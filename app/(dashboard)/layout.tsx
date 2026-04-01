import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { MOCK_MODE, mockAdminProfile } from '@/lib/mock-data';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (MOCK_MODE) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar profile={mockAdminProfile} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
