import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, rmdir, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { assessments, grade, newBlock, nextQuestion, progressBadge, recordAnswer } from '../src/assessment.js'
import { followUp, initial, modules } from '../src/content.js'
import { history } from '../src/history-view.js'
import { issueVariant, practiceQuestion, variantPool } from '../src/practice.js'
import { createApp } from '../src/server.js'

async function startServer(t, filename = ':memory:') {
  const server = createApp({ filename })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise(resolve => server.close(resolve)))
  return `http://127.0.0.1:${server.address().port}`
}

async function guest(origin, cookie, page = '/') {
  const response = await fetch(`${origin}${page}`, { headers: cookie ? { Cookie: cookie } : {} })
  cookie ??= response.headers.get('set-cookie').split(';')[0]
  const token = /name="token" value="([^"]+)"/.exec(await response.text())?.[1]
  const get = path => fetch(`${origin}${path}`, { headers: { Cookie: cookie } })
  const post = (path, fields = {}) => fetch(`${origin}${path}`, {
    method: 'POST', headers: { Cookie: cookie }, body: new URLSearchParams({ token, ...fields }), redirect: 'manual',
  })
  const answer = (instance, value, intent = 'answer') => post('/evaluacion/responder', { instance, answer: value, intent })
  const reassess = (instance, value, intent = 'answer') => post('/reevaluacion/responder', { instance, answer: value, intent })
  return { cookie, get, post, answer, reassess }
}

test('la calificación numérica compara el valor exacto y valida toda la respuesta', () => {
  const question = initial[3]
  for (const value of ['4', ' 4 ', '+4', '004.0', '4,0']) assert.equal(grade(question, value).outcome, 'correct')
  for (const value of ['4.5', '4.00000000000000000000001', '-4']) assert.equal(grade(question, value).outcome, 'incorrect')
  for (const value of ['4abc', '4.', ',4', '4e0', '']) assert.ok(grade(question, value).error)
  assert.ok(grade(initial[0], 'constructor').error)
})

test('el diagnóstico oculta la corrección, retoma el bloque y adapta la comprobación una sola vez', async t => {
  const origin = await startServer(t)
  const student = await guest(origin)
  assert.equal((await student.post('/evaluacion/iniciar', { token: 'inválido' })).status, 403)
  assert.equal((await student.post('/evaluacion/iniciar')).status, 303)
  assert.equal((await student.answer('i-multiplicativa', 'ambos')).status, 409)
  assert.equal((await student.answer('i-aditiva', 'izquierda')).status, 303)
  assert.equal((await student.answer('i-aditiva', 'ambos')).status, 303)
  const resumed = await (await student.get('/evaluacion')).text()
  assert.match(resumed, /Pregunta 2 de 4/)
  assert.doesNotMatch(resumed, /conservar la igualdad\. Queda/)
  const another = await guest(origin)
  assert.equal(new URL((await another.get('/resultado')).url).pathname, '/')
  await student.answer('i-multiplicativa', '', 'skip')
  const invalid = await student.answer('i-un-paso', '13abc')
  assert.equal(invalid.status, 422)
  assert.match(await invalid.text(), /Escribe un número/)
  await student.answer('i-un-paso', '13')
  await student.answer('i-dos-pasos', '4,0')
  assert.match(await (await student.get('/evaluacion')).text(), /Comprobación adicional/)
  await student.answer('i-comprobacion', 'ambos')
  const result = await (await student.get('/resultado')).text()
  assert.match(result, /Evidencia insuficiente/)
  assert.match(result, /Demostrada en esta evaluación/)
  assert.match(result, /Identificaste la transformación en la comprobación/)
  assert.match(result, /Elegiste restar 4 solo al lado izquierdo/)
  assert.match(result, /0 de 2 respuestas correctas/)
})

