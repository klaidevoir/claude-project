import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  description?: string;
}

export function StatCard({ label, value, icon, color = 'blue', description }: StatCardProps) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', value: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', value: 'text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', value: 'text-purple-700' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700' },
    red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', value: 'text-red-700' },
  };
  const c = colors[color];

  return (
    <div className={cn('rounded-xl p-5 border border-gray-100', c.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={cn('text-3xl font-bold mt-1', c.value)}>{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        {icon && (
          <div className={cn('p-2.5 rounded-lg', c.icon)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
