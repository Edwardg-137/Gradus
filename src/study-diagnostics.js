import { studyQuestion } from './study-content.js'

// Casos nuevos a partir de los objetivos y malentendidos de las lecciones de Nexora.
const cases = {
  'manipulacion-algebraica': {
    basico: [
      n => [`Alguien reduce ${n}x² + 4x² a ${n + 4}x⁴. ¿Qué error cometió?`, 'Sumó exponentes al combinar términos', 'Solo debía multiplicar los coeficientes', 'Los términos no se pueden combinar', 'Los dos términos comparten x². Se suman coeficientes y la potencia sigue siendo 2.'],
      n => [`Un inventario registra ${n}a − 3b − ${n + 5}a + 8b. ¿Cuál es el coeficiente de a después de reducir la expresión?`, -5,
        'Se suman con signo los dos coeficientes de a y los términos en b se agrupan aparte', 'Las cuatro cantidades se combinan en un solo coeficiente', 'El término negativo en a se vuelve positivo al combinarlo', 'El coeficiente es el saldo de a: se restan 5 unidades más de las que entran.'],
    ],
    intermedio: [
      n => [`Al expandir −2(x − ${n}), una persona escribe −2x − ${2 * n}. ¿Qué debe corregir?`, 'El producto de los dos negativos es positivo', 'La x debe quedar con signo positivo', 'El factor solo multiplica a la x', 'El término constante correcto es positivo. El término en x conserva el coeficiente −2.'],
      n => [`Dos proveedores expresan una medida como 3(2x − ${n}) + 4x y como 2(5x + 1). ¿Qué constante debes sumar a la primera expresión para que ambas sean equivalentes para todo x?`, 3 * n + 2,
        'Tras distribuir ambas tienen 10x, así que solo se comparan sus constantes', 'Se igualan al evaluar en x = 1 y se cambia el coeficiente de x', 'Hay que sumar los dos términos constantes sin atender a sus signos', `Quedan 10x − ${3 * n} y 10x + 2. La diferencia constante es ${3 * n + 2}.`],
    ],
    avanzado: [
      n => [`Para ${n}x² + ${n}x, el resultado ${n}x(x) omite algo. ¿Qué término falta en el paréntesis?`, 'Un 1, por dividir el segundo término entre el factor común', 'Un 0, porque el segundo término desaparece', 'Un x², para recuperar el grado original', 'Dividir un término no nulo entre sí mismo da 1. La factorización se verifica expandiendo.'],
      n => [`Un taller junta áreas para formar (x + 3)(x + ${n}) m². Una sección x(x + 3) m² ya está cubierta. ¿Cuántos m² faltan cuando x = 4?`, 7 * n,
        'Se extrae el factor común x + 3 y la diferencia de los otros factores queda constante', 'Se cancelan los dos términos con x y el resultado ya no depende de x', 'Se multiplica la diferencia de áreas por el área original para hallar el resto', `La diferencia se factoriza como ${n}(x + 3). Cuando x = 4 da ${7 * n} m².`],
    ],
  },
  'modelacion-matematica': {
    basico: [
      n => [`Se pide «el triple de la suma de x y ${n}». ¿Por qué 3x + ${n} cambia el sentido?`, 'Deja el segundo sumando fuera del triple', 'Triplica dos veces el valor fijo', 'Convierte la suma en una resta', 'La expresión que representa la frase agrupa toda la suma con paréntesis.'],
      n => [`Una persona paga Q ${n} por alquilar una bicicleta y Q 4 por cada hora de uso. ¿Cuántos quetzales paga por tres horas?`, n + 12,
        'El alquiler fijo se paga una sola vez y la tarifa se multiplica por tres', 'La suma de alquiler y tarifa se multiplica por tres', 'El precio fijo se divide entre las tres horas y se omite la tarifa', `El modelo para h horas es ${n} + 4h. Con h = 3 se obtiene Q ${n + 12}.`],
    ],
    intermedio: [
      n => [`En C(d) = ${n} + 5d, d está en kilómetros y C en quetzales. ¿Qué unidades tiene el 5?`, 'Quetzales por kilómetro', 'Kilómetros por quetzal', 'Quetzales por viaje', 'La tasa por distancia debe quedar en quetzales después de multiplicarla por kilómetros.'],
      n => [`Un depósito recibe agua a ritmo constante. A los 2 minutos hay ${n + 10} L y a los 6 hay ${n + 30} L. ¿Cuántos litros había al inicio?`, n,
        'Se calcula el aumento por minuto y se descuentan los dos primeros minutos del primer dato', 'Se divide el valor a los dos minutos entre dos porque el depósito arranca vacío', 'Se toma la diferencia entre mediciones como valor inicial', `Entre las mediciones entran 20 L en 4 minutos. A los 2 minutos ya entraron 10 L y el volumen inicial era ${n} L.`],
    ],
    avanzado: [
      n => [`Para comprar cajas a Q 7 con Q ${n} de entrega, el cálculo continuo permite 5,8 cajas. ¿Qué modelo es válido para el pedido?`, 'Cinco cajas enteras y comprobación del costo', 'Seis cajas por redondeo al entero más cercano', 'Cinco cajas y ocho décimas en el mismo pedido', 'Las cajas son indivisibles y redondear hacia arriba puede superar el presupuesto.'],
      n => [`Un proveedor cobra Q ${3 * n} de cuota y Q 3 por caja. Otro cobra Q 6 por caja sin cuota. Se comprarán ${n + 4} cajas y el presupuesto es Q ${6 * n + 15}. ¿Cuántos quetzales sobran con el plan viable?`, 3,
        'Se sustituyen las mismas unidades, se descarta el plan que excede el tope y se resta al presupuesto el costo viable', 'Se usan las cajas del punto de equilibrio aunque sean menos de las necesarias', 'Se descarta siempre el plan con cuota fija y se resta la tarifa unitaria', `El primero cuesta Q ${6 * n + 12} y el segundo Q ${6 * n + 24}. Solo el primero cumple el tope y sobran Q 3.`],
    ],
  },
  'resolucion-ecuaciones': {
    basico: [
      n => [`En x + ${n} = ${n + 5}, una persona borra ${n} del primer lado y deja el otro intacto. ¿Qué se perdió?`, 'La equivalencia de la igualdad', 'El valor del coeficiente de x', 'La posibilidad de comprobar la solución por sustitución', 'Debes restar la misma cantidad en ambos miembros.'],
      n => [`Un estante tenía ${n} libros, recibe x libros y queda con ${2 * n + 3}. ¿Cuántos llegaron?`, n + 3,
        'Se resta el inventario inicial de ambos miembros y se comprueba que el nuevo total coincide', 'Se divide el total entre la cantidad inicial para encontrar el incremento', 'Se suma el inventario inicial al total para aislar la incógnita', `En ${n} + x = ${2 * n + 3}, al restar ${n} queda x = ${n + 3}.`],
    ],
    intermedio: [
      n => [`En 2(x − ${n}) = x + 7, se propuso 2x − ${n} = x + 7. ¿Qué regla falla?`, 'El 2 multiplica también al término constante', 'Es obligatorio dividir ambos lados entre 2 primero', 'La x del segundo miembro se debe duplicar al distribuir el primero', 'El paréntesis se expande a 2x menos el doble del término constante.'],
      n => [`Dos equipos arman 3 lotes de x + 2 piezas en total por lote y 4 lotes de x piezas respectivamente. Si al segundo le sobran ${n} piezas tras igualar la cantidad del primero, ¿cuántas piezas hay en cada lote del segundo?`, n + 6,
        'La diferencia 4x − 3(x + 2) debe ser el sobrante positivo', 'Los dos totales se suman para obtener el sobrante', 'La diferencia se calcula quitando 2 del total del primer equipo una sola vez', `4x − 3(x + 2) = x − 6. Al igualar al sobrante queda x = ${n + 6}.`],
    ],
    avanzado: [
      n => [`En (x − ${n})(x + 2) = 7, alguien iguala los factores a cero. ¿Qué condición falta?`, 'Tener un producto igual a cero después de reordenar y factorizar', 'Tener factores con la misma variable y el mismo signo', 'Dividir ambos factores entre 7', 'La regla del producto cero solo permite anular factores cuando el producto es cero.'],
      n => [`Un rectángulo tiene ancho x y largo x + 3. El área es ${n * (n + 3)} m². ¿Cuántos metros mide el ancho posible?`, n,
        'Al reordenar se anula el producto de los factores y se descarta la raíz negativa por el contexto', 'La raíz negativa también representa otro ancho posible', 'Basta dividir el área entre 3 porque el largo supera al ancho por 3', `Queda (x − ${n})(x + ${n + 3}) = 0. Solo x = ${n} es una longitud positiva.`],
    ],
  },
  'relaciones-en-el-plano': {
    basico: [
      n => [`Desde (−${n}, 3) hasta (${n}, 3), alguien dice que la distancia es cero porque las abscisas se cancelan al sumar. ¿Qué operación corresponde?`, 'El valor absoluto de la diferencia de las abscisas', 'El valor absoluto de la suma de las ordenadas', 'El promedio de las abscisas', 'Si la ordenada no cambia, la separación horizontal se obtiene restando las abscisas.'],
      n => [`Un vehículo va en línea recta por la misma calle de (2, −${n}) a (2, ${n + 3}). ¿Cuántas unidades avanzó?`, 2 * n + 3,
        'Mantiene su coordenada horizontal y la separación se obtiene restando las verticales', 'Se suman ambas ordenadas y se ignora la parte del recorrido bajo el eje', 'Se restan las dos coordenadas horizontales para medir el recorrido', `Solo cambia y. La diferencia es ${n + 3} − (−${n}) = ${2 * n + 3}.`],
    ],
    intermedio: [
      n => [`Al pasar de (1, ${n + 6}) a (4, ${n}), ¿por qué la pendiente es negativa?`, 'La coordenada vertical disminuye mientras la horizontal crece', 'La recta cruza el eje vertical', 'La diferencia horizontal es negativa aunque se avance a la derecha', 'La variación vertical es −6 y la horizontal es 3. La pendiente es −2.'],
      n => [`Una ruta recta pasa por (2, ${n + 4}) y (6, ${n + 12}). ¿En qué valor de y cruza el eje vertical?`, n,
        'Se calcula la pendiente y se retrocede desde un punto hasta x = 0', 'El primer punto de la lista siempre es el intercepto', 'Se promedian las dos ordenadas para obtener el corte', `La pendiente vale 2. Dos unidades hacia atrás desde x = 2 restan 4 a y. El intercepto es ${n}.`],
    ],
    avanzado: [
      n => [`Entre (−${n}, 0) y (2, 4), una persona usa ${n + 2} + 4 como distancia directa. ¿Qué midió?`, 'La longitud de un recorrido horizontal y vertical', 'La hipotenusa del triángulo formado por ambos puntos', 'El área bajo el segmento', 'La suma de los catetos es un camino por los ejes. La distancia directa se calcula con Pitágoras.'],
      n => [`Un dron parte de (−${n}, ${2 * n}) hacia (${2 * n}, ${6 * n}) y tiene alcance ${6 * n} unidades. ¿Cuántas unidades de alcance le sobran al llegar en línea recta?`, n,
        `Los desplazamientos ${3 * n} y ${4 * n} son catetos. Se resta la hipotenusa del alcance`, 'Se suman los cambios horizontal y vertical antes de restar del alcance', 'Se toma solo el desplazamiento vertical como distancia directa', `Los cambios son ${3 * n} y ${4 * n}. La distancia es ${5 * n} y sobran ${n} unidades.`],
    ],
  },
}

function choice(labels, rotation) {
  const keys = ['a', 'b', 'c']
  return { options: Object.fromEntries(keys.map((key, index) => [key, labels[(index + rotation) % 3]])),
    key: keys[(3 - rotation) % 3] }
}

export function testQuestion(id, difficulty, index, parameter, rotation = parameter % 3) {
  if (index < 6) return studyQuestion(id, difficulty, index, parameter, rotation)
  const [prompt, solution, a, b, c, detail] = cases[id][difficulty][index - 6](parameter)
  const templateId = `${id}-${difficulty}-${index + 1}`
  const base = { id: `${templateId}-${parameter}`, templateId, version: 2, competencyId: id, difficulty, parameter, prompt, explanation: detail ?? c }
  return index === 6
    ? { ...base, format: 'choice', dimension: 'conceptual', indicator: 'Detectar un error de razonamiento', ...choice([solution, a, b], rotation) }
    : { ...base, format: 'number', dimension: 'aplicacion', indicator: 'Resolver y justificar una decisión', key: solution, answerLabel: 'Respuesta',
      reasoning: { format: 'choice', prompt: '¿Qué procedimiento justifica tu respuesta?', ...choice([a, b, c], rotation) } }
}
