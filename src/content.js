export const topic = {
  id: 'ecuaciones-lineales', area: 'Matemáticas', domain: 'Álgebra', title: 'Ecuaciones lineales',
}

export const skills = {
  igualdad: 'Mantener la igualdad',
  resolucion: 'Resolver ecuaciones lineales',
}

function choice(id, indicator, prompt, options, key, explanation) {
  return { id, version: 1, skill: 'igualdad', indicator, prompt, format: 'choice', options, key, explanation }
}

function number(id, indicator, equation, key, explanation, prompt = `Resuelve ${equation}.`) {
  return { id, version: 1, skill: 'resolucion', indicator, equation, prompt, format: 'number', key, explanation }
}

export const initial = [
  choice('i-aditiva', 'Igualdad aditiva', '¿Qué operación aísla x en x + 4 = 10?', {
    ambos: 'Restar 4 a ambos lados', izquierda: 'Restar 4 solo al lado izquierdo', inversa: 'Sumar 4 a ambos lados',
  }, 'ambos', 'Resta 4 a ambos lados para conservar la igualdad. Queda x = 6.'),
  choice('i-multiplicativa', 'Igualdad multiplicativa', '¿Qué operación aísla x en 3x = 15?', {
    inversa: 'Multiplicar ambos lados por 3', ambos: 'Dividir ambos lados entre 3', izquierda: 'Dividir solo el lado izquierdo entre 3',
  }, 'ambos', 'Divide ambos lados entre 3 para conservar la igualdad. Queda x = 5.'),
  number('i-un-paso', 'Resolución de un paso', 'x − 5 = 8', 13, 'Suma 5 a ambos lados. Queda x = 13.'),
  number('i-dos-pasos', 'Resolución de dos pasos', '2x + 3 = 11', 4, 'Resta 3 a ambos lados. Queda 2x = 8. Divide ambos lados entre 2. Queda x = 4.'),
]

export const check = choice('i-comprobacion', 'Aplicar una operación a ambos lados',
  '¿Qué igualdad queda si restas 3 a ambos lados de x + 3 = 9?', {
    izquierda: 'x = 9', ambos: 'x = 6', inversa: 'x = 12',
  }, 'ambos', 'A la izquierda queda x y a la derecha queda 9 − 3 = 6. La igualdad resultante es x = 6.')

export const followUp = [
  choice('f-aditiva', 'Igualdad aditiva', '¿Qué operación aísla x en x + 7 = 15?', {
    izquierda: 'Restar 7 solo al lado izquierdo', ambos: 'Restar 7 a ambos lados', inversa: 'Sumar 7 a ambos lados',
  }, 'ambos', 'Resta 7 a ambos lados para conservar la igualdad. Queda x = 8.'),
  choice('f-multiplicativa', 'Igualdad multiplicativa', '¿Qué operación aísla x en 4x = 28?', {
    ambos: 'Dividir ambos lados entre 4', inversa: 'Multiplicar ambos lados por 4', izquierda: 'Dividir solo el lado izquierdo entre 4',
  }, 'ambos', 'Divide ambos lados entre 4 para conservar la igualdad. Queda x = 7.'),
  number('f-un-paso', 'Resolución de un paso', 'x − 6 = 9', 15, 'Suma 6 a ambos lados. Queda x = 15.'),
  number('f-dos-pasos', 'Resolución de dos pasos', '3x + 2 = 17', 5, 'Resta 2 a ambos lados. Queda 3x = 15. Divide ambos lados entre 3. Queda x = 5.'),
]

