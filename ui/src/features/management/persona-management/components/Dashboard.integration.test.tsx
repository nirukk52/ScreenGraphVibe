/**
 * @module Dashboard.integration.test
 * @description Integration tests for full dashboard flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock fetch globally
global.fetch = vi.fn();

describe('Dashboard Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should load and render all panels with persona data', async () => {
    // Arrange
    const mockPersonas = [
      {
        persona_id: 'ian_botts_cto',
        name: 'Ian Botts — CTO',
        role: 'CTO (Graphiti-First)',
        version: '1.0.0',
        created_at: '2025-10-09',
        summary: 'Test CTO',
        graphiti_protocol: {
          before_task: {
            graph_id: 'screengraph-vibe',
            role_node: 'Ian Botts (CTO)',
            fetch_last: 10,
            where: 'tags in [ADR,strategy]',
            detect: ['conflicts'],
            on_failure: 'Graphiti step failed: BEFORE_TASK',
          },
          after_task: {
            write: 'episode using Deterministic ADR Spec',
            tags: ['ADR'],
            edges: [],
            emit_receipt_line: 'Graphiti: recorded episode',
            on_failure: 'Graphiti step failed: AFTER_TASK',
          },
        },
        workflow_expectations: {
          before_starting: ['Run sequential-thinking MCP'],
          after_completion: ['Track time-to-complete'],
        },
        module_ownership: [':backend', ':data'],
      },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPersonas,
    });

    // Act
    render(<Dashboard />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Persona Management Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Persona List/i)).toBeInTheDocument();
      expect(screen.getByText(/Thinking Patterns/i)).toBeInTheDocument();
      expect(screen.getByText(/Facts & Assumptions/i)).toBeInTheDocument();
      expect(screen.getByText(/Module Ownership/i)).toBeInTheDocument();
      expect(screen.getByText(/CODEOWNERS/i)).toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    // Arrange
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Act
    render(<Dashboard />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Error loading personas/i)).toBeInTheDocument();
    });
  });

  it('should validate all panels render with correct structure', async () => {
    // Arrange
    const mockPersonas = [
      {
        persona_id: 'test_persona',
        name: 'Test Persona',
        role: 'Tester',
        version: '1.0.0',
        created_at: '2025-10-11',
        summary: 'Test',
        graphiti_protocol: {
          before_task: {
            graph_id: 'screengraph-vibe',
            role_node: 'Test',
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
          before_starting: ['sequential-thinking'],
          after_completion: ['performance tracking'],
        },
      },
    ];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPersonas,
    });

    // Act
    render(<Dashboard />);

    // Assert: All panels should be present
    await waitFor(() => {
      const panels = [
        /Persona List/i,
        /Thinking Patterns/i,
        /Facts & Assumptions/i,
        /Module Ownership/i,
        /CODEOWNERS/i,
      ];

      for (const panelTitle of panels) {
        expect(screen.getByText(panelTitle)).toBeInTheDocument();
      }
    });
  });
});

