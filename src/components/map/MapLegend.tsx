const items = [
  { label: 'Urgent requests or expiring food', icon: '/Urgent_requests_or_expiring_food.png' },
  { label: 'Available donations', icon: '/Available_donations.png' },
  { label: 'Organizations and pickup hubs', icon: '/Organizations_and_pickup_hubs.png' },
  { label: 'Your location', icon: '/location.png' },
  { label: 'Events', icon: '/Events.png' },
];

export function MapLegend() {
  return (
    <div className="surface-card flex flex-wrap gap-3 p-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-brand-gray">
          <img src={item.icon} alt="" className="size-7 object-contain" />
          {item.label}
        </div>
      ))}
    </div>
  );
}
