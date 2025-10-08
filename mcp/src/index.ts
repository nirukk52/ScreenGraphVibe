import Fastify from 'fastify';
import { config } from './config';
import { graphitiClient } from './graphiti/client';

const server = Fastify({
  logger: {
    level: config.logging.level,
    ...(config.logging.file && { file: config.logging.file }),
  },
});

server.get('/healthz', async () => {
  return { ok: true, graphiti: config.graphiti.url };
});

server.get('/', async () => {
  return { status: 'ok' };
});

server.post('/proxy', async (request, reply) => {
  const body = request.body as any;
  const path = typeof body?.path === 'string' ? body.path : '/';
  const method = (body?.method || 'POST').toUpperCase();
  const payload = body?.body ?? {};

  try {
    let result: unknown;
    if (method === 'GET') {
      result = await graphitiClient.get(path);
    } else {
      result = await graphitiClient.post(path, payload);
    }
    return { success: true, result };
  } catch (error: any) {
    request.log.error({ err: error }, 'Proxy call failed');
    reply.code(502);
    return { success: false, error: error?.message ?? 'Proxy error' };
  }
});

const start = async () => {
  try {
    await server.listen({ port: config.server.port, host: config.server.host });
    console.log(`MCP server listening on http://${config.server.host}:${config.server.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
