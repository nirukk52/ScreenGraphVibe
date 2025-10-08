import { config } from '../config';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, config.graphiti.url).toString();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.graphiti.apiKey) {
    headers['Authorization'] = `Bearer ${config.graphiti.apiKey}`;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.graphiti.timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Graphiti request failed: ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const graphitiClient = {
  get: async <T>(path: string): Promise<T> => request<T>(path, { method: 'GET' }),
  post: async <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
