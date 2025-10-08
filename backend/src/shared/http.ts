/**
 * @module shared/http
 * @description HTTP helpers and schema helpers (if needed).
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
} as const;


