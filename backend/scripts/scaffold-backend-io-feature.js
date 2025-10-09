#!/usr/bin/env node
/*
  IO-first scaffolder:
  node scripts/scaffold-backend-io-feature.js --feature screen --sub details --method post --http-path /details/:deviceID

  Generates:
  - Feature skeleton with port/usecase/controller/route (method-aware: get|post|sse)
  - Versioned JSON examples: jsons/v1/{happy,sad}/{input.json,output.json}
  - Zod schemas: params/body/output (+exec response)
  - Fake adapter returning output per schema
  - Route tests: happy and sad/bad paths
  - Per-feature route aggregator under src/routes/<feature>/index.ts
  - Auto-wiring in src/routes/index.ts
  - Adds ROUTES constant for new path in shared/constants.ts
*/
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function arg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : fallback;
}

const feature = arg('feature');
const sub = arg('sub');
const method = (arg('method', 'get') || 'get').toLowerCase(); // get|post|sse
const httpPath = arg('http-path', '/example');

if (!feature || !sub) {
  console.error('Usage: --feature <name> --sub <name> [--method get|post|sse] [--http-path /path/:param]');
  process.exit(1);
}

function toPascal(input) {
  return String(input)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
}

function toConstKey(f, s) {
  return `${String(f).replace(/[-\s]/g, '_').toUpperCase()}_${String(s).replace(/[-\s]/g, '_').toUpperCase()}`;
}

const FeaturePascal = toPascal(feature);
const SubPascal = toPascal(sub);
const routeFn = `register${FeaturePascal}${SubPascal}Route`;
const portName = `${FeaturePascal}${SubPascal}Port`;
const routeConstKey = toConstKey(feature, sub);
const base = join('src', 'features', feature, sub);

// JSON examples (v1)
const jsonBase = join(base, 'jsons', 'v1');
const happyDir = join(jsonBase, 'happy');
const sadDir = join(jsonBase, 'sad');
if (!existsSync(happyDir)) mkdirSync(happyDir, { recursive: true });
if (!existsSync(sadDir)) mkdirSync(sadDir, { recursive: true });
const happyInput = join(happyDir, 'input.json');
const happyOutput = join(happyDir, 'output.json');
const sadInput = join(sadDir, 'input.json');
const sadOutput = join(sadDir, 'output.json');
const defaultHappyInput = method === 'post' ? '{\n  "screenName": "Login"\n}\n' : '{\n}\n';
const defaultHappyOutput = '{\n  "ok": true\n}\n';
if (!existsSync(happyInput)) writeFileSync(happyInput, defaultHappyInput);
if (!existsSync(happyOutput)) writeFileSync(happyOutput, defaultHappyOutput);
if (!existsSync(sadInput)) writeFileSync(sadInput, '{\n}\n');
if (!existsSync(sadOutput)) writeFileSync(sadOutput, '{\n  "code": "domain_error",\n  "message": "explainable message"\n}\n');

// ROUTES constant update
const constantsPath = join('src', 'shared', 'constants.ts');
try {
  const src = readFileSync(constantsPath, 'utf8');
  if (!src.includes(routeConstKey)) {
    const updated = src.replace(
      /export const ROUTES = \{([\s\S]*?)\n\} as const;/,
      (m, body) => m.replace(body, `${body}\n  ${routeConstKey}: '${httpPath}',`)
    );
    if (updated !== src) writeFileSync(constantsPath, updated);
  }
} catch {
  // ignore if constants missing
}

// Derived flags
const hasParams = /:\w+/.test(httpPath);

// File templates
const files = [];

// port.ts
files.push(['port.ts', `// feature port (define real contract per feature)
import type { HttpOutput } from './schemas/http-output.schema.js';
${method === 'post' ? "import type { HttpInput } from './schemas/http-input.schema.js';" : ''}

export interface ${portName} {
  run(input: { params${hasParams ? '' : '?:'} ${hasParams ? `{ ${[...httpPath.matchAll(/:(\w+)/g)].map(m=>m[1]+': string').join('; ')} }` : 'undefined'}; body${method === 'post' ? '' : '?:'} ${method === 'post' ? 'HttpInput' : 'undefined'} }): Promise<HttpOutput>;
}
`]);

