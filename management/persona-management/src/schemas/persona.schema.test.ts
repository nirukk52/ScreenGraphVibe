/**
 * @module Management/PersonaManagement/Schemas/Test
 */
import { describe, it, expect } from 'vitest';
import { PersonaSchema } from './persona.schema.js';

describe('PersonaSchema', () => {
  it('validates a valid persona', () => {
    const valid = {
      persona_id: 'test_persona',
      name: 'Test Persona',
      role: 'Tester',
      graphiti_protocol: {
        before_task: {
          graph_id: 'screengraph-vibe',
          role_node: 'Test',
          fetch_last: 10,
          where: 'tags',
          detect: ['conflicts'],
          on_failure: 'fail',
        },
        after_task: { action: 'noop' },
      },
    };
    const result = PersonaSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects persona with missing persona_id', () => {
    const invalid = {
      name: 'Test',
      role: 'Tester',
    };
    const result = PersonaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects persona with empty name', () => {
    const invalid = {
      persona_id: 'test',
      name: '',
      role: 'Tester',
      graphiti_protocol: {
        before_task: {
          graph_id: 'screengraph-vibe',
          role_node: 'Test',
          fetch_last: 10,
          where: 'tags',
          detect: [],
          on_failure: 'fail',
        },
        after_task: { action: 'noop' },
      },
    };
    const result = PersonaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

