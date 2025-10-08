<!-- 45f88886-3f8e-41e5-8211-9188cc36a100 eb635be2-e01b-4d65-8c1a-9b57b2589aea -->
# Backend Feature Docs, Mock-Mode DI, Deterministic Execs, and Schema Wiring

## Scope

Implement for both feature root and sub-features now: `features/health` + `features/health/check`, and `features/app-launch-config` + `features/app-launch-config/list`. Establish reusable infra (env, config, DI, Swagger) for all features.

## Docs per Feature and Sub-feature (fixed 3 files each)

- Create `features/<feature>/docs/` and `features/<feature>/<sub>/docs/` with:
  - `OVERVIEW.md`: purpose, inputs/outputs, invariants, how to run exec.
  - `CONTRACTS.md`: links to schemas. For feature root, link to its exec schema (below) and reference sub-feature contracts.
  - `DECISIONS.md`: local ADRs, link to top-level decisions.

## Mock Mode (DI edge only, hierarchical)

- Env var: `MOCK_FEATURES=app-launch-config,app-launch-config/list,health/check`.
- Keys supported:
  - `<feature>`: applies to all sub-features under feature
  - `<feature>/<sub>`: applies to that sub-feature only (overrides feature-level)
- Parse in `src/core/env.ts` (Zod optional string).
- Derive helpers in `src/core/config.ts`:
  - `getMockedFeatureSet(list?: string): { features: Set<string>; subFeatures: Set<string> }`
  - `isMocked(k: { feature: string; sub?: string }): boolean` with precedence: explicit sub-feature → feature → false.
- In `src/core/di.ts`, register fake vs real adapters per sub-feature key using `isMocked`.
- No branching in controllers/usecases.

## Schema Wiring + Swagger (sub-features)

- For each sub-feature route, add Zod `schemas/request.schema.ts` and `schemas/response.schema.ts`.
- Wire Fastify routes with `fastify-type-provider-zod`; attach schemas for `params/query/body` and `response`.
- Add Swagger: `src/core/plugins/swagger.ts` and `src/core/openapi.ts`; expose `/docs`.

## Execs (CLI, deterministic)

- Sub-feature execs (`features/<feature>/<sub>/exec/main.ts`):
  - Deterministic fake data that mirrors the route’s happy path
  - Include `trace_id: "EXEC_FIXED_TRACE_ID"`
  - Validate with the route’s `responseSchema.parse`
  - Print JSON to stdout and exit 0
- Feature-level execs (`features/<feature>/exec/main.ts`):
  - Minimal deterministic contract (no HTTP route):
    - Schema at `features/<feature>/schemas/exec-response.schema.ts`
    - Example shape: `{ feature: '<feature>', trace_id: 'EXEC_FIXED_TRACE_ID' }`
  - Validate with its schema, print JSON, exit 0
- No HTTP server; no cross-feature imports; only `shared/**` allowed.

## Tests

- Sub-feature integration tests with Supertest against the real route:
  - Expect 200; validate with the same `responseSchema`; assert deterministic content including `trace_id`.
- (Optional) Feature exec smoke tests: run CLI, parse output with its schema.
- Update `env.example` with `MOCK_FEATURES` examples (feature and sub-feature keys).

## Update `backend/CLAUDE.md`

- Document feature + sub-feature docs folder convention, CLI exec behavior, fixed `trace_id`, hierarchical mock-mode env and DI rule, and Swagger/OpenAPI as source of truth for routes.

## Essential Snippets (illustrative)

- Env parse (concept):
```ts
// env.ts
MOCK_FEATURES?: z.string().optional();
```

- Config helpers (concept):
```ts
export function getMockedFeatureSet(list?: string){
  const items = (list ?? '').split(',').map(s=>s.trim()).filter(Boolean);
  const features = new Set<string>();
  const subFeatures = new Set<string>();
  for(const it of items){
    if(it.includes('/')) subFeatures.add(it); else features.add(it);
  }
  return { features, subFeatures };
}
export function isMocked(sets: {features:Set<string>, subFeatures:Set<string>}, feature: string, sub?: string){
  if(sub && sets.subFeatures.has(`${feature}/${sub}`)) return true;
  if(sets.features.has(feature)) return true;
  return false;
}
```

- DI selection (concept):
```ts
const mockedSets = getMockedFeatureSet(env.MOCK_FEATURES);
const isFeatureMocked = (f: string, s?: string) => isMocked(mockedSets, f, s);
```

### To-dos

- [ ] Add docs folder (3 files) for health/check
- [ ] Add docs folder (3 files) for app-launch-config/list
- [ ] Add MOCK_FEATURES to env.ts (Zod) and env.example
- [ ] Add getMockedFeatureSet helper in core/config.ts
- [ ] Wire DI to select fake/real per sub-feature key
- [ ] Add request/response Zod schemas for health/check
- [ ] Add request/response Zod schemas for app-launch-config/list
- [ ] Wire health/check route with Zod schemas
- [ ] Wire app-launch-config/list route with Zod schemas
- [ ] Add Swagger plugin and OpenAPI wiring; expose /docs
- [ ] Convert health/check exec to CLI printing deterministic JSON
- [ ] Convert app-launch-config/list exec to CLI deterministic JSON
- [ ] Add integration test validating schema and deterministic response for health/check
- [ ] Add integration test for app-launch-config/list
- [ ] Update backend/CLAUDE.md with new conventions