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
import { categories, competencies, difficulties, studyQuestion, studyScope } from '../src/study-content.js'
import { testQuestion } from '../src/study-diagnostics.js'
import { masteryProfiles, masteryStatus } from '../src/study-mastery.js'
import { competencyLevels, createStudyAttempt, scopeLevel, submitStudyAnswer, testTypes } from '../src/study-tests.js'

async function startServer(t, filename = ':memory:', options = {}) {
  const server = createApp({ filename, ...options })
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

test('el escritorio sirve el script local y reserva las notas para fuera de una prueba activa', async t => {
  const client = browserClient(await startServer(t))
  const home = await client.request('/')
  const shell = await home.text()
  const deskKey = /data-desk-key="([a-f\d]+)"/.exec(shell)?.[1]
  assert.equal(deskKey?.length, 64)
  assert.ok(!client.cookies.get('gradus_guest').endsWith(deskKey))
  assert.match(shell, /Nota adhesiva/)
  assert.match(home.headers.get('content-security-policy'), /script-src 'self'/)
  assert.match((await client.request('/escritorio.js')).headers.get('content-type'), /text\/javascript/)
  assert.equal((await client.post('/evaluacion/iniciar', {}, '/')).status, 303)
  const active = await (await client.request('/evaluacion')).text()
  assert.match(active, /Lámpara de lectura/)
  assert.doesNotMatch(active, /Nota adhesiva/)
})

test('el pitch calcula la prioridad de repaso y los beneficios de ejemplo fuera del perfil real', async t => {
  const origin = await startServer(t)
  const client = browserClient(origin)
  const scene = async (query = '') => (await client.request(`/pitch${query}`)).text()
  const intro = await scene()
  assert.match(intro, /Colegio, estudiante y resultados ficticios/)
  assert.match(intro, /Ver la colaboración/)
  assert.equal(client.cookies.size, 0)
  assert.match(await scene('?escena=colegio'), /Colegio Demo Horizonte/)
  const route = await scene('?escena=ruta')
  assert.match(route, /<ol class="pitch-plan"><li class="pitch-priority">\s*<strong>Repasar Propiedad distributiva y signos/)
  assert.match(route, /Toca comprobar/)
  assert.match(await scene('?escena=repaso&respuesta=signo'), /Vista previa de la lección personalizada/)
  assert.match(await scene('?escena=repaso&respuesta=ambos'), /Retomar la ruta/)
  assert.match(await scene('?escena=metas'), /<h2 id="pitch-outcome">Metas pendientes/)
  assert.match(await scene('?escena=metas&caso=prioridad'), /<h2 id="pitch-outcome">Candidata a revisión prioritaria/)
  assert.match(await scene('?escena=metas&caso=beca'), /<h2 id="pitch-outcome">Candidata a media beca/)
  assert.equal(client.cookies.size, 0)
  assert.equal((await client.request('/evaluacion')).headers.get('location'), '/')
})

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

test('el banco clasifica las preguntas y conserva claves únicas en las variantes permitidas', () => {
  const identifiers = new Set()
  for (const [id, competency] of Object.entries(competencies)) {
    assert.ok(categories[competency.category].competencies.includes(id))
    for (const difficulty of Object.keys(difficulties)) {
      const lesson = competency.lessons[difficulty]
      assert.deepEqual(lesson.templates.map(item => item.dimension),
        ['conceptual', 'conceptual', 'procedimental', 'aplicacion', 'procedimental', 'aplicacion'])
      for (let parameter = 2; parameter <= 30; parameter++) {
        for (const [index] of lesson.templates.entries()) {
          const question = studyQuestion(id, difficulty, index, parameter)
          assert.ok(question.prompt && question.explanation && question.indicator)
          assert.ok(!identifiers.has(question.id))
          identifiers.add(question.id)
          if (question.format === 'choice') {
            assert.ok(question.options[question.key])
            assert.equal(new Set(Object.values(question.options)).size, 3, question.id)
          } else assert.ok(Number.isSafeInteger(question.key), question.id)
          assert.equal(grade(question, String(question.key)).outcome, 'correct')
        }
      }
    }
  }
  const triangle = studyQuestion('relaciones-en-el-plano', 'avanzado', 3, 4)
  assert.equal(triangle.key, 19)
  const budget = studyQuestion('modelacion-matematica', 'avanzado', 3, 8)
  assert.ok(6 * budget.key + 7 <= 57 && 6 * (budget.key + 1) + 7 > 57)
  const slope = studyQuestion('relaciones-en-el-plano', 'intermedio', 5, 8)
  assert.equal(grade(slope, '−8').outcome, 'correct')
})

test('las categorías ofrecen ambas lecciones y el invitado retoma las ayudas y la corrección', async t => {
  const client = browserClient(await startServer(t))
  const study = await (await client.request('/estudio')).text()
  for (const [id, category] of Object.entries(categories)) {
    assert.ok(study.includes(category.title))
    const page = await (await client.request(`/estudio/categorias/${id}`)).text()
    for (const difficulty of Object.keys(difficulties)) assert.ok(page.includes(`/estudio/categorias/${id}/${difficulty}`))
    for (const competency of category.competencies) assert.ok(page.includes(`/estudio/competencias/${competency}`))
  }
  const choice = '/estudio/categorias/algebra/avanzado'
  const modes = await (await client.request(choice)).text()
  assert.match(modes, /Lección rápida[\s\S]+Lección completa/)
  const path = `${choice}/completa`
  assert.equal((await client.post(path, { intent: 'start' })).status, 303)
  const intro = await (await client.request(path)).text()
  assert.match(intro, /Paso 1 de 10 · Manipulación algebraica/)
  assert.match(intro, /Ejemplo resuelto/)
  assert.match(intro, /var\.alg\.exp\.factor-comun\.default\.yaml/)
  const round = /name="round" value="([^"]+)"/.exec(intro)[1]
  await client.post(path, { intent: 'next', round, step: '0' })
  const problem = await (await client.request(path)).text()
  assert.match(problem, /Factoriza por completo 8x² \+ 8x/)
  const state = { round, step: '1', instance: instanceIn(problem) }
  await client.post(path, { ...state, intent: 'hint' })
  assert.match(await (await client.request(path)).text(), /Busca la menor potencia común/)
  await client.post(path, { ...state, intent: 'answer', answer: 'b' })
  await client.post(path, { ...state, intent: 'answer', answer: 'a' })
  assert.match(await (await client.request(path)).text(), /Correcta/)
  await client.post(path, { ...state, intent: 'next' })
  assert.match(await (await client.request(path)).text(), /Paso 3 de 10/)
})

