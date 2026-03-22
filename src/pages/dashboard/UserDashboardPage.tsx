import { Compass, HeartHandshake, MapPinned, Soup, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DonationCard } from '@/components/cards/DonationCard';
import { EventCard } from '@/components/cards/EventCard';
import { RequestCard } from '@/components/cards/RequestCard';
import { AlertBanner } from '@/components/common/AlertBanner';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StatsCard } from '@/components/common/StatsCard';
import { MiniMapPreview } from '@/components/map/MiniMapPreview';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { buildMapMarkers } from '@/utils/map';

export function UserDashboardPage() {
  const data = useAppData();
  const { donations, requests, events, organizations, profiles } = data;
  const { currentProfile } = useAuth();

  if (!currentProfile) {
    return null;
  }

  const nearbyDonations = donations.slice(0, 2);
  const myRequests = requests.filter((request) => request.profileId === currentProfile.id).slice(0, 2);
  const upcomingEvents = events.slice(0, 2);
  const mapMarkers = buildMapMarkers(data).slice(0, 6);

  return (
    <div className="space-y-6">
      <AlertBanner
        title="Public map is live"
        message="Your saved location is already used to highlight nearby donations and requests."
        tone="info"
        actionLabel="Open map"
        actionTo="/map"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Nearby food options" value={String(nearbyDonations.length)} change="Within your saved radius" icon={<Soup className="size-5" />} />
        <StatsCard label="Open requests" value={String(myRequests.length)} change="Track your latest help requests" icon={<HeartHandshake className="size-5" />} />
        <StatsCard label="Events this week" value={String(upcomingEvents.length)} change="Community pickup and distribution" icon={<Ticket className="size-5" />} tone="warning" />
        <StatsCard label="Verified pickup hubs" value={String(organizations.length)} change="Partners in your coverage map" icon={<Compass className="size-5" />} tone="success" />
      </div>

      <section className="surface-card p-6">
        <SectionHeading
          eyebrow="Quick Actions"
          title="Move fast when you need food support"
          description="The core request and discovery actions stay one tap away."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/map" className="surface-muted p-5">
            <MapPinned className="size-5 text-brand-red" />
            <h3 className="mt-4 font-display text-2xl">View Full Map</h3>
            <p className="mt-2 text-sm text-brand-gray">Browse nearby donations, requests, hubs, and events.</p>
          </Link>
          <Link to="/donations/feed" className="surface-muted p-5">
            <Soup className="size-5 text-brand-red" />
            <h3 className="mt-4 font-display text-2xl">Browse Food</h3>
            <p className="mt-2 text-sm text-brand-gray">Scan all live donations and pickup windows.</p>
          </Link>
          <Link to="/requests/new" className="surface-muted p-5">
            <HeartHandshake className="size-5 text-brand-red" />
            <h3 className="mt-4 font-display text-2xl">Create Request</h3>
            <p className="mt-2 text-sm text-brand-gray">Share what you need and where you are.</p>
          </Link>
          <Link to="/events" className="surface-muted p-5">
            <Ticket className="size-5 text-brand-red" />
            <h3 className="mt-4 font-display text-2xl">View Events</h3>
            <p className="mt-2 text-sm text-brand-gray">Find community distributions and scheduled pickups.</p>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-6">
          <SectionHeading title="Nearby food preview" description="Fresh matches around your saved location." />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {nearbyDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                organizationName={organizations.find((organization) => organization.id === donation.organizationId)?.organizationName}
                donorName={profiles.find((profile) => profile.id === donation.profileId)?.name}
              />
            ))}
          </div>
        </div>
        <div className="surface-card p-6">
          <SectionHeading title="Mini map preview" description="All markers stay synchronized with live feeds and detail pages." />
          <div className="mt-6">
            <MiniMapPreview markers={mapMarkers} center={{ lat: currentProfile.lat, lng: currentProfile.lng }} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-6">
          <SectionHeading title="Recent requests" description="Your latest food access requests and community comments." />
          <div className="mt-6 grid gap-4">
            {myRequests.map((request) => (
              <RequestCard key={request.id} request={request} requesterName={currentProfile.name} />
            ))}
          </div>
        </div>
        <div className="surface-card p-6">
          <SectionHeading title="Upcoming events" description="Register or attend nearby distribution events." />
          <div className="mt-6 grid gap-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                organizerName={organizations.find((organization) => organization.id === event.organizationId)?.organizationName}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