// usecase.ts
files.push(['usecase.ts', `// use case orchestration
import type { ${portName} } from './port.js';
${method === 'post' ? "import type { HttpInput } from './schemas/http-input.schema.js';" : ''}

export function makeUseCase(deps: { port: ${portName} }) {
  return async (input: { params${hasParams ? '' : '?:'} ${hasParams ? `{ ${[...httpPath.matchAll(/:(\w+)/g)].map(m=>m[1]+': string').join('; ')} }` : 'undefined'}; body${method === 'post' ? '' : '?:'} ${method === 'post' ? 'HttpInput' : 'undefined'} }) => deps.port.run(input);
}
`]);

// schemas
if (hasParams) {
  files.push(['schemas/http-params.schema.ts', `import { z } from 'zod';
export const HttpParamsSchema = z.object({ ${[...httpPath.matchAll(/:(\w+)/g)].map(m=>`${m[1]}: z.string().min(1)`).join(', ')} });
export type HttpParams = z.infer<typeof HttpParamsSchema>;
`]);
}
if (method === 'post') {
  files.push(['schemas/http-input.schema.ts', `import { z } from 'zod';
export const HttpInputSchema = z.object({ screenName: z.string().min(1) });
export type HttpInput = z.infer<typeof HttpInputSchema>;
`]);
}
files.push(['schemas/http-output.schema.ts', `import { z } from 'zod';
export const HttpOutputSchema = z.object({ ok: z.literal(true) });
export type HttpOutput = z.infer<typeof HttpOutputSchema>;
`]);
files.push(['schemas/exec-response.schema.ts', `import { z } from 'zod';
import { HttpOutputSchema } from './http-output.schema.js';
export const ExecResponseSchema = z.object({ data: HttpOutputSchema, trace_id: z.string() });
export type ExecResponse = z.infer<typeof ExecResponseSchema>;
`]);

// controller.ts
files.push(['controller.ts', `// HTTP controller
import type { FastifyRequest, FastifyReply } from 'fastify';
import { makeUseCase } from './usecase.js';
import type { ${portName} } from './port.js';
${hasParams ? "import { HttpParamsSchema } from './schemas/http-params.schema.js';" : ''}
${method === 'post' ? "import { HttpInputSchema } from './schemas/http-input.schema.js';" : ''}
import { HttpOutputSchema } from './schemas/http-output.schema.js';
import { HTTP_STATUS, success } from '../../shared/http.js';
import { withSpan } from '../../core/tracing.js';
import { ValidationError } from '../../core/error.js';

type Req = FastifyRequest<{ ${hasParams ? `Params: { ${[...httpPath.matchAll(/:(\w+)/g)].map(m=>m[1]+': string').join('; ')} }` : ''}${hasParams && method==='post' ? '; ' : ''}${method === 'post' ? 'Body: unknown' : ''} }>;

export function makeController(deps: { port: ${portName} }) {
  const exec = makeUseCase(deps);
  return async (req: Req, res: FastifyReply) =>
    withSpan('${feature}.${sub}', async () => {
      ${hasParams ? 'let params: any;' : ''}
      ${method === 'post' ? 'let body: any;' : ''}
      try {
        ${hasParams ? 'params = HttpParamsSchema.parse(req.params ?? {});' : ''}
        ${method === 'post' ? 'body = HttpInputSchema.parse(req.body ?? {});' : ''}
      } catch (err) {
        throw new ValidationError(err);
      }
      const out = await exec({ ${hasParams ? 'params' : 'params: undefined'}, ${method === 'post' ? 'body' : 'body: undefined'} });
      const parsed = HttpOutputSchema.parse(out);
      req.log.info({ route: '${feature}.${sub}'${hasParams ? `, ...params` : ''}${method === 'post' ? `, ...body` : ''} }, 'request processed');
      return res.code(HTTP_STATUS.OK).send(success(parsed));
    });
}
`]);

