import { HealthCheckResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${this.baseUrl}/healthz`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAgentStatus(): Promise<{ message: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/`);
    
    if (!response.ok) {
      throw new Error(`Agent status check failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
