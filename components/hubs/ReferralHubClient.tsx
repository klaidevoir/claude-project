'use client';

import { useState, useMemo } from 'react';
import type { Referral } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-emerald-100 text-emerald-700',
};

interface Props {
  referrals: Referral[];
}

export function ReferralHubClient({ referrals }: Props) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const filtered = useMemo(() => {
    return referrals.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search && !r.referral_name.toLowerCase().includes(search.toLowerCase()) && !r.contractor_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [referrals, statusFilter, search]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('referrals').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Status updated'); router.refresh(); }
  }

  async function toggleBonusPaid(id: string, current: boolean) {
    const { error } = await supabase.from('referrals').update({ bonus_paid: !current }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Bonus status updated'); router.refresh(); }
  }

  async function toggleBonusEligible(id: string, current: boolean) {
    const { error } = await supabase.from('referrals').update({ bonus_eligible: !current }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Bonus eligibility updated'); router.refresh(); }
  }

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    hired: referrals.filter(r => r.status === 'hired').length,
    bonusPending: referrals.filter(r => r.bonus_eligible && !r.bonus_paid).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Hub</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage contractor referrals and bonus tracking</p>
        </div>
        <a
          href="/referral"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Public Referral Form
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Total Referrals</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-green-600 font-medium">Hired</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{stats.hired}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-sm text-amber-600 font-medium">Bonus Pending</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{stats.bonusPending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search referrals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500 w-56"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} referrals</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Referral Name</th>
                <th className="px-4 py-3">Contractor</th>
                <th className="px-4 py-3">Role Applied For</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Links</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bonus Eligible</th>
                <th className="px-4 py-3">Bonus Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No referrals found</td>
                </tr>
              ) : (
                filtered.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{referral.referral_name}</td>
                    <td className="px-4 py-3 text-gray-600">{referral.contractor_name}</td>
                    <td className="px-4 py-3 text-gray-600">{referral.role_applying_for ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{referral.whatsapp_number ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {referral.resume_link && (
                          <a href={referral.resume_link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-xs">Resume</a>
                        )}
                        {referral.video_intro_link && (
                          <a href={referral.video_intro_link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-xs">Video</a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(referral.submission_date)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={referral.status}
                        onChange={(e) => updateStatus(referral.id, e.target.value)}
                        className={cn('text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer', STATUS_COLORS[referral.status])}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBonusEligible(referral.id, referral.bonus_eligible)}
                        className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors', referral.bonus_eligible ? 'bg-brand-600' : 'bg-gray-300')}
                      >
                        <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', referral.bonus_eligible ? 'translate-x-4' : 'translate-x-1')} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBonusPaid(referral.id, referral.bonus_paid)}
                        disabled={!referral.bonus_eligible}
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40',
                          referral.bonus_paid ? 'bg-green-600' : 'bg-gray-300'
                        )}
                      >
                        <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', referral.bonus_paid ? 'translate-x-4' : 'translate-x-1')} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
