import 'reflect-metadata';
import { Container } from 'typedi';

// Tokens from features (handlers can import tokens only from their feature port files)
export const TOKENS = {
  // Provided as example; real registrations can be done in bootstrap
};

export function registerDefaultAdapters() {
  // No-op placeholder to demonstrate DI hook point
  // In main server, register concrete adapters here, e.g.:
  // Container.set(TOKENS.HealthCheckPort, new HealthAdapter());
}

export { Container };