export const modules = {
  'mantener-igualdad': {
    title: 'Mantener la igualdad', skill: 'igualdad',
    lesson: 'Una ecuación dice que ambos lados tienen el mismo valor. Si sumas o restas un número, hazlo en ambos lados. Lo mismo vale al multiplicar o dividir por un número distinto de cero. Para aislar x, elige la operación inversa.',
    example: 'En x + 6 = 11, resta 6 a ambos lados. Queda x + 6 − 6 = 11 − 6, así que x = 5.',
    exercises: [
      choice('p-inversa', 'Igualdad aditiva', '¿Qué operación aísla x en x − 2 = 7?', {
        izquierda: 'Sumar 2 solo al lado izquierdo', inversa: 'Restar 2 a ambos lados', ambos: 'Sumar 2 a ambos lados',
      }, 'ambos', 'Sumar 2 a ambos lados deshace la resta y conserva la igualdad. Queda x = 9.'),
      choice('p-un-lado', 'Identificar una transformación que rompe la igualdad', 'Al pasar de 2x = 14 a x = 14, ¿qué lado quedó sin dividir?', {
        izquierdo: 'El lado izquierdo', derecho: 'El lado derecho', ninguno: 'Se dividieron ambos lados',
      }, 'derecho', 'El lado derecho quedó en 14. Al dividir también 14 entre 2, queda x = 7.'),
      choice('p-division', 'Igualdad multiplicativa', '¿Qué igualdad resulta al dividir ambos lados de 5x = 30 entre 5?', {
        seis: 'x = 6', treinta: 'x = 30', cientoCincuenta: 'x = 150',
      }, 'seis', 'A la izquierda, 5x ÷ 5 = x. A la derecha, 30 ÷ 5 = 6. Queda x = 6.'),
    ],
  },
  'despejar-incognita': {
    title: 'Despejar la incógnita', skill: 'resolucion',
    lesson: 'Deshacer las operaciones en ambos lados permite dejar x sola. En una ecuación de dos pasos, primero deshaz la suma o la resta y después divide por el coeficiente.',
    example: 'En 6x + 1 = 43, resta 1 a ambos lados. Queda 6x = 42. Divide ambos lados entre 6. Queda x = 7.',
    exercises: [
      number('p-un-paso', 'Resolución de un paso', 'x + 9 = 17', 8, 'Resta 9 a ambos lados. Queda x = 8.'),
      number('p-dos-pasos', 'Resolución de dos pasos', '3x − 4 = 14', 6, 'Suma 4 a ambos lados. Queda 3x = 18. Divide ambos lados entre 3. Queda x = 6.'),
    ],
  },
  'cantidad-desconocida': {
    title: 'Calcular una cantidad desconocida', skill: 'resolucion',
    lesson: 'Una ecuación puede separar un costo fijo de un costo por unidad. Resta el costo fijo y divide el resultado por el precio de una unidad. Explica qué representa el número en la situación.',
    example: 'Si un pedido cuesta Q 41 con Q 5 de envío y cada lápiz cuesta Q 6, la ecuación es 6x + 5 = 41. Resta 5 y divide entre 6. x = 6 representa seis lápices.',
    exercises: [
      number('p-cuadernos', 'Resolución e interpretación', '5x + 8 = 38', 6,
        'Resta 8 a ambos lados. Queda 5x = 30. Divide entre 5. x = 6 significa que se pidieron seis cuadernos.',
        'Un pedido cuesta Q 38.00, incluidos Q 8.00 de envío. Cada cuaderno cuesta Q 5.00. Usa 5x + 8 = 38 para encontrar cuántos cuadernos se pidieron.'),
    ],
  },
}

export const courses = {
  'ecuaciones-desde-la-igualdad': {
    title: 'Ecuaciones lineales desde la igualdad',
    objective: 'Elige operaciones que conservan la igualdad y calcula el valor de la incógnita.',
    modules: ['mantener-igualdad', 'despejar-incognita'],
  },
  'ecuaciones-en-situaciones-cotidianas': {
    title: 'Ecuaciones en situaciones cotidianas',
    objective: 'Resuelve una ecuación que describe un pedido e interpreta la solución en unidades.',
    modules: ['cantidad-desconocida'],
  },
}
