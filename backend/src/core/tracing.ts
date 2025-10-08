/**
 * @module core/tracing
 * @description Helpers for tracing spans. Integrate with OpenTelemetry SDK in infra.
 */
export function withSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return fn();
}


