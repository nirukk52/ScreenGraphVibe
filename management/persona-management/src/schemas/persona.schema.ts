/**
 * @module Management/PersonaManagement/Schemas
 * @description Zod schemas for persona validation
 */
import { z } from 'zod';

export const PersonaSchema = z.object({
  persona_id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  version: z.string().optional(),
  created_at: z.string().optional(),
  summary: z.string().optional(),
  graphiti_protocol: z.object({
    before_task: z.object({
      graph_id: z.string(),
      role_node: z.string(),
      fetch_last: z.number(),
      where: z.string(),
      detect: z.array(z.string()),
      on_failure: z.string(),
    }),
    after_task: z.object({
      action: z.string(),
    }).or(z.object({
      write: z.string().optional(),
      tags: z.array(z.string()).optional(),
      edges: z.array(z.any()).optional(),
      emit_receipt_line: z.string().optional(),
      on_failure: z.string().optional(),
    })),
  }),
  workflow_expectations: z.object({
    before_starting: z.array(z.string()).min(1),
    after_completion: z.array(z.string()).min(1),
  }).optional(),
});

export type Persona = z.infer<typeof PersonaSchema>;

