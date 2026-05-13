
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter backend...

COPY packages/shared-types ./packages/shared-types
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
RUN pnpm build
RUN ls -la dist/ || echo "ERROR: dist/ is missing after pnpm build"

WORKDIR /app

RUN pnpm --filter backend deploy --prod --legacy /deploy

RUN cp -r /app/apps/backend/dist /deploy/dist

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /deploy ./

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/src/main"]
