# Sprint 3 — Operations & DevOps (2-3 Days)

**Goal:** Production-ready infrastructure, CI/CD, observability.
**Flagged by:** DevOps (2/10), Performance, QA, CTO

---

## Step 3.1: Write Multi-Stage Dockerfiles (3 hrs)

**Files:** New `apps/api/Dockerfile`, `apps/web/Dockerfile`, `.dockerignore`
**Issue:** No Dockerfiles exist — cannot deploy consistently.
**Flagged by:** DevOps (score: 2/10 containerization)

- [ ] Create `apps/api/Dockerfile`:
  ```dockerfile
  # Build stage
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

  # Production stage
  FROM node:22-alpine
  WORKDIR /app
  COPY --from=builder /app/apps/api/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  EXPOSE 3001
  CMD ["node", "dist/main.js"]
  ```
- [ ] Create `apps/web/Dockerfile` (multi-stage with `next build` + standalone output)
- [ ] Create root `.dockerignore`: node_modules, .git, .next, dist, .env*
- [ ] Update `docker-compose.yml` to include api and web services
- [ ] Test: `docker compose up --build` boots all 4 services

## Step 3.2: Add Health Check Endpoint (1 hr)

**Files:** New health module or extend `app.controller.ts`
**Issue:** `GET /` only checks if process is alive — no dependency verification.
**Flagged by:** DevOps, CTO, Backend

- [ ] Install `@nestjs/terminus`: `pnpm add @nestjs/terminus --filter @flowboard/api`
- [ ] Create `src/health/health.module.ts` and `health.controller.ts`
- [ ] `GET /health` endpoint checking:
  - PostgreSQL: `PrismaHealthIndicator` (lightweight query)
  - Redis: custom check via `redis.ping()`
  - Bull queue: check connection
- [ ] Return 200 if all pass, 503 if any fail
- [ ] Mark as `@Public()` (no auth required)
- [ ] Update `docker-compose.yml` healthcheck to use `/health`

## Step 3.3: Add Structured Logging (2 hrs)

**Files:** New `src/common/logger/`, modify `main.ts`
**Issue:** Console text logs — no structure, no correlation, not searchable.
**Flagged by:** DevOps, CTO

- [ ] Install `nestjs-pino` + `pino-pretty`: `pnpm add nestjs-pino pino-http pino-pretty --filter @flowboard/api`
- [ ] Configure in `app.module.ts`:
  - JSON output in production
  - Pretty-print in development
- [ ] Add request correlation ID middleware:
  - Generate UUID per request
  - Attach to async context
  - Include in every log line
- [ ] Replace `Logger` calls with `PinoLogger` in critical services
- [ ] Add `LoggingInterceptor` error path (currently only logs success)

## Step 3.4: Add Graceful Shutdown (1 hr)

**File:** `apps/api/src/main.ts`
**Issue:** No shutdown handler — in-flight requests dropped on container restart.
**Flagged by:** DevOps, Performance

- [ ] Enable NestJS shutdown hooks: `app.enableShutdownHooks()`
- [ ] Implement `OnModuleDestroy` in key services:
  - Close Redis connections cleanly
  - Close Bull queue workers (stop processing new jobs)
  - Prisma: `$disconnect()`
- [ ] Set a shutdown timeout of 10 seconds
- [ ] Handle SIGTERM and SIGINT signals

## Step 3.5: GitHub Actions CI Pipeline (3 hrs)

**File:** New `.github/workflows/ci.yml`
**Issue:** No CI/CD — all deployments manual, no quality gates.
**Flagged by:** DevOps (1/10), QA

- [ ] Create `.github/workflows/ci.yml`:
  ```yaml
  on: [push, pull_request]
  jobs:
    lint:
      - pnpm install
      - pnpm run lint
    build:
      - pnpm install
      - pnpm --filter @flowboard/api build
      - pnpm --filter @flowboard/web build
    typecheck:
      - pnpm --filter @flowboard/shared lint (tsc --noEmit)
  ```
- [ ] Add build status badge to README
- [ ] Configure branch protection: require CI pass before merge

## Step 3.6: Add Socket.io Redis Adapter (2 hrs)

**Files:** `events.gateway.ts`, `gateway.module.ts`
**Issue:** Single-server WebSocket ceiling — cannot scale horizontally.
**Flagged by:** CTO, Performance (critical for scale)

- [ ] Install: `pnpm add @socket.io/redis-adapter --filter @flowboard/api`
- [ ] In `EventsGateway.afterInit()`:
  - Create pub/sub Redis clients from shared Redis module
  - `server.adapter(createAdapter(pubClient, subClient))`
- [ ] Replace `getSocketIdsForUser` O(N) scan with `userId → Set<socketId>` Map
- [ ] Update connect/disconnect to maintain the Map
- [ ] Test: verify events broadcast correctly (functional, not multi-instance)

## Completion Criteria
- `docker compose up --build` boots full stack from scratch
- `GET /health` verifies PostgreSQL + Redis connectivity
- Logs output structured JSON with correlation IDs in production
- Graceful shutdown: no dropped requests on container restart
- GitHub Actions runs lint + build on every push
- Socket.io adapter configured for horizontal scaling readiness
