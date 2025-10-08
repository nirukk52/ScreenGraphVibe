/**
 * @module core/di
 * @description Minimal DI wiring. Inject adapters into services here when composing app.
 */
export interface Container {
  // Add shared singletons here in the future
}

export function createContainer(): Container {
  return {};
}
