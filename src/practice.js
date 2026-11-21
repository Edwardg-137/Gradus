import { randomInt, randomUUID } from 'node:crypto'
import { grade } from './assessment.js'
import { followUp, initial, modules } from './content.js'

const template = { id: 'dos-pasos-variable', version: 1, moduleId: 'despejar-incognita' }
const equation = ({ a, b, s }) => `${a}x + ${b} = ${a * s + b}`
const reviewed = Object.values(modules).flatMap(module => module.exercises)
const reserved = new Set([...initial, ...followUp, ...reviewed].map(question => question.equation))

export const variantPool = []
for (let a = 2; a <= 5; a++) {
  for (let b = 2; b <= 9; b++) {
    for (let s = 2; s <= 9; s++) {
      const parameters = { a, b, s }
      if (!reserved.has(equation(parameters))) variantPool.push(parameters)
    }
  }
}

export function practiceQuestion(instance) {
  if (!instance.parameters) return reviewed.find(question => question.id === instance.exerciseId)
  const { a, b, s } = instance.parameters
  return {
    skill: modules[template.moduleId].skill, indicator: 'Resolución de dos pasos', format: 'number', key: s,
    prompt: `Resuelve ${equation(instance.parameters)}.`,
    explanation: `Resta ${b} a ambos lados. Queda ${a}x = ${a * s}. Divide ambos lados entre ${a}. Queda x = ${s}.`,
  }
}

export function currentRound(practice) {
  return practice?.rounds.at(-1)
}

export function pendingExercise(practice) {
  const round = currentRound(practice)
  return round?.instances.find(instance => !instance.response)
    ?? practice?.variants.find(instance => !instance.response)
}

export function findExercise(practice, id) {
  return practice?.rounds.flatMap(round => round.instances).find(instance => instance.id === id)
    ?? practice?.variants.find(instance => instance.id === id)
}

export function startRound(progress, moduleId, previous) {
  const practice = progress.practice?.[moduleId]
  const round = currentRound(practice)
  if (previous !== (round?.id ?? '') || (round && (!round.completedAt || pendingExercise(practice)))) return
  const instances = modules[moduleId].exercises.map(question => ({
    id: randomUUID(), exerciseId: question.id, version: question.version,
  }))
  const target = (progress.practice ??= {})[moduleId] ??= { rounds: [], variants: [] }
  target.rounds.push({ id: randomUUID(), instances })
}

export function offersVariants(moduleId) {
  return moduleId === template.moduleId
}

export function issueVariant(practice, previous) {
  const last = practice?.variants.at(-1)
  if (!currentRound(practice)?.completedAt) return null
  if (last && (!last.response || last.id !== previous)) return last
  if (!last && previous) return null
  const used = new Set(practice.variants.map(instance => equation(instance.parameters)))
  const available = variantPool.filter(parameters => !used.has(equation(parameters)))
  if (!available.length) return null
  const instance = {
    id: randomUUID(), exerciseId: template.id, version: template.version, parameters: available[randomInt(available.length)],
  }
  practice.variants.push(instance)
  return instance
}

export function answerExercise(practice, instance, value) {
  const response = grade(practiceQuestion(instance), value)
  if (response.error) return response
  instance.response = { ...response, date: new Date().toISOString() }
  const round = currentRound(practice)
  if (round.instances.every(item => item.response)) round.completedAt ??= instance.response.date
  return response
}
