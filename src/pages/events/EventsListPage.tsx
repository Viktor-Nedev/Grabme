import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchBar } from '@/components/common/SearchBar';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EventCard } from '@/components/cards/EventCard';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

export function EventsListPage() {
  const { events, organizations } = useAppData();
  const { currentProfile } = useAuth();
  const [query, setQuery] = useState('');
  const [organizer, setOrganizer] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const deferredQuery = useDeferredValue(query);

  const filtered = events
    .filter((event) => (organizer === 'all' ? true : event.organizationId === organizer))
    .filter((event) => {
      if (dateFilter === 'all') {
        return true;
      }
      const days = Number(dateFilter);
      const eventDate = new Date(event.eventDate).getTime();
      const cutoff = Date.now() + days * 24 * 60 * 60 * 1000;
      return eventDate <= cutoff;
    })
    .filter((event) =>
      deferredQuery
        ? `${event.title} ${event.description} ${event.address}`.toLowerCase().includes(deferredQuery.toLowerCase())
        : true,
    )
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime());

  return (
    <section className="section-shell py-10">
      <SectionHeading
        eyebrow="Community Events"
        title="Upcoming food distribution and support events"
        description="Explore pop-up distributions, pantry nights, school pickups, and local food rescue activations."
        action={
          currentProfile?.role === 'organization' ? (
            <Link to={ROUTES.eventNew} className="btn-primary">
              Create Event
            </Link>
          ) : null
        }
      />
      <div className="mt-8 grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <FilterBar title="Event filters">
          <div className="w-full space-y-3">
            <SearchBar value={query} onChange={setQuery} placeholder="Search events or locations" />
            <div className="grid gap-3 md:grid-cols-2">
              <select value={organizer} onChange={(event) => setOrganizer(event.target.value)} className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                <option value="all">All organizers</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.organizationName}
                  </option>
                ))}
              </select>
              <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                <option value="all">Any date</option>
                <option value="3">Next 3 days</option>
                <option value="7">Next 7 days</option>
                <option value="14">Next 14 days</option>
              </select>
            </div>
          </div>
        </FilterBar>

        {filtered.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                organizerName={organizations.find((organization) => organization.id === event.organizationId)?.organizationName}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No events found" description="Try another organizer, a wider date range, or a different search term." />
        )}
      </div>
    </section>
  );
}
