import { createClient } from '@/lib/supabase/server';
import { MainHubClient } from '@/components/hubs/MainHubClient';
import { MOCK_MODE, mockRoles, mockProfiles, mockCandidates } from '@/lib/mock-data';

export default async function MainHubPage() {
  if (MOCK_MODE) {
    const roles = mockRoles;
    const profiles = mockProfiles;
    const stats = {
      total_active_roles: roles.filter((r) => r.status === 'open' && r.role_type !== 'Inquiry').length,
      roles_in_sourcing: roles.filter((r) => r.status === 'open').length,
      roles_in_interviews: mockCandidates.filter((c) => c.endorsement_stage.startsWith('interview')).length,
      roles_awaiting_feedback: roles.filter((r) => r.status === 'paused').length,
    };
    return <MainHubClient roles={roles} profiles={profiles} stats={stats} />;
  }

  const supabase = createClient();

  const [rolesRes, profilesRes] = await Promise.all([
    supabase
      .from('roles')
      .select(`
        *,
        main_recruiter:profiles!roles_main_recruiter_id_fkey(id, full_name, email),
        sourcer:profiles!roles_sourcer_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .in('role', ['recruiter', 'sourcer', 'head_of_recruitment', 'recruitment_admin']),
  ]);

  const roles = rolesRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  const stats = {
    total_active_roles: roles.filter((r) => r.status === 'open' && r.role_type !== 'Inquiry').length,
    roles_in_sourcing: roles.filter((r) => r.status === 'open').length,
    roles_in_interviews: 0,
    roles_awaiting_feedback: roles.filter((r) => r.status === 'paused').length,
  };

  return <MainHubClient roles={roles} profiles={profiles} stats={stats} />;
}
