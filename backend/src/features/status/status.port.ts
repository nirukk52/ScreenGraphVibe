/**
 * @module features/status/port
 * @description Example port interface for external status dependencies (if any).
 */
export interface ClockPort {
  nowIso(): string;
}
