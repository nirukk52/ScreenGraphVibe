/**
 * @module shared/constants
 * @description Single source of truth for backend string literals and enums.
 */
export const ROUTES = {
  HEALTH: '/health',
  STATUS: '/status',
  SCREEN_DETAILS: '/details/:deviceID',
  SCREEN_DETAILS_STREAM: '/details/:deviceID/stream',
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

export const SCREEN_EVENTS = {
  DETAILS_RECEIVED: 'screen.details.received',
} as const;
