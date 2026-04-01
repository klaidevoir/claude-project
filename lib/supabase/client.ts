import { createBrowserClient } from '@supabase/ssr';

// Fallback values prevent URL-validation errors when running in mock mode
// without real Supabase credentials configured.
const MOCK_URL = 'https://placeholder.supabase.co';
const MOCK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24ifQ.placeholder';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || MOCK_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || MOCK_KEY
  );
}
