/**
 * @module shared/types
 * @description Cross-cutting backend types. Promotion rule: if ≥3 features use a type, move it here.
 * @publicAPI exports of shared type utilities
 */

export type TraceId = string;

export interface ApiErrorShape {
  error: string;
  message?: string;
}

export interface Pagination {
  limit?: number;
  offset?: number;
}

export type UniqueId = string;


