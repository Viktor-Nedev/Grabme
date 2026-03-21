import { Link, useParams } from 'react-router-dom';
import { MapPinned, Navigation, PackageOpen } from 'lucide-react';
import { MiniMapPreview } from '@/components/map/MiniMapPreview';
import { RoleBadge } from '@/components/common/RoleBadge';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import { buildNavigationUrl } from '@/utils/map';
import { formatDateTime } from '@/utils/formatters';

export function DonationDetailsPage() {
  const { id } = useParams();
  const protectedNavigate = useProtectedNavigation();
  const { donations, organizations } = useAppData();
  const donation = donations.find((entry) => entry.id === id);
  const organization = organizations.find((entry) => entry.id === donation?.organizationId);

  if (!donation || !organization) {
    return null;
  }

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-8">
          <RoleBadge role="organization" verified={organization.verified} />
          <SectionHeading
            eyebrow={donation.category}
            title={donation.title}
            description={donation.description}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Quantity</p>
              <p className="mt-2 font-semibold">{donation.quantity}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Expiry</p>
              <p className="mt-2 font-semibold">{formatDateTime(donation.expiryDate)}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Available from</p>
              <p className="mt-2 font-semibold">{formatDateTime(donation.availableFrom)}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Available until</p>
              <p className="mt-2 font-semibold">{formatDateTime(donation.availableUntil)}</p>
            </div>
            <div className="surface-muted p-4 md:col-span-2">
              <p className="text-sm text-brand-gray">Storage + notes</p>
              <p className="mt-2 font-semibold">{donation.storageType}</p>
              <p className="mt-2 text-sm text-brand-gray">{donation.notes}</p>
            </div>
            <div className="surface-muted p-4 md:col-span-2">
              <p className="text-sm text-brand-gray">Pickup location</p>
              <p className="mt-2 font-semibold">{donation.pickupAddress}</p>
              <p className="mt-2 text-sm text-brand-gray">{organization.organizationName}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <MiniMapPreview
              markers={[
                {
                  id: `donation-${donation.id}`,
                  entityId: donation.id,
                  type: 'donation',
                  title: donation.title,
                  description: donation.description,
                  locationText: donation.pickupAddress,
                  color: 'yellow',
                  detailRoute: `/donations/${donation.id}`,
                  navigationLabel: organization.organizationName,
                  meta: 'Available donation',
                  lat: donation.lat,
                  lng: donation.lng,
                },
              ]}
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={`/map?focus=donation:${donation.id}`} className="btn-primary">
                <MapPinned className="size-4" />
                View on Map
              </Link>
              <a
                href={buildNavigationUrl(donation.pickupAddress, donation.lat, donation.lng)}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <Navigation className="size-4" />
                Navigate
              </a>
              <button type="button" onClick={() => protectedNavigate('/profile')} className="btn-secondary">
                <PackageOpen className="size-4" />
                Claim Pickup
              </button>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gray">Organization</p>
            <h3 className="mt-3 font-display text-2xl">{organization.organizationName}</h3>
            <p className="mt-2 text-sm text-brand-gray">{organization.organizationType}</p>
            <p className="mt-4 text-sm text-brand-gray">{organization.operatingHours}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
