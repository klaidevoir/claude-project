import { createClient } from '@/lib/supabase/server';
import { RecruiterHubClient } from '@/components/hubs/RecruiterHubClient';
import { redirect } from 'next/navigation';
import { MOCK_MODE, mockAdminProfile, mockCandidates, mockRoles, mockProfiles } from '@/lib/mock-data';

export default async function RecruiterHubPage() {
  if (MOCK_MODE) {
    return (
      <RecruiterHubClient
        currentUser={mockAdminProfile}
        candidates={mockCandidates}
        roles={mockRoles}
        recruiters={mockProfiles.filter(p => ['recruiter', 'head_of_recruitment', 'recruitment_admin'].includes(p.role))}
        isAdmin={true}
      />
    );
  }

  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  // Admins and HoR can view all recruiters; recruiters only see themselves
  const isAdmin = ['recruitment_admin', 'head_of_recruitment'].includes(profile.role);

  const [candidatesRes, rolesRes, recruitersRes] = await Promise.all([
    isAdmin
      ? supabase
          .from('candidates')
          .select(`*, role:roles(id,title,client_name), recruiter:profiles!candidates_recruiter_id_fkey(id,full_name), stage_history(id,from_stage,to_stage,created_at,notes)`)
          .order('created_at', { ascending: false })
      : supabase
          .from('candidates')
          .select(`*, role:roles(id,title,client_name), recruiter:profiles!candidates_recruiter_id_fkey(id,full_name), stage_history(id,from_stage,to_stage,created_at,notes)`)
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false }),
    supabase.from('roles').select('id, title, client_name').eq('status', 'open'),
    isAdmin
      ? supabase.from('profiles').select('id, full_name').in('role', ['recruiter', 'head_of_recruitment', 'recruitment_admin'])
      : Promise.resolve({ data: [{ id: profile.id, full_name: profile.full_name }] }),
  ]);

  return (
    <RecruiterHubClient
      currentUser={profile}
      candidates={candidatesRes.data ?? []}
      roles={rolesRes.data ?? []}
      recruiters={(recruitersRes as any).data ?? []}
      isAdmin={isAdmin}
    />
  );
}
