# Seguridad

Cada consulta de documentos, páginas, chunks, búsqueda y trazas incluye el `user_id` del JWT. Un usuario no lee documentos de otro: la API responde 404.

El texto del PDF entra al modelo entre `BEGIN EVIDENCE_…` y `END EVIDENCE_…`. El límite se genera por pregunta y se borra si aparece dentro del archivo, así el PDF no puede cerrar el bloque. Una línea `IGNORE PREVIOUS INSTRUCTIONS` queda como dato. `JWT_SECRET` no puede ser el valor de `.env.example`. En `NODE_ENV=production` hace falta `QDRANT_API_KEY`; el Compose de desarrollo no publica esa clave.

Hay límite de requests en registro, login, preguntas y agente. Los accesos quedan en `audit_logs`. `.env` no se versiona.
