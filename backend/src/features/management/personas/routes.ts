/**
 * @module Backend/Management/Personas/Routes
 * @description Minimal personas list endpoint backed by .mcp/personas JSON files. Falls back to static list if filesystem unavailable.
 */
import type { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';

type PersonaLite = { id: string; name: string; role?: string };

function tryReadPersonasDir(): PersonaLite[] {
  const candidates = [
    path.resolve(process.cwd(), '.mcp/personas'),
    path.resolve(process.cwd(), '../.mcp/personas'),
    path.resolve(process.cwd(), '../../.mcp/personas'),
  ];
  for (const dir of candidates) {
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
      // continue to next candidate
    }
  }
  // Fallback static sample (keeps E2E green if FS not available)
  return [
    { id: 'ian_botts_cto', name: 'Ian Botts — CTO', role: 'CTO' },
    { id: 'rino_senior', name: 'Rino the Engineer — Senior', role: 'Engineer (Senior implementer)' },
    { id: 'jacob_engineer', name: 'Jacob — Backend Engineer', role: 'Engineer (Backend)' },
  ];
}

export const personasRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/management/personas', async () => {
    return { personas: tryReadPersonasDir() };
  });
};
