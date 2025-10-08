import Fastify from 'fastify';
import { registerAppLaunchConfigListRoute } from '../route.js';
import { FakeAppLaunchConfigListAdapter } from '../adapters/fake.adapter.js';

export async function createAppLaunchConfigListApp() {
  const app = Fastify({ logger: false });
  await registerAppLaunchConfigListRoute(app, { port: new FakeAppLaunchConfigListAdapter() });
  return app;
}

if (require.main === module) {
  (async () => {
    const app = await createAppLaunchConfigListApp();
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const info = app.server.address();
    if (typeof info === 'object' && info) {
      console.log(`app-launch-config list exec listening on ${info.address}:${info.port}`);
    } else {
      console.log(`app-launch-config list exec listening at ${address}`);
    }
  })();
}


