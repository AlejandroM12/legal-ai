# LegalAI --- Plan de estudio y desarrollo

## Objetivo general

Construir una aplicación privada de análisis de documentos legales que
permita:

1.  Registrarse e iniciar sesión.
2.  Subir documentos PDF.
3.  Procesarlos y extraer su contenido.
4.  Dividir documentos en fragmentos (chunks).
5.  Generar embeddings.
6.  Indexarlos en una base vectorial.
7.  Hacer preguntas sobre los documentos.
8.  Obtener respuestas fundamentadas en los documentos.
9.  Ver las fuentes y páginas utilizadas.
10. Hacer búsqueda semántica.
11. Analizar contratos.
12. Utilizar un agente con herramientas.
13. Implementar control de acceso por usuario.
14. Incorporar testing y evaluación de respuestas.
15. Tener logs, métricas y observabilidad.
16. Ejecutar inicialmente todo de forma local y gratuita.

La meta es terminar con un proyecto que sirva tanto para aprender AI
Engineering como para demostrar capacidades de Full Stack + IA en
entrevistas.

------------------------------------------------------------------------

# Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS

## Backend

-   NestJS
-   TypeScript
-   REST API

## Base de datos

-   PostgreSQL

## Vector database

-   Qdrant

## IA

-   Ollama
-   Modelos locales

Posteriormente, como proveedores opcionales:

-   OpenAI
-   Anthropic

## Infraestructura

-   Docker
-   Docker Compose

## Testing

-   Jest
-   Playwright

## Versionado

-   Git
-   GitHub

------------------------------------------------------------------------

# Arquitectura objetivo

``` text
                         USER
                           │
                           ↓
                       Next.js
                           │
                           ↓
                       NestJS
                           │
             ┌─────────────┼─────────────┐
             ↓             ↓             ↓
         PostgreSQL     Storage        RAG
                           │             │
                           ↓             ↓
                       Ingestion      Qdrant
                           │             │
                     ┌─────┴─────┐       │
                     ↓           ↓       ↓
                  Parser      Chunker  Retrieval
                     │           │       │
                     └─────┬─────┘       │
                           ↓             │
                       Embeddings ───────┘
                                         │
                                         ↓
                                        LLM
                                         │
                                         ↓
                                      Answer
                                         │
                                         ↓
                                    Citations
```

------------------------------------------------------------------------

# Roadmap completo

## FASE 0 --- Setup

### Objetivo

Preparar el entorno de desarrollo.

### Instalar

-   Node.js
-   Git
-   Docker Desktop
-   VS Code o Cursor
-   Postman o Bruno
-   Ollama

### Verificar

``` bash
node --version
npm --version
git --version
docker --version
ollama --version
```

### Crear repositorio

``` text
legal-ai
```

Estructura inicial:

``` text
/apps
/packages
/docker
/docs
```

### Estudiar

-   Docker básico
-   Docker Compose
-   Environment variables
-   Git
-   Monorepos

### Resultado esperado

Poder ejecutar:

``` bash
docker compose up
```

y tener PostgreSQL y Qdrant funcionando localmente.

------------------------------------------------------------------------

# FASE 1 --- Full Stack base

## Objetivo

Crear la estructura básica:

``` text
Next.js
    ↓
NestJS
    ↓
PostgreSQL
```

## Backend

Crear módulos:

``` text
AuthModule
UsersModule
DocumentsModule
```

## Frontend

Crear:

``` text
/login
/register
/dashboard
/documents
```

## Base de datos

Tabla `users`:

``` text
id
email
password_hash
created_at
```

Tabla `documents`:

``` text
id
user_id
filename
status
mime_type
size
created_at
```

## Estudiar

-   NestJS modules
-   Controllers
-   Services
-   DTOs
-   Validation
-   PostgreSQL
-   ORM
-   Migrations
-   REST
-   HTTP status codes

## Resultado esperado

``` text
Register
   ↓
Login
   ↓
Dashboard
   ↓
Documents
```

Todavía no incorporar IA.

------------------------------------------------------------------------

# FASE 2 --- Document Management

## Objetivo

Permitir subir documentos PDF.

Endpoint:

``` http
POST /documents
```

Pipeline:

``` text
PDF
 ↓
Validación
 ↓
Guardar archivo
 ↓
Guardar metadata
```

Validar:

-   Tipo
-   Tamaño
-   Extensión
-   Nombre
-   Usuario

## Estados del documento

``` text
UPLOADED
PROCESSING
PROCESSED
FAILED
```

## Frontend

Mostrar estados:

``` text
Contrato.pdf

Processing...
```

y luego:

