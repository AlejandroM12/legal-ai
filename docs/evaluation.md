# Evaluación

`apps/api/src/eval/score.spec.ts` corre 50 preguntas contra un índice en memoria:

- 32 preguntas factuales. Recall: la página esperada está en el top 3.
- 18 preguntas sin evidencia. Abstención: la búsqueda no devuelve fragmentos.

La barra publicada es recall de al menos 0.9 y abstención 1. El índice de test usa 256 dimensiones y umbral 0.4. Si el umbral o el texto del corpus empeoran, el spec falla.

`grounding.spec.ts` mide las citas. Con validación, un `used` que apunta a un bloque inexistente abstiene y el acierto es 1. Sin validación, esa cita inventada cuenta como respuesta y el acierto baja a 0.5.
