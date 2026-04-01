'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import type { Candidate, Role, ProfileSummary } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  candidate?: Candidate | null;
  roles: Role[];
  profiles: ProfileSummary[];
}

const STAGES = ['applied', 'screening', 'interview_1', 'interview_2', 'interview_3', 'offer', 'hired', 'rejected', 'withdrawn'];
const AVAILABILITIES = ['ASAP', '1 Week', '2 Weeks', '1 Month', 'Other'];

export function CandidateModal({ open, onClose, candidate, roles, profiles }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: candidate?.name ?? '',
    email: candidate?.email ?? '',
    whatsapp: candidate?.whatsapp ?? '',
    hos_gmail: candidate?.hos_gmail ?? '',
    role_id: candidate?.role_id ?? '',
    endorsement_writeup: candidate?.endorsement_writeup ?? '',
    resume_url: candidate?.resume_url ?? '',
    loom_video_link: candidate?.loom_video_link ?? '',
    portfolio_url: candidate?.portfolio_url ?? '',
    homework_url: candidate?.homework_url ?? '',
    salary_expectation_min: candidate?.salary_expectation_min ?? '',
    salary_expectation_max: candidate?.salary_expectation_max ?? '',
    availability: candidate?.availability ?? 'ASAP',
    availability_details: candidate?.availability_details ?? '',
    working_timezone: candidate?.working_timezone ?? '',
    planned_vacation: candidate?.planned_vacation ?? '',
    reason_for_leaving: candidate?.reason_for_leaving ?? '',
    red_flags: candidate?.red_flags ?? '',
    miscellaneous_notes: candidate?.miscellaneous_notes ?? '',
    endorsement_stage: candidate?.endorsement_stage ?? 'applied',
    assigned_reviewer_id: candidate?.assigned_reviewer_id ?? '',
    recruiter_id: candidate?.recruiter_id ?? '',
    references: candidate?.references ?? [
      { name: '', email: '', phone: '', relationship: '', status: 'pending' },
      { name: '', email: '', phone: '', relationship: '', status: 'pending' },
      { name: '', email: '', phone: '', relationship: '', status: 'pending' },
    ],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleRefChange(index: number, field: string, value: string) {
    setForm((prev) => {
      const refs = [...prev.references];
      refs[index] = { ...refs[index], [field]: value };
      return { ...prev, references: refs };
    });
  }

  async function handleSave() {
    if (!form.name) { toast.error('Candidate name is required'); return; }
    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        ...form,
        salary_expectation_min: form.salary_expectation_min ? Number(form.salary_expectation_min) : null,
        salary_expectation_max: form.salary_expectation_max ? Number(form.salary_expectation_max) : null,
        role_id: form.role_id || null,
        assigned_reviewer_id: form.assigned_reviewer_id || null,
        recruiter_id: form.recruiter_id || null,
      };

      if (candidate?.id) {
        const { error } = await supabase.from('candidates').update(payload).eq('id', candidate.id);
        if (error) throw error;
        toast.success('Candidate updated');
      } else {
        const { data, error } = await supabase.from('candidates').insert(payload).select('id').single();
        if (error) throw error;
        // Log stage history
        await supabase.from('stage_history').insert({
          candidate_id: data.id,
          to_stage: form.endorsement_stage,
          notes: 'Initial endorsement',
        });
        toast.success('Candidate endorsed');
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={candidate ? 'Edit Candidate' : 'Endorse Candidate'} size="2xl">
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Candidate Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HOS Gmail</label>
              <input name="hos_gmail" value={form.hos_gmail} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Role</label>
              <select name="role_id" value={form.role_id} onChange={handleChange} className="input w-full">
                <option value="">— Select Role —</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.title} {r.client_name ? `(${r.client_name})` : ''}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Endorsement Stage */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Stage & Assignment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endorsement Stage</label>
              <select name="endorsement_stage" value={form.endorsement_stage} onChange={handleChange} className="input w-full">
                {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter</label>
              <select name="recruiter_id" value={form.recruiter_id} onChange={handleChange} className="input w-full">
                <option value="">— None —</option>
                {profiles.filter(p => ['recruiter','head_of_recruitment','recruitment_admin'].includes(p.role)).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Reviewer</label>
              <select name="assigned_reviewer_id" value={form.assigned_reviewer_id} onChange={handleChange} className="input w-full">
                <option value="">— None —</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Links */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Links & Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'resume_url', label: 'Resume URL' },
              { name: 'loom_video_link', label: 'Loom / Video Link' },
              { name: 'portfolio_url', label: 'Portfolio URL' },
              { name: 'homework_url', label: 'Homework URL' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input name={name} value={(form as any)[name]} onChange={handleChange} className="input w-full" placeholder="https://" />
              </div>
            ))}
          </div>
        </section>

        {/* Salary & Availability */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Salary & Availability</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation Min ($)</label>
              <input type="number" name="salary_expectation_min" value={form.salary_expectation_min} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation Max ($)</label>
              <input type="number" name="salary_expectation_max" value={form.salary_expectation_max} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select name="availability" value={form.availability} onChange={handleChange} className="input w-full">
                {AVAILABILITIES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Timezone</label>
              <input name="working_timezone" value={form.working_timezone} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability Details</label>
              <input name="availability_details" value={form.availability_details} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Vacation</label>
              <input name="planned_vacation" value={form.planned_vacation} onChange={handleChange} className="input w-full" />
            </div>
          </div>
        </section>

        {/* Endorsement Write-up */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Endorsement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endorsement Write-up</label>
              <textarea name="endorsement_writeup" value={form.endorsement_writeup} onChange={handleChange} rows={4} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
              <textarea name="reason_for_leaving" value={form.reason_for_leaving} onChange={handleChange} rows={2} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Red Flags</label>
              <textarea name="red_flags" value={form.red_flags} onChange={handleChange} rows={2} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Miscellaneous Notes</label>
              <textarea name="miscellaneous_notes" value={form.miscellaneous_notes} onChange={handleChange} rows={2} className="input w-full" />
            </div>
          </div>
        </section>

        {/* References */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">References (3)</h3>
          <div className="space-y-4">
            {form.references.map((ref, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Reference {i + 1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                    <input value={ref.name} onChange={(e) => handleRefChange(i, 'name', e.target.value)} className="input w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                    <input value={ref.relationship} onChange={(e) => handleRefChange(i, 'relationship', e.target.value)} className="input w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input type="email" value={ref.email} onChange={(e) => handleRefChange(i, 'email', e.target.value)} className="input w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input value={ref.phone} onChange={(e) => handleRefChange(i, 'phone', e.target.value)} className="input w-full text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-lg transition-colors">
            {saving ? 'Saving...' : candidate ? 'Save Changes' : 'Endorse Candidate'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .input { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 0.15s, box-shadow 0.15s; background: white; }
        .input:focus { border-color: #6270f3; box-shadow: 0 0 0 3px rgba(98, 112, 243, 0.15); }
      `}</style>
    </Modal>
  );
}
