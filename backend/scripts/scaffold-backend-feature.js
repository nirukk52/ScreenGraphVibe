#!/usr/bin/env node
/*
  Scaffolder: node scripts/scaffold-backend-feature.js --feature graph --sub get-by-run
  Generates a self-executable feature skeleton with:
  - feature-scoped port/usecase/controller/route
  - fake adapter for exec/tests
  - exec with `run()` and CLI that prints deterministic JSON with trace_id
  - exec request/response schemas
  - basic integration exec test importing run()
  - route integration test using Fastify and HTTP envelope helpers
  - per-feature route aggregator under src/routes/<feature>/index.ts
*/
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function arg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : fallback;
}

const feature = arg('feature');
const sub = arg('sub');
if (!feature || !sub) {
  console.error('Usage: --feature <name> --sub <name>');
  process.exit(1);
}

const base = join('src', 'features', feature, sub);

function toPascal(input) {
  return String(input)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
}

const FeaturePascal = toPascal(feature);
const SubPascal = toPascal(sub);
const routeFn = `register${FeaturePascal}${SubPascal}Route`;

const files = [
  ['port.ts', `// feature port (define real contract per feature)
export interface ExamplePort { run(): Promise<{ ok: true }>; }
`],
  ['usecase.ts', `// use case orchestration
import type { ExamplePort } from './port.js';
export function makeUseCase(deps: { port: ExamplePort }) {
  return async () => deps.port.run();
}
`],
  ['controller.ts', `// HTTP controller
import type { FastifyRequest, FastifyReply } from 'fastify';
import { makeUseCase } from './usecase.js';
import type { ExamplePort } from './port.js';
import { success, HTTP_STATUS } from '../../shared/http.js';

export function makeController(deps: { port: ExamplePort }) {
  const exec = makeUseCase(deps);
  return async (_req: FastifyRequest, res: FastifyReply) => {
    const data = await exec();
    return res.code(HTTP_STATUS.OK).send(success(data));
  };
}
`],
  ['route.ts', `// Route wiring
import type { FastifyInstance } from 'fastify';
import { makeController } from './controller.js';
import type { ExamplePort } from './port.js';

export async function ${routeFn}(app: FastifyInstance, deps: { port: ExamplePort }) {
  app.get('/example', makeController(deps));
}
`],
  [join('adapters','fake.adapter.ts'), `// Fake adapter for tests/exec
import type { ExamplePort } from '../port.js';
export class FakeExampleAdapter implements ExamplePort {
  async run() { return { ok: true as const }; }
}
`],
  [join('exec','main.ts'), `// Self-executable CLI for this sub-feature
import { FakeExampleAdapter } from '../adapters/fake.adapter.js';
import { ExecResponseSchema } from '../schemas/exec-response.schema.js';

export type RunOptions = { traceId?: string; pretty?: boolean };

export async function run(options: RunOptions = {}) {
  const traceId = options.traceId ?? 'exec-fixed-trace-id';
  const port = new FakeExampleAdapter();
  const data = await port.run();
  return ExecResponseSchema.parse({ data, trace_id: traceId });
}

function parseArg(flag: string) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const pretty = process.argv.includes('--pretty');
  const trace = parseArg('--trace-id');
  const out = await run({ pretty, traceId: trace });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(out, null, pretty ? 2 : 0));
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
`],
  [join('schemas','exec-request.schema.ts'), `import { z } from 'zod';
export const ExecRequestSchema = z.object({});
export type ExecRequest = z.infer<typeof ExecRequestSchema>;
`],
  [join('schemas','exec-response.schema.ts'), `import { z } from 'zod';
export const ExecResponseSchema = z.object({
  data: z.object({ ok: z.literal(true) }),
  trace_id: z.string(),
});
export type ExecResponse = z.infer<typeof ExecResponseSchema>;
`],
  [join('__tests__','integration.exec.test.ts'), `import { describe, it, expect } from 'vitest';
import { run } from '../exec/main.js';
import { ExecResponseSchema } from '../schemas/exec-response.schema.js';

describe('exec (self-executable)', () => {
  it('produces valid output', async () => {
    const out = await run({ traceId: 'test-trace' });
    expect(ExecResponseSchema.parse(out)).toBeTruthy();
  });
});
`],
  [join('__tests__','route.integration.test.ts'), `import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { ${routeFn} } from '../route.js';
import { FakeExampleAdapter } from '../adapters/fake.adapter.js';

describe('route integration', () => {
  it('returns 200 with envelope', async () => {
    const app = Fastify({ logger: false });
    await ${routeFn}(app, { port: new FakeExampleAdapter() });
    const res = await app.inject({ method: 'GET', url: '/example' });
    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json).toHaveProperty('ok', true);
    expect(json).toHaveProperty('data.ok', true);
  });
});
`],
];

