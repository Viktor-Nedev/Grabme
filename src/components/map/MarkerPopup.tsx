import { motion } from 'framer-motion';
import { ArrowUpRight, MessageCircle, Navigation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MapMarker } from '@/types';
import { buildNavigationUrl } from '@/utils/map';

export function MarkerPopup({ marker, onClose }: { marker: MapMarker; onClose?: () => void }) {
  const canChat = marker.type === 'donation' || marker.type === 'request' || marker.type === 'event';
  const chatRoute = `${marker.detailRoute}${marker.detailRoute.includes('?') ? '&' : '?'}openChat=1`;

  return (
    <motion.div
      className="surface-card absolute inset-x-4 bottom-4 z-20 border-white/80 p-4 shadow-[var(--shadow-soft)] md:inset-x-auto md:right-4 md:w-80"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full border border-brand-ink/10 bg-white/80 p-1.5 text-brand-gray transition hover:text-brand-ink"
        aria-label="Close details"
      >
        <X className="size-4" />
      </button>
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
      {canChat ? (
        <Link to={chatRoute} className="btn-ghost mt-2 w-full px-4 py-2 text-sm">
          <MessageCircle className="size-4" />
          Chat
        </Link>
      ) : null}
    </motion.div>
  );
}
