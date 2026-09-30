# LegalAI

Aplicación privada para subir PDFs legales, indexarlos y preguntar con citas de página. Corre en local con PostgreSQL, Qdrant y Ollama.

## Requisitos

- Node.js 20 o superior
- npm
- Docker Desktop, para PostgreSQL y Qdrant
- Ollama, en el host

```bash
node --version
npm --version
git --version
docker --version
ollama --version
```

## Arranque

```bash
cp .env.example .env
# Definí JWT_SECRET con un valor propio. El de ejemplo no arranca la API.
docker compose up postgres qdrant -d
npm install
npm run db:generate
npm run db:migrate
ollama pull llama3.1
ollama pull nomic-embed-text
npm run dev:api
npm run dev:web
```

Web: http://localhost:3000  
API: http://localhost:3001/health

Ollama queda fuera de Compose y se alcanza en `http://localhost:11434`. Desde el contenedor de la API la URL es `http://host.docker.internal:11434`.

Para tests sin modelos locales:

```bash
AI_PROVIDER=mock VECTOR_STORE=memory EMBEDDING_DIMENSIONS=64 npm test -w @legal-ai/api
```

## Estructura

- `apps/web` Next.js
- `apps/api` NestJS
- `packages/config` y `packages/types`
- `docker-compose.yml` PostgreSQL, Qdrant, API y web

Los secretos van en `.env`. `.env.example` no contiene valores reales de producción.
