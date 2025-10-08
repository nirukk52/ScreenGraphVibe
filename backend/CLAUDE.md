## ScreenGraphVibe :backend Module — Architecture & Guidelines

Purpose: API server built on Fastify (TypeScript). Exposes HTTP endpoints, validates external inputs, orchestrates business logic, and talks to `:data` and other providers via well-defined ports/adapters. Provides a clean boundary to `:ui` and never leaks infra concerns upstream.

### Directory Layout (authoritative)

```text
backend/
├─ src/
│  ├─ core/                           # Server bootstrap, env, config, DI, error, tracing, plugins
│  │  ├─ app.ts                       # createApp(): registers plugins & routes; no listen()
│  │  ├─ server.ts                    # startServer(): loads env, builds app, listens; no global state
│  │  ├─ env.ts                       # Zod-validated environment config (single source of truth)
│  │  ├─ config.ts                    # Derived config (timeouts, limits) from env/constants
│  │  ├─ error.ts                     # Typed error mapping to HTTP; registers setErrorHandler
│  │  ├─ di.ts                        # Dependency injection wiring (ports → adapters)
│  │  ├─ tracing.ts                   # OpenTelemetry helpers (span creation, attributes)
│  │  ├─ plugins/
│  │  │  ├─ logging.ts                # Pino logger via `@screengraph/logging` + correlation IDs
│  │  │  ├─ cors.ts                   # CORS config (constants-driven)
│  │  │  ├─ security.ts               # Security headers, rate limits
│  │  │  ├─ otel.ts                   # OpenTelemetry Fastify instrumentation
│  │  │  └─ hooks.ts                  # onRequest/onResponse hooks (timing, audit)
│  │  └─ index.ts                     # Barrel for core
│  │
│  ├─ routes/
│  │  └─ index.ts                     # Registers feature routes in one place
│  │
│  ├─ features/                       # Feature → Sub-feature (one level only)
│  │  ├─ health/
│  │  │  ├─ check/
│  │  │  │  ├─ exec/main.ts           # runnable: fake adapters only, one route
│  │  │  │  ├─ route.ts               # Fastify route + schemas wiring
│  │  │  │  ├─ controller.ts          # HTTP boundary
│  │  │  │  ├─ usecase.ts             # orchestrates via ports
│  │  │  │  ├─ port.ts                # feature-scoped ports (interfaces/tokens)
│  │  │  │  ├─ adapters/fake.adapter.ts
│  │  │  │  ├─ schemas/{request.schema.ts,response.schema.ts}
│  │  │  │  ├─ types/index.ts
│  │  │  │  └─ __tests__/{unit.test.ts,integration.test.ts}
│  │  │  └─ CLAUDE.md
│  │  ├─ graph/
│  │  │  ├─ get-by-run/
│  │  │  │  ├─ exec/main.ts
│  │  │  │  ├─ route.ts
│  │  │  │  ├─ controller.ts
│  │  │  │  ├─ usecase.ts
│  │  │  │  ├─ port.ts
│  │  │  │  ├─ adapters/fake.adapter.ts
│  │  │  │  ├─ schemas/{request.schema.ts,response.schema.ts}
│  │  │  │  ├─ types/index.ts
│  │  │  │  └─ __tests__/{unit.test.ts,integration.test.ts}
│  │  │  └─ CLAUDE.md
│  │  ├─ app-launch-config/
│  │  │  ├─ list/
│  │  │  │  ├─ exec/main.ts
│  │  │  │  ├─ route.ts
│  │  │  │  ├─ controller.ts
│  │  │  │  ├─ usecase.ts
│  │  │  │  ├─ port.ts
│  │  │  │  ├─ adapters/fake.adapter.ts
│  │  │  │  ├─ schemas/{request.schema.ts,response.schema.ts}
│  │  │  │  ├─ types/index.ts
│  │  │  │  └─ __tests__/{unit.test.ts,integration.test.ts}
│  │  │  └─ CLAUDE.md
│  │
│  ├─ ports/                          # Interfaces required by backend from providers
│  │  ├─ data/
│  │  │  ├─ health.port.ts            # Example: data access contract for health
│  │  │  ├─ app-launch-config.port.ts # Example: data access contract for app launch config
│  │  │  └─ index.ts
│  │  └─ index.ts
│  │
│  ├─ adapters/                       # Implementations of ports using providers (e.g., :data)
│  │  ├─ data/
│  │  │  ├─ health.adapter.ts
│  │  │  ├─ app-launch-config.adapter.ts
│  │  │  └─ index.ts
│  │  └─ index.ts
│  │
│  ├─ shared/
│  │  ├─ constants.ts                 # All literals from enums/constants (Rule 3)
│  │  ├─ http.ts                      # HTTP helpers (status mapping, schema helpers)
│  │  ├─ errors.ts                    # Base typed errors + helpers
│  │  ├─ zod.ts                       # Zod helpers & patterns
│  │  ├─ result.ts                    # Result/Either helpers (optional)
│  │  └─ utils/
│  │     ├─ correlation.ts            # Request ID, trace utilities
│  │     └─ time.ts                   # Timing utilities
│  │
│  ├─ types/
│  │  └─ index.ts                     # Backend public types (no implicit any)
│  │
│  ├─ index.ts                        # Existing entrypoint (kept). Future: delegate to startServer().
│  └─ healthz.ts                      # Optional minimal health bootstrap for infra checks
│
├─ env.example
├─ vitest.config.ts
├─ tsconfig.json
└─ package.json
```

