import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { healthRoutes } from './routes/health.js';
import { AGENT_CONFIG, API_ENDPOINTS } from './config/constants.js';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  },
});

// Register plugins
await fastify.register(cors, {
  origin: ['http://localhost:3001'], // UI will run on 3001
  credentials: true,
});

await fastify.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'ScreenGraph Agent API',
      description: 'AI-driven crawling and verification system',
      version: '0.1.0',
    },
    servers: [
      {
        url: `http://${AGENT_CONFIG.HOST}:${AGENT_CONFIG.PORT}`,
        description: 'Development server',
      },
    ],
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Register routes
await fastify.register(healthRoutes);

// Health check for the agent itself
fastify.get('/', async (request, reply) => {
  return { 
    message: 'ScreenGraph Agent API', 
    version: '0.1.0',
    endpoints: {
      health: API_ENDPOINTS.HEALTH_CHECK,
      docs: '/docs',
    },
  };
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  try {
    await fastify.close();
    console.log('✅ Agent server closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    await fastify.listen({ 
      port: AGENT_CONFIG.PORT, 
      host: AGENT_CONFIG.HOST 
    });
    console.log(`🚀 Agent server running at http://${AGENT_CONFIG.HOST}:${AGENT_CONFIG.PORT}`);
    console.log(`📚 API docs available at http://${AGENT_CONFIG.HOST}:${AGENT_CONFIG.PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
