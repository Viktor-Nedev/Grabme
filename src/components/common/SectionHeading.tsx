export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">{eyebrow}</p> : null}
        <h2 className="mt-2 font-display text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm text-brand-gray">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