test('las dos pruebas cubren las dificultades y distinguen dominio, dimensiones y suficiencia', () => {
  const scopes = [...Object.keys(categories).map(id => studyScope('categorias', id)),
    ...Object.keys(competencies).map(id => studyScope('competencias', id))]
  for (const scope of scopes) {
    for (const [type, config] of Object.entries(testTypes)) {
      const attempt = createStudyAttempt(scope, type, 0)
      assert.equal(attempt.questions.length, scope.competencies.length * 3 * config.plan.length)
      assert.equal(new Set(attempt.questions.map(question => question.id)).size, attempt.questions.length)
      assert.equal(new Set(attempt.questions.map(question => question.templateId)).size, attempt.questions.length)
      assert.ok(attempt.questions.every(question => question.parameter > 5))
      const next = createStudyAttempt(scope, type, 1)
      assert.ok(next.questions.every(question => !attempt.questions.some(other => other.prompt === question.prompt)))
      for (const id of scope.competencies) {
        for (const difficulty of Object.keys(difficulties)) {
          const items = attempt.questions.filter(question => question.competencyId === id && question.difficulty === difficulty)
          assert.equal(items.length, config.plan.length)
          assert.equal(items.filter(question => question.dimension === 'conceptual').length, type === 'completa' ? 3 : 2)
          assert.equal(items.filter(question => question.dimension === 'aplicacion').length, type === 'completa' ? 3 : 0)
          assert.equal(items.filter(question => question.reasoning).length, type === 'completa' ? 1 : 0)
        }
      }
    }
  }

  const scope = studyScope('competencias', 'manipulacion-algebraica')
  const complete = createStudyAttempt(scope, 'completa', 0)
  const quick = createStudyAttempt(scope, 'rapida', 1)
  const inconclusive = createStudyAttempt(scope, 'completa', 2)
  for (const attempt of [complete, quick, inconclusive]) {
    for (const question of attempt.questions) {
      const skipped = attempt === inconclusive && question.difficulty === 'basico' && question.dimension === 'aplicacion'
      assert.ok(submitStudyAnswer(attempt, question.id, String(question.key), skipped, question.reasoning?.key).changed)
    }
  }
  assert.equal(complete.result.competencies[scope.id].level, 3)
  assert.equal(quick.result.competencies[scope.id].level, 2)
  assert.equal(inconclusive.result.competencies[scope.id].level, null)
  assert.equal(competencyLevels([inconclusive, quick, complete])[scope.id].attemptId, complete.id)
  assert.deepEqual(scopeLevel(studyScope('categorias', 'algebra'), competencyLevels([complete])), { level: null, observed: 1, required: 2 })
})

