# Gradus

## Propuesta de producto para el track 2 EdTech

**Cursor Hackathon · 21 de noviembre de 2026**

**Gradus es una plataforma de estudio que muestra qué habilidades has demostrado, te lleva a la práctica o al curso que necesitas y te permite comprobar qué cambió.** Su público principal son jóvenes de 12 a 20 años. La experiencia está abierta a cualquier persona que quiera fortalecer sus bases académicas. La primera versión se centra en matemáticas y la demostración del hackathon recorre un tema de álgebra: ecuaciones lineales.

### Resumen para la presentación

Un estudiante que falla una ecuación necesita saber qué hacer a continuación. Puede entender los pasos y cometer un error de cálculo, o puede estar cambiando solo un lado de la igualdad. Gradus comprueba esas habilidades por separado, recomienda una práctica concreta y reúne los cursos y el historial en el mismo lugar. Después de practicar, el estudiante responde ejercicios nuevos. Si demuestra una habilidad que antes estaba en desarrollo, Gradus registra el avance y otorga una insignia que muestra la evidencia del logro.

## 1. Problema y oportunidad

Una calificación resume el desempeño en un conjunto de ejercicios. Para continuar estudiando, el alumno necesita una indicación más concreta. Por ejemplo, dos estudiantes pueden equivocarse en `2x + 3 = 11`. Uno puede reconocer qué operación conserva la igualdad y equivocarse al dividir. El otro puede quitar el 3 únicamente del lado izquierdo. La primera persona se beneficia de resolver más ecuaciones y revisar su cálculo. La segunda necesita practicar qué ocurre al aplicar una operación a ambos lados.

También hay una decisión práctica después del diagnóstico. El estudiante tiene que encontrar un ejercicio, una explicación o un curso que corresponda con su dificultad. Gradus conecta el resultado con el módulo específico y reúne en un catálogo los cursos vinculados con cada habilidad. La utilidad de esa conexión se puede ver en el prototipo: el estudiante pasa de una respuesta a una recomendación explicada, abre el módulo desde allí y vuelve a comprobar la misma habilidad con una pregunta que aún no había visto.

## 2. Público y propuesta de valor

Gradus está diseñada para estudiantes de 12 a 20 años que quieran orientarse o reforzar una habilidad por cuenta propia. Puede servir al estudiante de secundaria al que le cuesta seguir un tema nuevo, o a alguien que está retomando matemáticas y quiere saber dónde empezar. La edad orienta el lenguaje, los ejemplos y el diseño de la experiencia. El resultado se obtiene de las respuestas y queda asociado a la habilidad evaluada.

La plataforma une cuatro acciones en un recorrido:

| Acción | Qué obtiene el estudiante |
|---|---|
| **Medir** | Una lectura de lo que ha demostrado en habilidades específicas y qué evidencia falta recoger. |
| **Practicar** | Ejercicios con retroalimentación, ejemplos resueltos y variantes que permiten volver a intentarlo. |
| **Encontrar cursos** | Un catálogo que reúne explicaciones y módulos organizados por las habilidades que desarrollan. |
| **Comprobar el avance** | Una reevaluación con ejercicios nuevos, un historial comparable y una insignia cuando se cumple el criterio de mejora. |

## 3. Alcance del MVP

El MVP entrega un ciclo completo en **Matemáticas → Álgebra → Ecuaciones lineales**. El tema permite observar un fundamento conceptual y una habilidad de resolución con preguntas breves, calificación determinista y retroalimentación que se entiende durante la demo.

| Componente | Alcance para el hackathon |
|---|---|
| Acceso | Web adaptable a teléfono. Sesión de invitado que se puede retomar al recargar en el mismo navegador. |
| Evaluación inicial | Cuatro preguntas, dos por habilidad. Hasta una comprobación adicional según la respuesta. |
| Resultado | Estado por habilidad, evidencia observable, motivo de la recomendación y acceso al módulo sugerido. |
| Cursos | Dos minicursos disponibles en un catálogo. Cada módulo indica qué habilidad trabaja. |
| Práctica | Seis ejercicios revisados repartidos entre los cursos y una plantilla de ecuaciones de dos pasos con valores variables. |
| Reevaluación | Cuatro preguntas inéditas, emparejadas con las iniciales por habilidad, formato y número de pasos. |
| Historial y recompensa | Comparación por habilidad y una insignia por tema cuando hay mejora demostrada. |

