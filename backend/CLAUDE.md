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
│  ├─ features/                       # One folder per feature (SRP; no cross-feature imports)
│  │  ├─ status/                      # Example feature following full structure
│  │  │  ├─ status.controller.ts      # HTTP boundary (req/res only)
│  │  │  ├─ status.service.ts         # Business logic; depends on ports (interfaces)
│  │  │  ├─ status.routes.ts          # Fastify routes + schemas
│  │  │  ├─ status.validators.ts      # Zod schemas for request/response validation
│  │  │  ├─ status.types.ts           # Feature types (no widening types)
│  │  │  ├─ status.errors.ts          # Feature-specific typed errors
│  │  │  ├─ status.adapters.ts        # Mapping to/from provider types (:data, externals)
│  │  │  ├─ status.port.ts            # Feature-scoped port (if not shared)
│  │  │  ├─ index.ts                  # Barrel
│  │  │  └─ __tests__/
│  │  │     ├─ unit/status.service.test.ts
│  │  │     ├─ integration/status.integration.test.ts
│  │  │     └─ mocks/status.port.mock.ts
│  │  └─ ...
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
features/<name>/
├─ <name>.controller.ts   # HTTP boundary (req/res)
├─ <name>.service.ts      # Business logic; depends on ports
├─ <name>.routes.ts       # Fastify routes + schemas
├─ <name>.validators.ts   # Zod schemas for req/res
├─ <name>.types.ts        # Feature types (no implicit any)
├─ <name>.errors.ts       # Feature-specific typed errors
├─ <name>.adapters.ts     # Mapping to/from provider types (:data, externals)
├─ <name>.port.ts         # Feature-scoped port (if distinct from shared ports/*)
├─ index.ts               # Barrel
└─ __tests__/
   ├─ unit/<name>.service.test.ts
   ├─ integration/<name>.integration.test.ts
   └─ mocks/<name>.port.mock.ts
```

### Ports & Adapters

- Define the interface you need in `src/ports/<provider>/<feature>.port.ts`.
- Implement it using providers in `src/adapters/<provider>/*.adapter.ts`.
- Wire in `src/core/di.ts`, injecting adapters into services.

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
