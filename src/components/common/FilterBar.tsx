import { SlidersHorizontal } from 'lucide-react';

export function FilterBar({
  title = 'Filters',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-gray">
        <SlidersHorizontal className="size-4" />
        {title}
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