for (const [rel, content] of files) {
  const dir = join(base, rel).split('/').slice(0, -1).join('/');
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  const full = join(base, rel);
  if (!existsSync(full)) writeFileSync(full, content);
}

const claudePath = join('src','features',feature,'CLAUDE.md');
if (!existsSync(claudePath)) {
  const md = `# ${feature}

Purpose: Describe the feature and its primary sub-features.

Structure: Feature → Sub-feature (no deep nesting).

Contracts: Ports live inside the feature; fakes under feature; real adapters outside.
`;
  const d = join('src','features',feature);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
  writeFileSync(claudePath, md);
}

// Create versioned JSON examples (v1/happy and v1/sad) with unified names
const jsonBase = join(base, 'jsons', 'v1');
const happyDir = join(jsonBase, 'happy');
const sadDir = join(jsonBase, 'sad');
if (!existsSync(happyDir)) mkdirSync(happyDir, { recursive: true });
if (!existsSync(sadDir)) mkdirSync(sadDir, { recursive: true });
const happyInput = join(happyDir, 'input.json');
const happyOutput = join(happyDir, 'output.json');
const sadInput = join(sadDir, 'input.json');
const sadOutput = join(sadDir, 'output.json');
if (!existsSync(happyInput)) writeFileSync(happyInput, '{\n  "version": "v1"\n}\n');
if (!existsSync(happyOutput)) writeFileSync(happyOutput, '{\n  "version": "v1"\n}\n');
if (!existsSync(sadInput)) writeFileSync(sadInput, '{\n}\n');
if (!existsSync(sadOutput)) writeFileSync(sadOutput, '{\n  "code": "domain_error",\n  "message": "explainable message"\n}\n');

// Create per-feature route aggregator if missing
const routesFeatureDir = join('src', 'routes', feature);
const routesFeatureIndex = join(routesFeatureDir, 'index.ts');
if (!existsSync(routesFeatureIndex)) {
  if (!existsSync(routesFeatureDir)) mkdirSync(routesFeatureDir, { recursive: true });
  const content = `/**
 * @module routes/${feature}
 * @description Groups all ${feature}-related routes.
 * @publicAPI register${FeaturePascal}Routes
 */
import type { FastifyInstance } from 'fastify';
import { ${routeFn} } from '../../features/${feature}/${sub}/route.js';
import { FakeExampleAdapter } from '../../features/${feature}/${sub}/adapters/fake.adapter.js';
import { getEnv } from '../../core/env.js';
import { getMockedFeatureSet, isMocked } from '../../core/config.js';

export async function register${FeaturePascal}Routes(app: FastifyInstance) {
  // Using fake adapter by default; wire real adapters when available
  const env = getEnv();
  const mocked = getMockedFeatureSet(env.MOCK_FEATURES);
  const useFake = isMocked(mocked, '${feature}', '${sub}') || true;
  const port = useFake ? new FakeExampleAdapter() : new FakeExampleAdapter();
  await ${routeFn}(app, { port });
}
`;
  writeFileSync(routesFeatureIndex, content);
}

// Auto-wire feature group in routes/index.ts if not already present
const routesIndexPath = join('src', 'routes', 'index.ts');
try {
  const src = readFileSync(routesIndexPath, 'utf8');
  const importLine = `import { register${FeaturePascal}Routes } from './${feature}/index.js';`;
  const hasImport = src.includes(importLine);
  let next = src;
  if (!hasImport) {
    next = next.replace(
      /(import[^\n]*from[^\n]*;\n)(?![\s\S]*import)/,
      `$1${importLine}\n`
    );
    if (!next.includes(importLine)) {
      // fallback: prepend at top
      next = `${importLine}\n${next}`;
    }
  }
  const callLine = `  await register${FeaturePascal}Routes(app);`;
  if (!next.includes(callLine)) {
    next = next.replace(
      /export\s+async\s+function\s+registerRoutes\([^)]*\)\s*{([\s\S]*?)}/,
      (m, body) => m.replace(body, `${body}\n${callLine}\n  `)
    );
  }
  if (next !== src) writeFileSync(routesIndexPath, next);
} catch {
  // ignore if routes/index.ts is missing
}

console.log(`Scaffolded ${feature}/${sub}`);


