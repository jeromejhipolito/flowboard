FROM node:22-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
COPY apps/api/ apps/api/
COPY packages/shared/ packages/shared/
RUN pnpm --filter @flowboard/api build
RUN pnpm --filter @flowboard/api deploy --prod /app/deploy

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/deploy ./
COPY --from=builder /app/apps/api/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
