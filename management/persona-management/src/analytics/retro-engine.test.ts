/**
 * @module RetroEngine.test
 */
import { describe, it, expect } from 'vitest';
import { computeConflictStats, computePRSplitImpact, computeTimeVsPoints } from './retro-engine.js';
import path from 'path';

describe('Retro Engine Analytics', () => {
  it('computes conflict stats from retro log', () => {
    const p = path.join(process.cwd(), 'management/persona-management/RETRO_LOG.md');
    const stats = computeConflictStats(p);
    expect(stats.totalConflictedFiles).toBeGreaterThanOrEqual(0);
    expect(stats.categories).toHaveProperty('backend');
    expect(stats.categories).toHaveProperty('ui');
  });

  it('computes PR split impact averages and advantage', () => {
    const result = computePRSplitImpact([
      { issueId: 'M4-44', prSplitDecision: 'one', timeMinutes: 120 },
      { issueId: 'M4-45', prSplitDecision: 'two', timeMinutes: 150 },
      { issueId: 'M4-46', prSplitDecision: 'one', timeMinutes: 90 },
    ]);
    expect(result.averageTimeOne).toBeGreaterThan(0);
    expect(['one', 'two', 'neutral']).toContain(result.advantage);
  });

  it('computes average minutes per point', () => {
    const result = computeTimeVsPoints([
      { issueId: 'M4-44', points: 3, timeMinutes: 180 },
      { issueId: 'M4-45', points: 5, timeMinutes: 260 },
    ]);
    expect(result.averageMinutesPerPoint).toBeGreaterThan(0);
  });
});


