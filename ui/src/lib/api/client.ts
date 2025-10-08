import type { ApiResponse } from './types';
import { buildApiError } from './error';

const BASE_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3000';

async function parseJson(res: Response) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : undefined; } catch { return text; }
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, method: 'GET' });
    const body = await parseJson(res);
    if (res.ok) {
      if (body && body.ok === true && 'data' in body) return body as ApiResponse<T>;
      return { ok: true, data: body as T };
    }
    return { ok: false, error: buildApiError(res.status, body) };
  } catch (e: any) {
    return { ok: false, error: buildApiError(0, undefined, e?.message) };
  }
}

export async function postJson<T>(path: string, data?: any, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...init,
    });
    const body = await parseJson(res);
    if (res.ok) {
      if (body && body.ok === true && 'data' in body) return body as ApiResponse<T>;
      return { ok: true, data: body as T };
    }
    return { ok: false, error: buildApiError(res.status, body) };
  } catch (e: any) {
    return { ok: false, error: buildApiError(0, undefined, e?.message) };
  }
}


