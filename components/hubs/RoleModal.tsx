'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import type { Role, ProfileSummary } from '@/types';
import toast from 'react-hot-toast';

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
  profiles: ProfileSummary[];
}

const TARGET_REGIONS = ['Philippines', 'Latin America', 'Nigeria', 'Sri Lanka', 'South Africa'];
const ROLE_TYPES = ['Active', 'Inquiry', 'Replacement', 'Internal'];
const STATUSES = ['open', 'paused', 'cancelled', 'closed', 'lost'];

export function RoleModal({ open, onClose, role, profiles }: RoleModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: role?.title ?? '',
    role_type: role?.role_type ?? 'Active',
    headcount: role?.headcount ?? 1,
    client_name: role?.client_name ?? '',
    account_manager: role?.account_manager ?? '',
    client_monthly_rate: role?.client_monthly_rate ?? '',
    estimated_budget_pay_rate: role?.estimated_budget_pay_rate ?? '',
    timezone: role?.timezone ?? '',
    target_onboarding_date: role?.target_onboarding_date ?? '',
    target_regions: role?.target_regions ?? [],
    jd_link: role?.jd_link ?? '',
    jd_file_url: role?.jd_file_url ?? '',
    client_jd_link: role?.client_jd_link ?? '',
    hos_jd_link: role?.hos_jd_link ?? '',
    client_homework_link: role?.client_homework_link ?? '',
    hos_homework_link: role?.hos_homework_link ?? '',
    workable_job_code_link: role?.workable_job_code_link ?? '',
    salary_min: role?.salary_min ?? '',
    salary_max: role?.salary_max ?? '',
    main_recruiter_id: role?.main_recruiter_id ?? '',
    sourcer_id: role?.sourcer_id ?? '',
    internal_notes: role?.internal_notes ?? '',
    status: role?.status ?? 'open',
    date_opened: role?.date_opened ?? new Date().toISOString().split('T')[0],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleRegion(region: string) {
    setForm((prev) => ({
      ...prev,
      target_regions: prev.target_regions.includes(region as any)
        ? prev.target_regions.filter((r) => r !== region)
        : [...prev.target_regions, region as any],
    }));
  }

  async function handleSave() {
    if (!form.title) { toast.error('Role title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        headcount: Number(form.headcount),
        client_monthly_rate: form.client_monthly_rate ? Number(form.client_monthly_rate) : null,
        estimated_budget_pay_rate: form.estimated_budget_pay_rate ? Number(form.estimated_budget_pay_rate) : null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        main_recruiter_id: form.main_recruiter_id || null,
        sourcer_id: form.sourcer_id || null,
        target_onboarding_date: form.target_onboarding_date || null,
      };

      if (role?.id) {
        const { error } = await supabase.from('roles').update(payload).eq('id', role.id);
        if (error) throw error;
        toast.success('Role updated');
      } else {
        const { error } = await supabase.from('roles').insert(payload);
        if (error) throw error;
        toast.success('Role created');
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const recruiters = profiles.filter((p) => ['recruiter', 'head_of_recruitment', 'recruitment_admin'].includes(p.role));
  const sourcers = profiles.filter((p) => ['sourcer', 'head_of_recruitment', 'recruitment_admin'].includes(p.role));

  return (
    <Modal open={open} onClose={onClose} title={role ? 'Edit Role' : 'New Role'} size="2xl">
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input w-full" placeholder="e.g. Senior React Developer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Type</label>
              <select name="role_type" value={form.role_type} onChange={handleChange} className="input w-full">
                {ROLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input w-full">
                {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headcount</label>
              <input type="number" name="headcount" value={form.headcount} onChange={handleChange} min={1} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Opened</label>
              <input type="date" name="date_opened" value={form.date_opened} onChange={handleChange} className="input w-full" />
            </div>
          </div>
        </section>

        {/* Client Info */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Client Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input name="client_name" value={form.client_name} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Manager</label>
              <input name="account_manager" value={form.account_manager} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Monthly Rate ($)</label>
              <input type="number" name="client_monthly_rate" value={form.client_monthly_rate} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Budget Pay Rate ($)</label>
              <input type="number" name="estimated_budget_pay_rate" value={form.estimated_budget_pay_rate} onChange={handleChange} className="input w-full" />
            </div>
          </div>
        </section>

        {/* Salary & Location */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Salary & Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min ($)</label>
              <input type="number" name="salary_min" value={form.salary_min} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max ($)</label>
              <input type="number" name="salary_max" value={form.salary_max} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <input name="timezone" value={form.timezone} onChange={handleChange} className="input w-full" placeholder="e.g. US/Eastern" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Onboarding Date</label>
              <input type="date" name="target_onboarding_date" value={form.target_onboarding_date} onChange={handleChange} className="input w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Regions</label>
              <div className="flex flex-wrap gap-2">
                {TARGET_REGIONS.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.target_regions.includes(region as any)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* JD Links */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">JD & Homework Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'jd_link', label: 'JD Link' },
              { name: 'jd_file_url', label: 'JD File URL' },
              { name: 'client_jd_link', label: 'Client JD Link' },
              { name: 'hos_jd_link', label: 'HOS JD Link' },
              { name: 'client_homework_link', label: 'Client Homework Link' },
              { name: 'hos_homework_link', label: 'HOS Homework Link' },
              { name: 'workable_job_code_link', label: 'Workable Job Code Link' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input name={name} value={(form as any)[name]} onChange={handleChange} className="input w-full" placeholder="https://" />
              </div>
            ))}
          </div>
        </section>

        {/* Team Assignment */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Team Assignment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Recruiter</label>
              <select name="main_recruiter_id" value={form.main_recruiter_id} onChange={handleChange} className="input w-full">
                <option value="">— None —</option>
                {recruiters.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sourcer</label>
              <select name="sourcer_id" value={form.sourcer_id} onChange={handleChange} className="input w-full">
                <option value="">— None —</option>
                {sourcers.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Internal Notes</h3>
          <textarea
            name="internal_notes"
            value={form.internal_notes}
            onChange={handleChange}
            rows={4}
            className="input w-full"
            placeholder="Add internal notes visible only to the team..."
          />
        </section>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : role ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .input {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: white;
        }
        .input:focus {
          border-color: #6270f3;
          box-shadow: 0 0 0 3px rgba(98, 112, 243, 0.15);
        }
      `}</style>
    </Modal>
  );
}