test('el conjunto de la plantilla excluye el banco fijo y se puede usar sin repeticiones', () => {
  const practice = { rounds: [{ completedAt: 'fecha' }], variants: [] }
  const reserved = [...initial, ...followUp, ...Object.values(modules).flatMap(module => module.exercises)]
  const equations = new Set()
  let previous = ''
  assert.equal(variantPool.length, 253)
  for (let count = 0; count < variantPool.length; count++) {
    const instance = issueVariant(practice, previous)
    const { a, b, s } = instance.parameters
    assert.ok(a >= 2 && a <= 5 && b >= 2 && b <= 9 && s >= 2 && s <= 9)
    const question = practiceQuestion(instance)
    const equation = `${a}x + ${b} = ${a * s + b}`
    assert.equal(question.prompt, `Resuelve ${equation}.`)
    assert.ok(question.explanation.includes(`Queda ${a}x = ${a * s}.`))
    assert.ok(question.explanation.endsWith(`Queda x = ${s}.`))
    assert.equal(grade(question, String(s)).outcome, 'correct')
    assert.ok(reserved.every(item => !item.prompt.includes(equation)))
    assert.ok(!equations.has(equation))
    equations.add(equation)
    instance.response = { outcome: 'correct' }
    previous = instance.id
  }
  assert.equal(issueVariant(practice, previous), null)
})

const instanceIn = html => /name="instance" value="([^"]+)"/.exec(html)?.[1]

test('la práctica revisada conserva la corrección y emite variantes estables y distintas', async t => {
  const student = await guest(await startServer(t))
  const modulePath = '/modulos/despejar-incognita'
  const modulePage = async (path = modulePath) => (await student.get(path)).text()
  const answer = (instance, value) => student.post(`${modulePath}/responder`, { instance, answer: value })

  assert.match(await modulePage(), /Ejemplo resuelto/)
  assert.equal((await student.post(`${modulePath}/variante`)).headers.get('location'), modulePath)
  await student.post(`${modulePath}/iniciar`)
  const firstId = instanceIn(await modulePage())
  assert.equal((await answer(firstId, '8abc')).status, 422)
  const first = await answer(firstId, '7')
  const retry = await answer(firstId, '8')
  assert.equal(first.headers.get('location'), retry.headers.get('location'))
  const feedback = await modulePage(retry.headers.get('location'))
  assert.match(feedback, /Incorrecta.*x = 7/)
  assert.match(feedback, /Resta 9 a ambos lados/)

  const second = await answer(instanceIn(await modulePage()), '6')
  assert.match(await modulePage(second.headers.get('location')), /Ronda completada/)
  const [variant, duplicate] = await Promise.all([student.post(`${modulePath}/variante`), student.post(`${modulePath}/variante`)])
  const location = variant.headers.get('location')
  assert.equal(location, duplicate.headers.get('location'))
  const html = await modulePage(location)
  assert.equal(await modulePage(location), html)
  assert.match(html, /Variante de dos pasos/)
  const [, a, b, c] = /Resuelve (\d)x \+ (\d) = (\d+)\./.exec(html)
  const variantId = instanceIn(html)
  assert.match(await modulePage((await answer(variantId, String((c - b) / a))).headers.get('location')), /Correcta/)
  const another = (await student.post(`${modulePath}/variante`, { previous: variantId })).headers.get('location')
  assert.notEqual(another, location)
  assert.doesNotMatch(await modulePage(another), new RegExp(`Resuelve ${a}x \\+ ${b} = ${c}\\.`))
})