function answerOn(html) {
  const instance = instanceIn(html)
  const parts = instance.split('-')
  const parameter = Number(parts.pop())
  const index = Number(parts.pop()) - 1
  const difficulty = parts.pop()
  const question = testQuestion(parts.join('-'), difficulty, index, parameter)
  const select = (name, question) => {
    const choices = [...html.matchAll(new RegExp(`name="${name}" value="([a-z]+)"[^>]*> ([^<]+)</label>`, 'g'))]
    return choices.find(([, , label]) => label === question.options[question.key])[1]
  }
  return { instance, answer: question.format === 'number' ? String(question.key) : select('answer', question),
    ...(question.reasoning && { reasoning: select('reasoning', question.reasoning) }) }
}

test('el perfil retoma pruebas, conserva intentos privados y actualiza la estimación por alcance', async t => {
  const oneDay = 86_400_000
  let now = Date.parse('2026-11-21T17:00:00Z')
  const origin = await startServer(t, ':memory:', { clock: () => now })
  const account = { email: 'pruebas@ejemplo.test', password: 'contraseña para pruebas' }
  const student = browserClient(origin)
  const scope = '/estudio/competencias/manipulacion-algebraica'
  const category = '/estudio/categorias/algebra'
  assert.match(await (await student.request(scope)).text(), /Sin evaluar/)
  const destination = `${category}/pruebas`
  const signup = `/perfil/registro?volver=${encodeURIComponent(destination)}`
  assert.match(await (await student.request(destination)).text(), /perfil\?volver=%2Festudio/)
  assert.equal((await student.post('/perfil/registro', { ...account, volver: destination }, signup)).headers.get('location'), destination)
  assert.match(await (await student.request(scope)).text(), /Iniciar prueba rápida/)
  assert.match(await (await student.request(category)).text(), /48 preguntas · 60–90 min/)
  const picker = await (await student.request(`${category}/pruebas`)).text()
  assert.match(picker, /Elige una prueba[\s\S]+Prueba rápida[\s\S]+Prueba completa/)
  const started = await student.post(`${scope}/pruebas/rapida`, {}, scope)
  const path = started.headers.get('location')
  assert.match(path, /^\/pruebas\//)
  assert.equal((await student.post(`${scope}/pruebas/rapida`, {}, scope)).headers.get('location'), path)

  let html = await (await student.request(path)).text()
  assert.match(html, /Pregunta 1 de 9/)
  assert.doesNotMatch(html, /Ver respuestas y soluciones/)
  assert.equal((await student.post(`${path}/responder`, { instance: 'otra-pregunta', answer: 'a' }, path)).status, 409)
  const first = answerOn(html)
  assert.equal((await student.post(`${path}/responder`, first, path)).status, 303)
  assert.equal((await student.post(`${path}/responder`, first, path)).status, 303)

  const resumed = browserClient(origin)
  assert.equal((await resumed.request(path)).headers.get('location'), '/perfil')
  await resumed.post('/perfil/entrar', account)
  assert.match(await (await resumed.request(path)).text(), /Pregunta 2 de 9/)
  for (let index = 1; index < 9; index++) {
    html = await (await resumed.request(path)).text()
    assert.equal((await resumed.post(`${path}/responder`, answerOn(html), path)).status, 303)
  }
  html = await (await resumed.request(path)).text()
  assert.match(html, /Funcional/)
  assert.match(html, /9 de 9 respuestas correctas/)
  assert.match(await (await resumed.request(category)).text(), /Cobertura parcial/)
  assert.match(await (await resumed.request('/perfil')).text(), /Pruebas recientes/)
  assert.equal((await resumed.post(`${scope}/retencion`, {}, scope)).headers.get('location'), `${scope}#dominio`)

  const exam = (await resumed.post(`${category}/pruebas/completa`, {}, category)).headers.get('location')
  for (let index = 0; index < 48; index++) {
    html = await (await resumed.request(exam)).text()
    const answer = answerOn(html)
    if (index === 1) assert.equal((await resumed.post(`${exam}/responder`, { ...answer, answer: '4abc' }, exam)).status, 422)
    if (index === 7) {
      const invalid = await resumed.post(`${exam}/responder`, { ...answer, reasoning: '' }, exam)
      assert.equal(invalid.status, 422)
      assert.match(await invalid.text(), /Elige el procedimiento/)
    }
    assert.equal((await resumed.post(`${exam}/responder`, answer, exam)).status, 303)
  }
  const result = await (await resumed.request(exam)).text()
  assert.equal((result.match(/24 de 24 respuestas correctas/g) ?? []).length, 2)
  assert.match(result, /Razonamiento y aplicación/)
  assert.match(result, /Nivel estimado · <strong>Avanzado<\/strong>/)
  assert.match(result, /En consolidación[\s\S]+0 de 2 competencias firmes/)
  assert.match(await (await resumed.request('/estudio')).text(), /Avanzado/)
  assert.match(await (await resumed.request(scope)).text(), new RegExp(`href="${exam}"`))
  const modeling = '/estudio/competencias/modelacion-matematica'
  async function checkRetention(competency, previous = '', correct = true) {
    const check = (await resumed.post(`${competency}/retencion`, { previous }, competency)).headers.get('location')
    assert.match(check, /^\/pruebas\//)
    const issued = []
    for (let index = 0; index < 2; index++) {
      const page = await (await resumed.request(check)).text()
      assert.match(page, new RegExp(`Pregunta ${index + 1} de 2`))
      const answer = answerOn(page)
      issued.push(answer.instance)
      if (!correct) answer.intent = 'skip'
      assert.equal((await resumed.post(`${check}/responder`, answer, check)).status, 303)
    }
    assert.match(await (await resumed.request(check)).text(), correct ? /Comprobación superada/ : /Conviene reforzar/)
    return { id: check.split('/').at(-1), items: issued }
  }

  now += oneDay - 1
  assert.equal((await resumed.post(`${scope}/retencion`, {}, scope)).headers.get('location'), `${scope}#dominio`)
  now++
  const firstCheck = await checkRetention(scope)
  const firstModeling = await checkRetention(modeling)
  assert.match(await (await resumed.request(scope)).text(), /1 de 2 comprobaciones iniciales superadas/)
  assert.match(await (await resumed.request(category)).text(), /0 de 2 competencias firmes/)
  now += 3 * oneDay
  const secondCheck = await checkRetention(scope, firstCheck.id)
  assert.ok(secondCheck.items.every(item => !firstCheck.items.includes(item)))
  assert.match(await (await resumed.request(category)).text(), /1 de 2 competencias firmes/)
  await checkRetention(modeling, firstModeling.id)
  assert.match(await (await resumed.request(category)).text(), /Dominio firme<\/strong> · 2 de 2 competencias firmes/)
  now += 6 * oneDay
  assert.match(await (await resumed.request(category)).text(), /Toca comprobar/)
  await checkRetention(scope, secondCheck.id, false)
  assert.match(await (await resumed.request(scope)).text(), /Dominio · <strong>En práctica<\/strong>/)
  assert.match(await (await resumed.request(scope)).text(), /Nivel estimado · <strong>Avanzado<\/strong>/)

  const outsider = browserClient(origin)
  await outsider.post('/perfil/registro', { ...account, email: 'otra@ejemplo.test' })
  assert.equal((await outsider.request(exam)).status, 404)
})

test('el gemelo conserva el historial y descarta comprobaciones emitidas antes de tiempo y evidencia antigua', () => {
  const id = 'resolucion-ecuaciones'
  const at = '2026-11-21T17:00:00.000Z'
  const historical = { type: 'completa', completedAt: at, result: { version: 1, competencies: { [id]: { level: 3 } } } }
  assert.equal(masteryStatus(masteryProfiles([historical])[id], at), 'Pendiente de evidencia autónoma')
  const complete = { ...historical, result: { competencies: { [id]: { level: 3, autonomous: [
    { id: 'uno', dimension: 'procedimental', correct: true }, { id: 'dos', dimension: 'conceptual', correct: true },
    { id: 'tres', dimension: 'aplicacion', correct: true }, { id: 'cuatro', dimension: 'aplicacion', correct: true },
  ] } } } }
  const early = { type: 'retencion', scopeId: id, createdAt: at, completedAt: '2026-11-22T18:00:00.000Z', result: { retention: { passed: true } } }
  const state = masteryProfiles([early, complete])[id]
  assert.equal(state.checks, 0)
  assert.equal(masteryStatus(state, early.completedAt), 'Toca comprobar')
})

test('una solución numérica correcta con justificación incorrecta no acredita esa dificultad', () => {
  const attempt = createStudyAttempt(studyScope('competencias', 'resolucion-ecuaciones'), 'completa', 1)
  for (const question of attempt.questions) {
    const badReason = question.reasoning && question.difficulty === 'avanzado'
    const reason = badReason ? Object.keys(question.reasoning.options).find(key => key !== question.reasoning.key) : question.reasoning?.key
    submitStudyAnswer(attempt, question.id, String(question.key), false, reason)
    if (badReason) assert.deepEqual([attempt.answers[question.id].resultCorrect, attempt.answers[question.id].reasonCorrect], [true, false])
  }
  const result = attempt.result.competencies['resolucion-ecuaciones']
  assert.equal(result.totals.correct, 23)
  assert.equal(result.level, 2)
  assert.equal(result.breakdown.avanzado.justified, false)
})
