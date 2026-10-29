ARG SOURCE_DATE_EPOCH=0

# build
FROM node:22.22.3-alpine3.22@sha256:cd7807368cf24826297cbad5dca1a44972ccfd770647db52a8c7589eb4599ac8 AS builder

ARG SOURCE_DATE_EPOCH
ARG BUILD_ID=local
ARG SERVER_ACTIONS_KEY_VERSION=1
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
ARG NEXT_PUBLIC_DEFAULT_AVATAR_URL=https://i.pravatar.cc/150?u=vendedor

ENV BUILD_ID=$BUILD_ID \
    NEXT_PUBLIC_APP_VERSION=$BUILD_ID \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL \
    NEXT_PUBLIC_DEFAULT_AVATAR_URL=$NEXT_PUBLIC_DEFAULT_AVATAR_URL \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY next.config.js next-env.d.ts postcss.config.js tsconfig.json ./
COPY scripts/prepararBuildDeterminista.mjs ./scripts/
COPY messages ./messages/
COPY public ./public/
COPY src ./src/
ENV NODE_ENV=production
RUN --mount=type=secret,id=next_server_actions_encryption_key,required=true \
    test -n "$SERVER_ACTIONS_KEY_VERSION" \
    && NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/next_server_actions_encryption_key)" \
       node scripts/prepararBuildDeterminista.mjs \
    && NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/next_server_actions_encryption_key)" \
       npm run build

# production
FROM node:22.22.3-alpine3.22@sha256:cd7807368cf24826297cbad5dca1a44972ccfd770647db52a8c7589eb4599ac8 AS runner

ARG SOURCE_DATE_EPOCH

WORKDIR /app

ENV HOSTNAME=0.0.0.0 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

RUN addgroup -g 10001 -S appgroup \
    && adduser -u 10001 -S -D -H -G appgroup appuser

COPY --from=builder --chown=10001:10001 /app/.next/standalone ./
COPY --from=builder --chown=10001:10001 /app/.next/static ./.next/static
COPY --from=builder --chown=10001:10001 /app/public ./public

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
