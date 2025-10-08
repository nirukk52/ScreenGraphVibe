import Fastify from 'fastify';
import { registerHealthCheckRoute } from '../route.js';
import { FakeHealthCheckAdapter } from '../adapters/fake.adapter.js';

export async function createHealthCheckApp() {
  const app = Fastify({ logger: false });
  await registerHealthCheckRoute(app, { port: new FakeHealthCheckAdapter() });
  return app;
}

if (require.main === module) {
  (async () => {
    const app = await createHealthCheckApp();
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const info = app.server.address();
    if (typeof info === 'object' && info) {
      console.log(`health-check exec listening on ${info.address}:${info.port}`);
    } else {
      console.log(`health-check exec listening at ${address}`);
    }
  })();
}


