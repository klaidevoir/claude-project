'use client';

import { useState, useMemo } from 'react';
import type { Candidate, Role, CandidateStage, ProfileSummary } from '@/types';
import { stageLabel, stageColor, formatDate, cn } from '@/lib/utils';
import { CandidateModal } from '@/components/hubs/CandidateModal';
import { CandidateProfileModal } from '@/components/hubs/CandidateProfileModal';

const STAGES: CandidateStage[] = ['applied', 'screening', 'interview_1', 'interview_2', 'interview_3', 'offer', 'hired', 'rejected', 'withdrawn'];

interface Props {
  candidates: Candidate[];
  roles: Partial<Role>[];
  profiles: ProfileSummary[];
}

export function CandidateTrackerClient({ candidates, roles, profiles }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const [stageFilter, setStageFilter] = useState<CandidateStage | 'all'>('all');
  const [recruiterFilter, setRecruiterFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (stageFilter !== 'all' && c.endorsement_stage !== stageFilter) return false;
      if (recruiterFilter !== 'all' && c.recruiter_id !== recruiterFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [candidates, stageFilter, recruiterFilter, search]);

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: candidates.length };
    for (const stage of STAGES) {
      counts[stage] = candidates.filter((c) => c.endorsement_stage === stage).length;
    }
    return counts;
  }, [candidates]);

  // Fall-off tracking
  const fallOffs = candidates.filter((c) => ['rejected', 'withdrawn'].includes(c.endorsement_stage));

  // Per-recruiter breakdown
  const recruiterBreakdown = useMemo(() => {
    const map: Record<string, { name: string; count: number; stages: Record<string, number> }> = {};
    for (const c of candidates) {
      if (!c.recruiter_id) continue;
      const recruiter = c.recruiter as any;
      if (!recruiter) continue;
      if (!map[c.recruiter_id]) {
        map[c.recruiter_id] = { name: recruiter.full_name, count: 0, stages: {} };
      }
      map[c.recruiter_id].count++;
      map[c.recruiter_id].stages[c.endorsement_stage] = (map[c.recruiter_id].stages[c.endorsement_stage] ?? 0) + 1;
    }
    return Object.values(map);
  }, [candidates]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Tracker</h1>
          <p className="text-gray-500 text-sm mt-0.5">All endorsed candidates across all roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Endorse Candidate
        </button>
      </div>

      {/* Stage Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-3">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
            className={cn(
              'rounded-xl p-3 border text-center transition-all',
              stageFilter === stage ? 'ring-2 ring-brand-500 border-brand-300' : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <p className="text-2xl font-bold text-gray-800">{stageCounts[stage] ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stageLabel(stage)}</p>
          </button>
        ))}
      </div>

      {/* Recruiter Breakdown */}
      {recruiterBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recruiter Breakdown</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recruiterBreakdown.map((r) => (
              <div key={r.name} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-800 text-sm">{r.name}</p>
                  <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">{r.count}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(r.stages).map(([stage, count]) => (
                    <span key={stage} className={cn('text-xs px-1.5 py-0.5 rounded-full', stageColor(stage))}>
                      {stageLabel(stage)}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500 w-56"
        />
        <select
          value={recruiterFilter}
          onChange={(e) => setRecruiterFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Recruiters</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
        {stageFilter !== 'all' && (
          <button
            onClick={() => setStageFilter('all')}
            className="text-xs text-brand-600 hover:underline"
          >
            Clear filter
          </button>
        )}
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} candidates</span>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Recruiter</th>
                <th className="px-4 py-3">Reviewer</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Stage History</th>
                <th className="px-4 py-3">Endorsed</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No candidates found
                  </td>
                </tr>
              ) : (
                filtered.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-xs text-gray-500">{candidate.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(candidate.role as any)?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', stageColor(candidate.endorsement_stage))}>
                        {stageLabel(candidate.endorsement_stage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(candidate.recruiter as any)?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(candidate.assigned_reviewer as any)?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{candidate.availability}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {((candidate.stage_history as any) ?? []).slice(-3).map((h: any, i: number) => (
                          <span key={i} className={cn('w-2 h-2 rounded-full', stageColor(h.to_stage).split(' ')[0])} title={stageLabel(h.to_stage)} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(candidate.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewCandidate(candidate)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          title="View profile"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditCandidate(candidate)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fall-off Section */}
      {fallOffs.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="font-semibold text-red-800">Fall-off Tracking ({fallOffs.length})</h2>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-red-50">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Final Stage</th>
                  <th className="px-4 py-3">Recruiter</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fallOffs.map((c) => (
                  <tr key={c.id} className="hover:bg-red-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{(c.role as any)?.title ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', stageColor(c.endorsement_stage))}>
                        {stageLabel(c.endorsement_stage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{(c.recruiter as any)?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <CandidateModal open={showAddModal} onClose={() => setShowAddModal(false)} roles={roles as Role[]} profiles={profiles} />
      )}
      {editCandidate && (
        <CandidateModal open={!!editCandidate} onClose={() => setEditCandidate(null)} candidate={editCandidate} roles={roles as Role[]} profiles={profiles} />
      )}
      {viewCandidate && (
        <CandidateProfileModal open={!!viewCandidate} onClose={() => setViewCandidate(null)} candidate={viewCandidate} profiles={profiles} />
      )}
    </div>
  );
}
