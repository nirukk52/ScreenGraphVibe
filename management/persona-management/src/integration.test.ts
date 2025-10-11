/**
 * @module integration.test
 * @description Integration tests for full persona management flow
 */

import { describe, it, expect } from 'vitest';
import { PersonaSchema } from './schemas/persona.schema.js';
import { listPersonas, readPersona } from './adapters/persona-file.adapter.js';

describe('Persona Management Integration', () => {
  it('should read, validate, and re-serialize persona files correctly', () => {
    // Arrange
    const personaList = listPersonas();
    
    // Act & Assert
    expect(personaList.length).toBeGreaterThan(0);
    
    for (const lite of personaList) {
      const persona = readPersona(lite.id);
      expect(persona).not.toBeNull();
      
      if (persona) {
        // Validate schema
        const result = PersonaSchema.safeParse(persona);
        expect(result.success).toBe(true);
        
        // Ensure required fields
        expect(persona.persona_id).toBeDefined();
        expect(persona.name).toBeDefined();
        expect(persona.role).toBeDefined();
        expect(persona.graphiti_protocol).toBeDefined();
        expect(persona.graphiti_protocol.before_task.graph_id).toBe('screengraph-vibe');
      }
    }
  });

  it('should update a persona and validate changes', () => {
    // Arrange
    const personaList = listPersonas();
    const testId = personaList[0].id;
    const testPersona = readPersona(testId);
    expect(testPersona).not.toBeNull();
    
    if (testPersona) {
      // Act
      const updated = {
        ...testPersona,
        version: '1.0.1',
      };
      
      // Note: We're not actually saving to avoid modifying git-tracked files
      // This validates the serialization process
      const validated = PersonaSchema.parse(updated);
      
      // Assert
      expect(validated.version).toBe('1.0.1');
      expect(validated.persona_id).toBe(testPersona.persona_id);
    }
  });

  it('should validate module ownership structure', () => {
    // Arrange
    const personaList = listPersonas();
    
    // Act & Assert
    for (const lite of personaList) {
      const persona = readPersona(lite.id);
      if (persona?.module_ownership) {
        expect(Array.isArray(persona.module_ownership)).toBe(true);
        
        for (const module of persona.module_ownership) {
          expect(module).toMatch(/^:(data|backend|ui|screengraph-agent|tests|infra|logging|docs|management)$/);
        }
      }
    }
  });

  it('should validate workflow expectations have required fields', () => {
    // Arrange
    const personaList = listPersonas();
    
    // Act & Assert
    for (const lite of personaList) {
      const persona = readPersona(lite.id);
      expect(persona).not.toBeNull();
      
      if (persona) {
        expect(persona.workflow_expectations).toBeDefined();
        expect(persona.workflow_expectations.before_starting).toBeDefined();
        expect(persona.workflow_expectations.after_completion).toBeDefined();
        
        // Check for sequential thinking requirement
        const beforeSteps = persona.workflow_expectations.before_starting;
        const hasSequentialThinking = beforeSteps.some(
          step => typeof step === 'string' && step.includes('sequential-thinking')
        );
        expect(hasSequentialThinking).toBe(true);
        
        // Check for performance tracking
        const afterSteps = persona.workflow_expectations.after_completion;
        const hasPerformanceTracking = afterSteps.some(
          step => typeof step === 'string' && (
            step.includes('time-to-complete') || 
            step.includes('performance')
          )
        );
        expect(hasPerformanceTracking).toBe(true);
      }
    }
  });

  it('should detect missing required fields in persona workflow', () => {
    // Arrange
    const invalidPersona = {
      persona_id: 'test_invalid',
      name: 'Test Invalid',
      role: 'Tester',
      version: '1.0.0',
      created_at: '2025-10-11',
      summary: 'Test',
      graphiti_protocol: {
        before_task: {
          graph_id: 'screengraph-vibe',
          role_node: 'Tester',
          fetch_last: 10,
          where: 'test',
          detect: [],
          on_failure: 'fail',
        },
        after_task: {
          write: 'episode',
          tags: [],
          edges: [],
          emit_receipt_line: 'test',
          on_failure: 'fail',
        },
      },
      workflow_expectations: {
        // Missing before_starting
        // Missing after_completion
      },
    };
    
    // Act
    const result = PersonaSchema.safeParse(invalidPersona);
    
    // Assert
    expect(result.success).toBe(false);
  });
});

