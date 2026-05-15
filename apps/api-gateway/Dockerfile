FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/

RUN pnpm install --frozen-lockfile --filter api-gateway...

COPY apps/api-gateway ./apps/api-gateway

WORKDIR /app/apps/api-gateway
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/main.js"]