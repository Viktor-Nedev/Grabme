import { Clock3, MapPin, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FoodRequest } from '@/types';
import { timeFromNow, urgencyTone } from '@/utils/formatters';

interface RequestCardProps {
  request: FoodRequest;
  requesterName?: string;
}

export function RequestCard({ request, requesterName }: RequestCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${urgencyTone(request.urgency)}`}>
            {request.urgency.toUpperCase()}
          </span>
          <h3 className="mt-3 font-display text-xl">{request.title}</h3>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-brand-gray">{request.description}</p>
      <div className="mt-5 space-y-2 text-sm text-brand-gray">
        <div className="flex items-center gap-2">
          <UsersRound className="size-4 text-brand-red" />
          {request.peopleCount} people
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-brand-red" />
          Posted {timeFromNow(request.createdAt)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-brand-red" />
          {request.locationText}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-ink/8 pt-4">
        <p className="text-sm font-medium text-brand-gray">{requesterName ?? 'Community member'}</p>
        <div className="flex gap-2">
          <Link to={`/requests/${request.id}`} className="btn-ghost px-4 py-2 text-sm">
            View Details
          </Link>
          <Link to={`/map?focus=request:${request.id}`} className="btn-primary px-4 py-2 text-sm">
            View on Map
          </Link>
        </div>
      </div>
    </article>
  );
}
