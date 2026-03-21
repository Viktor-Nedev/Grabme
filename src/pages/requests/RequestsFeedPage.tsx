import { useDeferredValue, useState } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchBar } from '@/components/common/SearchBar';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RequestCard } from '@/components/cards/RequestCard';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { FOOD_CATEGORIES } from '@/utils/constants';
import { formatDistanceKm, urgencyRank } from '@/utils/formatters';

export function RequestsFeedPage() {
  const { requests, profiles } = useAppData();
  const { currentProfile } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'nearest' | 'urgent'>('urgent');
  const deferredQuery = useDeferredValue(query);

  const filtered = requests
    .filter((request) => request.status === 'active')
    .filter((request) => (category === 'all' ? true : request.foodType === category))
    .filter((request) =>
      deferredQuery
        ? `${request.title} ${request.description} ${request.locationText}`.toLowerCase().includes(deferredQuery.toLowerCase())
        : true,
    )
    .sort((left, right) => {
      if (sortBy === 'urgent') {
        return urgencyRank(right.urgency) - urgencyRank(left.urgency);
      }
      if (sortBy === 'nearest' && currentProfile) {
        const leftDistance = Number(
          formatDistanceKm(currentProfile.lat, currentProfile.lng, left.lat, left.lng).replace(' km', ''),
        );
        const rightDistance = Number(
          formatDistanceKm(currentProfile.lat, currentProfile.lng, right.lat, right.lng).replace(' km', ''),
        );
        return leftDistance - rightDistance;
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  return (
    <section className="section-shell py-10">
      <SectionHeading
        eyebrow="Requests Feed"
        title="Active food requests from the community"
        description="Sort by urgency, distance, or freshness to find the needs that should be addressed first."
      />

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <FilterBar title="Request filters">
          <div className="w-full space-y-3">
            <SearchBar value={query} onChange={setQuery} placeholder="Search requests or neighborhoods" />
            <div className="grid gap-3 md:grid-cols-2">
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                <option value="all">All categories</option>
                {FOOD_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                <option value="urgent">Most urgent</option>
                <option value="newest">Newest</option>
                <option value="nearest">Nearest</option>
              </select>
            </div>
          </div>
        </FilterBar>

        {filtered.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                requesterName={profiles.find((profile) => profile.id === request.profileId)?.name}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No requests match this filter"
            description="Try a broader search or remove distance and category limits."
          />
        )}
      </div>
    </section>
  );
}
