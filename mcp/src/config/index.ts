import fs from 'fs';
import path from 'path';

// A more robust solution would use a validation library like Zod
interface GraphitiConfig {
  url: string;
  groupId: string;
  apiKey?: string;
  timeoutMs: number;
}

interface ServerConfig {
  host: string;
  port: number;
}

interface LoggingConfig {
  level: string;
  file: string;
}

interface McpConfig {
  version: number;
  graphiti: GraphitiConfig;
  server: ServerConfig;
  logging: LoggingConfig;
}

function loadConfig(): McpConfig {
  const configPath = path.resolve(__dirname, 'mcp-config.json');
  try {
    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(rawConfig) as McpConfig;
    // Add validation logic here if necessary
    return config;
  } catch (error) {
    console.error('Failed to load or parse MCP configuration:', error);
    process.exit(1);
  }
}

export const config = loadConfig();
