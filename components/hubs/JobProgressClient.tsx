'use client';

import { useState, useMemo } from 'react';
import { formatDate } from '@/lib/utils';

interface Log {
  id: string;
  role_id?: string;
  candidate_id?: string;
  action: string;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user?: { full_name: string; role: string };
  role?: { title: string; client_name?: string };
  candidate?: { name: string };
}

interface Props {
  roles: { id: string; title: string; client_name?: string; status: string }[];
  logs: Log[];
}

export function JobProgressClient({ roles, logs }: Props) {
  const [selectedRole, setSelectedRole] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);

  const filtered = useMemo(() => {
    if (selectedRole === 'all') return logs;
    return logs.filter((l) => l.role_id === selectedRole);
  }, [logs, selectedRole]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Log[]> = {};
    for (const log of filtered) {
      const day = log.created_at.split('T')[0];
      if (!map[day]) map[day] = [];
      map[day].push(log);
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function actionLabel(log: Log) {
    if (log.action === 'stage_changed') {
      return `moved ${log.candidate?.name ?? 'candidate'} from ${log.old_value ?? '?'} → ${log.new_value ?? '?'}`;
    }
    if (log.action === 'role_created') return `created role ${log.role?.title ?? ''}`;
    if (log.action === 'role_updated') return `updated ${log.field_changed ?? 'field'}: "${log.old_value}" → "${log.new_value}"`;
    if (log.action === 'candidate_added') return `endorsed ${log.candidate?.name ?? 'candidate'}`;
    return log.action.replace(/_/g, ' ');
  }

  async function exportPDF() {
    setExportLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Job Progress Report', 20, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      let y = 45;
      for (const [date, dayLogs] of grouped) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(formatDate(date), 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        for (const log of dayLogs) {
          const line = `• ${log.user?.full_name ?? 'System'} ${actionLabel(log)}`;
          const lines = doc.splitTextToSize(line, 170);
          if (y + lines.length * 6 > 280) { doc.addPage(); y = 20; }
          doc.text(lines, 25, y);
          y += lines.length * 6;
        }
        y += 4;
      }
      doc.save(`job-progress-${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Progress Hub</h1>
          <p className="text-gray-500 text-sm mt-0.5">Activity log per role with daily summaries</p>
        </div>
        <button
          onClick={exportPDF}
          disabled={exportLoading}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exportLoading ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.title} {r.client_name ? `(${r.client_name})` : ''}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} events</span>
      </div>

      {/* Activity Feed */}
      <div className="space-y-6">
        {grouped.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <p className="text-sm">No activity logged yet</p>
          </div>
        ) : (
          grouped.map(([date, dayLogs]) => (
            <div key={date} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-gray-700">{formatDate(date, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <span className="text-xs text-gray-500">{dayLogs.length} event{dayLogs.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {dayLogs.map((log) => (
                  <div key={log.id} className="px-6 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-brand-600 text-xs font-bold">
                        {log.user?.full_name?.charAt(0).toUpperCase() ?? 'S'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{log.user?.full_name ?? 'System'}</span>{' '}
                        {actionLabel(log)}
                        {log.role && (
                          <span className="text-gray-500"> on <span className="text-brand-600">{log.role.title}</span></span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(log.created_at, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