La ampliación a otros temas y materias sigue el mismo modelo de competencias, indicadores y módulos. Las evaluaciones integrales, la corrección de procedimientos abiertos, el tutor conversacional, la publicación de cursos por terceros y las certificaciones corresponden a etapas posteriores. El prototipo muestra un resultado sobre las dos habilidades de la tabla siguiente. Un perfil académico amplio requerirá más cobertura y un instrumento revisado con estudiantes.

## 4. Qué mide la evaluación

La estructura de contenido es **área → dominio → tema → habilidad → indicador → evidencia**. Una habilidad se describe mediante acciones que se pueden observar. Los cursos y los ejercicios de práctica apuntan a esas mismas habilidades, de modo que agregar otro curso amplía las formas de estudiarlas y conserva la forma de interpretar el resultado.

| Habilidad | Indicadores observables | Formato |
|---|---|---|
| **Mantener la igualdad** | Identifica qué operación inversa aplicar a ambos lados para aislar `x` en un caso aditivo y en un caso multiplicativo. | Selección múltiple. |
| **Resolver ecuaciones lineales** | Encuentra `x` en una ecuación de un paso y en otra de dos pasos. | Respuesta numérica. |

Las preguntas de igualdad aportan evidencia sobre la elección de una transformación. Las preguntas numéricas aportan evidencia sobre el resultado obtenido. El estudiante puede consultar la solución explicada al finalizar. El razonamiento escrito y la ejecución de cada paso quedan para actividades que puedan observarlos directamente. El tiempo que tarda el estudiante queda fuera del cálculo del resultado.

### Estado por habilidad

Se usan las dos preguntas principales de cada habilidad. El estado siempre se acompaña de la evidencia concreta y se refiere a esa evaluación.

| Respuestas en las dos preguntas | Estado que se muestra |
|---|---|
| Ambas correctas | **Demostrada en esta evaluación.** |
| Dos respuestas evaluables y cero o un acierto | **En desarrollo.** |
| Al menos una respuesta «No lo sé todavía» | **Evidencia insuficiente.** |

Una respuesta con formato inválido se puede corregir antes de enviarse. «No lo sé todavía» es una opción explícita que permite terminar el bloque y conserva la pregunta pendiente para futuras comprobaciones. Con dos preguntas por habilidad, la suficiencia de evidencia se expresa mediante estos estados y el detalle de respuestas. Las etiquetas de dominio amplio y los porcentajes de confianza se reservan para una evaluación con más cobertura.

### Adaptación y recomendación

Las cuatro preguntas principales son las mismas para cada estudiante en la evaluación inicial. Si en una pregunta de igualdad elige una opción que modifica un solo lado, al terminar el bloque aparece una comprobación adicional de esa misma idea, antes de revelar la corrección. La comprobación se abre como máximo una vez y aporta contexto a la explicación. El estado y la comparación con la reevaluación se calculan con las cuatro preguntas principales.

Por ejemplo, si el estudiante elige restar 4 solo a la izquierda de `x + 4 = 10`, la pregunta adicional le pide identificar qué igualdad resulta al restar 3 **a ambos lados** de `x + 3 = 9`. Si contesta bien, el resultado explica «Identificaste la transformación en el segundo ejemplo. Practica aplicarla también al despejar». Si vuelve a cambiar un solo lado, la explicación puede mostrar el efecto de esa operación concreta y enviar al mismo módulo. Si elige «No lo sé todavía», se conserva el motivo basado en la primera respuesta.

| Estado observado | Acción recomendada |
|---|---|
| Mantener la igualdad está en desarrollo o tiene evidencia insuficiente | Abrir **Mantener la igualdad**. |
| Mantener la igualdad está demostrada y resolver ecuaciones está en desarrollo o tiene evidencia insuficiente | Abrir **Despejar la incógnita**. |
| Las dos habilidades están demostradas | Probar **Calcular una cantidad desconocida** para aplicar la resolución en un contexto cotidiano. |

