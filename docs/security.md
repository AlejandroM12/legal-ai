# Seguridad

Cada consulta de documentos, páginas, chunks, búsqueda y trazas incluye el `user_id` del JWT. Un usuario no lee documentos de otro: la API responde 404.

El texto del PDF entra al modelo como contenido citado. Una línea `IGNORE PREVIOUS INSTRUCTIONS` dentro del archivo no se promueve a instrucción del sistema.

Hay límite de requests en registro, login, preguntas y agente. Los accesos quedan en `audit_logs`. `.env` no se versiona.
