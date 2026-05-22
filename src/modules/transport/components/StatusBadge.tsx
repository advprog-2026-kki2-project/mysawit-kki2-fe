'use client';

import { cn } from '@/lib/utils';

export type StatusVariant = 'loading' | 'transporting' | 'arrived' | 'approved' | 'rejected' | 'pending';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  loading: 'bg-[#774E15]/20 text-[#774E15] border border-[#774E15]/30',
  transporting: 'bg-[#774E15]/20 text-[#774E15] border border-[#774E15]/30',
  arrived: 'bg-[#80B048]/20 text-[#80B048] border border-[#80B048]/30',
  approved: 'bg-[#80B048]/20 text-[#80B048] border border-[#80B048]/30',
  rejected: 'bg-red-100 text-red-700 border border-red-300',
  pending: 'bg-gray-100 text-gray-700 border border-gray-300',
};

const statusLabels: Record<StatusVariant, string> = {
  loading: 'Loading',
  transporting: 'In Transit',
  arrived: 'Arrived',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        variantStyles[status],
        className
      )}
    >
      {label || statusLabels[status]}
    </span>
  );
}
