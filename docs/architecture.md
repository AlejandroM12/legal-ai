# Arquitectura

El navegador habla con Next.js. Next.js llama a la API NestJS con un JWT Bearer.

NestJS persiste usuarios, documentos, páginas, chunks, auditoría y trazas en PostgreSQL. Los PDF quedan en disco local. Los vectores van a Qdrant en la colección `legal_chunks`, con `user_id` en el payload.

La ingesta corre en el proceso de la API: parseo por página con pdfjs, chunking con overlap, embeddings y upsert. Antes de reindexar se borran los vectores de ese documento. Si la API se reinicia, retoma los que quedaron en `UPLOADED` o `PROCESSING`. El estado pasa por `UPLOADED`, `PROCESSING`, `PROCESSED` o `FAILED`.

Ollama queda en el host, en `http://localhost:11434`. No entra en Compose: la inferencia local se deja fuera de los contenedores a propósito. Desde la API en Docker la URL es `http://host.docker.internal:11434`.

Las preguntas arman un prompt con el texto del PDF delimitado como dato. El agente usa tool calling nativo, sin LangChain.

## Módulos de la API

`AppModule` solo compone estos módulos. Cada uno tiene un dueño claro:

| Módulo | Responsabilidad |
| --- | --- |
| `auth` | Registro, login, JWT y usuario actual |
| `documents` | Alta, listado, páginas, chunks y borrado de PDF |
| `ingestion` | Parseo, chunking y disparo de embeddings |
| `ai` | Proveedor de chat y embeddings (`ollama` o `mock`) |
| `retrieval` | Búsqueda vectorial y `POST /search` |
| `rag` | Pregunta con citas (`POST /documents/:id/ask` y `POST /ask`) |
| `agents` | Loop del agente; las herramientas viven en `AgentToolkit` |
| `observability` | Trazas de latencia por pregunta |
| `audit` | Registro de acciones sobre documentos |
| `prisma` | Cliente de PostgreSQL |

`AiModule` elige el proveedor con `AI_PROVIDER`. `RetrievalModule` elige el almacén con `VECTOR_STORE` (`qdrant` o `memory`).

## Pantallas

`apps/web/src/app` define las rutas. La sesión y la navegación están en `components/shell.tsx`. Login y registro comparten `components/auth-screen.tsx`. El detalle de un documento arma la pantalla con `QuestionPanel`, `AnalysisPanel` y `ChunkList`. Los tipos de la API viven en `lib/types.ts`.
