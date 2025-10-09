/**
 * @module shared/constants
 * @description Single source of truth for backend string literals and enums.
 */
export const ROUTES = {
  HEALTH: '/health',
  STATUS: '/status',
  SCREEN_DETAILS: '/details/:deviceID',
} as const;

export const HEADERS = {
  REQUEST_ID: 'x-request-id',
} as const;

export const TRACE = {
  EXEC_FIXED_TRACE_ID: 'EXEC_FIXED_TRACE_ID',
} as const;

export const SCREEN_STATUS = {
  RECEIVED: 'received',
} as const;
