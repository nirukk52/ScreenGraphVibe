/**
 * @module Management/PersonaManagement/Analytics/RetroEngine
 * @description Analytics utilities for retro: conflict stats, PR split impact, and time-to-complete vs points.
 * @dependencies Node fs/path only. Consumed by tests and tooling.
 * @publicAPI computeConflictStats, computePRSplitImpact, computeTimeVsPoints
 */

import fs from 'fs';
import path from 'path';

export type ConflictStats = {
  totalConflictedFiles: number;
  categories: {
    backend: number;
    ui: number;
    management: number;
    other: number;
  };
};

export type PRSplitImpactInput = {
  issueId: string;
  prSplitDecision: 'one' | 'two';
  timeMinutes: number; // measured total time to complete the parent issue
};

export type PRSplitImpact = {
  averageTimeOne: number | null;
  averageTimeTwo: number | null;
  advantage: 'one' | 'two' | 'neutral';
};

export type TimePointSample = {
  issueId: string;
  points: 1 | 2 | 3 | 5 | 8 | 13;
  timeMinutes: number;
};

export type TimeVsPoints = {
  samples: TimePointSample[];
  averageMinutesPerPoint: number;
};

/**
 * Compute conflict stats from the retro log file (simple heuristic parser).
 */
export function computeConflictStats(retroLogAbsolutePath?: string): ConflictStats {
  const retroPath =
    retroLogAbsolutePath ??
    path.join(process.cwd(), 'management/persona-management/RETRO_LOG.md');

  if (!fs.existsSync(retroPath)) {
    return {
      totalConflictedFiles: 0,
      categories: { backend: 0, ui: 0, management: 0, other: 0 },
    };
  }

  const content = fs.readFileSync(retroPath, 'utf8');
  // Attempt to extract affected files block (``` ... ```)
  const filesBlockMatch = content.match(/### Affected Files[\s\S]*?```([\s\S]*?)```/);
  const filesBlock = filesBlockMatch?.[1] ?? '';
  const files = filesBlock
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('```'));

  let backend = 0;
  let ui = 0;
  let management = 0;
  let other = 0;
  for (const f of files) {
    if (f.startsWith('backend/')) backend += 1;
    else if (f.startsWith('ui/')) ui += 1;
    else if (f.startsWith('management/')) management += 1;
    else other += 1;
  }

  return {
    totalConflictedFiles: files.length,
    categories: { backend, ui, management, other },
  };
}

/**
 * Compute PR split impact based on historical samples captured externally.
 * Caller supplies samples captured from issue analytics.
 */
export function computePRSplitImpact(samples: PRSplitImpactInput[]): PRSplitImpact {
  const ones = samples.filter((s) => s.prSplitDecision === 'one').map((s) => s.timeMinutes);
  const twos = samples.filter((s) => s.prSplitDecision === 'two').map((s) => s.timeMinutes);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const averageTimeOne = avg(ones);
  const averageTimeTwo = avg(twos);

  let advantage: 'one' | 'two' | 'neutral' = 'neutral';
  if (averageTimeOne !== null && averageTimeTwo !== null) {
    if (averageTimeOne < averageTimeTwo) advantage = 'one';
    else if (averageTimeTwo < averageTimeOne) advantage = 'two';
  }

  return { averageTimeOne, averageTimeTwo, advantage };
}

/**
 * Compute time vs points regression-like simple ratio for dashboard.
 */
export function computeTimeVsPoints(samples: TimePointSample[]): TimeVsPoints {
  const totalPoints = samples.reduce((sum, s) => sum + s.points, 0);
  const totalMinutes = samples.reduce((sum, s) => sum + s.timeMinutes, 0);
  const averageMinutesPerPoint = totalPoints > 0 ? totalMinutes / totalPoints : 0;
  return { samples, averageMinutesPerPoint };
}


