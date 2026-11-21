export const difficulties = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }
export const dimensions = { conceptual: 'Comprensión conceptual', procedimental: 'Procedimiento', aplicacion: 'Razonamiento y aplicación' }

export const categories = {
  algebra: { title: 'Álgebra', competencies: ['manipulacion-algebraica', 'modelacion-matematica'] },
  ecuaciones: { title: 'Ecuaciones', competencies: ['resolucion-ecuaciones'] },
  'plano-cartesiano': { title: 'Plano cartesiano', competencies: ['relaciones-en-el-plano'] },
}

const concept = (indicator, build) => ({ dimension: 'conceptual', indicator, build })
const procedure = (indicator, build) => ({ dimension: 'procedimental', indicator, build })
const application = (indicator, build) => ({ dimension: 'aplicacion', indicator, build })

export const competencies = {
  'manipulacion-algebraica': {
    title: 'Manipulación algebraica', category: 'algebra',
    description: 'Lee, simplifica y transforma expresiones conservando su valor.',
    lessons: {
      basico: {
        concept: 'Un coeficiente multiplica a una variable. Los términos semejantes tienen la misma parte literal y se pueden combinar sumando sus coeficientes.',
        example: 'En 4x + 3x − 2, los primeros dos términos son semejantes. La expresión se simplifica a 7x − 2.',
        templates: [
          concept('Reconocer coeficientes', n => [`¿Qué representa ${n} en ${n}x + 3?`, 'El factor que multiplica a x', 'El valor que siempre tiene x', 'El término que se suma a x', `En ${n}x, el número ${n} multiplica a x.`]),
          concept('Distinguir términos semejantes', n => [`¿Cuál es un término semejante a ${n}x²?`, '3x²', '3x', '3xy', 'Los términos semejantes tienen las mismas variables con los mismos exponentes.']),
          procedure('Combinar coeficientes', n => [`Simplifica ${n}x + 3x. Escribe el coeficiente de x.`, n + 3, `Suma los coeficientes ${n} y 3. Queda ${n + 3}x.`]),
          application('Evaluar una expresión en contexto', n => [`En un juego obtienes ${n} puntos por ronda y 2 puntos de bono al final. La expresión ${n}r + 2 da el total. ¿Cuántos puntos obtienes con 3 rondas?`, n * 3 + 2, `Sustituye r por 3, multiplica y suma el bono. El total es ${n * 3 + 2}.`]),
          procedure('Restar términos semejantes', n => [`Simplifica ${n}y − y + 4. ¿Cuál es el coeficiente de y?`, n - 1, `El coeficiente de y es 1. Resta 1 de ${n} para obtener ${n - 1}.`]),
          application('Combinar medidas expresadas con la misma variable', n => [`Una guía mide ${n}u centímetros y se le añade una extensión de 4u centímetros. Si u = 2, ¿cuánto mide en total?`, 2 * n + 8, `La medida total es (${n} + 4)u. Con u = 2 da ${2 * n + 8} cm.`]),
        ],
      },
      intermedio: {
        concept: 'La propiedad distributiva multiplica cada término del paréntesis. Después puedes reunir términos semejantes.',
        example: '3(2x − 1) + x equivale a 6x − 3 + x, que se simplifica a 7x − 3.',
        templates: [
          concept('Reconocer la propiedad distributiva', n => [`¿Cuál es una expansión equivalente a 3(x + ${n})?`, `3x + ${3 * n}`, `3x + ${n}`, `x + ${3 * n}`, 'El 3 multiplica los dos términos dentro del paréntesis.']),
          concept('Distribuir un signo negativo', n => [`¿Qué expresión equivale a −(x − ${n})?`, `−x + ${n}`, `−x − ${n}`, `x + ${n}`, 'El signo menos cambia el signo de cada término.']),
          procedure('Distribuir y reunir términos', n => [`Simplifica 2(${n}x + 3) − 3x. ¿Cuál es el coeficiente de x?`, 2 * n - 3, `Distribuye el 2 y combina ${2 * n}x − 3x. El coeficiente es ${2 * n - 3}.`]),
          application('Combinar expresiones de un perímetro', n => [`Un rectángulo tiene lados x + ${n} y 2x + 4. Al simplificar su perímetro como ax + b, ¿cuánto vale b?`, 2 * n + 8, `Suma los dos lados y duplica el resultado. El término constante es 2(${n} + 4) = ${2 * n + 8}.`]),
          procedure('Distribuir una resta sobre un paréntesis', n => [`Simplifica 5 − 2(x − ${n}). ¿Cuál es el término constante?`, 5 + 2 * n, `Al distribuir −2 queda 5 − 2x + ${2 * n}. El término constante es ${5 + 2 * n}.`]),
          application('Simplificar el material que queda', n => [`Hay ${n}t + 12 cm de cinta. Se recortan dos pedazos de t + 3 cm cada uno. ¿Cuántos centímetros quedan si t = 4?`, 4 * n - 2, `Resta 2(t + 3). Queda ${n - 2}t + 6. Con t = 4 quedan ${4 * n - 2} cm.`]),
        ],
      },
      avanzado: {
        concept: 'Para multiplicar polinomios, distribuye cada término. Factorizar recorre el camino inverso y permite reconocer estructuras equivalentes.',
        example: '(x + 4)(x − 4) da x² − 16 porque los términos lineales se cancelan.',
        templates: [
          concept('Reconocer un factor común', n => [`¿Qué factorización equivale a 3x² + ${3 * n}x?`, `3x(x + ${n})`, `3(x + ${n})`, `x(3x + ${n})`, 'El factor común es 3x. Divide cada término por 3x para obtener el otro factor.']),
          concept('Reconocer una diferencia de cuadrados', n => [`¿Qué expresión resulta de expandir (x + ${n})(x − ${n})?`, `x² − ${n * n}`, `x² + ${n * n}`, `x² − ${2 * n}x + ${n * n}`, 'Los productos cruzados tienen signos opuestos y se cancelan.']),
          procedure('Multiplicar polinomios', n => [`Desarrolla (x + ${n})(2x + 3). ¿Cuál es el coeficiente del término de grado uno?`, 2 * n + 3, `Los productos que contienen x son 3x y ${2 * n}x. Su suma tiene coeficiente ${2 * n + 3}.`]),
          application('Calcular la diferencia entre áreas', n => [`Un patio rectangular mide (x + ${n}) por (x + 2) metros. Dentro hay un área cuadrada de lado x. ¿Cuántos metros cuadrados quedan fuera del cuadrado si x vale 3?`, 5 * n + 6, `Resta x² de (x + ${n})(x + 2). Queda ${n + 2}x + ${2 * n}. Con x = 3 obtienes ${5 * n + 6} m².`]),
          procedure('Identificar el término constante de un producto', n => [`Desarrolla (2x − ${n})(x + 3). ¿Cuál es el término constante?`, -3 * n, `El término constante es el producto (−${n}) × 3 = −${3 * n}.`]),
          application('Transferir un producto a un cálculo de beneficio', n => [`Un puesto vende x + ${n} paquetes a x + 2 quetzales cada uno. Su costo total es 2x + 4 quetzales. ¿Cuál es el beneficio en quetzales cuando x = 3?`, 5 * n + 5, `Resta 2x + 4 del producto (x + ${n})(x + 2). Con x = 3 queda 5(${n} + 3) − 10 = ${5 * n + 5}.`]),
        ],
      },
    },
  },
  'modelacion-matematica': {
    title: 'Modelación matemática', category: 'algebra',
    description: 'Representa situaciones con expresiones y explica qué significa el resultado.',
    lessons: {
      basico: {
        concept: 'Una variable representa una cantidad que puede cambiar. Una expresión combina esa cantidad con datos conocidos.',
        example: 'Si se pagan Q 4 por cuaderno y Q 6 de envío, el costo de c cuadernos es 4c + 6.',
        templates: [
          concept('Elegir una expresión para un costo', n => [`Cada boleto cuesta Q ${n} y hay Q 2 de servicio por pedido. ¿Qué expresión da el costo de b boletos?`, `${n}b + 2`, `b + ${n + 2}`, `${n + 2}b`, 'El precio unitario se multiplica por la cantidad. El servicio se suma una vez.']),
          concept('Interpretar una constante', n => [`La expresión 4k + ${n} da el costo de un viaje de k kilómetros. ¿Qué representa ${n}?`, 'El costo fijo del viaje', 'El costo por cada kilómetro', 'La distancia que siempre se recorre', 'El costo fijo es la cantidad que permanece cuando k vale cero.']),
          procedure('Evaluar una regla a partir de una cantidad', n => [`El total está dado por ${n}u + 5. ¿Cuál es el total cuando u = 2?`, 2 * n + 5, `Sustituye u por 2 y calcula ${n} × 2 + 5 = ${2 * n + 5}.`]),
          application('Representar una compra con costo fijo', n => [`Compras tres marcadores que cuestan Q ${n} cada uno. Te cobran Q 4 de entrega por todo el pedido. ¿Cuántos quetzales pagas?`, 3 * n + 4, `El pedido cuesta 3 × ${n} + 4 = ${3 * n + 4} quetzales.`]),
          procedure('Evaluar una regla de disminución', n => [`Usa la expresión ${20 + n} − 3v para hallar el valor cuando v = 2.`, n + 14, `Sustituye v por 2 y resta 6 de ${20 + n}. Resulta ${n + 14}.`]),
          application('Representar el saldo tras varios viajes', n => [`Una tarjeta tiene Q ${3 * n + 3}. Cada viaje descuenta Q ${n}. ¿Cuántos quetzales quedan después de dos viajes?`, n + 3, `Resta el costo de dos viajes, Q ${2 * n}, del saldo inicial. Quedan Q ${n + 3}.`]),
        ],
      },
      intermedio: {
        concept: 'Una ecuación relaciona un objetivo con una expresión. En una regla lineal, la tasa indica cuánto cambia el total al aumentar una unidad.',
        example: 'Si ya tienes Q 12 y ahorras Q 5 cada semana, llegar a Q 37 implica resolver 12 + 5s = 37. Son 5 semanas.',
        templates: [
          concept('Relacionar objetivo y cantidad acumulada', n => [`Tienes Q ${n} y ahorras Q 4 por semana. ¿Qué ecuación indica en cuántas semanas s llegas a Q ${n + 24}?`, `${n} + 4s = ${n + 24}`, `${n}s + 4 = ${n + 24}`, `4s = ${n + 24}`, 'El total es el ahorro inicial más el ahorro semanal por el número de semanas.']),
          concept('Interpretar una variación por unidad', n => [`Si V(t) = ${n} + 3t es el volumen en litros tras t minutos, ¿qué pasa con V cuando transcurren 2 minutos más?`, 'Sube 6 litros', 'Permanece igual', 'Sube 3 litros', 'Cada minuto adicional suma 3 litros. El volumen inicial no cambia.']),
          procedure('Despejar el dato que falta en un modelo', n => [`En la regla P = ${n} + 4d, P vale ${5 * n}. ¿Cuánto vale d?`, n, `Resta ${n} de ${5 * n} y divide entre 4. Resulta d = ${n}.`]),
          application('Interpretar una cantidad acumulada', n => [`Una botella tiene ${n} mL. Una máquina añade 5 mL por segundo. ¿Cuántos segundos necesita para alcanzar ${6 * n + 5} mL?`, n + 1, `Faltan ${5 * n + 5} mL. Divide esa cantidad entre 5 para obtener ${n + 1} segundos.`]),
          procedure('Recuperar la cantidad inicial', n => [`La regla W(t) = a + 3t da W(4) = ${n + 12}. ¿Qué valor tiene a?`, n, `Para t = 4 el aumento es 12. El valor inicial es ${n + 12} − 12 = ${n}.`]),
          application('Deducir una tarifa por unidad', n => [`Un recorrido de 3 km cuesta Q ${3 * n + 4}. El precio incluye Q 4 fijos y una tarifa igual por cada kilómetro. ¿Cuántos quetzales cobra por kilómetro?`, n, `Resta Q 4 y reparte el resto entre los 3 km. La tarifa es Q ${n} por kilómetro.`]),
        ],
      },
      avanzado: {
        concept: 'Comparar modelos puede requerir igualar dos costos. Si además hay un presupuesto y las unidades son enteras, debes comprobar qué cantidad es factible.',
        example: 'Un viaje cuesta Q 7 de inicio y Q 4 por kilómetro. Con Q 30 puedes pagar 5 kilómetros enteros: 6 kilómetros cuestan Q 31.',
        templates: [
          concept('Traducir un límite a una restricción', n => [`Cada artículo cuesta Q 5 y el pedido requiere Q ${n} de envío. Si B es el presupuesto, ¿qué condición deben cumplir las u unidades?`, `5u + ${n} ≤ B`, `5u + ${n} ≥ B`, `5u ≤ B + ${n}`, 'El total puede ser igual o menor que el presupuesto. El envío es fijo.']),
          concept('Inferir cuándo comparar modelos', n => [`Dos planes cuestan ${n} + 4m y ${2 * n} + 2m. ¿Qué condición permite encontrar cuándo cuestan lo mismo?`, 'Igualar sus costos para el mismo m', 'Comparar solo los cargos fijos', 'Igualar el precio por unidad de ambos planes', 'La comparación usa la misma cantidad m en ambos modelos.']),
          procedure('Determinar un punto de equilibrio', n => [`Encuentra el valor de m donde ${n} + 5m = ${4 * n} + 2m.`, n, `Resta 2m y ${n} a ambos lados. Queda 3m = ${3 * n}, así que m = ${n}.`]),
          application('Elegir una cantidad entera factible', n => [`Hay Q ${6 * n + 9} para una compra. El envío cuesta Q 7 y cada caja cuesta Q 6. ¿Cuál es el máximo de cajas completas que se puede comprar?`, n, `Quedan Q ${6 * n + 2} tras pagar el envío. Eso alcanza para ${n} cajas y sobran Q 2.`]),
          procedure('Comparar modelos con una diferencia objetivo', n => [`Dos planes cuestan 4u + 6 y 2u + ${2 * n + 2}. ¿Para cuántas unidades u el primero cuesta exactamente 4 más que el segundo?`, n, `Plantea 4u + 6 = 2u + ${2 * n + 2} + 4. Al simplificar queda 2u = ${2 * n}.`]),
          application('Combinar dos modelos y comparar su costo', n => [`Para imprimir ${n} hojas, un local cobra Q 7 de preparación y Q 6 por hoja. Otro cobra Q ${n + 7} de preparación y Q 3 por hoja. ¿Cuántos quetzales ahorras usando el segundo local?`, 2 * n, `Compara 7 + ${6 * n} con ${n + 7} + ${3 * n}. La diferencia es Q ${2 * n}.`]),
        ],
      },
    },
  },
  'resolucion-ecuaciones': {
    title: 'Resolución de ecuaciones', category: 'ecuaciones',
    description: 'Encuentra valores que hacen verdadera una igualdad y comprueba tus soluciones.',
    lessons: {
      basico: {
        concept: 'Para aislar la incógnita, aplica la operación inversa a ambos lados de la igualdad.',
        example: 'Para resolver x + 6 = 14, resta 6 a ambos lados. La solución es 8 porque 8 + 6 = 14.',
        templates: [
          concept('Reconocer la inversa de una suma', n => [`¿Qué operación conserva la igualdad y aísla x en x + ${n} = ${n + 4}?`, `Restar ${n} a ambos lados`, `Restar ${n} solo a la izquierda`, `Sumar ${n} a ambos lados`, 'Restar el mismo número de ambos lados conserva la igualdad.']),
          concept('Reconocer la inversa de un producto', n => [`¿Qué transformación aísla x en ${n}x = ${3 * n}?`, `Dividir ambos lados entre ${n}`, `Dividir solo el lado derecho entre ${n}`, `Restar ${n} a ambos lados`, 'La división entre el coeficiente deshace la multiplicación en ambos lados.']),
          procedure('Resolver una ecuación de un paso', n => [`Encuentra x en x − ${n} = ${n + 4}.`, 2 * n + 4, `Suma ${n} a ambos lados. x = ${2 * n + 4}.`]),
          application('Resolver una repartición equitativa', n => [`Hay ${4 * n} fichas repartidas en 4 bolsas iguales. La cantidad x en cada bolsa satisface 4x = ${4 * n}. ¿Cuántas fichas hay por bolsa?`, n, `Divide ${4 * n} entre 4 para obtener ${n} fichas.`]),
          procedure('Resolver un producto de un paso', n => [`Encuentra y en 3y = ${3 * (n + 2)}.`, n + 2, `Divide ambos lados entre 3. y = ${n + 2}.`]),
          application('Recuperar un valor anterior', n => [`Después de añadir 5 libros a una mesa quedan ${n + 5}. Usa x + 5 = ${n + 5}. ¿Cuántos libros había antes?`, n, `Resta 5 del total. Antes había ${n} libros.`]),
        ],
      },
      intermedio: {
        concept: 'En ecuaciones de varios pasos puedes simplificar o deshacer operaciones en orden inverso. Verifica la solución sustituyendo el valor en la igualdad original.',
        example: 'En 3(x + 2) = 24, divide ambos lados entre 3 y después resta 2. Con x = 6, ambos lados valen 24.',
        templates: [
          concept('Elegir un primer paso equivalente', n => [`En 3(x + ${n}) = ${3 * n + 12}, ¿qué igualdad obtienes al dividir ambos lados entre 3?`, `x + ${n} = ${n + 4}`, `x + ${n} = ${3 * n + 12}`, `x = ${n + 4}`, 'Al dividir ambos miembros por 3, queda el paréntesis sin su factor exterior.']),
          concept('Verificar una solución por sustitución', n => [`Para saber si x = ${n} resuelve 2x + 5 = ${2 * n + 5}, ¿qué comprobación haces?`, `Ver si 2(${n}) + 5 es ${2 * n + 5}`, `Ver si ${n} es ${2 * n + 5}`, `Ver si 2(${n}) es ${2 * n + 5}`, 'Sustituye x en la igualdad completa y comprueba ambos lados.']),
          procedure('Resolver una ecuación con paréntesis', n => [`Encuentra x en 4(x − 2) = ${4 * n}.`, n + 2, `Divide entre 4 para obtener x − 2 = ${n}. Suma 2 y obtienes x = ${n + 2}.`]),
          application('Encontrar una cantidad tras un cobro fijo', n => [`Un grupo pagó Q ${5 * n + 12}. El alquiler costó Q 12 y cada entrada Q 5. Usa 5x + 12 = ${5 * n + 12} para hallar cuántas entradas se compraron.`, n, `Resta el alquiler y divide lo que queda entre 5. Se compraron ${n} entradas.`]),
          procedure('Resolver una ecuación de dos operaciones', n => [`Encuentra z en 5z − ${n} = ${4 * n + 5}.`, n + 1, `Suma ${n} a ambos lados. Queda 5z = ${5 * n + 5}. Divide entre 5 para obtener z = ${n + 1}.`]),
          application('Determinar una longitud antes de cortar', n => [`Un rollo de ${2 * n + 5} m se divide en dos tramos iguales y sobra un trozo de 5 m. Usa 2x + 5 = ${2 * n + 5}. ¿Cuántos metros mide cada tramo igual?`, n, `Retira los 5 m que sobran y divide el resto entre 2. Cada tramo mide ${n} m.`]),
        ],
      },
      avanzado: {
        concept: 'Con incógnitas en ambos lados, reúne los términos con variable. Si se cancelan, la igualdad resultante te permite distinguir contradicciones e identidades.',
        example: 'En 5x + 2 = 3x + 14 queda 2x = 12. En 5x + 2 = 5x + 14 queda 2 = 14 y por tanto no hay solución.',
        templates: [
          concept('Distinguir una identidad de una contradicción', n => [`Al resolver 4x + ${n} = 4x + ${n + 2}, ¿cuántas soluciones hay?`, 'Ninguna, porque los términos constantes son distintos', 'Una, porque x desaparece', 'Infinitas, porque los coeficientes coinciden', `Al restar 4x queda ${n} = ${n + 2}, que es falso para cualquier x.`]),
          concept('Eliminar un denominador de toda la igualdad', n => [`¿Qué igualdad se obtiene al multiplicar x/3 + ${n} = 2x por 3?`, `x + ${3 * n} = 6x`, `x + ${n} = 6x`, `x + ${3 * n} = 2x`, 'Multiplica por 3 cada término de ambos lados.']),
          procedure('Despejar una incógnita presente en ambos lados', n => [`Encuentra x en 4(x + ${n}) = 2x + ${6 * n + 8}.`, n + 4, `Distribuye el 4, resta 2x y resta ${4 * n}. Queda 2x = ${2 * n + 8}. Entonces x = ${n + 4}.`]),
          application('Igualar balances que cambian en sentidos opuestos', n => [`Dos depósitos contienen ${4 * n + 2} y ${n + 2} litros. Por minuto, el primero pierde 2 litros y el segundo gana 1. ¿En qué minuto tendrán la misma cantidad?`, n, `Iguala ${4 * n + 2} − 2t con ${n + 2} + t. Queda 3t = ${3 * n}, así que t = ${n}.`]),
          procedure('Eliminar un denominador con incógnitas en ambos lados', n => [`Encuentra y en y/3 + ${2 * n} = y.`, 3 * n, `Multiplica toda la igualdad por 3. Queda y + ${6 * n} = 3y, así que y = ${3 * n}.`]),
          application('Resolver un reparto fraccionario con condiciones', n => [`En una caja hay x fichas. Se entrega la mitad a un equipo y un cuarto a otro. Quedan ${n} fichas. ¿Cuántas fichas había al inicio?`, 4 * n, `La igualdad es x − x/2 − x/4 = ${n}. Queda un cuarto del total, así que había ${4 * n} fichas.`]),
        ],
      },
    },
  },
  'relaciones-en-el-plano': {
    title: 'Ubicación y relaciones en el plano', category: 'plano-cartesiano',
    description: 'Interpreta coordenadas, compara desplazamientos y analiza relaciones entre puntos y rectas.',
    lessons: {
      basico: {
        concept: 'Un punto (x, y) indica un desplazamiento horizontal y uno vertical desde el origen. Los signos de ambas coordenadas identifican el cuadrante.',
        example: '(−3, 2) se ubica tres unidades a la izquierda y dos arriba del origen, en el segundo cuadrante.',
        templates: [
          concept('Identificar un cuadrante por los signos', n => [`¿En qué cuadrante está el punto (−${n}, 2)?`, 'Segundo cuadrante', 'Primer cuadrante', 'Tercer cuadrante', 'Una x negativa y una y positiva colocan el punto arriba y a la izquierda del origen.']),
          concept('Distinguir el eje horizontal del vertical', n => [`¿Sobre qué eje está el punto (${n}, 0)?`, 'Eje horizontal x', 'Eje vertical y', 'Sobre ambos ejes', 'Un punto con y igual a cero y x distinta de cero se encuentra sobre el eje x.']),
          procedure('Calcular un desplazamiento horizontal', n => [`Desde (${n}, 4) avanzas dos unidades a la izquierda. ¿Cuál es la nueva coordenada horizontal?`, n - 2, `Moverse a la izquierda resta 2 de x. La coordenada horizontal es ${n - 2}.`]),
          application('Leer un desplazamiento en un mapa', n => [`Un mapa ubica tu parada en (3, 1) y la biblioteca en (3, ${n + 1}). ¿Cuántas cuadras hacia el norte hay entre ambas?`, n, `Como x es igual en ambos puntos, calcula la diferencia vertical: ${n + 1} − 1 = ${n}.`]),
          procedure('Calcular un desplazamiento vertical', n => [`Desde (4, ${n + 1}) bajas 3 unidades. ¿Cuál es la nueva coordenada vertical?`, n - 2, `Bajar reduce y. Resta 3 de ${n + 1} y obtienes ${n - 2}.`]),
          application('Calcular una distancia entre posiciones con distinto signo', n => [`En el mapa, dos estaciones están en (−${n}, 4) y (${n + 2}, 4). ¿Cuántas unidades las separan en horizontal?`, 2 * n + 2, `Resta la coordenada izquierda de la derecha: ${n + 2} − (−${n}) = ${2 * n + 2}.`]),
        ],
      },
      intermedio: {
        concept: 'La pendiente compara el cambio vertical con el cambio horizontal. El punto medio se obtiene promediando las coordenadas por separado.',
        example: 'De (2, 1) a (6, 9), la pendiente es 8 ÷ 4 = 2. El punto medio es (4, 5).',
        templates: [
          concept('Interpretar una pendiente positiva', n => [`Una recta tiene pendiente ${n}. ¿Qué pasa con y cuando x aumenta una unidad?`, `Aumenta ${n}`, `Disminuye ${n}`, 'Permanece igual', 'La pendiente es el cambio vertical por cada unidad de avance horizontal.']),
          concept('Reconocer el criterio de punto medio', n => [`¿Cómo obtienes la coordenada horizontal del punto medio entre (${n}, 4) y (${n + 6}, 8)?`, 'Promediando solo las dos coordenadas horizontales', 'Restando las dos coordenadas verticales', 'Sumando las cuatro coordenadas y dividiendo entre 2', 'El punto medio promedia cada componente por separado.']),
          procedure('Calcular una pendiente a partir de dos puntos', n => [`Calcula la pendiente de la recta que pasa por (1, 2) y (3, ${2 * n + 2}).`, n, `El cambio vertical es ${2 * n} y el horizontal es 2. La pendiente es ${n}.`]),
          application('Ubicar un punto intermedio en un mapa', n => [`En un mapa se instalará una parada a mitad del segmento entre (2, 3) y (${2 * n + 2}, 9). ¿Cuál es la coordenada horizontal de la parada?`, n + 2, `Promedia 2 y ${2 * n + 2}. La coordenada horizontal es ${n + 2}.`]),
          procedure('Calcular una coordenada del punto medio', n => [`¿Cuál es la coordenada vertical del punto medio entre (2, 1) y (4, ${2 * n + 1})?`, n + 1, `Promedia las dos coordenadas verticales. (1 + ${2 * n + 1}) ÷ 2 = ${n + 1}.`]),
          application('Interpretar una pendiente descendente en un mapa', n => [`Un recorrido recto va de (1, ${2 * n + 8}) a (3, 8) en un plano. ¿Cuál es la pendiente con signo?`, -n, `El cambio vertical es −${2 * n}. Divide entre el avance horizontal, 2, para obtener −${n}.`]),
        ],
      },
      avanzado: {
        concept: 'En el cruce de dos rectas ambas reglas producen la misma coordenada vertical. Para hallar áreas con vértices oblicuos puedes usar el determinante de dos desplazamientos.',
        example: 'Las rectas y = 2x + 1 e y = x + 4 se cruzan donde 2x + 1 = x + 4, en (3, 7). Para un triángulo con vértices (0, 0), (4, 2) y (1, 3), el área es |4 × 3 − 2 × 1| ÷ 2 = 5.',
        templates: [
          concept('Reconocer rectas paralelas', n => [`¿Qué relación tienen las rectas y = ${n}x + 1 e y = ${n}x + 4?`, 'Son paralelas y no se cruzan', 'Se cruzan en el origen', 'Son la misma recta', 'Tienen la misma pendiente y distintos cortes con el eje y.']),
          concept('Justificar el criterio de intersección', n => [`Para hallar el cruce entre y = 2x + ${n} e y = 3x + 4, ¿qué relación debe cumplirse?`, `2x + ${n} = 3x + 4`, `2x + ${n} = 0`, 'Las dos pendientes deben coincidir', 'El punto de cruce tiene la misma x y la misma y en ambas rectas.']),
          procedure('Resolver la intersección de dos rectas', n => [`Encuentra la coordenada horizontal del cruce de y = 3x + 2 e y = x + ${2 * n + 2}.`, n, `Iguala las expresiones. Al restar x y 2 queda 2x = ${2 * n}, así que x = ${n}.`]),
          application('Calcular área con coordenadas', n => [`Un terreno triangular tiene vértices (1, 1), (${n + 1}, 3) y (2, ${2 * n + 3}). ¿Cuál es su área en unidades cuadradas? Puedes usar el determinante de dos lados que salen de (1, 1).`, n * (n + 1) - 1, `Los desplazamientos son (${n}, 2) y (1, ${2 * n + 2}). La mitad de su determinante absoluto es (${n} × ${2 * n + 2} − 2) ÷ 2 = ${n * (n + 1) - 1}.`]),
          procedure('Obtener la altura en el punto de cruce', n => [`¿Cuál es la coordenada vertical del cruce de y = 2x + 1 e y = x + ${n + 1}?`, 2 * n + 1, `Al igualar ambas expresiones queda x = ${n}. Sustituye en y = 2x + 1 para obtener ${2 * n + 1}.`]),
          application('Calcular una distancia directa con dos desplazamientos', n => [`En un mapa, un dron vuela en línea recta de (−${n}, 1) a (${2 * n}, ${4 * n + 1}). ¿Cuántas unidades vuela?`, 5 * n, `Recorre ${3 * n} unidades en horizontal y ${4 * n} en vertical. La distancia es √(${3 * n}² + ${4 * n}²) = ${5 * n}.`]),
        ],
      },
    },
  },
}

