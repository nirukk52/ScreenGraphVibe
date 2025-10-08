import Fastify from 'fastify';
import { registerGraphGetByRunRoute } from '../route.js';
import { FakeGraphGetByRunAdapter } from '../adapters/fake.adapter.js';

export async function createGraphGetByRunApp() {
  const app = Fastify({ logger: false });
  await registerGraphGetByRunRoute(app, { port: new FakeGraphGetByRunAdapter() });
  return app;
}

if (require.main === module) {
  (async () => {
    const app = await createGraphGetByRunApp();
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const info = app.server.address();
    if (typeof info === 'object' && info) {
      console.log(`graph-get-by-run exec listening on ${info.address}:${info.port}`);
    } else {
      console.log(`graph-get-by-run exec listening at ${address}`);
    }
  })();
}


