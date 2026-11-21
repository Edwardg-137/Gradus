import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { assessments, canStartFollowUp, newBlock, nextQuestion, progressBadge, recordAnswer } from './assessment.js'
import { credentials, digest, limitAuth, newSecret, protectPassword, verifyPassword } from './auth.js'
import { catalog, coursePage } from './catalog-view.js'
import { courses, modules } from './content.js'
import { layout } from './desk-view.js'
import { history } from './history-view.js'
import { pitchPage } from './pitch.js'
import { answerExercise, findExercise, issueVariant, offersVariants, pendingExercise, startRound } from './practice.js'
import { practicePage } from './practice-view.js'
import { credentialsPage, profilePage } from './profile-view.js'
import { accountOwner, openStore, sessionMaxAge } from './store.js'
import { studyScope } from './study-content.js'
import { advanceLesson, lessonKey } from './study-lessons.js'
import { masteryProfiles } from './study-mastery.js'
import { masterySection, studyAttemptPage, studyTestOptions } from './study-test-view.js'
import { competencyLevels, createRetentionAttempt, createStudyAttempt, submitStudyAnswer } from './study-tests.js'
import { lessonChooser, lessonPage, studyIndex, studyScopePage } from './study-view.js'
import { assessmentQuestion, home, initialResult, message } from './views.js'

const css = readFileSync(new URL('./style.css', import.meta.url))
const deskScript = readFileSync(new URL('./desk.js', import.meta.url))
const guestCookie = 'gradus_guest'
const authCookie = 'gradus_auth'

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

function redirect(response, location) {
  response.writeHead(303, { Location: location }).end()
}

