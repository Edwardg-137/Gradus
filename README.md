# Gradus

Gradus es una aplicación de estudio para diagnosticar y practicar dos habilidades de ecuaciones lineales. La [definición del MVP](definicion/README.md) describe la propuesta y el banco de ejercicios.

## Ejecutar en local

Con Node.js 24 o superior, ejecuta `npm start` y abre [Gradus](http://127.0.0.1:3000). `npm test` ejecuta las pruebas. El proyecto usa el módulo integrado `node:sqlite` y arranca sin instalar dependencias.

Las sesiones de invitado se guardan en `data/gradus.sqlite`. El navegador conserva la sesión mediante una cookie y el archivo permite recuperarla después de reiniciar el servidor.

## Recorrido de la demo

1. Abre **Medir mi punto de partida**. Elige restar 4 solo al lado izquierdo, elige dividir ambos lados entre 3, responde `13` y después `5`. Aparece la comprobación adicional.
2. Desde el resultado, abre **Mantener la igualdad** y completa sus tres ejercicios. Vuelve al resultado y elige **Comprobar mi avance**.
3. En la reevaluación, resta 7 a ambos lados, divide ambos lados entre 4 y responde `15` y `4`. El historial registra la mejora en igualdad, muestra la insignia y recomienda **Despejar la incógnita**.
4. Completa la ronda de **Despejar la incógnita** y pide dos variantes. Puedes volver al historial o explorar los dos cursos en **Catálogo**.

Para ensayar desde cero, abre una ventana privada. Usa respuestas sintéticas durante la demo.
