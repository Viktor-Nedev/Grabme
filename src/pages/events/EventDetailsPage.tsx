import { Link, useParams } from 'react-router-dom';
import { CalendarDays, MapPinned, Navigation, Users } from 'lucide-react';
import { MiniMapPreview } from '@/components/map/MiniMapPreview';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import { formatDateTime } from '@/utils/formatters';
import { buildNavigationUrl } from '@/utils/map';

export function EventDetailsPage() {
  const { id } = useParams();
  const protectedNavigate = useProtectedNavigation();
  const { events, organizations } = useAppData();
  const event = events.find((entry) => entry.id === id);
  const organization = organizations.find((entry) => entry.id === event?.organizationId);

  if (!event || !organization) {
    return null;
  }

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-8">
          <SectionHeading eyebrow={event.foodType} title={event.title} description={event.description} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Organizer</p>
              <p className="mt-2 font-semibold">{organization.organizationName}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Date and time</p>
              <p className="mt-2 font-semibold">{formatDateTime(event.eventDate)}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Capacity</p>
              <p className="mt-2 font-semibold">{event.capacity}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Status</p>
              <p className="mt-2 font-semibold capitalize">{event.status}</p>
            </div>
            <div className="surface-muted p-4 md:col-span-2">
              <p className="text-sm text-brand-gray">Location</p>
              <p className="mt-2 font-semibold">{event.address}</p>
              <p className="mt-2 text-sm text-brand-gray">{event.notes}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <MiniMapPreview
              markers={[
                {
                  id: `event-${event.id}`,
                  entityId: event.id,
                  type: 'event',
                  title: event.title,
                  description: event.description,
                  locationText: event.address,
                  color: 'purple',
                  detailRoute: `/events/${event.id}`,
                  navigationLabel: organization.organizationName,
                  meta: 'Community event',
                  lat: event.lat,
                  lng: event.lng,
                },
              ]}
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={`/map?focus=event:${event.id}`} className="btn-primary">
                <MapPinned className="size-4" />
                View on Map
              </Link>
              <a href={buildNavigationUrl(event.address, event.lat, event.lng)} target="_blank" rel="noreferrer" className="btn-ghost">
                <Navigation className="size-4" />
                Navigate
              </a>
              <button type="button" onClick={() => protectedNavigate('/profile')} className="btn-secondary">
                <Users className="size-4" />
                Join / Register
              </button>
            </div>
          </div>
          <div className="surface-card p-6">
            <div className="flex items-center gap-3 text-brand-red">
              <CalendarDays className="size-5" />
              <p className="font-semibold">Distribution snapshot</p>
            </div>
            <p className="mt-3 text-sm text-brand-gray">
              This event is visible on the public map so community members can discover it even before they log in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
