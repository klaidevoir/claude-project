import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  const MOCK_URL = 'https://placeholder.supabase.co';
  const MOCK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24ifQ.placeholder';

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || MOCK_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || MOCK_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: import('@supabase/ssr').CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
          }
        },
      },
    }
  );
}
