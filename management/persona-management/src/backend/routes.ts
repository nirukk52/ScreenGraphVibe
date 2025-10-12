/**
 * @module Backend/Management/Personas/Routes
 * @description Personas endpoints backed by .mcp/personas JSON files. List + minimal create/update/delete.
 */
import type { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

type PersonaLite = { id: string; name: string; role?: string };

const IdParamSchema = z.object({ id: z.string().min(1) });
const CreateBodySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
});
const UpdateBodySchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
});

const FactsBodySchema = z.object({
  facts: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })).min(0),
});

const OwnershipBodySchema = z.object({
  modules: z.array(z.enum([':data', ':backend', ':ui', ':agent', ':infra'])).min(0),
});

const WorkflowBodySchema = z.object({
  workflow_expectations: z.object({
    before_starting: z.array(z.string().min(1)).min(1),
    after_completion: z.array(z.string().min(1)).min(1),
  }),
});

function candidatesDirs(): string[] {
  return [
    path.resolve(process.cwd(), '.mcp/personas'),
    path.resolve(process.cwd(), '../.mcp/personas'),
    path.resolve(process.cwd(), '../../.mcp/personas'),
  ];
}

function tryReadPersonasDir(): PersonaLite[] {
  for (const dir of candidatesDirs()) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const personas: PersonaLite[] = [];
      for (const ent of entries) {
        if (ent.isFile() && ent.name.endsWith('.json')) {
          const raw = fs.readFileSync(path.join(dir, ent.name), 'utf8');
          const json = JSON.parse(raw);
          personas.push({ id: json.persona_id ?? ent.name.replace(/\.json$/, ''), name: json.name ?? ent.name, role: json.role });
        }
      }
      if (personas.length) return personas;
    } catch (_err) {
      // continue
    }
  }
  return [
    { id: 'ian_botts_cto', name: 'Ian Botts — CTO', role: 'CTO' },
    { id: 'rino_senior', name: 'Rino the Engineer — Senior', role: 'Engineer (Senior implementer)' },
    { id: 'jacob_engineer', name: 'Jacob — Backend Engineer', role: 'Engineer (Backend)' },
  ];
}

function findWritableDir(): string | null {
  for (const dir of candidatesDirs()) {
    try {
      if (fs.existsSync(dir) && fs.accessSync(dir, fs.constants.W_OK) === undefined) {
        return dir;
      }
    } catch {}
  }
  return null;
}

function tryWritePersona(id: string, patch: { name: string; role: string }): boolean {
  for (const dir of candidatesDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      json.name = patch.name;
      json.role = patch.role;
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
      return true;
    } catch (_err) {}
  }
  return false;
}

function tryWriteFacts(id: string, facts: Array<{ key: string; value: string }>): boolean {
  for (const dir of candidatesDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      json.facts_assumptions = facts;
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
      return true;
    } catch (_err) {}
  }
  return false;
}

function tryWriteOwnership(id: string, modules: string[]): boolean {
  for (const dir of candidatesDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      json.module_ownership = modules;
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
      return true;
    } catch (_err) {}
  }
  return false;
}

function tryWriteWorkflow(
  id: string,
  workflow: { before_starting: string[]; after_completion: string[] },
): boolean {
  for (const dir of candidatesDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      json.workflow_expectations = {
        before_starting: workflow.before_starting,
        after_completion: workflow.after_completion,
      };
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
      return true;
    } catch (_err) {}
  }
  return false;
}

function readPersonaById(id: string): Record<string, unknown> | null {
  for (const dir of candidatesDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      return json;
    } catch (_err) {}
  }
  return null;
}

function tryCreatePersona(id: string, body: { name: string; role: string }): boolean {
  const dir = findWritableDir();
  if (!dir) return false;
  const file = path.join(dir, `${id}.json`);
  try {
    if (fs.existsSync(file)) return false;
    const json = { persona_id: id, name: body.name, role: body.role };
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
    return true;
  } catch {
    return false;
  }
}

function tryDeletePersona(id: string): boolean {
  for (const dir of candidatesDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      fs.unlinkSync(file);
      return true;
    } catch (_err) {}
  }
  return false;
}

export const personasRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/management/personas', async () => {
    return { personas: tryReadPersonasDir() };
  });

  fastify.get('/management/personas/:id', async (request, reply) => {
    const p = IdParamSchema.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid id' });
    const persona = readPersonaById(p.data.id);
    if (!persona) return reply.code(404).send({ error: 'persona not found' });
    return { persona };
  });

  fastify.post('/management/personas', async (request, reply) => {
    const parsed = CreateBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'id, name, role required' });
    const { id, name, role } = parsed.data;
    const ok = tryCreatePersona(id, { name, role });
    return reply.code(200).send({ created: ok, dryRun: !ok });
  });

  fastify.put('/management/personas/:id', async (request, reply) => {
    const p = IdParamSchema.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid id' });
    const b = UpdateBodySchema.safeParse(request.body);
    if (!b.success) return reply.code(400).send({ error: 'Invalid body: name and role are required' });
    const ok = tryWritePersona(p.data.id, { name: b.data.name.trim(), role: b.data.role.trim() });
    return reply.code(200).send({ updated: ok, dryRun: !ok });
  });

  fastify.put('/management/personas/:id/facts', async (request, reply) => {
    const p = IdParamSchema.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid id' });
    const b = FactsBodySchema.safeParse(request.body);
    if (!b.success) return reply.code(400).send({ error: 'Invalid body: facts required' });
    const ok = tryWriteFacts(p.data.id, b.data.facts);
    return reply.code(200).send({ updated: ok, dryRun: !ok });
  });

  fastify.put('/management/personas/:id/ownership', async (request, reply) => {
    const p = IdParamSchema.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid id' });
    const b = OwnershipBodySchema.safeParse(request.body);
    if (!b.success) return reply.code(400).send({ error: 'Invalid body: modules required' });
    const ok = tryWriteOwnership(p.data.id, b.data.modules);
    return reply.code(200).send({ updated: ok, dryRun: !ok });
  });

  fastify.put('/management/personas/:id/workflow', async (request, reply) => {
    const p = IdParamSchema.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid id' });
    const b = WorkflowBodySchema.safeParse(request.body);
    if (!b.success)
      return reply.code(400).send({ error: 'Invalid body: workflow expectations required' });
    const ok = tryWriteWorkflow(p.data.id, b.data.workflow_expectations);
    return reply.code(200).send({ updated: ok, dryRun: !ok });
  });

  fastify.delete('/management/personas/:id', async (request, reply) => {
    const p = IdParamSchema.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid id' });
    const ok = tryDeletePersona(p.data.id);
    return reply.code(200).send({ deleted: ok, dryRun: !ok });
  });
};

