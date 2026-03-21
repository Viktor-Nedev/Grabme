import { useDeferredValue, useState } from 'react';
import { DonationCard } from '@/components/cards/DonationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchBar } from '@/components/common/SearchBar';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { FOOD_CATEGORIES } from '@/utils/constants';
import { formatDistanceKm, isExpiringSoon } from '@/utils/formatters';

export function DonationFeedPage() {
  const { donations, organizations } = useAppData();
  const { currentProfile } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [organizationId, setOrganizationId] = useState('all');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'expiring' | 'newest'>('newest');
  const deferredQuery = useDeferredValue(query);

  const filtered = donations
    .filter((donation) => donation.status === 'active')
    .filter((donation) => (category === 'all' ? true : donation.category === category))
    .filter((donation) => (organizationId === 'all' ? true : donation.organizationId === organizationId))
    .filter((donation) => (showExpiringSoon ? isExpiringSoon(donation.expiryDate, 48) : true))
    .filter((donation) =>
      deferredQuery
        ? `${donation.title} ${donation.description} ${donation.pickupAddress}`.toLowerCase().includes(deferredQuery.toLowerCase())
        : true,
    )
    .sort((left, right) => {
      if (sortBy === 'expiring') {
        return new Date(left.expiryDate).getTime() - new Date(right.expiryDate).getTime();
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
        eyebrow="Donation Feed"
        title="Available food donations across the network"
        description="Filter by food type, expiry pressure, nearest pickups, or organization to find the right distribution opportunity."
      />

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <FilterBar title="Donation filters">
          <div className="w-full space-y-3">
            <SearchBar value={query} onChange={setQuery} placeholder="Search donations or pickup points" />
            <div className="grid gap-3 md:grid-cols-2">
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                <option value="all">All food types</option>
                {FOOD_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value)}
                className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm"
              >
                <option value="all">All organizations</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.organizationName}
                  </option>
                ))}
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                <option value="newest">Newest</option>
                <option value="expiring">Expiring soon</option>
                <option value="nearest">Nearest</option>
              </select>
              <label className="flex items-center gap-3 rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                <input type="checkbox" checked={showExpiringSoon} onChange={() => setShowExpiringSoon((value) => !value)} />
                Expiring within 48 hours
              </label>
            </div>
          </div>
        </FilterBar>

        {filtered.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                organizationName={organizations.find((organization) => organization.id === donation.organizationId)?.organizationName}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No donations match this filter"
            description="Try widening the radius, removing expiry pressure, or checking another food category."
          />
        )}
      </div>
    </section>
  );
}
