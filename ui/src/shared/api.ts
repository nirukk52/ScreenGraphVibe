import type { HealthCheckResponse, GraphResponse, Run } from './types.js';

const API_BASE_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${this.baseUrl}/healthz`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getGraph(runId: string): Promise<GraphResponse> {
    const response = await fetch(`${this.baseUrl}/graph/${runId}`);
    if (!response.ok) {
      throw new Error(`Failed to get graph: ${response.statusText}`);
    }
    return response.json();
  }

  async getRuns(): Promise<{ runs: Run[] }> {
    const response = await fetch(`${this.baseUrl}/runs`);
    if (!response.ok) {
      throw new Error(`Failed to get runs: ${response.statusText}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
