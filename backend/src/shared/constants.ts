/**
 * @module shared/constants
 * @description Single source of truth for backend string literals and enums.
 */
export const ROUTES = {
  HEALTH: '/health',
  STATUS: '/status',
} as const;

export const HEADERS = {
  REQUEST_ID: 'x-request-id',
} as const;
