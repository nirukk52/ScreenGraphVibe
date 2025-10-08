import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HealthIndicator from '../components/HealthIndicator.js';
import HealthStatus from '../components/HealthStatus.js';
import { apiClient } from '../../../../shared/api.js';

// Mock the API client
vi.mock('../../../../shared/api.js', () => ({
  apiClient: {
    healthCheck: vi.fn(),
  },
}));

describe('HealthIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render health indicator with loading state initially', () => {
    vi.mocked(apiClient.healthCheck).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                status: 'ok',
                message: 'All services operational',
                timestamp: new Date().toISOString(),
                requestId: 'test-123',
                region: 'local',
                environment: 'test',
                services: { database: 'healthy' },
              }),
            100,
          ),
        ),
    );

    render(<HealthIndicator />);

    expect(screen.getByText('Checking...')).toBeInTheDocument();
    expect(screen.getByTestId('health-indicator')).toBeInTheDocument();
  });

  it('should display healthy status when API returns ok', async () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' },
    });

    render(<HealthIndicator />);

    await waitFor(() => {
      expect(screen.getByText('System Healthy')).toBeInTheDocument();
    });
  });

  it('should display unhealthy status when API returns error', async () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'db_down',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'unhealthy' },
    });

    render(<HealthIndicator />);

    await waitFor(() => {
      expect(screen.getByText('System Down')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(apiClient.healthCheck).mockRejectedValue(new Error('Network error'));

    render(<HealthIndicator />);

    await waitFor(() => {
      expect(screen.getByText('System Down')).toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' },
    });

    render(<HealthIndicator className="custom-class" />);

    const indicator = screen.getByTestId('health-indicator');
    expect(indicator).toHaveClass('custom-class');
  });
});

describe('HealthStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render health status with loading state initially', () => {
    vi.mocked(apiClient.healthCheck).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                status: 'ok',
                message: 'All services operational',
                timestamp: new Date().toISOString(),
                requestId: 'test-123',
                region: 'local',
                environment: 'test',
                services: { database: 'healthy' },
              }),
            100,
          ),
        ),
    );

    render(<HealthStatus />);

    expect(screen.getByText('Checking system health...')).toBeInTheDocument();
  });

  it('should display healthy status with green styling', async () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' },
    });

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('All services operational')).toBeInTheDocument();
    });

    // Check for green styling - need to find the outer container
    const statusText = screen.getByText('Healthy');
    const statusContainer = statusText.closest('div.border.rounded-lg');
    expect(statusContainer).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('should display unhealthy status with red styling', async () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'db_down',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'unhealthy' },
    });

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Unhealthy')).toBeInTheDocument();
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    // Check for red styling - need to find the outer container
    const statusText = screen.getByText('Unhealthy');
    const statusContainer = statusText.closest('div.border.rounded-lg');
    expect(statusContainer).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('should display service status indicators', async () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' },
    });

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument();
    });
  });

  it('should display error message when API fails', async () => {
    vi.mocked(apiClient.healthCheck).mockRejectedValue(new Error('Network error'));

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' },
    });

    render(<HealthStatus className="custom-class" />);

    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('All services operational')).toBeInTheDocument();
    });

    const statusContainer = screen.getByText('Healthy').closest('div.border.rounded-lg');
    expect(statusContainer).toHaveClass('custom-class');
  });

  it('should display last checked time', async () => {
    const testTime = new Date('2024-01-01T12:00:00Z');
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: testTime.toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' },
    });

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
    });
  });

  it('should display request ID', async () => {
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: new Date().toISOString(),
      requestId: 'test-request-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' },
    });

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Request ID: test-request-123')).toBeInTheDocument();
    });
  });
});
