# RAG

1. La pregunta se embebe.
2. Qdrant devuelve top-K con umbral de similitud, filtrado por `user_id` y, si aplica, `document_id`.
3. El prompt marca cada fragmento con archivo y página dentro de `document_content`.
4. El modelo responde y la API devuelve citas.

La evaluación vive en `apps/api/eval/dataset.json` (`question`, `expected_answer`, `expected_sources`) y se corre con Jest.
