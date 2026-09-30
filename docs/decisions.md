# Decisiones

## Ollama en el host

La inferencia local no entra en Compose. El contenedor de la API la alcanza por `host.docker.internal`. Así el modelo usa la CPU o la GPU de la máquina sin duplicar el runtime dentro de Docker.

## Qdrant y PostgreSQL

PostgreSQL guarda el documento, el texto por página y el chunk. Qdrant guarda el vector y el filtro `user_id`. Son dos stores porque la búsqueda por significado no es una consulta SQL.

## Sin LangChain

El agente es un loop con tool calling nativo y un tope de iteraciones. El runtime queda a la vista. Un framework entra si el estado del agente lo pide.

## Chunks de tamaño fijo

La ventana es de 1200 caracteres con overlap 150, y cada chunk guarda la página. Es determinística y se puede evaluar. Un corte por artículo sería una optimización medida contra el recall, no el primer diseño.

## JWT y localStorage

El token vive en `localStorage` porque la app es local y el cliente es un Bearer simple. En un despliegue público el access token iría en memoria y el refresh en una cookie HttpOnly.

## Ingesta en el proceso de la API

No hay una cola aparte. El alta responde y el procesamiento sigue en el mismo proceso. Al arrancar se retoman los documentos trabados. Una cola entra cuando haya más de una instancia.

## Mock en CI

Los tests usan `AI_PROVIDER=mock` y `VECTOR_STORE=memory`. El workflow no descarga un modelo.
