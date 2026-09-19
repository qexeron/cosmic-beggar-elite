import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function sanitizeUrl(raw?: string): string {
  const fallback = 'https://svvmoqgtygkcgjbbrteh.supabase.co';
  if (!raw || typeof raw !== 'string') return fallback;
  const match = raw.match(/https:\/\/[a-zA-Z0-9.-]+\.supabase\.co/);
  if (!match) return fallback;
  const url = match[0];
  if (url.includes('xwrokjcdqucrropgtofm')) return fallback;
  return url;
}

function sanitizeKey(raw?: string): string {
  const fallback = 'sb_publishable_DS2JM0X7t8kq0V6-jrs7ig_vt8J31uk';
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (trimmed.startsWith('VITE_') || trimmed.includes('SUPABASE_')) return fallback;
  if (!trimmed.startsWith('sb_') && !trimmed.startsWith('eyJ')) return fallback;
  return trimmed;
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === 'Bearer ' + supabaseKey) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseAdminClient() {
  const rawUrl =
    process.env['SUPABASE_URL'] ||
    process.env['VITE_SUPABASE_URL'];
  const rawKey =
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ||
    process.env['SERVICE_ROLE_KEY'] ||
    process.env['SUPABASE_SERVICE_KEY'] ||
    process.env['SUPABASE_SECRET_KEY'] ||
    process.env['SUPABASE_PUBLISHABLE_KEY'] ||
    process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];

  const SUPABASE_URL = sanitizeUrl(rawUrl);
  const SUPABASE_KEY = sanitizeKey(rawKey);

  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_KEY),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