La recomendación usa una regla sencilla de prerrequisito y se presenta como orientación. El catálogo sigue disponible para explorar los módulos y volver al resultado. Este mismo orden de decisión se aplica al cierre de la reevaluación.

## 5. Experiencia del estudiante

1. **Entrar.** El inicio ofrece «Medir mi punto de partida». Antes de empezar, explica qué dos habilidades se van a comprobar y enumera los formatos de respuesta. El estudiante entra como invitado durante la demo.
2. **Responder.** La evaluación presenta una pregunta a la vez. Se guarda cada envío aceptado. El estudiante puede indicar que aún no sabe, continuar y recuperar el último punto guardado tras recargar. La retroalimentación se revela al cerrar el bloque.
3. **Interpretar el resultado.** Cada habilidad muestra su etiqueta, un ejemplo de evidencia y el siguiente paso. Una acción principal lleva al módulo recomendado. El detalle conserva las respuestas y sus explicaciones.
4. **Estudiar y practicar.** El módulo combina una explicación breve, un ejemplo resuelto y ejercicios con corrección inmediata. El estudiante puede volver a intentarlo. En el módulo de resolución, al terminar la ronda puede pedir otra ecuación de dos pasos con valores distintos.
5. **Comprobar el avance.** Tras terminar una ronda del módulo recomendado, el resultado ofrece «Comprobar mi avance». La reevaluación presenta los cuatro ejercicios del segundo bloque y guarda su resultado al cerrar.
6. **Consultar el historial.** La pantalla final muestra el antes y el después por habilidad, las respuestas que explican el cambio, la insignia si corresponde y la recomendación actual. El catálogo permanece disponible desde esa pantalla.

La interfaz muestra el estado mediante texto y permite avanzar con teclado. El formulario numérico presenta `x =` junto al campo y el mensaje de formato aparece junto a la respuesta. Las ecuaciones se mantienen legibles en pantalla estrecha. En práctica, las explicaciones se leen debajo del ejercicio para que el estudiante pueda comparar lo que envió con el procedimiento esperado.

## 6. Catálogo y práctica

El catálogo centraliza cursos breves que comparten habilidades. Cada curso muestra su nombre, qué se aprende y una lista de módulos disponibles. Una recomendación abre el mismo módulo accesible desde el catálogo. El progreso se registra por habilidad en el historial del estudiante.

| Curso | Módulo | Actividad |
|---|---|---|
| **Ecuaciones lineales desde la igualdad** | Mantener la igualdad | Elegir una operación, detectar una transformación incorrecta y reconocer el resultado de dividir ambos lados. |
| **Ecuaciones lineales desde la igualdad** | Despejar la incógnita | Resolver una ecuación de un paso y otra de dos pasos. Pedir otra variante paramétrica al finalizar. |
| **Ecuaciones en situaciones cotidianas** | Calcular una cantidad desconocida | Resolver una ecuación ya planteada a partir del costo de un pedido e interpretar la solución en unidades. |

La práctica se revisa editorialmente. Cada módulo identifica qué habilidad desarrolla y contiene una explicación, un ejemplo resuelto y las actividades correspondientes. El segundo curso muestra cómo una misma habilidad sirve en otro contexto. La actividad entrega la ecuación ya planteada, por lo que evidencia resolución e interpretación de la solución. Formular la ecuación a partir de un enunciado puede convertirse en otra habilidad evaluada cuando se amplíe el banco.

## 7. Ejercicios con valores cambiantes

Una plantilla de práctica conserva la estructura matemática y genera ejercicios con valores controlados. Para el MVP se usa **`ax + b = c`**, con `a` de 2 a 5, `b` de 2 a 9 y una solución entera `s` de 2 a 9. El servidor elige `a`, `b` y `s`, y calcula `c = a × s + b`. Así el estudiante practica restar el término independiente y dividir por el coeficiente en cada variante.