``` text
Ready
```

## Estudiar

-   Multipart/form-data
-   File upload
-   Streams
-   File validation
-   Storage
-   Async processing

## Resultado esperado

Subir un PDF y verlo en el dashboard.

------------------------------------------------------------------------

# FASE 3 --- Document Processing

## Objetivo

Convertir un PDF en texto estructurado.

Pipeline:

``` text
PDF
 ↓
PDF Parser
 ↓
Texto
 ↓
Páginas
 ↓
Metadata
```

Queremos conservar información como:

``` json
{
  "page": 3,
  "text": "El presente contrato..."
}
```

Esto permitirá posteriormente mostrar las páginas utilizadas como
fuente.

------------------------------------------------------------------------

## Chunking

Un documento largo no debe enviarse completo al LLM.

Pipeline:

``` text
Document
│
├── Chunk 1
├── Chunk 2
├── Chunk 3
├── Chunk 4
├── ...
└── Chunk N
```

Cada chunk debería conservar:

``` text
document_id
page
chunk_index
text
```

## Estudiar

### PDF

-   PDF parsing
-   Extracción de texto
-   Páginas
-   Metadata

### Chunking

-   Chunk size
-   Overlap
-   Semantic chunking
-   Metadata

## Resultado esperado

Subir un PDF y obtener sus chunks.

------------------------------------------------------------------------

# FASE 4 --- Embeddings + Vector Database

## Objetivo

Convertir cada chunk en un vector y almacenarlo en Qdrant.

Conceptualmente:

``` text
"El contrato dura 24 meses"
```

↓

``` text
[0.021, -0.72, 0.31, ...]
```

Pipeline:

``` text
Chunk
 ↓
Embedding Model
 ↓
Vector
 ↓
Qdrant
```

## Qdrant

Crear una colección para los documentos legales.

Cada registro debería incluir:

``` text
vector
document_id
page
chunk_id
text
metadata
```

## Estudiar

-   Embeddings
-   Vector similarity
-   Cosine similarity
-   Vector databases
-   Semantic search
-   Keyword search vs semantic search

## Prueba

Buscar:

``` text
duración del contrato
```

y encontrar contenido como:

``` text
El contrato tendrá una vigencia de 24 meses...
```

aunque no use exactamente las mismas palabras.

------------------------------------------------------------------------

# FASE 5 --- RAG

## Objetivo

Construir un sistema RAG completo.

RAG = Retrieval Augmented Generation.

## Pipeline

``` text
Usuario
   │
   ↓
Pregunta
   │
   ↓
Embedding de pregunta
   │
   ↓
Qdrant
   │
   ↓
Top-K chunks
   │
   ↓
Context
   │
   ↓
LLM
   │
   ↓
Respuesta
```

## Ejemplo

Pregunta:

> ¿Cuánto dura el contrato?

Qdrant encuentra:

``` text
Chunk 87
Página 12

"El presente contrato tendrá una duración
de veinticuatro meses..."
```

El LLM recibe el contexto y responde:

> El contrato tiene una duración de 24 meses.

## Citaciones

La respuesta debería incluir:

``` text
Fuente:
contrato.pdf
Página 12
```

## Estudiar

-   RAG
-   Retrieval
-   Context windows
-   Prompt construction
-   Grounding
-   Hallucinations
-   Citations
-   Top-K retrieval
-   Similarity threshold

## Preguntas de prueba

``` text
¿Cuánto dura el contrato?

¿Quiénes son las partes?

¿Cuál es el monto?

¿Cuándo comienza?

¿Cuáles son las condiciones de rescisión?
```

La respuesta debe estar respaldada por el documento.

------------------------------------------------------------------------

# FASE 6 --- AI Agent

## Objetivo

Construir un agente que pueda utilizar herramientas.

Ejemplo:

``` text
AI Agent
│
├── search_documents()
├── search_chunks()
├── get_document()
├── get_page()
└── generate_report()
```

## Ejemplo de uso

Usuario:

> Analizá este contrato y decime si existen cláusulas de rescisión.

El agente puede:

``` text
Agent
 ↓
search_documents()
 ↓
search_chunks("rescisión")
 ↓
get_page()
 ↓
Analizar contenido
 ↓
Responder
```

## Comparación de documentos

También podrá realizar:

``` text
Contrato A
 ↓
Retrieval

Contrato B
 ↓
Retrieval

     ↓

Comparación
     ↓
Resultado
```

## Estudiar

-   Function calling
-   Tool calling
-   Agents
-   Agent loops
-   State
-   Tool schemas
-   Guardrails
-   Human-in-the-loop

## Estrategia

