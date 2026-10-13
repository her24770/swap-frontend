#!/bin/sh
set -eu

RAIZ=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$RAIZ"

PLATAFORMA=${PLATFORM:-linux/amd64}
EPOCH=${SOURCE_DATE_EPOCH:-$(git log -1 --format=%ct)}
ID_BUILD=${BUILD_ID:-$(git rev-parse HEAD)}
URL_API=${NEXT_PUBLIC_API_URL:-http://localhost:3001}
URL_SOCKET=${NEXT_PUBLIC_SOCKET_URL:-http://localhost:3001}
URL_AVATAR=${NEXT_PUBLIC_DEFAULT_AVATAR_URL:-https://i.pravatar.cc/150?u=vendedor}
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=}
export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

if [ "${ALLOW_DIRTY:-0}" != "1" ] && [ -n "$(git status --porcelain)" ]; then
    echo "El repositorio debe estar limpio para verificar exactamente un commit." >&2
    exit 2
fi

TEMPORAL=$(mktemp -d)
trap 'rm -rf -- "$TEMPORAL"' EXIT HUP INT TERM

construir() {
    docker buildx build \
        --no-cache \
        --pull=false \
        --platform "$PLATAFORMA" \
        --build-arg "SOURCE_DATE_EPOCH=$EPOCH" \
        --build-arg "BUILD_ID=$ID_BUILD" \
        --build-arg "SERVER_ACTIONS_KEY_VERSION=verification" \
        --build-arg "NEXT_PUBLIC_API_URL=$URL_API" \
        --build-arg "NEXT_PUBLIC_SOCKET_URL=$URL_SOCKET" \
        --build-arg "NEXT_PUBLIC_DEFAULT_AVATAR_URL=$URL_AVATAR" \
        --secret id=next_server_actions_encryption_key,env=NEXT_SERVER_ACTIONS_ENCRYPTION_KEY \
        --provenance=false \
        --sbom=false \
        --output "type=oci,dest=$1,rewrite-timestamp=true" \
        .
}

digest() {
    tar -xOf "$1" index.json | sed -n 's/.*"digest":"\([^"]*\)".*/\1/p'
}

echo "Construyendo frontend dos veces para $PLATAFORMA (BUILD_ID=$ID_BUILD)..."
construir "$TEMPORAL/primera.tar"
construir "$TEMPORAL/segunda.tar"

PRIMER_DIGEST=$(digest "$TEMPORAL/primera.tar")
SEGUNDO_DIGEST=$(digest "$TEMPORAL/segunda.tar")

if [ -z "$PRIMER_DIGEST" ] || [ "$PRIMER_DIGEST" != "$SEGUNDO_DIGEST" ]; then
    echo "Build no reproducible: ${PRIMER_DIGEST:-sin digest} != ${SEGUNDO_DIGEST:-sin digest}" >&2
    exit 1
fi

echo "Build reproducible: $PRIMER_DIGEST"
