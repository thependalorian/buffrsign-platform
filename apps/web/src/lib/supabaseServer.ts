// Supabase SSR server client helper. Purpose: provide SSR-safe client using service role via env or anon for server actions. Location: apps/web/src/lib/supabaseServer.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/database.types';
import { cookies } from 'next/headers';

// Note: For SSR secure operations, prefer SERVICE_ROLE in server-only contexts.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getServerSupabase() {
  const cookieStore = cookies();
  if (!url || !anon) return null;
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