// route.ts
files.push(['route.ts', `// Route wiring
import type { FastifyInstance } from 'fastify';
import { makeController } from './controller.js';
import type { ${portName} } from './port.js';
import { ROUTES } from '../../shared/constants.js';

export async function ${routeFn}(app: FastifyInstance, deps: { port: ${portName} }) {
  app.${method === 'sse' ? 'get' : method}(ROUTES.${routeConstKey}, makeController(deps));
}
`]);

// fake adapter
files.push(['adapters/fake.adapter.ts', `// Fake adapter for tests/exec
import type { ${portName} } from '../port.js';
import type { HttpOutput } from '../schemas/http-output.schema.js';

export class Fake${FeaturePascal}${SubPascal}Adapter implements ${portName} {
  async run(_input: any): Promise<HttpOutput> {
    return { ok: true as const };
  }
}
`]);

// exec
files.push(['exec/main.ts', `// Self-executable CLI for this sub-feature
import { Fake${FeaturePascal}${SubPascal}Adapter } from '../adapters/fake.adapter.js';
import { ExecResponseSchema } from '../schemas/exec-response.schema.js';

export type RunOptions = { traceId?: string; pretty?: boolean };

export async function run(options: RunOptions = {}) {
  const traceId = options.traceId ?? 'exec-fixed-trace-id';
  const port = new Fake${FeaturePascal}${SubPascal}Adapter();
  const data = await port.run({ ${hasParams ? `params: { ${[...httpPath.matchAll(/:(\w+)/g)].map(m=>`${m[1]}: '${m[1]}-123'`).join(', ')} }` : 'params: undefined'}, ${method === 'post' ? `body: { screenName: 'Login' }` : 'body: undefined'} });
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
`]);

// tests
files.push(['__tests__/route.happy.test.ts', `import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { ${routeFn} } from '../route.js';
import { Fake${FeaturePascal}${SubPascal}Adapter } from '../adapters/fake.adapter.js';

describe('${feature}/${sub} route happy path', () => {
  it('${method.toUpperCase()} ${httpPath} returns 200 with envelope', async () => {
    const app = Fastify({ logger: false });
    await ${routeFn}(app, { port: new Fake${FeaturePascal}${SubPascal}Adapter() });
    const res = await app.inject({
      method: '${method === 'sse' ? 'GET' : method.toUpperCase()}',
      url: '${httpPath.replace(/:(\w+)/g, (_,$1)=>$1+'-123')}',
      ${method === 'post' ? "payload: { screenName: 'Login' }," : ''}
    });
    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.ok).toBe(true);
  });
});
`]);

files.push(['__tests__/route.sad-bad.test.ts', `import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { ${routeFn} } from '../route.js';
import { Fake${FeaturePascal}${SubPascal}Adapter } from '../adapters/fake.adapter.js';
import { NotFoundError, setErrorHandling } from '../../core/error.js';

describe('${feature}/${sub} route sad/bad paths', () => {
  it('400 when input invalid', async () => {
    const app = Fastify({ logger: false });
    setErrorHandling(app);
    await ${routeFn}(app, { port: new Fake${FeaturePascal}${SubPascal}Adapter() });
    const res = await app.inject({
      method: '${method === 'sse' ? 'GET' : method.toUpperCase()}',
      url: '${httpPath.replace(/:(\w+)/g, (_,$1)=>$1+'-123')}',
      ${method === 'post' ? "payload: { screenName: '' }," : ''}
    });
    ${method === 'post' ? 'expect(res.statusCode).toBe(400);' : 'expect([200, 400]).toContain(res.statusCode);'}
  });

  it('404 when domain not found', async () => {
    const app = Fastify({ logger: false });
    setErrorHandling(app);
    await ${routeFn}(app, {
      port: {
        async run() { throw new NotFoundError('${feature}'); },
      } as any,
    });
    const res = await app.inject({
      method: '${method === 'sse' ? 'GET' : method.toUpperCase()}',
      url: '${httpPath.replace(/:(\w+)/g, (_,$1)=>$1+'-404')}',
      ${method === 'post' ? "payload: { screenName: 'Login' }," : ''}
    });
    expect(res.statusCode).toBe(404);
  });
});
`]);