| Parámetros | Enunciado generado | Corrección |
|---|---|---|
| `a = 4`, `b = 3`, `s = 6` | Resuelve `4x + 3 = 27`. | Resta 3 a ambos lados. Queda `4x = 24`. Divide ambos lados entre 4. `x = 6`. |
| `a = 5`, `b = 4`, `s = 7` | Resuelve `5x + 4 = 39`. | Resta 4 a ambos lados. Queda `5x = 35`. Divide ambos lados entre 5. `x = 7`. |

### Generación y repetición

La plantilla tiene un identificador, una versión, restricciones, una clave derivada y un formato de explicación. El servidor guarda el identificador de la instancia y sus parámetros al emitirla. Al recargar, el estudiante recupera esa instancia. Al pedir otro ejercicio, se selecciona una combinación inédita en la sesión. El conjunto generado excluye las ecuaciones de los bloques de evaluación y de la práctica revisada. Hay 256 combinaciones posibles antes de aplicar las exclusiones, de modo que se pueden enumerar y verificar durante el desarrollo. Si el conjunto se agota, el módulo ofrece volver a su práctica revisada.

Las dos evaluaciones usan los bloques fijos del anexo. Esto facilita revisar que cubran los mismos tipos de pregunta y que sus ejercicios se mantengan reservados hasta el momento de evaluar. Cambiar valores dentro de la plantilla amplía la práctica disponible. Las variaciones que requieren nuevas operaciones, como manejar fracciones o coeficientes negativos, tendrán restricciones y criterios propios cuando esas habilidades se incorporen.

### Calificación y retroalimentación

- **Respuesta numérica.** El servidor interpreta toda la entrada y compara su valor exacto con la solución. Con solución 5, `5`, ` 5 `, `+5`, `5.0` y `5,0` se aceptan. `5,5` es un número y se califica como incorrecto. `5abc` se devuelve como error de formato y el ejercicio permanece abierto. El formato acepta un signo inicial y un separador decimal de punto o coma, con dígitos a ambos lados del separador cuando se use.
- **Selección múltiple.** El servidor recibe el identificador de una opción de la instancia. Cada pregunta tiene una única clave. Los distractores marcados permiten explicar decisiones observables, como restar en un solo lado o elegir la operación inversa equivocada.
- **Persistencia.** La interfaz recibe el enunciado y el identificador. El servidor conserva las claves de evaluación y los parámetros que determinan la respuesta de práctica. Un reenvío del mismo intento devuelve la corrección guardada. Una variante emitida conserva su versión hasta que termine la sesión.

Las comprobaciones de la plantilla cubren rangos, unicidad de parámetros, sustitución de la solución, coherencia entre enunciado y retroalimentación y exclusión de los ejercicios reservados. Para selección múltiple se revisan las opciones una a una y se verifica que exactamente una cumpla lo que pide el enunciado.

## 8. Historial e insignia de progreso

El historial guarda los resultados inicial y final de cada habilidad con sus respuestas y fechas, y registra qué módulos practicó el estudiante. La pantalla compara ambos resultados lado a lado. Si el estado se mantiene y hay un acierto adicional, puede mostrar el cambio en las respuestas dentro de ese estado.

Gradus otorga **Avance en ecuaciones lineales** cuando al menos una habilidad pasa de «En desarrollo» a «Demostrada en esta evaluación». El detalle de la insignia enumera las habilidades que cumplieron ese criterio y enlaza con la evidencia. Si ambas mejoran, se conserva una sola insignia que reconoce las dos. La recompensa se registra una vez por sesión y tema, incluso si el resultado se vuelve a enviar.

El cambio de «Evidencia insuficiente» a «Demostrada en esta evaluación» se presenta como **evidencia nueva**. En ese caso, la primera evaluación carecía de una base completa para comparar. La práctica y el resultado se conservan en el historial. La recompensa describe un cambio entre dos evaluaciones breves. Para comprobar si el aprendizaje se mantiene habrá que volver a evaluar en otro momento.

## 9. Implementación y datos

El prototipo puede funcionar como una aplicación web con lógica de evaluación en el servidor. Los ejercicios y módulos se configuran como contenido revisado. El servidor asigna la pregunta, comprueba la respuesta, actualiza el estado de la sesión y proyecta el resultado que muestra la interfaz. Una misma regla de contenido conecta cada pregunta y módulo con su habilidad. Eso permite agregar cursos y preguntas al catálogo sin reescribir la navegación ni la regla de progreso.

