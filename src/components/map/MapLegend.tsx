const items = [
  { label: 'Urgent requests or expiring food', color: 'bg-red-500' },
  { label: 'Available donations', color: 'bg-brand-yellow' },
  { label: 'Organizations and pickup hubs', color: 'bg-emerald-500' },
  { label: 'Your saved location', color: 'bg-sky-500' },
  { label: 'Events', color: 'bg-violet-500' },
];

export function MapLegend() {
  return (
    <div className="surface-card flex flex-wrap gap-3 p-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-brand-gray">
          <span className={`size-3 rounded-full ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
