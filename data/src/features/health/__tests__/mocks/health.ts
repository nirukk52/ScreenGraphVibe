// Local mock for database health used by health feature unit tests

export async function mockCheckDatabaseHealth(
  shouldFail: boolean = false
): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  if (shouldFail) {
    return {
      status: 'unhealthy',
      message: 'Test mode - simulated database connection failure',
    };
  }
  
  return {
    status: 'healthy',
    message: 'Test mode - simulated successful database connection',
  };
}


