'use client';

import { useState, useEffect } from 'react';
import type { HealthStatus } from '../../../../shared/types';
import { apiClient } from '../../../../shared/api';

interface HealthIndicatorProps {
  className?: string;
}

export default function HealthIndicator({ className = '' }: HealthIndicatorProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
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

  const getStatusColor = () => {
    if (loading) return 'bg-gray-400';
    if (error || !healthStatus?.isHealthy) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    if (error || !healthStatus?.isHealthy) return 'System Down';
    return 'System Healthy';
  };

  return (
    <div 
      data-testid="health-indicator"
      className={`flex items-center space-x-2 ${className}`}
      title={healthStatus?.message || 'Health status'}
    >
      <div 
        className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}
        aria-label={`Health status: ${getStatusText()}`}
      />
      <span className="text-sm text-gray-600 hidden sm:inline">
        {getStatusText()}
      </span>
    </div>
  );
}
