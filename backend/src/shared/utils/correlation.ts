/**
 * @module shared/utils/correlation
 * @description Correlation utilities for request/trace IDs.
 */
export function getRequestId(headers: Record<string, unknown>, fallback: string): string {
  const rid = headers['x-request-id'];
  return typeof rid === 'string' && rid.length > 0 ? rid : fallback;
}
