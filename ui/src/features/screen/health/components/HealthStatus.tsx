'use client';

import { useState, useEffect } from 'react';
import type { HealthStatus } from '../../../../shared/types';
import { apiClient } from '../../../../shared/api';

interface HealthStatusProps {
  className?: string;
}

export default function HealthStatus({ className = '' }: HealthStatusProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    
    try {
      setError(null);
      
      const response = await apiClient.healthCheck();
      
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
      setError(err instanceof Error ? err.message : 'Connection failed');
      setHealthStatus({
        isHealthy: false,
        message: 'Agent unavailable',
        lastChecked: new Date().toISOString(),
        requestId: 'error',
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

  if (loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Checking system health...</span>
        </div>
      </div>
    );
  }

  const isHealthy = healthStatus?.isHealthy ?? false;
  const statusColor = isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const iconColor = isHealthy ? 'text-green-500' : 'text-red-500';
  const statusText = isHealthy ? 'Healthy' : 'Unhealthy';

  return (
    <div className={`border rounded-lg p-4 ${statusColor} ${className}`} data-testid="health-status">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <div>
            <h3 className={`text-sm font-medium ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
              {statusText}
            </h3>
            <p className={`text-xs ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {healthStatus?.message || 'Unknown status'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500" data-testid="health-last-checked">
            Last checked: {healthStatus?.lastChecked ? new Date(healthStatus.lastChecked).toLocaleTimeString() : 'Never'}
          </div>
          <div className="text-xs text-gray-400">
            Request ID: {healthStatus?.requestId || 'N/A'}
          </div>
          <button
            onClick={() => checkHealth(true)}
            disabled={loading}
            data-testid="health-refresh-button"
            className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            aria-busy={loading}
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
          Error: {error}
        </div>
      )}
      
      <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${healthStatus?.services.database ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-600">Database</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${healthStatus?.services.redis ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-600">Redis</span>
        </div>
      </div>
    </div>
  );
}
