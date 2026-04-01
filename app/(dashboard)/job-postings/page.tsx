import { createClient } from '@/lib/supabase/server';
import { JobPostingsClient } from '@/components/hubs/JobPostingsClient';
import { MOCK_MODE, mockJobPostings, mockRoles } from '@/lib/mock-data';

export default async function JobPostingsPage() {
  if (MOCK_MODE) {
    return (
      <JobPostingsClient
        postings={mockJobPostings}
        roles={mockRoles}
      />
    );
  }

  const supabase = createClient();

  const [postingsRes, rolesRes] = await Promise.all([
    supabase
      .from('job_postings')
      .select('*, role:roles(id, title, client_name)')
      .order('date_posted', { ascending: false }),
    supabase.from('roles').select('id, title, client_name').eq('status', 'open'),
  ]);

  return (
    <JobPostingsClient
      postings={postingsRes.data ?? []}
      roles={rolesRes.data ?? []}
    />
  );
}
