import { createClient } from '@/lib/supabase/server';
import { CandidateTrackerClient } from '@/components/hubs/CandidateTrackerClient';
import { MOCK_MODE, mockCandidates, mockRoles, mockProfiles } from '@/lib/mock-data';

export default async function CandidatesPage() {
  if (MOCK_MODE) {
    return (
      <CandidateTrackerClient
        candidates={mockCandidates}
        roles={mockRoles}
        profiles={mockProfiles}
      />
    );
  }

  const supabase = createClient();

  const [candidatesRes, rolesRes, profilesRes] = await Promise.all([
    supabase
      .from('candidates')
      .select(`
        *,
        role:roles(id, title, client_name),
        assigned_reviewer:profiles!candidates_assigned_reviewer_id_fkey(id, full_name),
        recruiter:profiles!candidates_recruiter_id_fkey(id, full_name),
        stage_history(id, from_stage, to_stage, created_at, notes, changed_by:profiles(full_name))
      `)
      .order('created_at', { ascending: false }),
    supabase.from('roles').select('id, title, client_name').eq('status', 'open'),
    supabase.from('profiles').select('id, full_name, role').in('role', ['recruiter', 'head_of_recruitment', 'recruitment_admin']),
  ]);

  return (
    <CandidateTrackerClient
      candidates={candidatesRes.data ?? []}
      roles={rolesRes.data ?? []}
      profiles={profilesRes.data ?? []}
    />
  );
}
