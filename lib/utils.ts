import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysOpen(dateOpened: string): number {
  return differenceInDays(new Date(), parseISO(dateOpened));
}

export function formatDate(date: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  try {
    return format(parseISO(date), fmt);
  } catch {
    return '—';
  }
}

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    applied: 'Applied',
    screening: 'Screening',
    interview_1: 'Interview 1',
    interview_2: 'Interview 2',
    interview_3: 'Interview 3',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[stage] ?? stage;
}

export function stageColor(stage: string): string {
  const colors: Record<string, string> = {
    applied: 'bg-gray-100 text-gray-700',
    screening: 'bg-blue-100 text-blue-700',
    interview_1: 'bg-indigo-100 text-indigo-700',
    interview_2: 'bg-violet-100 text-violet-700',
    interview_3: 'bg-purple-100 text-purple-700',
    offer: 'bg-amber-100 text-amber-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-500',
  };
  return colors[stage] ?? 'bg-gray-100 text-gray-700';
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    closed: 'bg-gray-100 text-gray-700',
    lost: 'bg-red-100 text-red-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-700';
}

export function roleTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Active: 'bg-brand-100 text-brand-700',
    Inquiry: 'bg-sky-100 text-sky-700',
    Replacement: 'bg-orange-100 text-orange-700',
    Internal: 'bg-teal-100 text-teal-700',
  };
  return colors[type] ?? 'bg-gray-100 text-gray-700';
}