// Write all files
for (const [rel, content] of files) {
  const dir = join(base, rel).split('/').slice(0, -1).join('/');
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  const full = join(base, rel);
  if (!existsSync(full)) writeFileSync(full, content);
}

// Feature-level CLAUDE.md if missing
const claudePath = join('src', 'features', feature, 'CLAUDE.md');
if (!existsSync(claudePath)) {
  const md = `# ${feature}\n\nPurpose: Describe the feature and its primary sub-features.\n\nStructure: Feature → Sub-feature (no deep nesting).\n\nContracts: Ports live inside the feature; fakes under feature; real adapters outside.\n`;
  const d = join('src', 'features', feature);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
  writeFileSync(claudePath, md);
}

// Per-feature route aggregator
const routesFeatureDir = join('src', 'routes', feature);
const routesFeatureIndex = join(routesFeatureDir, 'index.ts');
if (!existsSync(routesFeatureDir)) mkdirSync(routesFeatureDir, { recursive: true });
if (!existsSync(routesFeatureIndex)) {
  const content = `/**\n * @module routes/${feature}\n * @description Groups all ${feature}-related routes.\n * @publicAPI register${FeaturePascal}Routes\n */\nimport type { FastifyInstance } from 'fastify';\nimport { ${routeFn} } from '../../features/${feature}/${sub}/route.js';\nimport { getEnv } from '../../core/env.js';\nimport { getMockedFeatureSet, isMocked } from '../../core/config.js';\nimport { Fake${FeaturePascal}${SubPascal}Adapter } from '../../features/${feature}/${sub}/adapters/fake.adapter.js';\n\nexport async function register${FeaturePascal}Routes(app: FastifyInstance) {\n  const env = getEnv();\n  const mocked = getMockedFeatureSet(env.MOCK_FEATURES);\n  const useFake = isMocked(mocked, '${feature}', '${sub}') || true;\n  const port = useFake ? new Fake${FeaturePascal}${SubPascal}Adapter() : new Fake${FeaturePascal}${SubPascal}Adapter();\n  await ${routeFn}(app, { port });\n}\n`;
  writeFileSync(routesFeatureIndex, content);
}

// Auto-wire feature group in routes/index.ts
const routesIndexPath = join('src', 'routes', 'index.ts');
try {
  const src = readFileSync(routesIndexPath, 'utf8');
  const importLine = `import { register${FeaturePascal}Routes } from './${feature}/index.js';`;
  let next = src;
  if (!next.includes(importLine)) {
    next = next.replace(
      /(import[^\n]*from[^\n]*;\n)(?![\s\S]*import)/,
      `$1${importLine}\n`
    );
    if (!next.includes(importLine)) next = `${importLine}\n${next}`;
  }
  const callLine = `  await register${FeaturePascal}Routes(app);`;
  if (!next.includes(callLine)) {
    next = next.replace(
      /export\s+async\s+function\s+registerRoutes\([^)]*\)\s*{([\s\S]*?)}/,
      (m, body) => m.replace(body, `${body}\n${callLine}\n  `)
    );
  }
  if (next !== src) writeFileSync(routesIndexPath, next);
} catch {}

console.log(`Scaffolded IO feature ${feature}/${sub} (${method.toUpperCase()} ${httpPath})`);


