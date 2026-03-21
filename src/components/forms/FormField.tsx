import { cn } from '@/utils/cn';

export const inputClassName =
  'mt-2 w-full rounded-[18px] border border-brand-ink/10 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-brand-gray/80 focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/10';

export function FormField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-sm font-semibold text-brand-ink">{label}</span>
      {hint ? <span className="mt-1 block text-xs text-brand-gray">{hint}</span> : null}
      {children}
    </label>
  );
}