test('el recorrido del hackathon desbloquea la reevaluación y guarda una insignia al mejorar', async t => {
  const origin = await startServer(t)
  const student = await guest(origin)
  await student.post('/evaluacion/iniciar')
  for (const [id, value] of initial.map((question, index) => [question.id, ['izquierda', 'ambos', '13', '5'][index]])) {
    assert.equal((await student.answer(id, value)).status, 303)
  }
  await student.answer('i-comprobacion', 'izquierda')
  assert.equal((await student.post('/reevaluacion/iniciar')).headers.get('location'), '/resultado')
  assert.doesNotMatch(await (await student.get('/resultado')).text(), /Comprobar mi avance/)
  assert.match(await (await student.get('/resultado')).text(), /dejaste el lado derecho en 9/)

  const path = '/modulos/mantener-igualdad'
  await student.post(`${path}/iniciar`)
  for (const value of ['ambos', 'derecho', 'seis']) {
    const instance = instanceIn(await (await student.get(path)).text())
    assert.equal((await student.post(`${path}/responder`, { instance, answer: value })).status, 303)
  }
  assert.match(await (await student.get('/resultado')).text(), /Comprobar mi avance/)
  assert.equal((await student.post('/reevaluacion/iniciar')).headers.get('location'), '/reevaluacion')
  assert.equal((await student.reassess('i-aditiva', 'ambos')).status, 409)
  for (const [index, question] of followUp.entries()) {
    const form = await (await student.get('/reevaluacion')).text()
    assert.equal(instanceIn(form), question.id)
    assert.match(form, new RegExp(`Pregunta ${index + 1} de 4`))
    assert.equal((await student.reassess(question.id, ['ambos', 'ambos', '15', '4'][index])).status, 303)
  }

  const completed = await (await student.get('/historial')).text()
  assert.match(completed, /Antes[\s\S]+Después/)
  assert.match(completed, /En desarrollo[\s\S]+Demostrada en esta evaluación/)
  assert.match(completed, /Ver evidencia de mantener la igualdad/)
  assert.match(completed, /Módulos practicados/)
  assert.match(completed, /href="\/modulos\/despejar-incognita"/)
  assert.equal((completed.match(/Avance en ecuaciones lineales/g) ?? []).length, 1)
  assert.equal((await student.reassess('f-dos-pasos', '5')).headers.get('location'), '/historial')
  assert.equal(await (await student.get('/historial')).text(), completed)
  const another = await guest(origin)
  assert.doesNotMatch(await (await another.get('/historial')).text(), /Avance en ecuaciones lineales/)
})

function finishedBlock(assessment, answers) {
  const block = newBlock()
  for (const value of answers) recordAnswer(block, assessment, nextQuestion(block, assessment), value, value === null)
  return block
}

test('la insignia agrupa mejoras y distingue la evidencia nueva y los estados que se mantienen', () => {
  for (const [index, question] of initial.entries()) {
    assert.equal(question.skill, followUp[index].skill)
    assert.equal(question.indicator, followUp[index].indicator)
    assert.equal(question.format, followUp[index].format)
    assert.notEqual(question.prompt, followUp[index].prompt)
  }
  const follow = finishedBlock(assessments.followUp, ['ambos', 'ambos', '15', '5'])
  const partial = finishedBlock(assessments.initial, [null, 'ambos', '13', '4'])
  const progress = { topicId: 'ecuaciones-lineales', initial: partial, followUp: follow }
  assert.equal(progressBadge(progress), null)
  assert.match(history(progress), /Evidencia nueva/)
  assert.match(history(progress), /Pendiente\. Se obtiene/)

  progress.initial = finishedBlock(assessments.initial, ['inversa', 'ambos', '13', '5'])
  assert.equal(progressBadge(progress).evidence.length, 2)
  progress.initial = finishedBlock(assessments.initial, ['inversa', 'inversa', '1', '5'])
  progress.followUp = finishedBlock(assessments.followUp, ['izquierda', 'ambos', '15', '4'])
  assert.equal(progressBadge(progress), null)
  assert.match(history(progress), /Aumentaron los aciertos y el estado se mantiene/)
})

test('el catálogo abre los dos cursos y sus módulos', async t => {
  const student = await guest(await startServer(t))
  const catalog = await (await student.get('/catalogo')).text()
  const courses = [...catalog.matchAll(/href="(\/cursos\/[^"/]+)"/g)].map(match => match[1])
  assert.equal(courses.length, 2)
  const seen = []
  for (const course of courses) {
    const response = await student.get(course)
    assert.equal(response.status, 200)
    const page = await response.text()
    assert.match(page, /<h2>Módulos<\/h2>/)
    for (const [, path, id] of page.matchAll(/href="(\/modulos\/([a-z-]+))"/g)) {
      const module = await student.get(path)
      assert.equal(module.status, 200)
      assert.ok((await module.text()).includes(`<h1>${modules[id].title}</h1>`))
      seen.push(id)
    }
  }
  assert.deepEqual(seen.sort(), Object.keys(modules).sort())
})