Notes

- No side effects on import. `createApp()` registers everything; `startServer()` listens.
- Ports live with consumers (backend), adapters live with providers (implemented here using provider SDKs such as `@screengraph/data`).
- Features are isolated; no cross-feature imports. Share logic via `features/core` (if truly feature-shared) or `src/shared`.
- Existing files under `src/features/*` remain operational. This structure introduces a clean migration path without breaking current code.

### Dependency Direction

- `:ui → :backend → :data`
- Backend defines its own ports (interfaces). Adapters translate backend’s domain to provider calls/types.

### Public API Surface

- `src/index.ts` is the runtime entry. Library consumers (tests) may import `src/core/app.ts` to spin a server instance without listening.

### Plugin & Boot Strategy

- `src/core/app.ts`: `createApp()` returns a configured Fastify instance.
- `src/core/server.ts`: `startServer()` reads env, creates app, sets error handler, and `listen()`.
- `src/core/plugins/*`: logging, CORS, security, OpenTelemetry, hooks.

### Configuration & Env

- `src/core/env.ts`: Zod-validated env. Load once; inject required parts.
- `src/core/config.ts`: Derived configuration (timeouts, limits). No direct `process.env` reads here—only via `env.ts`.

### Error Handling

- Use typed errors only. Map errors to HTTP status in `src/core/error.ts`.
- No `console.log`. Use Pino from `@screengraph/logging` with correlation/trace IDs, and OpenTelemetry spans on critical paths.

### Validation

- All external inputs validated with Zod at route boundaries (`*.validators.ts`).
- Controllers only receive already-validated, typed data.

### Feature Layout (authoritative)

```text
features/<feature>/<sub-feature>/
├─ exec/main.ts            # runnable app with fake adapters only
├─ route.ts                # route + schema wiring
├─ controller.ts           # HTTP boundary (req/res only)
├─ usecase.ts              # orchestrates via feature ports
├─ port.ts                 # feature-scoped ports (interfaces/tokens)
├─ adapters/fake.adapter.ts
├─ schemas/{request.schema.ts,response.schema.ts}
├─ types/index.ts          # local DTOs/entities (not imported by others)
└─ __tests__/{unit.test.ts,integration.test.ts}
```

Rules:
- Ports live inside the feature. Real adapters live outside features at `adapters/<port>/<impl>`.
- Fakes/in-memory for exec/tests live inside the feature. Fakes for cross-cutting shared ports live under `shared/ports/fakes/*`.
- Handlers import schemas + ports only. DI selects real (routes) vs fake (exec/tests).
- Block cross-feature imports. Allowed cross-boundary imports come only from `shared/**`.

### DI (TypeDI)

- Use TypeDI Container to register concrete adapters during bootstrap.
- Import `reflect-metadata` at process start.
- Example registration: `Container.set('HealthCheckPort', new HealthAdapter())`.

Reference: TypeDI docs [docs.typestack.community/typedi](https://github.com/typestack/typedi)

### Ports & Adapters

- Define the interface in `features/<feature>/<sub>/port.ts`.
- Real adapters: `adapters/<port>/<impl>.ts` (outside `features/`).
- Fakes: inside the feature (`adapters/fake.adapter.ts`).
- Wire real adapters in `core/di/di.ts` at boot; handlers never import concretes.

### Scaffolding

- Command: `npm run scaffold:feature -- --feature <name> --sub <name>`
- Creates feature/sub-feature skeleton with exec, route, controller, usecase, port, schemas, and fake adapter.

### Logging & Tracing

- Use `@screengraph/logging` (Pino). Include request ID and trace context.
- Add OpenTelemetry instrumentation via `src/core/plugins/otel.ts`. Annotate spans for critical operations.

### Testing Strategy

- Unit: Test services with port mocks (`__tests__/unit`).
- Integration: Spin `createApp()` or Fastify instance and register only the feature under test (`__tests__/integration`).
- E2E: Only in top-level `:tests` package.
- Every logic branch must have a test.

### Clean Architecture Rules (backend-specific)

1. Boundaries: `:ui → :backend → :data`. No reverse deps.
2. Ports & adapters: Interfaces in backend; adapters call providers.
3. Validation at boundaries: Zod on all inputs/outputs crossing HTTP.
4. Constants/enums SoT: All literals from `src/shared/constants.ts`. Exhaustive unions on unions.
5. No implicit `any`. No widening types.
6. Files < 400 lines; functions < 50; nesting ≤ 3.
7. No cross-feature imports. Share only via `shared` or feature/core.
8. Error discipline: Typed errors → unified mapper → HTTP.
9. Observability: Structured logs + OTel spans. Never log secrets.
10. Documentation: File headers with purpose, dependencies, public API. Record decisions in `DECISIONS.md`.

### Migration Notes (non-breaking)

- Existing `src/index.ts` and current `features/*` remain as-is.
- New structure can be adopted incrementally per feature.
- Prefer creating new files under the proposed layout and gradually refactor.

Last updated: 2025-10-08
