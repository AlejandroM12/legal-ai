# RAG

1. La pregunta se embebe.
2. Qdrant devuelve top-K con umbral de similitud, filtrado por `user_id` y, si aplica, `document_id`.
3. El prompt marca cada fragmento con archivo y página entre `BEGIN` y `END`.
4. El modelo responde JSON y la API acepta solo los bloques recuperados.

Si la búsqueda no trae fragmentos, la pregunta se abstiene. Las primeras páginas solo entran cuando preguntan de qué trata el archivo.

La evaluación de retrieval vive en `apps/api/eval/dataset.json` y la tasa de 50 preguntas en `docs/evaluation.md`.

`apps/api/eval/failures.json` publica tres casos:

- Una pregunta puntual no se responde con las primeras páginas.
- Un PDF puede decir `IGNORE PREVIOUS INSTRUCTIONS`. Eso queda dentro del bloque y no cierra el límite.
- Un vector cuyo documento ya se borró se descarta. La pregunta sigue, sin un 403.

La respuesta incluye `abstained: true` cuando no hay fragmentos propios o el modelo no puede contestar. Cada traza separa `embeddingMs`, `retrievalMs` y `llmMs`.

Latencia medida en el equipo de desarrollo, Ryzen 5 5600G sin GPU, con `llama3.1`: el embedding ronda un segundo y la generación tarda uno a tres minutos. No es un SLA.

Costo de API en local: cero. La traza guarda `promptTokens` y `completionTokens`. Un proveedor pago se estima con `(promptTokens * precioEntrada + completionTokens * precioSalida) / 1_000_000`.
