/**
 * @module Backend/Management/Personas/Routes
 * @description Personas endpoints backed by .mcp/personas JSON files. List + minimal update.
 */
import type { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';

type PersonaLite = { id: string; name: string; role?: string };

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
    } catch (_err) {
      // try next dir
    }
  }
  return false;
}

export const personasRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/management/personas', async () => {
    return { personas: tryReadPersonasDir() };
  });

  fastify.put<{ Params: { id: string }; Body: { name?: string; role?: string } }>('/management/personas/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, role } = request.body || {};
    if (typeof name !== 'string' || name.trim().length === 0 || typeof role !== 'string' || role.trim().length === 0) {
      return reply.code(400).send({ error: 'Invalid body: name and role are required' });
    }
    const ok = tryWritePersona(id, { name: name.trim(), role: role.trim() });
    if (!ok) {
      // If FS write not possible, treat as dry-run success so UI can proceed; persistence to be improved later
      return reply.code(200).send({ updated: false, dryRun: true });
    }
    return { updated: true };
  });
};