export function createApp({ filename = 'data/gradus.sqlite', secureCookie = false, clock = Date.now } = {}) {
  const store = openStore(filename)
  const attemptAuthentication = limitAuth()
  const setCookie = (response, name, value, age = sessionMaxAge) => response.appendHeader('Set-Cookie',
    `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secureCookie ? '; Secure' : ''}`)
  const server = createServer(async (request, response) => {
    const desk = {}
    const page = (response, title, body, status = 200) => response.writeHead(status,
      { 'Content-Type': 'text/html; charset=utf-8' }).end(layout(title, body, desk))
    const notFound = response => page(response, 'Página no encontrada',
      message('Página no encontrada', 'El enlace no está disponible.'), 404)
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")
    response.setHeader('Referrer-Policy', 'same-origin')
    response.setHeader('X-Content-Type-Options', 'nosniff')

    try {
      const { pathname, searchParams } = new URL(request.url, 'http://localhost')
      const [blockKey, assessment] = Object.entries(assessments).find(([, item]) =>
        [item.path, `${item.path}/iniciar`, `${item.path}/responder`].includes(pathname)) ?? []
      const [, moduleId, action] = /^\/modulos\/([a-z-]+)(?:\/(iniciar|responder|variante))?$/.exec(pathname) ?? []
      const module = Object.hasOwn(modules, moduleId) ? modules[moduleId] : null
      const [, studyKind, studyId, difficulty, lessonMode, tests, testType, retention] = /^\/estudio\/(categorias|competencias)\/([a-z-]+)(?:\/(basico|intermedio|avanzado)(?:\/(rapida|completa))?|(\/pruebas)(?:\/(rapida|completa))?|\/(retencion))?$/.exec(pathname) ?? []
      const scope = studyScope(studyKind, studyId)
      const [, attemptId, answering] = /^\/pruebas\/([a-f\d-]{36})(\/responder)?$/.exec(pathname) ?? []
      desk.pathname = pathname
      desk.testing = Boolean(assessment || attemptId)
      if (request.method === 'GET' && pathname === '/estilos.css') {
        return response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' }).end(css)
      }
      if (request.method === 'GET' && pathname === '/escritorio.js') {
        return response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' }).end(deskScript)
      }
      if (request.method === 'GET' && pathname === '/favicon.ico') return response.writeHead(204).end()
      if (request.method === 'GET' && pathname === '/pitch') return page(response, 'Presentación de Gradus', pitchPage(searchParams))

      const matches = (request.headers.cookie ?? '').matchAll(/(?:^|;\s*)(gradus_guest|gradus_auth)=([0-9a-f]{64})(?=;|$)/g)
      const cookies = Object.fromEntries(Array.from(matches, ([, name, value]) => [name, value]))
      const guest = cookies[guestCookie] ?? newSecret()
      const login = cookies[authCookie]
      const loginId = login ? digest(login) : null
      const data = request.method === 'POST' ? await formData(request) : null
      const account = loginId ? store.accountForSession(loginId) : null
      const at = new Date(clock()).toISOString()
      const owner = account ? accountOwner(account.id) : guest
      desk.storageKey = digest(`gradus-desk:${owner}`)
      const token = digest(`gradus-form:${account ? login : guest}`)
      const registering = pathname === '/perfil/registro'
      const credentialRoute = registering || pathname === '/perfil/entrar'
      const returnPath = (data ?? searchParams).get('volver')
      const destination = /^\/estudio\/(categorias|competencias)\/[a-z-]+\/pruebas$/.test(returnPath ?? '') ? returnPath : null

      if (request.method === 'GET') {
        if (!cookies[guestCookie]) setCookie(response, guestCookie, guest)
        if (login && !account) setCookie(response, authCookie, '', 0)
        const progress = store.read(owner)
        desk.progress = progress
        if (pathname === '/') return page(response, 'Inicio', home(progress, token, account))
        if (pathname === '/perfil' || pathname === '/estudio' || (scope && !difficulty)) {
          const attempts = account ? store.studyAttempts(account.id) : []
          if (pathname === '/perfil') return account && destination ? redirect(response, destination)
            : page(response, 'Mi perfil', profilePage(account, token, attempts, destination))
          const levels = competencyLevels(attempts)
          const profiles = masteryProfiles(attempts)
          if (pathname === '/estudio') return page(response, 'Estudio', studyIndex(levels, profiles, at))
          if (testType) return redirect(response, `${scope.path}/pruebas`)
          if (retention) return redirect(response, `${scope.path}#dominio`)
          const options = studyTestOptions(scope, account, attempts, token)
          if (tests) return page(response, 'Elige una prueba', `<p><a href="${scope.path}">${scope.title}</a></p><h1>Elige una prueba</h1>${options}`)
          const mastery = masterySection(scope, profiles, attempts, token, at)
          return page(response, scope.title, studyScopePage(scope, levels, options, mastery, profiles, at))
        }
        if (scope && difficulty) {
          const body = lessonMode ? lessonPage(scope, difficulty, lessonMode,
            progress.studyLessons?.[lessonKey(scope, difficulty, lessonMode)], token) : lessonChooser(scope, difficulty)
          return page(response, scope.title, body)
        }
        if (attemptId && !answering) {
          if (!account) return redirect(response, '/perfil')
          const attempt = store.readAttempt(account.id, attemptId)
          if (!attempt) return notFound(response)
          desk.testing = !attempt.completedAt
          let mastery = ''
          if (attempt.completedAt) {
            const attempts = store.studyAttempts(account.id)
            mastery = masterySection(studyScope(attempt.kind, attempt.scopeId), masteryProfiles(attempts), attempts, token, at)
          }
          return page(response, 'Prueba', studyAttemptPage(attempt, token, undefined, mastery))
        }
        if (credentialRoute) {
          if (account) return redirect(response, destination ?? '/perfil')
          return page(response, registering ? 'Crear perfil' : 'Iniciar sesión', credentialsPage(registering, token, { destination }))
        }
        if (pathname === assessment?.path) {
          const block = progress[blockKey]
          if (!block) return redirect(response, blockKey === 'initial' ? '/' : '/resultado')
          if (block.result) return redirect(response, assessment.resultPath)
          return page(response, assessment.title, assessmentQuestion(assessment, nextQuestion(block, assessment), token))
        }
        if (pathname === '/resultado') {
          if (!progress.initial?.result) return redirect(response, '/evaluacion')
          return page(response, 'Tu punto de partida', initialResult(progress, token))
        }
        if (pathname === '/historial') return page(response, 'Mi historial', history(progress))
        if (pathname === '/catalogo') return page(response, 'Catálogo de cursos', catalog(progress.initial?.result))
        const courseId = /^\/cursos\/([a-z-]+)$/.exec(pathname)?.[1]
        if (Object.hasOwn(courses, courseId)) {
          const course = courses[courseId]
          return page(response, course.title, coursePage(course))
        }
        if (module && !action) {
          const practice = progress.practice?.[moduleId]
          const selected = findExercise(practice, searchParams.get('ejercicio'))
          return page(response, module.title, practicePage(moduleId, practice, token, selected?.response ? selected : undefined))
        }
        return notFound(response)
      }

      if (request.method !== 'POST') return notFound(response)
      if ((!cookies[guestCookie] && !account) || data.get('token') !== token) {
        throw new RequestError(403, 'Vuelve a abrir la página para recuperar tu sesión.')
      }
      if (assessment || module) desk.progress = store.read(owner)
      if (pathname === '/perfil/salir') {
        if (account) store.revoke(loginId)
        setCookie(response, authCookie, '', 0)
        return redirect(response, '/perfil')
      }
      if (credentialRoute) {
        if (account) return redirect(response, destination ?? '/perfil')
        const { email, password, error } = credentials(data)
        const failure = (status, error) => page(response, registering ? 'Crear perfil' : 'Iniciar sesión',
          credentialsPage(registering, token, { email, error, destination }), status)
        if (error) return failure(422, error)
        const secret = newSecret()
        const accepted = await attemptAuthentication(request.socket.remoteAddress, async () => {
          if (registering) {
            const { salt, passwordHash } = await protectPassword(password)
            return store.register(email, salt, passwordHash, guest, digest(secret))
          }
          const candidate = store.findAccount(email)
          if (!await verifyPassword(password, candidate)) return false
          store.authorize(digest(secret), candidate.id)
          return true
        })
        if (accepted === null) return failure(429, 'Hay demasiados intentos. Vuelve a intentarlo en unos minutos.')
        if (!accepted) return registering
          ? failure(409, 'Ese correo ya tiene un perfil. Puedes iniciar sesión.')
          : failure(401, 'Revisa tu correo y contraseña.')
        setCookie(response, authCookie, secret)
        return redirect(response, destination ?? '/perfil')
      }
      if (scope && difficulty) {
        if (!lessonMode) return redirect(response, pathname)
        const result = store.update(owner, progress => advanceLesson(progress, scope, difficulty, lessonMode, data))
        if (result.error) return page(response, scope.title,
          lessonPage(scope, difficulty, lessonMode, result.round, token, result), 422)
        return redirect(response, pathname)
      }
      if (scope && testType) {
        if (!account) return redirect(response, '/perfil')
        const attempt = store.beginAttempt(account.id, scope, testType, data.get('previous') ?? '',
          (target, type, count) => createStudyAttempt(target, type, count, at))
        return redirect(response, attempt ? `/pruebas/${attempt}` : scope.path)
      }
      if (scope?.kind === 'competencias' && retention) {
        if (!account) return redirect(response, '/perfil')
        const attempt = store.beginAttempt(account.id, scope, 'retencion', data.get('previous') ?? '', () => {
          const attempts = store.studyAttempts(account.id)
          const due = masteryProfiles(attempts)[scope.id]?.nextCheckAt
          return due && due <= at ? createRetentionAttempt(scope, attempts, at) : null
        })
        return redirect(response, attempt ? `/pruebas/${attempt}` : `${scope.path}#dominio`)
      }
      if (attemptId && answering) {
        if (!account) return redirect(response, '/perfil')
        const value = data.get('answer') ?? ''
        const reasoningValue = data.get('reasoning') ?? ''
        const result = store.updateAttempt(account.id, attemptId, attempt =>
          submitStudyAnswer(attempt, data.get('instance'), value, data.get('intent') === 'skip', reasoningValue, at))
        if (!result) return notFound(response)
        if (result.conflict) throw new RequestError(409, 'Abre la prueba para recuperar la pregunta actual.')
        if (result.error) return page(response, 'Prueba', studyAttemptPage(result.attempt, token, { value, reasoningValue, error: result.error }), 422)
        return redirect(response, `/pruebas/${attemptId}`)
      }
      if (assessment && pathname === `${assessment.path}/iniciar`) {
        const location = store.update(owner, progress => {
          if (blockKey === 'followUp' && !progress.followUp && !canStartFollowUp(progress)) return '/resultado'
          progress[blockKey] ??= newBlock()
          return assessment.path
        })
        return redirect(response, location)
      }
      if (assessment && pathname === `${assessment.path}/responder`) {
        const instance = data.get('instance')
        const value = data.get('answer') ?? ''
        const result = store.update(owner, progress => {
          const block = progress[blockKey]
          if (!block) return { location: assessment.path }
          if (block.result) return { location: assessment.resultPath }
          if (Object.hasOwn(block.answers, instance)) return { location: assessment.path }
          const question = nextQuestion(block, assessment)
          if (instance !== question.id) throw new RequestError(409, 'Abre tu evaluación para recuperar la pregunta actual.')
          const answer = recordAnswer(block, assessment, question, value, data.get('intent') === 'skip')
          if (answer.error) return { question, error: answer.error }
          if (blockKey === 'followUp' && block.result) progress.badge = progressBadge(progress)
          return { location: block.result ? assessment.resultPath : assessment.path }
        })
        if (result.location) return redirect(response, result.location)
        return page(response, assessment.title, assessmentQuestion(assessment, result.question, token, { value, error: result.error }), 422)
      }
      if (module && action) {
        const path = `/modulos/${moduleId}`
        const previous = data.get('previous') ?? ''
        const value = data.get('answer') ?? ''
        const result = store.update(owner, progress => {
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
