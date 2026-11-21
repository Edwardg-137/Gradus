# Gradus

Gradus es una aplicación de estudio que estima el dominio por competencia y vincula el resultado con práctica guiada. La [definición del MVP](definicion/README.md) describe el diagnóstico inicial de ecuaciones lineales.

## Ejecutar en local

Con Node.js 24 o superior, ejecuta `npm start` y abre [Gradus](http://127.0.0.1:3000). `npm test` ejecuta las pruebas. El proyecto usa el módulo integrado `node:sqlite` y arranca sin instalar dependencias.

Las sesiones de invitado se guardan en `data/gradus.sqlite`. El navegador conserva la sesión mediante una cookie y el archivo permite recuperarla después de reiniciar el servidor.

## Perfiles, estudio y pruebas

Crea un perfil con correo y contraseña desde **Mi perfil**. El avance del diagnóstico inicial de ese navegador pasa al perfil al registrarte. El estudio y el diagnóstico inicial siguen disponibles como invitado. Las pruebas nuevas y sus resultados se guardan en el perfil privado. En una instalación servida por HTTPS, activa `GRADUS_SECURE_COOKIE=1`.

- **Estudio** contiene Álgebra, Ecuaciones y Plano cartesiano. Cada competencia tiene conceptos, un ejemplo y cuatro actividades por dificultad.
- **Prueba rápida** presenta 9 preguntas por competencia de comprensión conceptual y procedimiento breve. Estima el dominio hasta Funcional con confianza baja.
- **Prueba completa** presenta 18 preguntas por competencia y añade problemas de aplicación. En Álgebra cubre las dos competencias y suma 36 preguntas. Los tiempos mostrados son estimados y puedes retomar la prueba más tarde.

El dominio se expresa como Inicial, En desarrollo, Funcional o Avanzado. Para subir de nivel se requieren aciertos en dificultades consecutivas y al menos un acierto en cada dimensión incluida. Una cobertura evaluable insuficiente deja el nivel pendiente. Para una categoría se usa el nivel menor de sus competencias y se indica cobertura parcial mientras falten resultados utilizables. El perfil prioriza el resultado completo más reciente con evidencia suficiente en cada competencia. Los umbrales son provisionales y requieren calibración con estudiantes.

## Recorrido de la demo

1. Abre **Medir mi punto de partida**. Elige restar 4 solo al lado izquierdo, elige dividir ambos lados entre 3, responde `13` y después `5`. Aparece la comprobación adicional.
2. Desde el resultado, abre **Mantener la igualdad** y completa sus tres ejercicios. Vuelve al resultado y elige **Comprobar mi avance**.
3. En la reevaluación, resta 7 a ambos lados, divide ambos lados entre 4 y responde `15` y `4`. El historial registra la mejora en igualdad, muestra la insignia y recomienda **Despejar la incógnita**.
4. Completa la ronda de **Despejar la incógnita** y pide dos variantes. Puedes volver al historial o explorar los dos cursos en **Catálogo**.

Para ensayar desde cero, abre una ventana privada. Usa respuestas sintéticas durante la demo.
