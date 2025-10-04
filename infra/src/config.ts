import { z } from 'zod';

// Environment schema with validation
export const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  POSTGRES_URL: z.string().url('Invalid POSTGRES_URL'),
  SUPABASE_URL: z.string().url('Invalid SUPABASE_URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY required'),
  
  // Redis
  REDIS_URL: z.string().url('Invalid REDIS_URL'),
  
  // Agent
  AGENT_PORT: z.coerce.number().min(1).max(65535).default(3000),
  AGENT_HOST: z.string().default('0.0.0.0'),
  
  // UI
  NEXT_PUBLIC_AGENT_URL: z.string().url('Invalid NEXT_PUBLIC_AGENT_URL'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Fly.io
  FLY_REGION: z.string().optional(),
  FLY_APP_NAME: z.string().default('screengraph'),
  
  // Storage
  STORAGE_BUCKET: z.string().default('screengraph-assets'),
});

export type Environment = z.infer<typeof envSchema>;

// Global config instance
let config: Environment | null = null;

export function getConfig(): Environment {
  if (!config) {
    // Load .env files in order of priority
    require('dotenv').config({ path: '.env.local' });
    require('dotenv').config({ path: '.env' });
    
    try {
      config = envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        console.error('❌ Environment validation failed:');
        console.error(missingVars.join('\n'));
        console.error('\n📝 Create .env.local with required variables (see README.md)');
        process.exit(1);
      }
      throw error;
    }
  }
  return config;
}

// Fly.io regions configuration - Focus on US + India
export const flyRegions = [
  'iad', // US East (Virginia) - Primary
  'dfw', // US Central (Texas) - Secondary US
  'bom', // Asia Pacific (Mumbai) - India
] as const;

export type FlyRegion = typeof flyRegions[number];

// Health check configuration
export const healthConfig = {
  timeout: 5000,
  retries: 3,
  checkInterval: 30000,
} as const;
