#!/usr/bin/env node
/*
  Scaffolder: node scripts/scaffold-backend-feature.js --feature graph --sub get-by-run
  Generates a self-executable feature skeleton with:
  - feature-scoped port/usecase/controller/route
  - fake adapter for exec/tests
  - exec with `run()` and CLI that prints deterministic JSON with trace_id
  - exec request/response schemas
  - basic integration exec test importing run()
*/
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
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

export function makeController(deps: { port: ExamplePort }) {
  const exec = makeUseCase(deps);
  return async (_req: FastifyRequest, res: FastifyReply) => {
    const data = await exec();
    return res.code(200).send({ data });
  };
}
`],
  ['route.ts', `// Route wiring
import type { FastifyInstance } from 'fastify';
import { makeController } from './controller.js';
import type { ExamplePort } from './port.js';

export async function registerRoute(app: FastifyInstance, deps: { port: ExamplePort }) {
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

console.log(`Scaffolded ${feature}/${sub}`);