export function studyQuestion(competencyId, difficulty, templateIndex, parameter, optionRotation = parameter % 3) {
  const competency = competencies[competencyId]
  const { dimension, indicator, build } = competency.lessons[difficulty].templates[templateIndex]
  const [prompt, expected, ...details] = build(parameter)
  const templateId = `${competencyId}-${difficulty}-${templateIndex + 1}`
  const base = { id: `${templateId}-${parameter}`, templateId, parameter, version: 1,
    competencyId, categoryId: competency.category, difficulty, dimension, indicator, prompt }
  if (dimension !== 'conceptual') {
    return { ...base, format: 'number', key: expected, explanation: details[0], answerLabel: 'Respuesta' }
  }
  const options = {}
  const choices = [expected, ...details.slice(0, 2)]
  for (const [index, key] of ['a', 'b', 'c'].entries()) options[key] = choices[(index + optionRotation) % 3]
  return { ...base, format: 'choice', options, key: ['a', 'b', 'c'].find(key => options[key] === expected), explanation: details[2] }
}

export function studyScope(kind, id) {
  const collection = kind === 'categorias' ? categories : kind === 'competencias' ? competencies : null
  if (!collection || !Object.hasOwn(collection, id)) return null
  const item = collection[id]
  return { ...item, id, kind, path: `/estudio/${kind}/${id}`, competencies: item.competencies ?? [id] }
}
