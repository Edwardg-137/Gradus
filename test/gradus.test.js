import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { grade } from '../src/assessment.js'
import { followUp, initial, modules } from '../src/content.js'
import { issueVariant, practiceQuestion, variantPool } from '../src/practice.js'
import { createApp } from '../src/server.js'

async function startServer(t, filename = ':memory:') {
  const server = createApp({ filename })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise(resolve => server.close(resolve)))
  return `http://127.0.0.1:${server.address().port}`
}

async function guest(origin, cookie) {
  const response = await fetch(`${origin}/`, { headers: cookie ? { Cookie: cookie } : {} })
  cookie ??= response.headers.get('set-cookie').split(';')[0]
  const token = /name="token" value="([^"]+)"/.exec(await response.text())?.[1]
  const get = path => fetch(`${origin}${path}`, { headers: { Cookie: cookie } })
  const post = (path, fields = {}) => fetch(`${origin}${path}`, {
    method: 'POST', headers: { Cookie: cookie }, body: new URLSearchParams({ token, ...fields }), redirect: 'manual',
  })
  const answer = (instance, value, intent = 'answer') => post('/evaluacion/responder', { instance, answer: value, intent })
  return { cookie, get, post, answer }
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
  assert.match(result, /Elegiste restar 4 solo en el lado izquierdo/)
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