test('la sesión de invitado se recupera después de reiniciar el servidor', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'gradus-test-'))
  const filename = join(directory, 'session.sqlite')
  t.after(async () => {
    await unlink(filename)
    await rmdir(directory)
  })
  let cookie
  await t.test('guardar una respuesta', async phase => {
    const student = await guest(await startServer(phase, filename))
    cookie = student.cookie
    await student.post('/evaluacion/iniciar')
    assert.equal((await student.answer('i-aditiva', 'ambos')).status, 303)
  })
  await t.test('retomar y guardar la siguiente', async phase => {
    const student = await guest(await startServer(phase, filename), cookie, '/evaluacion')
    assert.match(await (await student.get('/evaluacion')).text(), /Pregunta 2 de 4/)
    assert.equal((await student.answer('i-multiplicativa', 'ambos')).status, 303)
    assert.match(await (await student.get('/evaluacion')).text(), /Pregunta 3 de 4/)
  })
})

function browserClient(origin) {
  const cookies = new Map()
  const request = async (path, options) => {
    const response = await fetch(`${origin}${path}`, {
      ...options, redirect: 'manual', headers: { Cookie: [...cookies.values()].join('; '), ...options?.headers },
    })
    for (const value of response.headers.getSetCookie()) {
      const [pair] = value.split(';')
      const [name] = pair.split('=')
      if (value.includes('Max-Age=0')) cookies.delete(name)
      else cookies.set(name, pair)
    }
    return response
  }
  const post = async (path, fields = {}, source = path) => {
    const html = await (await request(source)).text()
    const token = /name="token" value="([^"]+)"/.exec(html)?.[1]
    assert.ok(token, `Formulario en ${source}`)
    return request(path, { method: 'POST', body: new URLSearchParams({ token, ...fields }) })
  }
  return { request, post, cookies }
}

test('el perfil migra el avance, aísla cuentas y permite volver a entrar desde otro navegador', async t => {
  const origin = await startServer(t)
  const first = browserClient(origin)
  const account = { email: 'Estudiante@ejemplo.test ', password: 'una frase útil y larga' }
  assert.equal((await first.post('/evaluacion/iniciar', {}, '/')).status, 303)
  assert.equal((await first.post('/evaluacion/responder', { instance: 'i-aditiva', answer: 'ambos' }, '/evaluacion')).status, 303)
  assert.equal((await first.post('/perfil/registro', { ...account, password: 'breve' })).status, 422)
  const registration = await first.post('/perfil/registro', account)
  assert.equal(registration.headers.get('location'), '/perfil')
  assert.match(registration.headers.get('set-cookie'), /gradus_auth=.*HttpOnly; SameSite=Lax/)
  assert.match(await (await first.request('/perfil')).text(), /estudiante@ejemplo.test/)
  assert.match(await (await first.request('/evaluacion')).text(), /Pregunta 2 de 4/)

  const second = browserClient(origin)
  assert.equal((await second.request('/evaluacion')).headers.get('location'), '/')
  assert.equal((await second.post('/perfil/registro', account)).status, 409)
  assert.equal((await second.post('/perfil/entrar', { ...account, password: 'contraseña equivocada' })).status, 401)
  assert.equal((await second.post('/perfil/entrar', account)).headers.get('location'), '/perfil')
  assert.match(await (await second.request('/evaluacion')).text(), /Pregunta 2 de 4/)
  assert.notEqual(first.cookies.get('gradus_auth'), second.cookies.get('gradus_auth'))

  const revokedCookie = first.cookies.get('gradus_auth')
  assert.equal((await first.post('/perfil/salir', {}, '/perfil')).status, 303)
  assert.equal((await first.request('/evaluacion')).headers.get('location'), '/')
  first.cookies.set('gradus_auth', revokedCookie)
  assert.doesNotMatch(await (await first.request('/perfil')).text(), /estudiante@ejemplo.test/)
  assert.match(await (await second.request('/evaluacion')).text(), /Pregunta 2 de 4/)
})
