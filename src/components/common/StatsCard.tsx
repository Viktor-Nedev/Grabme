import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'critical';
}

export function StatsCard({ label, value, change, icon, tone = 'default' }: StatsCardProps) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-brand-gray">{label}</p>
          <p className="mt-3 font-display text-3xl text-brand-ink">{value}</p>
        </div>
        <div
          className={cn(
            'rounded-2xl p-3',
            tone === 'success' && 'bg-emerald-50 text-emerald-600',
            tone === 'warning' && 'bg-amber-50 text-amber-600',
            tone === 'critical' && 'bg-red-50 text-red-600',
            tone === 'default' && 'bg-brand-yellow/20 text-brand-red',
          )}
        >
          {icon ?? <ArrowUpRight className="size-5" />}
        </div>
      </div>
      {change ? <p className="mt-4 text-sm font-medium text-brand-gray">{change}</p> : null}
    </div>
  );
}
