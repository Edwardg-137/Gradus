export const topic = {
  id: 'ecuaciones-lineales', area: 'Matemáticas', domain: 'Álgebra', title: 'Ecuaciones lineales',
}

export const skills = {
  igualdad: 'Mantener la igualdad',
  resolucion: 'Resolver ecuaciones lineales',
}

export const modules = {
  'mantener-igualdad': { title: 'Mantener la igualdad', skill: 'igualdad' },
  'despejar-incognita': { title: 'Despejar la incógnita', skill: 'resolucion' },
  'cantidad-desconocida': { title: 'Calcular una cantidad desconocida', skill: 'resolucion' },
}

function choice(id, indicator, prompt, options, key, explanation) {
  return { id, version: 1, skill: 'igualdad', indicator, prompt, format: 'choice', options, key, explanation }
}

function number(id, indicator, prompt, key, explanation) {
  return { id, version: 1, skill: 'resolucion', indicator, prompt, format: 'number', key, explanation }
}

export const initial = [
  choice('i-aditiva', 'Igualdad aditiva', '¿Qué operación aísla x en x + 4 = 10?', {
    ambos: 'Restar 4 a ambos lados', izquierda: 'Restar 4 solo al lado izquierdo', inversa: 'Sumar 4 a ambos lados',
  }, 'ambos', 'Resta 4 a ambos lados para conservar la igualdad. Queda x = 6.'),
  choice('i-multiplicativa', 'Igualdad multiplicativa', '¿Qué operación aísla x en 3x = 15?', {
    inversa: 'Multiplicar ambos lados por 3', ambos: 'Dividir ambos lados entre 3', izquierda: 'Dividir solo el lado izquierdo entre 3',
  }, 'ambos', 'Divide ambos lados entre 3 para conservar la igualdad. Queda x = 5.'),
  number('i-un-paso', 'Resolución de un paso', 'Resuelve x − 5 = 8.', 13, 'Suma 5 a ambos lados. Queda x = 13.'),
  number('i-dos-pasos', 'Resolución de dos pasos', 'Resuelve 2x + 3 = 11.', 4, 'Resta 3 a ambos lados. Queda 2x = 8. Divide ambos lados entre 2. Queda x = 4.'),
]

export const check = choice('i-comprobacion', 'Aplicar una operación a ambos lados',
  '¿Qué igualdad queda si restas 3 a ambos lados de x + 3 = 9?', {
    izquierda: 'x = 9', ambos: 'x = 6', inversa: 'x = 12',
  }, 'ambos', 'A la izquierda queda x y a la derecha queda 9 − 3 = 6. La igualdad resultante es x = 6.')
