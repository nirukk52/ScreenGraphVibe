// Load environment variables
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the agent directory (where the process runs)
config({ path: resolve(process.cwd(), '.env') });

// Export database connection and utilities
export * from './db/index.js';

// Export configuration
export * from './config/constants.js';

// Export types
export * from './types/app-launch-config.js';
