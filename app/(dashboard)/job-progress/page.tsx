import { createClient } from '@/lib/supabase/server';
import { JobProgressClient } from '@/components/hubs/JobProgressClient';
import { MOCK_MODE, mockRoles, mockActivityLogs } from '@/lib/mock-data';

export default async function JobProgressPage() {
  if (MOCK_MODE) {
    return (
      <JobProgressClient
        roles={mockRoles}
        logs={mockActivityLogs}
      />
    );
  }

  const supabase = createClient();

  const [rolesRes, logsRes] = await Promise.all([
    supabase.from('roles').select('id, title, client_name, status').order('title'),
    supabase
      .from('activity_log')
      .select(`*, user:profiles(full_name, role), role:roles(title, client_name), candidate:candidates(name)`)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  return (
    <JobProgressClient
      roles={rolesRes.data ?? []}
      logs={logsRes.data ?? []}
    />
  );
}
