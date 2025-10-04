import { createClient } from '@supabase/supabase-js';
import { getConfig } from './config.js';

// Supabase client with health check
export function createSupabaseClient() {
  const config = getConfig();
  
  const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return supabase;
}

// Service role client for admin operations
export function createSupabaseAdminClient() {
  const config = getConfig();
  
  const adminSupabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return adminSupabase;
}

// Health check function
export async function checkSupabaseHealth(): Promise<{ status: string; details?: any }> {
  try {
    const supabase = createSupabaseClient();
    
    // Simple query to check connectivity
    const { data, error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected)
      return { 
        status: 'db_down', 
        details: { error: error.message, code: error.code } 
      };
    }
    
    return { status: 'ok' };
  } catch (error) {
    return { 
      status: 'db_down', 
      details: { error: error instanceof Error ? error.message : String(error) } 
    };
  }
}

// Storage operations
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: { upsert?: boolean; contentType?: string }
) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: options?.contentType,
    });

  if (error) throw error;
  return data;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}
