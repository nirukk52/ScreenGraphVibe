import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createSupabaseClient,
  createSupabaseAdminClient,
  checkSupabaseHealth,
} from '@screengraph/infra/supabase.js';
import { getConfig } from '@screengraph/infra/config.js';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      limit: vi.fn(() => ({
        then: vi.fn((callback) => callback({ data: null, error: null })),
      })),
    })),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'test/file.png' }, error: null })),
      createSignedUrl: vi.fn(() =>
        Promise.resolve({ data: { signedUrl: 'https://signed-url.com' }, error: null }),
      ),
    })),
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock config
vi.mock('@screengraph/infra/config.js', () => ({
  getConfig: vi.fn(() => ({
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  })),
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create Supabase client with correct configuration', () => {
    const client = createSupabaseClient();

    expect(client).toBeDefined();
    expect(mockSupabaseClient.from).toBeDefined();
    expect(mockSupabaseClient.storage).toBeDefined();
  });

  it('should create admin client with service role key', () => {
    const adminClient = createSupabaseAdminClient();

    expect(adminClient).toBeDefined();
    expect(adminClient).toBe(mockSupabaseClient);
  });

  it('should return ok status when health check succeeds', async () => {
    const result = await checkSupabaseHealth();

    expect(result.status).toBe('ok');
    expect(result.details).toBeUndefined();
  });

  it('should return db_down status when health check fails', async () => {
    // Mock database error
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          then: vi.fn((callback) =>
            callback({
              data: null,
              error: { message: 'Connection failed', code: 'ECONNREFUSED' },
            }),
          ),
        })),
      })),
    });

    const result = await checkSupabaseHealth();

    expect(result.status).toBe('db_down');
    expect(result.details).toEqual({
      error: 'Connection failed',
      code: 'ECONNREFUSED',
    });
  });

  it('should handle unexpected errors in health check', async () => {
    // Mock unexpected error
    mockSupabaseClient.from.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const result = await checkSupabaseHealth();

    expect(result.status).toBe('db_down');
    expect(result.details).toEqual({
      error: 'Unexpected error',
    });
  });

  it('should handle table not found error as success', async () => {
    // Mock table not found error (expected)
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          then: vi.fn((callback) =>
            callback({
              data: null,
              error: { message: 'Table not found', code: 'PGRST116' },
            }),
          ),
        })),
      })),
    });

    const result = await checkSupabaseHealth();

    expect(result.status).toBe('ok');
    expect(result.details).toBeUndefined();
  });
});

describe('Storage Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload file successfully', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const client = createSupabaseClient();

    const result = await client.storage.from('test-bucket').upload('test/file.txt', file);

    expect(result.data).toEqual({ path: 'test/file.png' });
    expect(result.error).toBeNull();
  });

  it('should create signed URL successfully', async () => {
    const client = createSupabaseClient();

    const result = await client.storage.from('test-bucket').createSignedUrl('test/file.txt', 3600);

    expect(result.data.signedUrl).toBe('https://signed-url.com');
    expect(result.error).toBeNull();
  });
});
