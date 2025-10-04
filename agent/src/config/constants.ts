export const AGENT_CONFIG = {
  PORT: process.env.AGENT_PORT || 3000,
  HOST: process.env.AGENT_HOST || 'localhost',
  API_PREFIX: '/api/v1',
} as const;

export const API_ENDPOINTS = {
  HEALTH_CHECK: '/healthz',
  CRAWL: '/crawl',
  STATUS: '/status',
  GRAPH: '/graph',
} as const;

export const QUEUE_CONFIG = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  QUEUE_NAME: 'screengraph-crawls',
} as const;
