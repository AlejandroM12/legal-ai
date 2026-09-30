# IA

El proveedor por defecto es Ollama:

- chat: `llama3.1`
- embeddings: `nomic-embed-text` (768 dimensiones)

`AI_PROVIDER=mock` usa embeddings por tokens y un chat determinista para tests. OpenAI y Anthropic no están cableados: entrarían detrás de las mismas interfaces `EmbeddingProvider` y `ChatProvider`. Si Ollama falla, la pregunta vuelve con `abstained` y el error queda en la traza. No hay un segundo modelo de respaldo.

El cliente de Qdrant es 1.19 y el servidor del Compose es `v1.19.0`. Las versiones mayores tienen que coincidir y la menor no puede alejarse más de uno.

El orden de estudio del proyecto acompaña las fases: embeddings, búsqueda, RAG, evaluación, tools y agentes. El runtime del agente es un loop propio con tope de iteraciones.
