# Gradus entre básico y diversificado

Gradus busca elevar el nivel de matemáticas con diagnóstico, práctica y comprobaciones de retención. El MVP se enfoca en básico porque allí se forman las bases que se necesitan en diversificado. Para el pitch, el caso propuesto es el de una estudiante de tercero básico que se prepara para ingresar a Bachillerato.

## Producto y público

| Público | Necesidad | Valor que Gradus busca demostrar |
| --- | --- | --- |
| Estudiantes y familias | Reforzar matemáticas y prepararse para un proceso de ingreso | Saber qué practicar y comprobar qué habilidades se sostienen con el tiempo |
| Colegios | Detectar brechas y acompañar el avance | Priorizar refuerzos y observar el avance del grupo. La mejora de rendimiento y reputación es una hipótesis del piloto |
| Universidades | Recibir estudiantes mejor preparados en las bases de ingreso | Definir contenidos y diseñar cursos de preparación en colaboración, como línea de trabajo a largo plazo |

El ciclo de aprendizaje combina diagnóstico, ruta de práctica y reevaluación. Las metas, el progreso visible y las insignias pueden ayudar a sostener la práctica. Las insignias deben corresponder a evidencia de aprendizaje.

## Modelo comercial propuesto

- **Acceso gratuito con límites.** Una entrada abierta para diagnosticar y practicar. Queda por decidir qué alcance gratuito sigue siendo útil para estudiantes de básico.
- **Planes de pago para particulares.** Paquetes de preparación para procesos de ingreso y herramientas de apoyo al estudio. El alcance de una posible IA de apoyo sigue abierto.
- **Planes para instituciones.** Cursos alineados con los requisitos del colegio, herramientas para acompañar a sus estudiantes e indicadores agregados para evaluar el piloto.
- **Colaboraciones con universidades.** Cursos de nivelación ajustados a los requisitos de entrada de una carrera o institución.

## Caso preparado para el pitch

Ejecuta `npm start` y abre [el modo pitch local](http://127.0.0.1:3000/pitch). Cada escena se abre manualmente. El escenario usa un colegio, una estudiante y resultados ficticios. El recorrido está disponible como invitado.

1. **Curso y mapa.** Desde **Curso**, abre la propuesta de colaboración escolar. Lucía comienza con cuatro de cinco módulos cursados. **Mapa** permite abrir cada unidad y consultar su contenido y su evidencia.
2. **Intervención.** En **Hoy**, Gradus recomienda el repaso de distributiva porque venció su comprobación. **Práctica** muestra la fecha y el motivo. En el repaso, elige `−2x − 8` para mostrar un error de signo o `−2x − 4` para mostrar una distribución parcial. Gradus presenta una guía y un ejercicio acordes con el error.
3. **Comprobación y cierre.** Resuelve la guía y después la variante sin pista. El mapa abre el problema integrador. Elige `3(x + 4) + 6 = 48` y responde `10`. El examen final tiene cinco problemas de 20 puntos y se califica al enviarlo.
4. **Metas.** Acreditar tres objetivos y alcanzar 75 de 100 habilitaría una revisión prioritaria. Alcanzar 90 y confirmar la retención permitiría considerar una beca del 50 % de la colegiatura del primer ciclo. Después de un examen con ese puntaje, **Abrir seguimiento** abre la comprobación. La decisión le correspondería al colegio.

La demostración aplica las reglas de dominio de Gradus al historial ficticio y califica los ejercicios con reglas deterministas. El avance del ensayo viaja entre las pantallas. **Volver a empezar** reinicia el recorrido desde **Metas**. El convenio, la visita posterior y las condiciones de ingreso son simulaciones.

Para ensayar un examen de 100, responde `−7`, `−6x + 15`, `6`, `15 + 5c = 40` y `4`, en ese orden. En la visita posterior, elige `−10x + 20`.

## Decisiones por cerrar para un piloto

1. **Público y currículo.** Confirmar el grado, los temas requeridos para ingresar a diversificado, el tamaño de la cohorte y la duración del curso.
2. **Evaluación.** Acordar qué acredita cada objetivo, quién valida el examen, qué umbrales se usarán y cómo se comprobará el progreso con pruebas comparables y una revisión diferida.
3. **Convenio.** Definir qué aportará un colegio real, qué significa la preferencia, cuántas becas y cupos habría, qué cubren y quién decide su asignación.
4. **Datos y seguimiento.** Acordar qué información requiere el colegio, quién tendrá acceso, por cuánto tiempo se conservará y cómo se manejarán el consentimiento y la privacidad de menores.
5. **Modelo comercial.** Concretar los límites del acceso gratuito, los paquetes de pago y la función de una posible IA de apoyo.
