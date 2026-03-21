import { CalendarClock, MapPin, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Donation } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface DonationCardProps {
  donation: Donation;
  organizationName?: string;
}

export function DonationCard({ donation, organizationName }: DonationCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">{donation.category}</p>
          <h3 className="mt-2 font-display text-xl">{donation.title}</h3>
        </div>
        <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-semibold text-brand-ink">
          Active
        </span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-brand-gray">{donation.description}</p>
      <div className="mt-5 space-y-2 text-sm text-brand-gray">
        <div className="flex items-center gap-2">
          <PackageOpen className="size-4 text-brand-red" />
          {donation.quantity}
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-brand-red" />
          Expires {formatDateTime(donation.expiryDate)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-brand-red" />
          {donation.pickupAddress}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-ink/8 pt-4">
        <p className="text-sm font-medium text-brand-gray">{organizationName ?? 'Community partner'}</p>
        <div className="flex gap-2">
          <Link to={`/donations/${donation.id}`} className="btn-ghost px-4 py-2 text-sm">
            View Details
          </Link>
          <Link to={`/map?focus=donation:${donation.id}`} className="btn-primary px-4 py-2 text-sm">
            View on Map
          </Link>
        </div>
      </div>
    </article>
  );
}
