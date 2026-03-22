import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPinned,
  PackageOpen,
  PlusCircle,
  Sparkles,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { MiniMapPreview } from '@/components/map/MiniMapPreview';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { buildMapMarkers } from '@/utils/map';
import { formatDateTime, isExpiringSoon, timeFromNow, urgencyRank, urgencyTone } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';

export function OrganizationDashboardPage() {
  const data = useAppData();
  const { donations, requests, events, eventParticipants } = data;
  const { currentOrganization } = useAuth();

  if (!currentOrganization) {
    return null;
  }

  const orgDonations = donations.filter((donation) => donation.organizationId === currentOrganization.id);
  const activeDonations = orgDonations.filter((donation) => donation.status === 'active');
  const expiringSoon = activeDonations
    .filter((donation) => isExpiringSoon(donation.expiryDate, 48))
    .sort((left, right) => new Date(left.expiryDate).getTime() - new Date(right.expiryDate).getTime());
  const urgentRequests = requests
    .filter((request) => request.status === 'active')
    .filter((request) => request.urgency === 'high' || request.urgency === 'critical')
    .sort((left, right) => urgencyRank(right.urgency) - urgencyRank(left.urgency));
  const orgEvents = events.filter((event) => event.organizationId === currentOrganization.id);
  const upcomingEvents = orgEvents
    .filter((event) => new Date(event.eventDate).getTime() >= Date.now())
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime());
  const orgEventIds = new Set(orgEvents.map((event) => event.id));
  const totalParticipants = eventParticipants.filter((participant) => orgEventIds.has(participant.eventId)).length;
  const totalRequests = requests.length;
  const fulfilledRequests = requests.filter((request) => request.status !== 'active').length;
  const fulfillmentRate = totalRequests ? Math.round((fulfilledRequests / totalRequests) * 100) : 0;
  const recentDonations = [...orgDonations]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 3);
  const latestRequests = [...requests]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 4);

  const orgMarkers = buildMapMarkers(data).filter((marker) => {
    if (marker.type === 'donation') {
      return orgDonations.some((donation) => donation.id === marker.entityId);
    }
    if (marker.type === 'event') {
      return orgEvents.some((event) => event.id === marker.entityId);
    }
    if (marker.type === 'request') {
      return urgentRequests.some((request) => request.id === marker.entityId);
    }
    return false;
  });

  return (
    <div className="space-y-8">
      <section className="surface-card p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">Organization dashboard</p>
            <h1 className="mt-3 font-display text-3xl">{currentOrganization.organizationName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-brand-gray">
              Real-time operational view across your donations, requests, and community events.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.donationNew} className="btn-primary px-4 py-2 text-sm">
              <PlusCircle className="size-4" />
              New Donation
            </Link>
            <Link to={ROUTES.eventNew} className="btn-ghost px-4 py-2 text-sm">
              <CalendarDays className="size-4" />
              Create Event
            </Link>
            <Link to={ROUTES.map} className="btn-ghost px-4 py-2 text-sm">
              <MapPinned className="size-4" />
              Open Map
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            label: 'Active donations',
            value: activeDonations.length,
            detail: `${orgDonations.length} total created`,
            icon: <PackageOpen className="size-5" />,
            tone: 'bg-brand-yellow/20 text-brand-red',
          },
          {
            label: 'Expiring in 48h',
            value: expiringSoon.length,
            detail: 'Needs priority routing',
            icon: <Clock3 className="size-5" />,
            tone: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Urgent requests',
            value: urgentRequests.length,
            detail: 'High & critical priority',
            icon: <AlertTriangle className="size-5" />,
            tone: 'bg-red-50 text-red-600',
          },
          {
            label: 'Upcoming events',
            value: upcomingEvents.length,
            detail: `${orgEvents.length} events total`,
            icon: <CalendarDays className="size-5" />,
            tone: 'bg-brand-yellow/20 text-brand-red',
          },
          {
            label: 'People attending',
            value: totalParticipants,
            detail: 'Across your event schedule',
            icon: <Users className="size-5" />,
            tone: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Fulfillment rate',
            value: `${fulfillmentRate}%`,
            detail: `${fulfilledRequests} completed requests`,
            icon: <CheckCircle2 className="size-5" />,
            tone: 'bg-emerald-50 text-emerald-600',
          },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-brand-gray">{stat.label}</p>
                <p className="mt-3 font-display text-3xl text-brand-ink">{stat.value}</p>
              </div>
              <div className={`rounded-2xl p-3 ${stat.tone}`}>{stat.icon}</div>
            </div>
            <p className="mt-4 text-sm font-medium text-brand-gray">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Action queue"
            title="Urgent requests in your coverage"
            description="These community needs require immediate attention."
          />
          <div className="mt-6 space-y-3">
            {urgentRequests.slice(0, 4).map((request) => (
              <Link
                key={request.id}
                to={`/requests/${request.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-brand-ink/10 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-brand-red/30"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${urgencyTone(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                    <p className="text-xs text-brand-gray">{timeFromNow(request.createdAt)}</p>
                  </div>
                  <p className="mt-2 font-semibold">{request.title}</p>
                  <p className="mt-1 text-sm text-brand-gray">{request.locationText}</p>
                </div>
                <Sparkles className="size-4 text-brand-red" />
              </Link>
            ))}
            {!urgentRequests.length ? (
              <EmptyState
                title="No urgent requests right now"
                description="New requests will appear here as soon as they are posted."
              />
            ) : null}
          </div>
        </div>

        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Inventory risk"
            title="Donations expiring soon"
            description="Move these items to distribution partners first."
          />
          <div className="mt-6 space-y-3">
            {expiringSoon.slice(0, 4).map((donation) => (
              <Link
                key={donation.id}
                to={`/donations/${donation.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-brand-ink/10 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-brand-yellow/40"
              >
                <div>
                  <p className="font-semibold">{donation.title}</p>
                  <p className="mt-1 text-sm text-brand-gray">{donation.pickupAddress}</p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {formatDateTime(donation.expiryDate)}
                </span>
              </Link>
            ))}
            {!expiringSoon.length ? (
              <EmptyState
                title="No expiring donations"
                description="All active donations are safely within their pickup windows."
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Upcoming events"
            title="Next distribution moments"
            description="Track your schedule and attendance from one place."
          />
          <div className="mt-6 space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => {
              const participants = eventParticipants.filter((participant) => participant.eventId === event.id).length;
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-brand-ink/10 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-brand-red/20"
                >
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 text-sm text-brand-gray">{formatDateTime(event.eventDate)}</p>
                    <p className="mt-1 text-sm text-brand-gray">{event.address}</p>
                  </div>
                  <div className="text-right text-sm text-brand-gray">
                    <p className="font-semibold text-brand-ink">{participants} attending</p>
                    <p>{event.capacity} capacity</p>
                  </div>
                </Link>
              );
            })}
            {!upcomingEvents.length ? (
              <EmptyState
                title="No upcoming events"
                description="Create a new community event to activate your network."
                action={
                  <Link to={ROUTES.eventNew} className="btn-primary px-4 py-2 text-sm">
                    <PlusCircle className="size-4" />
                    Create event
                  </Link>
                }
              />
            ) : null}
          </div>
        </div>

        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Live snapshot"
            title="Your coverage view"
            description="Live markers for your donations, events, and urgent requests."
          />
          <div className="mt-6">
            <MiniMapPreview
              markers={orgMarkers.slice(0, 10)}
              center={{ lat: currentOrganization.lat, lng: currentOrganization.lng }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Recent donations"
            title="Latest contributions posted"
            description="Keep track of what your team added most recently."
          />
          <div className="mt-6 space-y-3">
            {recentDonations.map((donation) => (
              <Link
                key={donation.id}
                to={`/donations/${donation.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-brand-ink/10 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-brand-yellow/40"
              >
                <div>
                  <p className="font-semibold">{donation.title}</p>
                  <p className="mt-1 text-sm text-brand-gray">{donation.quantity}</p>
                </div>
                <p className="text-sm text-brand-gray">{timeFromNow(donation.createdAt)}</p>
              </Link>
            ))}
            {!recentDonations.length ? (
              <EmptyState
                title="No donations yet"
                description="Start by creating your first donation for the community."
              />
            ) : null}
          </div>
        </div>

        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Latest requests"
            title="Newest community needs"
            description="Monitor fresh requests across the platform."
          />
          <div className="mt-6 space-y-3">
            {latestRequests.map((request) => (
              <Link
                key={request.id}
                to={`/requests/${request.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-brand-ink/10 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-brand-red/20"
              >
                <div>
                  <p className="font-semibold">{request.title}</p>
                  <p className="mt-1 text-sm text-brand-gray">{request.locationText}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${urgencyTone(request.urgency)}`}>
                  {request.urgency.toUpperCase()}
                </span>
              </Link>
            ))}
            {!latestRequests.length ? (
              <EmptyState
                title="No requests yet"
                description="Requests will appear as soon as community members post them."
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
