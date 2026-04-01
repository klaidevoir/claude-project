'use client';

import { useState, useMemo } from 'react';
import type { JobPosting, Role } from '@/types';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface Props {
  postings: JobPosting[];
  roles: Partial<Role>[];
}

const PLATFORMS = ['Indeed', 'LinkedIn', 'JobStreet', 'Facebook', 'Kalibrr', 'Jobstreet', 'WorkAbroad', 'OnlineJobs.ph', 'Remote.co', 'Other'];

export function JobPostingsClient({ postings, roles }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editPosting, setEditPosting] = useState<JobPosting | null>(null);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const router = useRouter();

  const filtered = useMemo(() => {
    return postings.filter((p) => {
      if (platformFilter !== 'all' && p.platform_name !== platformFilter) return false;
      if (roleFilter !== 'all' && p.role_id !== roleFilter) return false;
      return true;
    });
  }, [postings, platformFilter, roleFilter]);

  const platforms = [...new Set(postings.map((p) => p.platform_name))].sort();

  // Stats
  const totalSpend = postings.reduce((sum, p) => sum + (p.ad_spend ?? 0), 0);
  const totalApps = postings.reduce((sum, p) => sum + (p.application_count ?? 0), 0);
  const sponsoredCount = postings.filter((p) => p.sponsored).length;

  // Platform breakdown
  const platformBreakdown = useMemo(() => {
    const map: Record<string, { count: number; apps: number; spend: number }> = {};
    for (const p of postings) {
      if (!map[p.platform_name]) map[p.platform_name] = { count: 0, apps: 0, spend: 0 };
      map[p.platform_name].count++;
      map[p.platform_name].apps += p.application_count ?? 0;
      map[p.platform_name].spend += p.ad_spend ?? 0;
    }
    return Object.entries(map).sort((a, b) => b[1].apps - a[1].apps);
  }, [postings]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Posting Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track every job ad posted per platform</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Posting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Total Postings</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{postings.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-green-600 font-medium">Total Applications</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{totalApps}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-sm text-purple-600 font-medium">Sponsored Ads</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">{sponsoredCount}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-sm text-amber-600 font-medium">Total Ad Spend</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{formatCurrency(totalSpend)}</p>
        </div>
      </div>

      {/* Platform Breakdown */}
      {platformBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Applications by Source</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {platformBreakdown.map(([platform, stats]) => (
              <div key={platform} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-800 text-sm">{platform}</p>
                  <span className="text-xs text-gray-500">{stats.count} posting{stats.count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <p className="text-gray-500">Applications</p>
                    <p className="font-semibold text-gray-800">{stats.apps}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ad Spend</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(stats.spend)}</p>
                  </div>
                  {stats.apps > 0 && stats.spend > 0 && (
                    <div>
                      <p className="text-gray-500">Cost/App</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(stats.spend / stats.apps)}</p>
                    </div>
                  )}
                </div>
                {/* Simple bar */}
                <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min((stats.apps / (totalApps || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500">
          <option value="all">All Platforms</option>
          {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500">
          <option value="all">All Roles</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} postings</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Date Posted</th>
                <th className="px-4 py-3">Sponsored</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Ad Spend</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Cost/App</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No job postings found</td>
                </tr>
              ) : (
                filtered.map((posting) => {
                  const costPerApp = posting.ad_spend && posting.application_count
                    ? posting.ad_spend / posting.application_count
                    : null;
                  return (
                    <tr key={posting.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{posting.platform_name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {(posting.role as any)?.title ?? '—'}
                        {(posting.role as any)?.client_name && <span className="text-gray-400 ml-1 text-xs">({(posting.role as any)?.client_name})</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(posting.date_posted)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', posting.sponsored ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500')}>
                          {posting.sponsored ? 'Sponsored' : 'Organic'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{posting.duration_days ? `${posting.duration_days}d` : '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{formatCurrency(posting.ad_spend)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{posting.application_count}</td>
                      <td className="px-4 py-3 text-gray-600">{costPerApp ? formatCurrency(costPerApp) : '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditPosting(posting)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(showAdd || editPosting) && (
        <JobPostingModal
          open={showAdd || !!editPosting}
          onClose={() => { setShowAdd(false); setEditPosting(null); }}
          posting={editPosting ?? undefined}
          roles={roles as Role[]}
          platforms={PLATFORMS}
        />
      )}
    </div>
  );
}

function JobPostingModal({ open, onClose, posting, roles, platforms }: {
  open: boolean;
  onClose: () => void;
  posting?: JobPosting;
  roles: Role[];
  platforms: string[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    platform_name: posting?.platform_name ?? '',
    role_id: posting?.role_id ?? '',
    date_posted: posting?.date_posted ?? new Date().toISOString().split('T')[0],
    sponsored: posting?.sponsored ?? false,
    duration_days: posting?.duration_days ?? '',
    ad_spend: posting?.ad_spend ?? '',
    application_count: posting?.application_count ?? 0,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSave() {
    if (!form.platform_name) { toast.error('Platform name is required'); return; }
    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        ...form,
        duration_days: form.duration_days ? Number(form.duration_days) : null,
        ad_spend: form.ad_spend ? Number(form.ad_spend) : null,
        application_count: Number(form.application_count),
        role_id: form.role_id || null,
      };
      if (posting?.id) {
        const { error } = await supabase.from('job_postings').update(payload).eq('id', posting.id);
        if (error) throw error;
        toast.success('Posting updated');
      } else {
        const { error } = await supabase.from('job_postings').insert(payload);
        if (error) throw error;
        toast.success('Posting added');
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={posting ? 'Edit Job Posting' : 'Add Job Posting'} size="lg">
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
          <select name="platform_name" value={form.platform_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">— Select Platform —</option>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Linked Role</label>
          <select name="role_id" value={form.role_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">— None —</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.title} {r.client_name ? `(${r.client_name})` : ''}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Posted</label>
            <input type="date" name="date_posted" value={form.date_posted} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input type="number" name="duration_days" value={form.duration_days} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Spend ($)</label>
            <input type="number" name="ad_spend" value={form.ad_spend} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applications Received</label>
            <input type="number" name="application_count" value={form.application_count} onChange={handleChange} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" name="sponsored" id="sponsored" checked={form.sponsored} onChange={handleChange} className="h-4 w-4 text-brand-600 border-gray-300 rounded" />
          <label htmlFor="sponsored" className="text-sm font-medium text-gray-700">Sponsored Ad</label>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-lg transition-colors">
            {saving ? 'Saving...' : posting ? 'Save Changes' : 'Add Posting'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
