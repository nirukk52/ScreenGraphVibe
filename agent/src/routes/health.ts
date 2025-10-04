import { FastifyInstance } from 'fastify';
import { HealthCheckResponse } from '../types/index.js';
import { randomUUID } from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database health check function
async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  try {
    // Get database URL from environment
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      return { 
        status: 'unhealthy', 
        message: 'Database URL not configured' 
      };
    }

    // Create temporary connection for health check
    const connection = postgres(postgresUrl, { max: 1 });
    const db = drizzle(connection);
    
    // Simple query to check database connectivity
    await db.execute(sql`SELECT 1 as health_check`);
    
    // Close the connection
    await connection.end();
    
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get('/healthz', async (request, reply) => {
    try {
      // Check database health
      const dbHealth = await checkDatabaseHealth();
      const requestId = randomUUID();
      
      const response: HealthCheckResponse = {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        message: dbHealth.status === 'healthy' ? 'All services operational' : dbHealth.message,
        timestamp: new Date().toISOString(),
        requestId,
        services: {
          database: dbHealth.status,
        },
      };

      // Set cache control headers to prevent caching
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');

      // Return appropriate HTTP status
      if (response.status === 'healthy') {
        return reply.code(200).send(response);
      } else {
        return reply.code(503).send(response);
      }
    } catch (error) {
      const requestId = randomUUID();
      const response: HealthCheckResponse = {
        status: 'unhealthy',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        requestId,
        services: {
          database: 'unhealthy',
        },
      };
      
      // Set cache control headers
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
      
      return reply.code(503).send(response);
    }
  });
}
