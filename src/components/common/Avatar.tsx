import { cn } from '@/utils/cn';

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (!parts.length) return 'U';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', className)} />;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-brand-cream text-xs font-semibold text-brand-ink',
        className,
      )}
    >
      {initialsFromName(name)}
    </div>
  );
}
