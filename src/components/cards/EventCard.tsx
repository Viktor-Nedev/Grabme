import { motion } from 'framer-motion';
import { useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Event } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface EventCardProps {
  event: Event;
  organizerName?: string;
}

export function EventCard({ event, organizerName }: EventCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(event.imageUrl && /^(https?:\/\/|data:image\/|\/)/.test(event.imageUrl));
  const showImage = hasImage && !imageFailed;
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="surface-card flex h-full flex-col p-5 transition"
    >
      {showImage ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          onError={() => setImageFailed(true)}
          className="mb-4 h-36 w-full rounded-2xl object-cover"
        />
      ) : null}
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
      <div className="mt-5 border-t border-brand-ink/8 pt-4">
        <p className="text-sm font-medium text-brand-gray">{organizerName ?? 'Community organizer'}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link to={`/events/${event.id}`} className="btn-primary w-full px-4 py-2 text-center text-sm">
            View Details
          </Link>
          <Link to={`/events/${event.id}?openChat=1`} className="btn-ghost w-full px-4 py-2 text-center text-sm">
            Group Chat
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
