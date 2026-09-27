# IA

El proveedor por defecto es Ollama:

- chat: `llama3.1`
- embeddings: `nomic-embed-text` (768 dimensiones)

`AI_PROVIDER=mock` usa embeddings por tokens y un chat determinista para tests. OpenAI y Anthropic no están cableados: entrarían detrás de las mismas interfaces `EmbeddingProvider` y `ChatProvider`.

El orden de estudio del proyecto acompaña las fases: embeddings, búsqueda, RAG, evaluación, tools y agentes. El runtime del agente es un loop propio con tope de iteraciones.
