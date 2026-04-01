'use client';

import type { Role } from '@/types';
import { formatDate, formatCurrency, daysOpen, statusColor, roleTypeColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface RolesTableProps {
  roles: Role[];
  onEdit?: (role: Role) => void;
}

export function RolesTable({ roles, onEdit }: RolesTableProps) {
  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">No roles found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3 bg-gray-50 first:rounded-tl-none">Role Title</th>
            <th className="px-4 py-3 bg-gray-50">Type</th>
            <th className="px-4 py-3 bg-gray-50">HC</th>
            <th className="px-4 py-3 bg-gray-50">Client</th>
            <th className="px-4 py-3 bg-gray-50">Acct Manager</th>
            <th className="px-4 py-3 bg-gray-50">Client Rate</th>
            <th className="px-4 py-3 bg-gray-50">Budget Rate</th>
            <th className="px-4 py-3 bg-gray-50">Salary Range</th>
            <th className="px-4 py-3 bg-gray-50">Date Opened</th>
            <th className="px-4 py-3 bg-gray-50">Days Open</th>
            <th className="px-4 py-3 bg-gray-50">Recruiter</th>
            <th className="px-4 py-3 bg-gray-50">Sourcer</th>
            <th className="px-4 py-3 bg-gray-50">Status</th>
            <th className="px-4 py-3 bg-gray-50">Last Updated</th>
            <th className="px-4 py-3 bg-gray-50"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {roles.map((role) => {
            const days = daysOpen(role.date_opened);
            return (
              <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap max-w-[200px] truncate">
                  {role.title}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', roleTypeColor(role.role_type))}>
                    {role.role_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{role.headcount}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{role.client_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{role.account_manager ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatCurrency(role.client_monthly_rate)}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatCurrency(role.estimated_budget_pay_rate)}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {role.salary_min || role.salary_max
                    ? `${formatCurrency(role.salary_min)} – ${formatCurrency(role.salary_max)}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatDate(role.date_opened)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={cn(
                    'font-medium',
                    days > 30 ? 'text-red-600' : days > 14 ? 'text-amber-600' : 'text-green-600'
                  )}>
                    {days}d
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {(role.main_recruiter as any)?.full_name ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {(role.sourcer as any)?.full_name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusColor(role.status))}>
                    {role.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(role.updated_at, 'MMM d, h:mm a')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEdit?.(role)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
