# Gradus

Gradus es una aplicación de estudio que estima el dominio por competencia y vincula el resultado con práctica guiada. La [definición del MVP](definicion/README.md) describe el diagnóstico inicial de ecuaciones lineales.

## Ejecutar en local

Con Node.js 24 o superior, ejecuta `npm start` y abre [Gradus](http://127.0.0.1:3000). `npm test` ejecuta las pruebas. El proyecto usa el módulo integrado `node:sqlite` y arranca sin instalar dependencias.

Las sesiones de invitado se guardan en `data/gradus.sqlite`. El navegador conserva la sesión mediante una cookie y el archivo permite recuperarla después de reiniciar el servidor.

## Perfiles, estudio y pruebas

Crea un perfil con correo y contraseña desde **Mi perfil**. El avance del diagnóstico inicial de ese navegador pasa al perfil al registrarte. El estudio y el diagnóstico inicial siguen disponibles como invitado. Las pruebas nuevas y sus resultados se guardan en el perfil privado. En una instalación servida por HTTPS, activa `GRADUS_SECURE_COOKIE=1`.

- **Estudio** contiene Álgebra, Ecuaciones y Plano cartesiano. Cada dificultad ofrece una lección rápida o completa para toda la categoría o para una competencia. Las lecciones presentan un concepto, un ejemplo resuelto y dos o cuatro actividades por competencia, con pistas, solución y corrección. Puedes retomar la lección al recargar.
- **Prueba rápida** presenta 9 preguntas por competencia de comprensión conceptual, detección de errores y procedimiento breve. Estima el dominio hasta Funcional con confianza baja.
- **Prueba completa** presenta 24 problemas por competencia, incluidas decisiones en contexto que requieren una justificación. En Álgebra cubre dos competencias y suma 48 problemas. Los tiempos son estimados y puedes retomar la prueba más tarde.

El **nivel estimado** es Inicial, En desarrollo, Funcional o Avanzado. Se requieren evidencias en dificultades consecutivas y en las dimensiones de cada prueba. La completa requiere justificar una aplicación en cada dificultad. Una cobertura insuficiente deja el nivel pendiente. Para una categoría se usa el nivel menor de sus competencias y se indica cobertura parcial mientras falten resultados utilizables. El perfil prioriza la prueba completa más reciente con evidencia suficiente en cada competencia.

El **dominio firme** requiere una prueba completa que estime nivel avanzado y evidencias autónomas variadas. Después se programan dos comprobaciones con problemas nuevos, primero tras 24 horas y luego tras tres días adicionales. Las ayudas en las lecciones sirven para aprender. El nivel estimado y el historial se conservan al vencer una comprobación, mientras el dominio vigente pasa a «Toca comprobar». Una categoría está firme cuando todas sus competencias lo están. Los criterios y duraciones son hipótesis pendientes de calibración con estudiantes.

Las lecciones adaptan doce variantes del [contenido publicado de Nexora](https://github.com/Edwardg-137/nexora_content/tree/d9397b19806f952827f0b1bbcba2fa0314338978). La política de dominio se basa en [el modelo de aprendizaje de Nexora](https://github.com/Edwardg-137/nexora_r_app/blob/5e745fc70dcd2684f55661c661b8d4cd02804f80/packages/cognitive-twin/src/learning.ts).

## Pitch de básico a diversificado

Con el servidor local abierto, entra al [modo pitch](http://127.0.0.1:3000/pitch) para recorrer el mapa de un curso ficticio, resolver el repaso intervenido y presentar el examen final. La [preparación del pitch](definicion/Gradus_preparacion_pitch.md) incluye el guion y las decisiones pendientes para un piloto.

## Recorrido de la demo

1. Abre **Medir mi punto de partida**. Elige restar 4 solo al lado izquierdo, elige dividir ambos lados entre 3, responde `13` y después `5`. Aparece la comprobación adicional.
2. Desde el resultado, abre **Mantener la igualdad** y completa sus tres ejercicios. Vuelve al resultado y elige **Comprobar mi avance**.
3. En la reevaluación, resta 7 a ambos lados, divide ambos lados entre 4 y responde `15` y `4`. El historial registra la mejora en igualdad, muestra la insignia y recomienda **Despejar la incógnita**.
4. Completa la ronda de **Despejar la incógnita** y pide dos variantes. Puedes volver al historial o explorar los dos cursos en **Catálogo**.

Para ensayar desde cero, abre una ventana privada. Usa respuestas sintéticas durante la demo.
