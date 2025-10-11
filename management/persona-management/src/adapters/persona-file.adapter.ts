/**
 * @module Management/PersonaManagement/Adapters/PersonaFile
 * @description File I/O adapter for persona JSON files
 */
import fs from 'fs';
import path from 'path';
import { PersonaSchema, type Persona } from '../schemas/persona.schema.js';

export type PersonaLite = { id: string; name: string; role?: string };

function candidateDirs(): string[] {
  return [
    path.resolve(process.cwd(), '.mcp/personas'),
    path.resolve(process.cwd(), '../.mcp/personas'),
    path.resolve(process.cwd(), '../../.mcp/personas'),
  ];
}

export function listPersonas(): PersonaLite[] {
  for (const dir of candidateDirs()) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const personas: PersonaLite[] = [];
      for (const ent of entries) {
        if (ent.isFile() && ent.name.endsWith('.json')) {
          const raw = fs.readFileSync(path.join(dir, ent.name), 'utf8');
          const json = JSON.parse(raw);
          personas.push({
            id: json.persona_id ?? ent.name.replace(/\.json$/, ''),
            name: json.name ?? ent.name,
            role: json.role,
          });
        }
      }
      if (personas.length) return personas;
    } catch (_err) {
      // continue
    }
  }
  return [];
}

export function readPersona(id: string): Persona | null {
  for (const dir of candidateDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, 'utf8');
      const json = JSON.parse(raw);
      const parsed = PersonaSchema.safeParse(json);
      return parsed.success ? parsed.data : null;
    } catch {
      // try next dir
    }
  }
  return null;
}

export function writePersona(id: string, persona: Persona): boolean {
  for (const dir of candidateDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      fs.writeFileSync(file, JSON.stringify(persona, null, 2) + '\\n', 'utf8');
      return true;
    } catch {
      // try next dir
    }
  }
  return false;
}

export function createPersona(id: string, persona: Persona): boolean {
  for (const dir of candidateDirs()) {
    try {
      if (!fs.existsSync(dir)) continue;
      const file = path.join(dir, `${id}.json`);
      if (fs.existsSync(file)) return false; // already exists
      fs.writeFileSync(file, JSON.stringify(persona, null, 2) + '\\n', 'utf8');
      return true;
    } catch {
      // try next dir
    }
  }
  return false;
}

export function deletePersona(id: string): boolean {
  for (const dir of candidateDirs()) {
    const file = path.join(dir, `${id}.json`);
    try {
      if (!fs.existsSync(file)) continue;
      fs.unlinkSync(file);
      return true;
    } catch {
      // try next dir
    }
  }
  return false;
}

