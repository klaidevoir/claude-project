'use client';

import { useState, useMemo } from 'react';
import type { Role, Profile, DashboardStats } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { RolesTable } from '@/components/hubs/RolesTable';
import { RoleModal } from '@/components/hubs/RoleModal';
import { cn, stageColor } from '@/lib/utils';

type StatusFilter = 'all' | 'open' | 'inquiry' | 'replacement' | 'internal' | 'paused' | 'cancelled' | 'lost';

interface MainHubClientProps {
  roles: Role[];
  profiles: Profile[];
  stats: DashboardStats;
}

export function MainHubClient({ roles, profiles, stats }: MainHubClientProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return roles;
    if (filter === 'open') return roles.filter((r) => r.status === 'open' && r.role_type === 'Active');
    if (filter === 'inquiry') return roles.filter((r) => r.role_type === 'Inquiry');
    if (filter === 'replacement') return roles.filter((r) => r.role_type === 'Replacement');
    if (filter === 'internal') return roles.filter((r) => r.role_type === 'Internal');
    if (filter === 'paused') return roles.filter((r) => r.status === 'paused');
    if (filter === 'cancelled') return roles.filter((r) => r.status === 'cancelled');
    if (filter === 'lost') return roles.filter((r) => r.status === 'lost');
    return roles;
  }, [roles, filter]);

  const filterTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: roles.length },
    { key: 'open', label: 'Active', count: roles.filter((r) => r.status === 'open' && r.role_type === 'Active').length },
    { key: 'inquiry', label: 'Inquiry', count: roles.filter((r) => r.role_type === 'Inquiry').length },
    { key: 'replacement', label: 'Replacement', count: roles.filter((r) => r.role_type === 'Replacement').length },
    { key: 'internal', label: 'Internal', count: roles.filter((r) => r.role_type === 'Internal').length },
    { key: 'paused', label: 'Paused', count: roles.filter((r) => r.status === 'paused').length },
    { key: 'cancelled', label: 'Cancelled', count: roles.filter((r) => r.status === 'cancelled').length },
    { key: 'lost', label: 'Lost', count: roles.filter((r) => r.status === 'lost').length },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Main Hub</h1>
          <p className="text-gray-500 text-sm mt-0.5">All active roles and headcount</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Role
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Active Roles"
          value={stats.total_active_roles}
          color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Roles in Sourcing"
          value={stats.roles_in_sourcing}
          color="purple"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
        <StatCard
          label="Roles in Interviews"
          value={stats.roles_in_interviews}
          color="amber"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
        <StatCard
          label="Awaiting Client Feedback"
          value={stats.roles_awaiting_feedback}
          color="green"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 pt-4 border-b border-gray-100">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors border-b-2 -mb-px',
                  filter === tab.key
                    ? 'text-brand-600 border-brand-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  filter === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        <RolesTable roles={filtered} onEdit={setEditRole} />
      </div>

      {/* Modals */}
      {showAddModal && (
        <RoleModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          profiles={profiles}
        />
      )}
      {editRole && (
        <RoleModal
          open={!!editRole}
          onClose={() => setEditRole(null)}
          role={editRole}
          profiles={profiles}
        />
      )}
    </div>
  );
}
