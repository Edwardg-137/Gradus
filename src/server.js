import { createHash, randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { newBlock, nextQuestion, recordAnswer } from './assessment.js'
import { modules } from './content.js'
import { answerExercise, findExercise, issueVariant, offersVariants, pendingExercise, startRound } from './practice.js'
import { practicePage } from './practice-view.js'
import { openStore } from './store.js'
import { assessmentQuestion, home, initialResult, layout, message } from './views.js'

const css = readFileSync(new URL('./style.css', import.meta.url))
const sessionCookie = 'gradus_guest'

class RequestError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function formData(request) {
  if (request.headers['content-type']?.split(';')[0] !== 'application/x-www-form-urlencoded') {
    throw new RequestError(415, 'El formato del formulario no es compatible.')
  }
  let size = 0
  const chunks = []
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    size += chunk.length
    if (size > 4096) {
      request.resume()
      throw new RequestError(413, 'La respuesta es demasiado larga.')
    }
    chunks.push(chunk)
  }
  return new URLSearchParams(Buffer.concat(chunks).toString('utf8'))
}

function page(response, title, body, status = 200) {
  response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' }).end(layout(title, body))
}

function redirect(response, location) {
  response.writeHead(303, { Location: location }).end()
}

function notFound(response) {
  return page(response, 'Página no encontrada', message('Página no encontrada', 'El enlace no está disponible.'), 404)
}

export function createApp({ filename = 'data/gradus.sqlite', secureCookie = false } = {}) {
  const store = openStore(filename)
  const server = createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")
    response.setHeader('Referrer-Policy', 'same-origin')
    response.setHeader('X-Content-Type-Options', 'nosniff')

    try {
      const { pathname, searchParams } = new URL(request.url, 'http://localhost')
      const [, moduleId, action] = /^\/modulos\/([a-z-]+)(?:\/(iniciar|responder|variante))?$/.exec(pathname) ?? []
      const module = Object.hasOwn(modules, moduleId) ? modules[moduleId] : null
      if (request.method === 'GET' && pathname === '/estilos.css') {
        return response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' }).end(css)
      }

      const cookie = request.headers.cookie?.match(/(?:^|;\s*)gradus_guest=([0-9a-f]{64})(?=;|$)/)?.[1]
      const session = cookie ?? randomBytes(32).toString('hex')
      const token = createHash('sha256').update(`gradus-form:${session}`).digest('hex')

      if (request.method === 'GET') {
        if (!cookie) {
          response.setHeader('Set-Cookie', `${sessionCookie}=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secureCookie ? '; Secure' : ''}`)
        }
        const progress = store.read(session)
        if (pathname === '/') return page(response, 'Inicio', home(progress, token))
        if (pathname === '/evaluacion') {
          if (!progress.initial) return redirect(response, '/')
          if (progress.initial.result) return redirect(response, '/resultado')
          return page(response, 'Evaluación inicial', assessmentQuestion(nextQuestion(progress.initial), token))
        }
        if (pathname === '/resultado') {
          if (!progress.initial?.result) return redirect(response, '/evaluacion')
          return page(response, 'Tu punto de partida', initialResult(progress.initial))
        }
        if (module && !action) {
          const practice = progress.practice?.[moduleId]
          const selected = findExercise(practice, searchParams.get('ejercicio'))
          return page(response, module.title, practicePage(moduleId, practice, token, selected?.response ? selected : undefined))
        }
        return notFound(response)
      }

      if (request.method !== 'POST') return notFound(response)
      const data = await formData(request)
      if (!cookie || data.get('token') !== token) {
        throw new RequestError(403, 'Vuelve a abrir la página para recuperar tu sesión de invitado.')
      }
      if (pathname === '/evaluacion/iniciar') {
        store.update(session, progress => { progress.initial ??= newBlock() })
        return redirect(response, '/evaluacion')
      }
      if (pathname === '/evaluacion/responder') {
        const instance = data.get('instance')
        const value = data.get('answer') ?? ''
        const result = store.update(session, progress => {
          const block = progress.initial
          if (!block) return { location: '/' }
          if (Object.hasOwn(block.answers, instance) || block.result) return { location: '/evaluacion' }
          const question = nextQuestion(block)
          if (instance !== question.id) throw new RequestError(409, 'Abre tu evaluación para recuperar la pregunta actual.')
          const answer = recordAnswer(block, question, value, data.get('intent') === 'skip')
          return answer.error ? { question, error: answer.error } : { location: '/evaluacion' }
        })
        if (result.location) return redirect(response, result.location)
        return page(response, 'Evaluación inicial', assessmentQuestion(result.question, token, { value, error: result.error }), 422)
      }
      if (module && action) {
        const path = `/modulos/${moduleId}`
        const previous = data.get('previous') ?? ''
        const value = data.get('answer') ?? ''
        const result = store.update(session, progress => {
          if (action === 'iniciar') {
            startRound(progress, moduleId, previous)
            return { location: path }
          }
          const practice = progress.practice?.[moduleId]
          if (action === 'variante' && offersVariants(moduleId)) {
            const variant = issueVariant(practice, previous)
            return { location: variant ? `${path}?ejercicio=${variant.id}` : path }
          }
          if (action !== 'responder') return { location: path }
          const instance = findExercise(practice, data.get('instance'))
          if (instance && (instance.response || instance === pendingExercise(practice))) {
            const answer = instance.response ?? answerExercise(practice, instance, value)
            return answer.error
              ? { practice, instance, error: answer.error }
              : { location: `${path}?ejercicio=${instance.id}` }
          }
          throw new RequestError(409, 'Abre el módulo para recuperar el ejercicio actual.')
        })
        if (result.location) return redirect(response, result.location)
        return page(response, module.title, practicePage(moduleId, result.practice, token, result.instance, { value, error: result.error }), 422)
      }
      return notFound(response)
    } catch (error) {
      if (response.destroyed) return
      if (error instanceof RequestError) {
        return page(response, 'Revisa tu solicitud', message('Revisa tu solicitud', error.message), error.status)
      }
      console.error(error)
      return page(response, 'Error', message('Algo salió mal', 'Vuelve a abrir Gradus para retomar el último punto guardado.'), 500)
    }
  })
  server.on('close', store.close)
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const host = process.env.GRADUS_HOST ?? '127.0.0.1'
  const port = Number(process.env.PORT ?? 3000)
  const server = createApp({ filename: process.env.GRADUS_DB, secureCookie: process.env.GRADUS_SECURE_COOKIE === '1' })
  server.listen(port, host, () => console.log(`Gradus está disponible en http://${host}:${server.address().port}`))
}
