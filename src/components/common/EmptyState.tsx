import { Inbox } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="rounded-full bg-brand-yellow/25 p-4 text-brand-red">
        <Inbox className="size-8" />
      </div>
      <div>
        <h3 className="font-display text-xl">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-brand-gray">{description}</p>
      </div>
      {action}
    </div>
  );
}