Primero implementar tool calling directamente con la API del modelo.

Después evaluar frameworks como:

-   LangChain
-   LangGraph

La prioridad es entender el funcionamiento antes de abstraerlo.

------------------------------------------------------------------------

# FASE 7 --- Security

## Objetivo

Asegurar que cada usuario solo pueda acceder a sus propios documentos.

Regla fundamental:

``` text
User A
 ↓
Documentos de A
```

Nunca:

``` text
User A
 ↓
Documentos de B
```

## Implementar

### Authentication

-   JWT

### Authorization

-   Ownership
-   Roles si fueran necesarios
-   Permisos sobre documentos

Cada documento tendrá:

``` text
user_id
```

------------------------------------------------------------------------

## AI Security

### Prompt Injection

Un PDF podría contener:

``` text
IGNORE PREVIOUS INSTRUCTIONS
```

El sistema debe tratar esto como contenido del documento, no como una
instrucción para el agente.

### Otros temas

-   Data leakage
-   Secrets management
-   Input validation
-   Access control
-   Rate limiting
-   Document isolation
-   Audit logs

Nunca guardar secrets en Git.

Utilizar:

``` text
.env
.env.example
```

------------------------------------------------------------------------

# FASE 8 --- Testing + AI Evaluation

## Objetivo

Validar tanto el software tradicional como la calidad del sistema de IA.

## Unit tests

Testear:

``` text
Services
Functions
Chunking
Retrieval
```

## Integration tests

Testear:

``` text
NestJS
PostgreSQL
Qdrant
```

## E2E

Flujo:

``` text
Login
 ↓
Upload PDF
 ↓
Process
 ↓
Ask question
 ↓
Receive answer
```

Utilizar Playwright.

------------------------------------------------------------------------

# AI Evaluation

Crear un dataset de evaluación:

``` text
question
expected_answer
expected_sources
```

Ejemplo:

``` text
Question:
¿Cuánto dura el contrato?

Expected:
24 meses

Source:
page 12
```

Esto permite medir si el RAG realmente está funcionando.

## Estudiar

-   Retrieval evaluation
-   Answer evaluation
-   Groundedness
-   Hallucination detection
-   Regression testing for LLM applications

------------------------------------------------------------------------

# FASE 9 --- Observability

## Objetivo

Saber qué ocurre internamente con cada pregunta.

Pipeline:

``` text
Request
 ↓
Embedding
 ↓
Retrieval
 ↓
LLM
 ↓
Response
```

Registrar:

``` text
latency
tokens
retrieved chunks
errors
model
response time
```

Ejemplo:

``` text
Question
────────────────────
¿Cuánto dura?

Retrieval
────────────────────
5 chunks
132ms

LLM
────────────────────
1.4s

Total
────────────────────
1.53s
```

## Estudiar

-   Logging
-   Metrics
-   Tracing
-   Performance
-   Token usage
-   AI evaluation
-   Error tracking

------------------------------------------------------------------------

# FASE 10 --- Production / Portfolio

## Objetivo

Convertir el proyecto de estudio en un proyecto demostrable
profesionalmente.

## Docker

Toda la aplicación debería poder levantarse con:

``` bash
docker compose up
```

Servicios:

``` text
Next.js
NestJS
PostgreSQL
Qdrant
Ollama
```

## CI/CD

GitHub Actions:

``` text
push
 ↓
lint
 ↓
tests
 ↓
build
 ↓
E2E
```

## Documentación

Crear:

``` text
README.md
ARCHITECTURE.md
AI.md
SECURITY.md
RAG.md
```

------------------------------------------------------------------------

# Estructura final esperada

``` text
legal-ai/
│
├── apps/
│   │
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   └── ...
│   │
│   └── api/
│       ├── auth/
│       ├── users/
│       ├── documents/
│       ├── ingestion/
│       ├── embeddings/
│       ├── retrieval/
│       ├── rag/
│       ├── agents/
│       └── ...
│
├── packages/
│   ├── types/
│   ├── config/
│   └── ...
│
├── docker/
│
├── docs/
│   ├── architecture.md
│   ├── rag.md
│   ├── security.md
│   └── ai.md
│
├── docker-compose.yml
├── package.json
└── README.md
```

------------------------------------------------------------------------

# Plan de estudio

  Semana   Tema                   Resultado
  -------- ---------------------- -----------------
  1        Setup + Docker         Infraestructura
  2        Nest + PostgreSQL      Backend
  3        Next + Auth            Frontend
  4        Upload de documentos   Documents
  5        PDF + parsing          Ingestion
  6        Chunking               Processing
  7        Embeddings             AI fundamentals
  8        Qdrant                 Vector search
  9        Semantic Search        Retrieval
  10       RAG                    RAG funcional
  11       RAG avanzado           Citations
  12       Agents                 Tools
  13       Security               Production
  14       Testing                Quality
  15       Observability          Performance
  16       Deploy + portfolio     Final

