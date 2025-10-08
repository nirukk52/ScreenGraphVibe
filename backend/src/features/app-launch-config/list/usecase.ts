import type { AppLaunchConfigListPort } from './port.js';

export function makeListAppLaunchConfigsUseCase(deps: { port: AppLaunchConfigListPort }) {
  return async function execute() {
    return deps.port.list();
  };
}


