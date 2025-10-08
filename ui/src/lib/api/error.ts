import type { ApiErrorShape, ApiErrorCode } from './types';

export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 400) return 'BAD_REQUEST';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'UNPROCESSABLE';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'INTERNAL';
  return 'UNKNOWN';
}

export function fallbackRouteFor(code: ApiErrorCode): string | undefined {
  if (code === 'UNAUTHORIZED') return '/login';
  if (code === 'NOT_FOUND') return '/404';
  if (code === 'FORBIDDEN') return '/403';
  if (code === 'INTERNAL') return '/error';
  return undefined;
}

export function buildApiError(
  status: number,
  body?: any,
  networkMessage?: string,
): ApiErrorShape {
  const code = codeFromStatus(status);
  const fallbackRoute = fallbackRouteFor(code);
  if (body && typeof body === 'object') {
    if (body.ok === false && body.error) {
      return {
        code: (body.error.code as ApiErrorCode) ?? code,
        error: String(body.error.error ?? 'Error'),
        message: body.error.message,
        type: body.error.type,
        fallbackRoute: body.error.fallbackRoute ?? fallbackRoute,
      };
    }
    if (body.error || body.message) {
      return {
        code,
        error: String(body.error ?? 'Error'),
        message: String(body.message ?? ''),
        fallbackRoute,
      };
    }
  }
  return {
    code,
    error: networkMessage ?? 'Request failed',
    fallbackRoute,
  };
}


