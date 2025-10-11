/**
 * @module Management/PersonaManagement/Adapters/PersonaFile/Test
 */
import { describe, it, expect } from 'vitest';
import { listPersonas } from './persona-file.adapter.js';

describe('PersonaFileAdapter', () => {
  it('listPersonas returns array', () => {
    const result = listPersonas();
    expect(Array.isArray(result)).toBe(true);
  });

  it('listPersonas items have id and name', () => {
    const result = listPersonas();
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    }
  });
});

