import { Building2, ShieldCheck, UserRound } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { UserRole } from '@/types';

interface RoleBadgeProps {
  role: UserRole | 'visitor';
  verified?: boolean;
  className?: string;
}

export function RoleBadge({ role, verified, className }: RoleBadgeProps) {
  const icon =
    role === 'organization' ? (
      verified ? (
        <ShieldCheck className="size-3.5" />
      ) : (
        <Building2 className="size-3.5" />
      )
    ) : (
      <UserRound className="size-3.5" />
    );

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        role === 'organization'
          ? 'bg-brand-red/10 text-brand-red'
          : role === 'user'
            ? 'bg-brand-yellow/25 text-brand-ink'
            : 'bg-brand-ink/8 text-brand-gray',
        className,
      )}
    >
      {icon}
      {role === 'organization' ? (verified ? 'Verified Org' : 'Organization') : role === 'user' ? 'User' : 'Visitor'}
    </span>
  );
}
