'use client';

import { useState, useEffect } from 'react';
import type { HealthStatus } from '../types';
import { apiClient } from '../lib/api';

interface HealthStatusProps {
  className?: string;
}

export default function HealthStatus({ className = '' }: HealthStatusProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async (setLoadingState = true) => {
    try {
      if (setLoadingState) {
        setLoading(true);
      }
      setError(null);
      
          // Add a small delay to ensure loading state is visible for testing
      const [response] = await Promise.all([
        apiClient.healthCheck(),
        new Promise(resolve => setTimeout(resolve, 100))
      ]);
      
      setHealthStatus({
        isHealthy: response.status === 'ok',
        message: response.message,
        lastChecked: new Date().toISOString(),
        requestId: response.requestId,
        services: {
          database: response.services.database === 'healthy',
          redis: response.services.redis === 'healthy',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setHealthStatus({
        isHealthy: false,
        message: 'Failed to connect to agent',
        lastChecked: new Date().toISOString(),
        services: {
          database: false,
          redis: false,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthStatus) {
    return (
      <div 
        data-testid="health-status"
        data-state="loading"
        className={`p-4 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center space-x-3">
          <div 
            data-testid="health-indicator"
            className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Checking health...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-testid="health-status"
      data-state={error ? 'error' : (healthStatus?.isHealthy ? 'healthy' : 'unhealthy')}
      data-request-id={healthStatus?.requestId}
      className={`p-4 rounded-lg border ${
        healthStatus?.isHealthy 
          ? 'border-success-200 bg-success-50' 
          : 'border-danger-200 bg-danger-50'
      } ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            data-testid="health-indicator"
            className={`w-3 h-3 rounded-full ${
              healthStatus?.isHealthy ? 'bg-success-500' : 'bg-danger-500'
            }`}></div>
          <div>
            <p 
              data-testid="health-status-text"
              className={`font-medium ${
                healthStatus?.isHealthy ? 'text-success-700' : 'text-danger-700'
              }`}>
              {healthStatus?.isHealthy ? 'System Healthy' : 'System Unhealthy'}
            </p>
            <p 
              data-testid="health-message"
              className="text-sm text-gray-600">
              {healthStatus?.message}
            </p>
          </div>
        </div>
        <button
          data-testid="health-refresh-button"
          onClick={() => {
            setLoading(true);
            checkHealth(false);
          }}
          disabled={loading}
          aria-busy={loading}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div 
          data-testid="health-error"
          className="mt-2 p-2 bg-danger-100 border border-danger-200 rounded text-sm text-danger-700">
          {error}
        </div>
      )}
      
      <div 
        data-testid="health-last-checked"
        className="mt-3 text-xs text-gray-500">
        Last checked: {healthStatus?.lastChecked ? new Date(healthStatus.lastChecked).toLocaleString() : 'Never'}
      </div>
    </div>
  );
}