| Registro | Qué necesita guardar |
|---|---|
| Pregunta o plantilla | Identificador, versión, habilidad, indicador, formato, enunciado o parámetros, clave, explicación y distractores relevantes. |
| Sesión de invitado | Identificador opaco, tema, etapa del recorrido y acceso al historial de esa sesión. |
| Instancia de ejercicio | Identificador, referencia de contenido y, para las variantes, parámetros utilizados. |
| Respuesta | Instancia, respuesta enviada, corrección, fecha e identificador de envío. |
| Resultado | Habilidad, bloque evaluado, estado, evidencias y recomendación. |
| Curso y módulo | Título, objetivo, habilidades, explicación, ejemplo y ejercicios asociados. |
| Insignia | Sesión, tema, habilidades reconocidas y referencias a los dos resultados. |

Para la demo basta un banco pequeño y almacenamiento persistente de las sesiones de invitado. El resultado final y la insignia se guardan juntos para que recargar o reenviar una solicitud conserve un estado coherente. Si el envío se interrumpe, el alumno puede recuperar el punto guardado y reintentar. El recorrido tiene dos bloques evaluativos por sesión, con una reevaluación cerrada que sigue consultable en el historial.

La evaluación, la recomendación, la generación paramétrica y la concesión de la insignia funcionan con reglas deterministas. Una asistencia futura puede ayudar a redactar explicaciones o borradores de contenido. Publicar preguntas y modificar los criterios de evaluación exige revisión editorial y versionado.

### Privacidad durante la demostración

Se utiliza una sesión de invitado y un recorrido ensayado con respuestas sintéticas. El prototipo necesita las respuestas, el historial y la identificación técnica de la sesión. El acceso al historial es privado. Para un piloto con estudiantes se deberán definir el tratamiento de datos, la conservación, el borrado y el consentimiento aplicable antes de abrir el acceso a menores.

## 10. Construcción, demo y validación

### Orden de construcción

1. **Evaluación inicial y resultado.** Cargar el contenido del anexo, calificar los dos formatos y llevar una respuesta real hasta una recomendación justificada.
2. **Módulos y práctica.** Abrir el módulo correcto desde el resultado, mostrar retroalimentación y permitir una segunda ronda con otra instancia de la plantilla.
3. **Reevaluación e historial.** Completar el segundo bloque, comparar por habilidad y registrar la insignia según el criterio definido.
4. **Catálogo y ensayo.** Abrir ambos cursos desde un mismo lugar y probar recuperación de sesión, accesibilidad básica y el guion completo en una pantalla estrecha.

### Guion de demostración

1. En el primer bloque, elegir restar 4 solo a la izquierda y acertar la otra pregunta de igualdad. Resolver bien la ecuación de un paso y fallar la de dos pasos. Mostrar la pregunta adicional.
2. Abrir el resultado y completar la ronda recomendada de **Mantener la igualdad**. Detenerse en la corrección que muestra qué ocurre al aplicar la misma operación a ambos lados.
3. En la reevaluación, acertar ambas preguntas de igualdad y mantener un error en resolución. Mostrar el cambio de estado, la insignia y la nueva recomendación **Despejar la incógnita**.
4. Abrir **Despejar la incógnita**, completar la ronda breve y pedir dos ejercicios adicionales para mostrar cómo cambian los valores y se valida la respuesta. Cerrar con el historial y los dos cursos del catálogo.

### Criterios para considerar el MVP listo

| Comprobación | Resultado esperado |
|---|---|
| Error de modificar un solo lado en la evaluación inicial | Se emite una comprobación adicional y se explica una recomendación coherente. |
| «No lo sé todavía» en una pregunta principal | La habilidad se muestra con evidencia insuficiente y el resto del bloque se conserva. |
| Variantes de práctica | Dos emisiones sucesivas tienen parámetros distintos. Una recarga conserva el ejercicio emitido y el servidor valida su solución. |
| Reevaluación | Las preguntas son inéditas en la sesión y cubren los mismos indicadores que el primer bloque. |
| Mejora según el criterio | Aparece una insignia con las evidencias que la justifican. Un reenvío conserva un solo registro. |
| Mismos estados en ambos bloques | El historial muestra ambos resultados y mantiene la insignia pendiente. |
| Navegación y recuperación | Los dos cursos abren desde el catálogo. Es posible retomar la sesión tras recargar y usar el flujo con teclado o en una pantalla estrecha. |

