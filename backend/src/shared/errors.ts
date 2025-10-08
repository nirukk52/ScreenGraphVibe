/**
 * @module shared/errors
 * @description Base typed errors and helpers for backend features.
 */
export class BackendError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code);
  }
}


