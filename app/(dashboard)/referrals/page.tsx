import { createClient } from '@/lib/supabase/server';
import { ReferralHubClient } from '@/components/hubs/ReferralHubClient';
import { MOCK_MODE, mockReferrals } from '@/lib/mock-data';

export default async function ReferralsPage() {
  if (MOCK_MODE) {
    return <ReferralHubClient referrals={mockReferrals} />;
  }

  const supabase = createClient();
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .order('created_at', { ascending: false });

  return <ReferralHubClient referrals={referrals ?? []} />;
}
