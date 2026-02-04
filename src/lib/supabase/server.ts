import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

type CookieOptions = {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

// Validate Supabase credentials
const validateCredentials = (): { valid: boolean; url: string; key: string } => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return { valid: false, url: '', key: '' };
  }
  
  // Check for placeholder values
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
    return { valid: false, url: '', key: '' };
  }
  
  // Validate URL format
  try {
    new URL(supabaseUrl);
    return { valid: true, url: supabaseUrl, key: supabaseAnonKey };
  } catch {
    return { valid: false, url: '', key: '' };
  }
};

// Create a no-op server client
function createNoOpServerClient(): SupabaseClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (_table: string): any => ({
      select: (): any => ({
        eq: (_column: string, _value?: unknown): any => ({
          single: async () => ({ data: null, error: null }),
          order: async () => ({ data: [], error: null }),
        }),
        in: (_column: string, _values: unknown[]): any => ({
          eq: (_column: string, _value?: unknown): any => ({
            single: async () => ({ data: null, error: null }),
            order: async () => ({ data: [], error: null }),
            gt: (_column: string, _value?: unknown): any => ({
              lt: (_column: string, _value?: unknown): any => ({ data: [], error: null }),
              gte: (_column: string, _value?: unknown): any => ({ data: [], error: null }),
            }),
          }),
        }),
        order: async () => ({ data: [], error: null }),
      }),
      insert: async () => ({ error: { message: 'Supabase not configured' } }),
      update: async () => ({ error: { message: 'Supabase not configured' } }),
      delete: async () => ({ error: { message: 'Supabase not configured' } }),
      upsert: async () => ({ error: { message: 'Supabase not configured' } }),
    }),
  } as unknown as SupabaseClient;
}

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const { valid, url, key } = validateCredentials();

  if (!valid) {
    console.warn('Supabase environment variables not configured. Using no-op client.');
    return createNoOpServerClient();
  }

  try {
    return createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    return createNoOpServerClient();
  }
}

// Export helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const { valid } = validateCredentials();
  return valid;
}

