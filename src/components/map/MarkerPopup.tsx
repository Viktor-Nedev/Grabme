import { ArrowUpRight, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MapMarker } from '@/types';
import { buildNavigationUrl } from '@/utils/map';

export function MarkerPopup({ marker }: { marker: MapMarker }) {
  return (
    <div className="surface-card absolute inset-x-4 bottom-4 z-20 border-white/80 p-4 shadow-[var(--shadow-soft)] md:inset-x-auto md:right-4 md:w-80">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">{marker.meta}</p>
      <h3 className="mt-2 font-display text-xl">{marker.title}</h3>
      <p className="mt-2 text-sm text-brand-gray">{marker.description}</p>
      <div className="mt-4 rounded-2xl bg-brand-cream/70 p-3 text-sm text-brand-gray">
        <p className="font-semibold text-brand-ink">{marker.navigationLabel}</p>
        <p className="mt-1">{marker.locationText}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Link to={marker.detailRoute} className="btn-primary flex-1 px-4 py-2 text-sm">
          <ArrowUpRight className="size-4" />
          View Details
        </Link>
        <a
          href={buildNavigationUrl(marker.locationText, marker.lat, marker.lng)}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost flex-1 px-4 py-2 text-sm"
        >
          <Navigation className="size-4" />
          Navigate
        </a>
      </div>
    </div>
  );
}
