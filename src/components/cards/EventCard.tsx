import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Event } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface EventCardProps {
  event: Event;
  organizerName?: string;
}

export function EventCard({ event, organizerName }: EventCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="surface-card flex h-full flex-col p-5 transition"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">{event.foodType}</p>
      <h3 className="mt-2 font-display text-xl">{event.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm text-brand-gray">{event.description}</p>
      <div className="mt-5 space-y-2 text-sm text-brand-gray">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-brand-red" />
          {formatDateTime(event.eventDate)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-brand-red" />
          {event.address}
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-brand-red" />
          Capacity {event.capacity}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-ink/8 pt-4">
        <p className="text-sm font-medium text-brand-gray">{organizerName ?? 'Community organizer'}</p>
        <div className="flex gap-2">
          <Link to={`/events/${event.id}`} className="btn-ghost px-4 py-2 text-sm">
            View Details
          </Link>
          <Link to={`/map?focus=event:${event.id}`} className="btn-primary px-4 py-2 text-sm">
            View on Map
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
