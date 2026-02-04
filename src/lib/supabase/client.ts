import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Validate Supabase credentials
const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    if (typeof window !== 'undefined') {
      console.warn('NEXT_PUBLIC_SUPABASE_URL is not set. Supabase features will be disabled.');
    }
    return '';
  }
  // Validate URL format
  try {
    new URL(url);
    return url;
  } catch {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is invalid. Supabase features will be disabled.');
    return '';
  }
};

const getSupabaseAnonKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    if (typeof window !== 'undefined') {
      console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase features will be disabled.');
    }
    return '';
  }
  return key;
};

// Track if Supabase has been initialized
let supabaseInitialized = false;

export function createClient(): SupabaseClient {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  // Check if credentials are valid
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a no-op client that won't crash
    return createNoOpClient();
  }

  // Check if this is a placeholder value
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
    console.warn('Supabase is using placeholder credentials. Please configure your environment variables.');
    return createNoOpClient();
  }

  try {
    supabaseInitialized = true;
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return createNoOpClient();
  }
}

// Create a no-op client that mimics Supabase interface but does nothing
function createNoOpClient(): SupabaseClient {
  // Create a properly typed no-op client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      updateUser: async () => ({ error: { message: 'Supabase not configured' } }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (_table: string): any => ({
      select: (): any => ({
        eq: (_column: string, _value?: unknown): any => ({
          single: async () => ({ data: null, error: null }),
          order: async () => ({ data: [], error: null }),
          gt: (_column: string, _value?: unknown): any => ({
            lt: (_column: string, _value?: unknown): any => ({ data: [], error: null }),
            gte: (_column: string, _value?: unknown): any => ({ data: [], error: null }),
          }),
          in: (_column: string, _values: unknown[]): any => ({
            eq: (_column: string, _value?: unknown): any => ({
              single: async () => ({ data: null, error: null }),
              order: async () => ({ data: [], error: null }),
            }),
          }),
        }),
        order: async () => ({ data: [], error: null }),
      }),
      insert: async () => ({ error: { message: 'Supabase not configured' } }),
      update: async () => ({ error: { message: 'Supabase not configured' } }),
      delete: async () => ({ error: { message: 'Supabase not configured' } }),
    }),
  } as unknown as SupabaseClient;
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
    return false;
  }
  
  return true;
}