Las semanas son orientativas. Si una etapa requiere más tiempo, se
extiende.

------------------------------------------------------------------------

# Orden exacto de estudio

No estudiar IA al azar.

Seguir este orden:

``` text
1. LLM fundamentals
        ↓
2. OpenAI / Anthropic APIs
        ↓
3. Prompting
        ↓
4. Structured outputs
        ↓
5. Embeddings
        ↓
6. Vector databases
        ↓
7. Semantic search
        ↓
8. Chunking
        ↓
9. RAG
        ↓
10. RAG evaluation
        ↓
11. Tool calling
        ↓
12. AI Agents
        ↓
13. Document Intelligence
        ↓
14. AI Security
        ↓
15. Observability
        ↓
16. Production AI
```

------------------------------------------------------------------------

# Objetivos por nivel

## Nivel 1 --- AI Developer

Poder explicar:

-   ¿Qué es un LLM?
-   ¿Qué es un embedding?
-   ¿Qué es una vector DB?
-   ¿Qué es RAG?

------------------------------------------------------------------------

## Nivel 2 --- AI Application Developer

Poder construir:

``` text
PDF
 ↓
Chunks
 ↓
Embeddings
 ↓
Vector DB
 ↓
Retrieval
 ↓
LLM
```

------------------------------------------------------------------------

## Nivel 3 --- AI Engineer

Poder diseñar:

``` text
Users
 ↓
API
 ↓
Document pipeline
 ↓
Vector DB
 ↓
RAG
 ↓
Agents
 ↓
Security
 ↓
Observability
```

Y explicar por qué se tomó cada decisión arquitectónica.

------------------------------------------------------------------------

# Meta final

Al terminar, deberías poder defender una arquitectura como:

``` text
                         USER
                           │
                           ↓
                       Next.js
                           │
                           ↓
                       NestJS
                           │
             ┌─────────────┼─────────────┐
             ↓             ↓             ↓
         PostgreSQL     Storage        RAG
                           │             │
                           ↓             ↓
                       Ingestion      Qdrant
                           │             │
                     ┌─────┴─────┐       │
                     ↓           ↓       ↓
                  Parser      Chunker  Retrieval
                     │           │       │
                     └─────┬─────┘       │
                           ↓             │
                       Embeddings ───────┘
                                         │
                                         ↓
                                        LLM
                                         │
                                         ↓
                                      Answer
                                         │
                                         ↓
                                    Citations
```

Y poder explicar conceptos como:

-   Context window
-   Retrieval
-   Embeddings
-   Vector similarity
-   RAG
-   Grounding
-   Hallucinations
-   Chunking
-   Semantic search
-   Tool calling
-   Agents
-   Security
-   Observability
-   Cost
-   Latency
-   Scalability

------------------------------------------------------------------------

# Sprint 0 --- Primer objetivo inmediato

No intentar hacer todo el proyecto de una vez.

El primer sprint es solamente:

``` text
Windows
 ↓
Node
 ↓
Git
 ↓
Docker
 ↓
Ollama
 ↓
Next.js
 ↓
NestJS
 ↓
PostgreSQL
 ↓
Qdrant
```

### Definition of Done

El Sprint 0 está terminado cuando:

-   [ ] Node.js funciona
-   [ ] npm funciona
-   [ ] Git funciona
-   [ ] Docker funciona
-   [ ] Ollama funciona
-   [ ] Next.js está creado
-   [ ] NestJS está creado
-   [ ] PostgreSQL funciona en Docker
-   [ ] Qdrant funciona en Docker
-   [ ] Frontend puede ejecutarse
-   [ ] Backend puede ejecutarse
-   [ ] Primer commit creado
-   [ ] README inicial creado
-   [ ] `.env.example` creado
-   [ ] No hay secrets en Git

------------------------------------------------------------------------

# Filosofía del proyecto

No hacer:

``` text
Tutorial
 ↓
Copiar código
 ↓
"Funciona"
```

Hacer:

``` text
Requerimiento
 ↓
Diseño
 ↓
Decisión técnica
 ↓
Implementación
 ↓
Testing
 ↓
Observability
 ↓
Documentación
```

El objetivo no es solamente tener un chatbot funcionando.

El objetivo es aprender a **diseñar, construir y defender técnicamente
una aplicación Full Stack AI de punta a punta**.
