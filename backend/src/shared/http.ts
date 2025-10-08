/**
 * @module shared/http
 * @description HTTP helpers and schema helpers (if needed).
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
} as const;

export function success<T>(data: T, traceId?: string) {
  return { ok: true as const, data, trace_id: traceId };
}

export function failure(
  error: { code: string; error: string; message?: string; type?: string; fallbackRoute?: string },
  traceId?: string,
) {
  return { ok: false as const, error, trace_id: traceId };
}
