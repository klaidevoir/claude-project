'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import type { Candidate, Profile, CandidateStage } from '@/types';
import { stageLabel, stageColor, formatDate, formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  candidate: Candidate;
  profiles: Partial<Profile>[];
}

const STAGES: CandidateStage[] = ['applied', 'screening', 'interview_1', 'interview_2', 'interview_3', 'offer', 'hired', 'rejected', 'withdrawn'];

export function CandidateProfileModal({ open, onClose, candidate, profiles }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [movingStage, setMovingStage] = useState(false);
  const [stageNote, setStageNote] = useState('');
  const [selectedStage, setSelectedStage] = useState<CandidateStage>(candidate.endorsement_stage);

  async function moveStage() {
    if (selectedStage === candidate.endorsement_stage) return;
    setMovingStage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('candidates').update({ endorsement_stage: selectedStage }).eq('id', candidate.id);
      await supabase.from('stage_history').insert({
        candidate_id: candidate.id,
        from_stage: candidate.endorsement_stage,
        to_stage: selectedStage,
        changed_by_id: user?.id,
        notes: stageNote || null,
      });
      await supabase.from('activity_log').insert({
        candidate_id: candidate.id,
        user_id: user?.id,
        action: 'stage_changed',
        field_changed: 'endorsement_stage',
        old_value: candidate.endorsement_stage,
        new_value: selectedStage,
      });
      toast.success(`Moved to ${stageLabel(selectedStage)}`);
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setMovingStage(false);
    }
  }

  const refs = candidate.references ?? [];

  return (
    <Modal open={open} onClose={onClose} title={candidate.name} size="2xl">
      <div className="p-6 space-y-6">
        {/* Stage Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Stage Timeline</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {STAGES.map((stage, idx) => {
              const history = (candidate.stage_history ?? []) as any[];
              const reached = history.some((h) => h.to_stage === stage) || candidate.endorsement_stage === stage;
              const isCurrent = candidate.endorsement_stage === stage;
              return (
                <div key={stage} className="flex items-center gap-1">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    isCurrent ? stageColor(stage) : reached ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                  )}>
                    {stageLabel(stage)}
                  </span>
                  {idx < STAGES.length - 1 && <span className="text-gray-300">→</span>}
                </div>
              );
            })}
          </div>

          {/* Stage History */}
          {(candidate.stage_history ?? []).length > 0 && (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {((candidate.stage_history ?? []) as any[]).map((h: any) => (
                <div key={h.id} className="px-4 py-2 flex items-start gap-3 text-sm">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium mt-0.5', stageColor(h.to_stage))}>
                    {stageLabel(h.to_stage)}
                  </span>
                  <div className="flex-1">
                    {h.notes && <p className="text-gray-700">{h.notes}</p>}
                    <p className="text-gray-400 text-xs">{h.changed_by?.full_name} · {formatDate(h.created_at, 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Move Stage */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Move Stage</p>
            <div className="flex gap-3">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as CandidateStage)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                {STAGES.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
              </select>
              <button
                onClick={moveStage}
                disabled={movingStage || selectedStage === candidate.endorsement_stage}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {movingStage ? 'Moving...' : 'Move'}
              </button>
            </div>
            <input
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              placeholder="Optional note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Contact</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Email:</dt><dd className="text-gray-900">{candidate.email ?? '—'}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">WhatsApp:</dt><dd className="text-gray-900">{candidate.whatsapp ?? '—'}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">HOS Gmail:</dt><dd className="text-gray-900">{candidate.hos_gmail ?? '—'}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Timezone:</dt><dd className="text-gray-900">{candidate.working_timezone ?? '—'}</dd></div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Compensation</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2"><dt className="text-gray-500 w-32 shrink-0">Salary Min:</dt><dd className="text-gray-900">{formatCurrency(candidate.salary_expectation_min)}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-32 shrink-0">Salary Max:</dt><dd className="text-gray-900">{formatCurrency(candidate.salary_expectation_max)}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-32 shrink-0">Availability:</dt><dd className="text-gray-900">{candidate.availability}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-32 shrink-0">Vacation:</dt><dd className="text-gray-900">{candidate.planned_vacation ?? '—'}</dd></div>
            </dl>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Documents & Links</h3>
          <div className="flex flex-wrap gap-3">
            {candidate.resume_url && <a href={candidate.resume_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-sm">Resume</a>}
            {candidate.loom_video_link && <a href={candidate.loom_video_link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-sm">Video Intro</a>}
            {candidate.portfolio_url && <a href={candidate.portfolio_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-sm">Portfolio</a>}
            {candidate.homework_url && <a href={candidate.homework_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-sm">Homework</a>}
          </div>
        </div>

        {/* Endorsement Write-up */}
        {candidate.endorsement_writeup && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Endorsement Write-up</h3>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">{candidate.endorsement_writeup}</p>
          </div>
        )}

        {/* Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {candidate.reason_for_leaving && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Reason for Leaving</h3>
              <p className="text-sm text-gray-700">{candidate.reason_for_leaving}</p>
            </div>
          )}
          {candidate.red_flags && (
            <div>
              <h3 className="text-xs font-semibold text-red-500 uppercase mb-1">Red Flags</h3>
              <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{candidate.red_flags}</p>
            </div>
          )}
          {candidate.miscellaneous_notes && (
            <div className="sm:col-span-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Miscellaneous Notes</h3>
              <p className="text-sm text-gray-700">{candidate.miscellaneous_notes}</p>
            </div>
          )}
        </div>

        {/* References */}
        {refs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">References</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {refs.map((ref: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-900">{ref.name || '—'}</p>
                  <p className="text-gray-500">{ref.relationship}</p>
                  <p className="text-gray-600">{ref.email}</p>
                  <p className="text-gray-600">{ref.phone}</p>
                  <span className={cn(
                    'inline-block mt-1 px-2 py-0.5 rounded-full text-xs',
                    ref.status === 'completed' ? 'bg-green-100 text-green-700' :
                    ref.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {ref.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