### Qué comprobar en un piloto

El primer piloto debe observar si un estudiante entiende su resultado, puede explicar por qué le recomendaron un módulo y consigue recorrer el ciclo por cuenta propia. La revisión educativa debe comprobar si los bloques tienen una exigencia comparable, si los distractores realmente reflejan las dificultades previstas y si el progreso se mantiene en una evaluación diferida. Con esos resultados se puede ajustar el banco y ampliar la cobertura antes de introducir niveles de dominio más amplios.

## Anexo A. Banco inicial del MVP

El banco incluye ocho preguntas de evaluación, una comprobación adaptativa y seis de práctica, además de la plantilla dinámica. Las claves y explicaciones se presentan aquí como parte de la especificación editorial.

### Bloques de evaluación

| Habilidad | Evaluación inicial | Reevaluación |
|---|---|---|
| Igualdad aditiva | ¿Qué operación aísla `x` en `x + 4 = 10`? **Restar 4 a ambos lados.** | ¿Qué operación aísla `x` en `x + 7 = 15`? **Restar 7 a ambos lados.** |
| Igualdad multiplicativa | ¿Qué operación aísla `x` en `3x = 15`? **Dividir ambos lados entre 3.** | ¿Qué operación aísla `x` en `4x = 28`? **Dividir ambos lados entre 4.** |
| Resolución de un paso | Resuelve `x − 5 = 8`. **`x = 13`.** | Resuelve `x − 6 = 9`. **`x = 15`.** |
| Resolución de dos pasos | Resuelve `2x + 3 = 11`. **`x = 4`.** | Resuelve `3x + 2 = 17`. **`x = 5`.** |

En la pregunta aditiva, las opciones son restar el término a ambos lados, restarlo solo al lado izquierdo y sumarlo a ambos lados. En la multiplicativa, son dividir ambos lados entre el coeficiente, dividir solo el izquierdo y multiplicar ambos lados por el coeficiente. Las posiciones de la clave pueden variar entre preguntas. La opción que modifica solo el lado izquierdo activa la comprobación adicional de la evaluación inicial.

**Comprobación adaptativa.** ¿Qué igualdad queda si restas 3 a ambos lados de `x + 3 = 9`? Opciones `x = 9`, `x = 6` y `x = 12`. La clave es `x = 6`. La primera opción conserva el lado derecho y aporta evidencia compatible con la dificultad que motivó la pregunta. La tercera da pie a repasar cómo se resta en el lado derecho. El enunciado explicita la operación para observar cómo se aplica a la igualdad.

### Práctica revisada

| Módulo | Ejercicio | Clave o explicación |
|---|---|---|
| Mantener la igualdad | ¿Qué operación aísla `x` en `x − 2 = 7`? | Sumar 2 a ambos lados. |
| Mantener la igualdad | Al pasar de `2x = 14` a `x = 14`, ¿qué lado quedó sin dividir? | El derecho. Al dividir ambos lados entre 2 queda `x = 7`. |
| Mantener la igualdad | ¿Qué igualdad resulta al dividir ambos lados de `5x = 30` entre 5? | `x = 6`. |
| Despejar la incógnita | Resuelve `x + 9 = 17`. | `x = 8`. Se resta 9 a ambos lados. |
| Despejar la incógnita | Resuelve `3x − 4 = 14`. | `x = 6`. Se suma 4 a ambos lados y se divide entre 3. |
| Calcular una cantidad desconocida | Un pedido cuesta Q 38.00, incluidos Q 8.00 de envío. Cada cuaderno cuesta Q 5.00. Usa `5x + 8 = 38` para encontrar cuántos cuadernos se pidieron. | `x = 6`. La solución representa seis cuadernos. |
