# Builds reproducibles

La imagen se construye únicamente a partir de entradas explícitas y
versionadas:

- `package-lock.json` fija todo el árbol de npm y Docker usa `npm ci`.
- Cada `FROM` está fijado por versión y digest SHA-256.
- `.env` no entra al contexto. Las variables públicas necesarias se reciben
  como argumentos de build.
- Next.js usa el hash del commit como `BUILD_ID` y la imagen usa la fecha del
  commit como `SOURCE_DATE_EPOCH`.
- La clave de Server Actions es un secreto estable de BuildKit; nunca se pasa
  como `ARG`. Las credenciales de Draft/Preview Mode se derivan de ella con
  HMAC y etiquetas separadas. `SERVER_ACTIONS_KEY_VERSION` invalida la caché
  cuando se rota.
- La telemetría de Next.js está deshabilitada durante build y runtime.

## Verificación local

Con Docker Buildx y el repositorio limpio:

```bash
./scripts/verificarBuildReproducible.sh
```

El script construye dos veces sin caché para `linux/amd64`, deshabilita
provenance/SBOM, normaliza timestamps y exige el mismo digest de manifest OCI.
Para otra arquitectura puede usarse `PLATFORM=linux/arm64`.

Durante desarrollo puede verificarse un árbol aún no confirmado con
`ALLOW_DIRTY=1`, aunque ese resultado no demuestra reproducibilidad de un
commit.

## Build para despliegue

El dueño del servidor conserva una clave estable en su gestor de secretos. Se
genera una sola vez con `openssl rand -base64 32`; no se confirma en Git ni se
regenera en cada build. También proporciona las variables públicas
explícitamente:

```bash
docker build \
  --build-arg "SOURCE_DATE_EPOCH=$(git log -1 --format=%ct)" \
  --build-arg "BUILD_ID=$(git rev-parse HEAD)" \
  --build-arg "SERVER_ACTIONS_KEY_VERSION=$SERVER_ACTIONS_KEY_VERSION" \
  --build-arg "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" \
  --build-arg "NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL" \
  --build-arg "NEXT_PUBLIC_DEFAULT_AVATAR_URL=$NEXT_PUBLIC_DEFAULT_AVATAR_URL" \
  --secret id=next_server_actions_encryption_key,env=NEXT_SERVER_ACTIONS_ENCRYPTION_KEY \
  -t swap-frontend .
```

Estas variables forman parte del bundle: dos imágenes sólo son comparables si
usan el mismo commit, plataforma, argumentos y clave. La clave debe codificar
16, 24 o 32 bytes en base64; al rotarla también se incrementa
`SERVER_ACTIONS_KEY_VERSION`. El despliegue sigue siendo responsabilidad del
dueño del servidor.

## Actualizar entradas fijadas

1. Cambiar `package.json`, ejecutar `npm install --package-lock-only` y validar
   con `npm ci`.
2. Para actualizar Node, obtener el digest con
   `docker buildx imagetools inspect node:TAG` y cambiar juntos ambos `FROM`.
3. Ejecutar tests, `npm run build` y la verificación de doble build.

"Equivalente" significa el mismo digest de manifest OCI para los mismos
inputs de build. No cubre volúmenes, datos ni configuración de ejecución del
servidor.
