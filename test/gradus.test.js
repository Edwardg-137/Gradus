import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { grade } from '../src/assessment.js'
import { initial } from '../src/content.js'
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
