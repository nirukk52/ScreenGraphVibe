#!/usr/bin/env node
/*
  Simple scaffolder: node scripts/scaffold-feature.js --feature graph --sub get-by-run
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
  ['port.ts', `// feature port
export interface ExamplePort { run(): Promise<void>; }
`],
  ['usecase.ts', `// use case orchestration
import type { ExamplePort } from './port.js';
export function makeUseCase(deps:{ port: ExamplePort }){ return async ()=> deps.port.run(); }
`],
  ['controller.ts', `// HTTP controller
import type { FastifyRequest, FastifyReply } from 'fastify';
import { makeUseCase } from './usecase.js';
import type { ExamplePort } from './port.js';
export function makeController(deps:{ port: ExamplePort }){ const exec = makeUseCase(deps); return async (_req:FastifyRequest,res:FastifyReply)=>{ await exec(); return res.code(200).send({ ok:true }); } }
`],
  ['route.ts', `// Route wiring
import type { FastifyInstance } from 'fastify';
import { makeController } from './controller.js';
import type { ExamplePort } from './port.js';
export async function registerRoute(app: FastifyInstance, deps:{ port: ExamplePort }){ app.get('/example', makeController(deps)); }
`],
  [join('adapters','fake.adapter.ts'), `// Fake adapter for tests/exec
import type { ExamplePort } from '../port.js';
export class FakeExampleAdapter implements ExamplePort { async run(){ /* noop */ } }
`],
  [join('exec','main.ts'), `import Fastify from 'fastify';
import { registerRoute } from '../route.js';
import { FakeExampleAdapter } from '../adapters/fake.adapter.js';
export async function createApp(){ const app = Fastify({ logger:false }); await registerRoute(app, { port: new FakeExampleAdapter() }); return app; }
if (require.main === module){ (async()=>{ const app = await createApp(); await app.listen({ port:0, host:'127.0.0.1' }); })(); }
`],
  [join('schemas','request.schema.ts'), `import { z } from 'zod';
export const RequestSchema = z.object({});
`],
  [join('schemas','response.schema.ts'), `import { z } from 'zod';
export const ResponseSchema = z.object({ ok: z.boolean() });
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


