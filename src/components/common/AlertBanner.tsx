import { AlertTriangle, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AlertBannerProps {
  title: string;
  message: string;
  tone?: 'info' | 'warning' | 'critical';
  actionLabel?: string;
  actionTo?: string;
}

export function AlertBanner({
  title,
  message,
  tone = 'info',
  actionLabel,
  actionTo,
}: AlertBannerProps) {
  const icon =
    tone === 'critical' ? <AlertTriangle className="size-5" /> : tone === 'warning' ? <Bell className="size-5" /> : <Sparkles className="size-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-[26px] border p-4 md:p-5',
        tone === 'critical' && 'border-red-200 bg-red-50 text-red-800',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-800',
        tone === 'info' && 'border-brand-yellow/60 bg-brand-yellow/20 text-brand-ink',
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5">{icon}</span>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
        {actionLabel && actionTo ? (
          <Link to={actionTo} className="btn-ghost px-4 py-2 text-sm">
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
