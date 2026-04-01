'use client';

import { useState, useMemo } from 'react';
import type { Candidate, Profile, Role, CandidateStage } from '@/types';
import { stageLabel, stageColor, formatDate, cn } from '@/lib/utils';
import { CandidateProfileModal } from '@/components/hubs/CandidateProfileModal';
import { CandidateModal } from '@/components/hubs/CandidateModal';

const STAGES: CandidateStage[] = ['applied', 'screening', 'interview_1', 'interview_2', 'interview_3', 'offer', 'hired', 'rejected', 'withdrawn'];

interface Props {
  currentUser: Profile;
  candidates: Candidate[];
  roles: Partial<Role>[];
  recruiters: { id: string; full_name: string }[];
  isAdmin: boolean;
}

export function RecruiterHubClient({ currentUser, candidates, roles, recruiters, isAdmin }: Props) {
  const [selectedRecruiter, setSelectedRecruiter] = useState(isAdmin ? 'all' : currentUser.id);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<CandidateStage | 'all'>('all');

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (selectedRecruiter !== 'all' && c.recruiter_id !== selectedRecruiter) return false;
      if (stageFilter !== 'all' && c.endorsement_stage !== stageFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [candidates, selectedRecruiter, stageFilter, search]);

  const stageCounts = useMemo(() => {
    const base = selectedRecruiter === 'all' ? candidates : candidates.filter(c => c.recruiter_id === selectedRecruiter);
    const counts: Record<string, number> = {};
    for (const s of STAGES) counts[s] = base.filter(c => c.endorsement_stage === s).length;
    return counts;
  }, [candidates, selectedRecruiter]);

  const fallOffs = filtered.filter((c) => ['rejected', 'withdrawn'].includes(c.endorsement_stage));
  const activeCount = filtered.filter((c) => !['rejected', 'withdrawn', 'hired'].includes(c.endorsement_stage)).length;
  const hiredCount = filtered.filter((c) => c.endorsement_stage === 'hired').length;

  const recruiterName = isAdmin && selectedRecruiter !== 'all'
    ? recruiters.find(r => r.id === selectedRecruiter)?.full_name
    : isAdmin ? 'All Recruiters' : currentUser.full_name;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Hub</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isAdmin ? 'Personal dashboards per recruiter' : `Your personal dashboard, ${currentUser.full_name}`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Endorse Candidate
        </button>
      </div>

      {/* Recruiter Selector (admin only) */}
      {isAdmin && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedRecruiter('all')}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', selectedRecruiter === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50')}
          >
            All Recruiters
          </button>
          {recruiters.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRecruiter(r.id)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', selectedRecruiter === r.id ? 'bg-brand-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50')}
            >
              {r.full_name}
            </button>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Active Candidates</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{activeCount}</p>
          <p className="text-xs text-blue-500 mt-1">{recruiterName}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <p className="text-sm text-green-600 font-medium">Hired</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{hiredCount}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border border-red-100">
          <p className="text-sm text-red-600 font-medium">Fall-offs</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{fallOffs.length}</p>
        </div>
      </div>

      {/* Stage Pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Pipeline Overview</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
              className={cn('rounded-lg p-2.5 border text-center transition-all', stageFilter === stage ? 'ring-2 ring-brand-500 border-brand-300 bg-brand-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50')}
            >
              <p className="text-xl font-bold text-gray-800">{stageCounts[stage] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stageLabel(stage)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500 w-56"
        />
        {stageFilter !== 'all' && (
          <button onClick={() => setStageFilter('all')} className="text-xs text-brand-600 hover:underline">Clear filter</button>
        )}
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} candidates</span>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No candidates yet</p>
          </div>
        ) : (
          filtered.map((candidate) => {
            const history = (candidate.stage_history as any) ?? [];
            return (
              <div key={candidate.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-brand-700 font-semibold">{candidate.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-500">{(candidate.role as any)?.title ?? 'No role assigned'} {(candidate.role as any)?.client_name ? `· ${(candidate.role as any)?.client_name}` : ''}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', stageColor(candidate.endorsement_stage))}>
                          {stageLabel(candidate.endorsement_stage)}
                        </span>
                        {candidate.email && <span className="text-xs text-gray-400">{candidate.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewCandidate(candidate)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button onClick={() => setEditCandidate(candidate)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mini Stage Timeline */}
                {history.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
                      {history.map((h: any, i: number) => (
                        <div key={i} className="flex items-center gap-1 shrink-0">
                          <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', stageColor(h.to_stage))}>
                            {stageLabel(h.to_stage)}
                          </span>
                          {i < history.length - 1 && <span className="text-gray-300 text-xs">→</span>}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Endorsed {formatDate(candidate.created_at)}</p>
                  </div>
                )}

                {/* Notes Tag */}
                {candidate.miscellaneous_notes && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 truncate">{candidate.miscellaneous_notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Fall-off Section */}
      {fallOffs.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="font-semibold text-red-800">Fall-offs ({fallOffs.length})</h2>
          </div>
          <div className="p-4 space-y-2">
            {fallOffs.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{(c.role as any)?.title ?? '—'}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', stageColor(c.endorsement_stage))}>
                  {stageLabel(c.endorsement_stage)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <CandidateModal open={showAdd} onClose={() => setShowAdd(false)} roles={roles as Role[]} profiles={[]} />
      )}
      {editCandidate && (
        <CandidateModal open={!!editCandidate} onClose={() => setEditCandidate(null)} candidate={editCandidate} roles={roles as Role[]} profiles={[]} />
      )}
      {viewCandidate && (
        <CandidateProfileModal open={!!viewCandidate} onClose={() => setViewCandidate(null)} candidate={viewCandidate} profiles={[]} />
      )}
    </div>
  );
}
