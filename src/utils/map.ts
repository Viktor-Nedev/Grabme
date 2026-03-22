import { isExpiringSoon } from '@/utils/formatters';
import type { AppDataset, Coordinates, Donation, Event, FoodRequest, MapMarker, Organization, Profile } from '@/types';

export function projectToMap(
  point: Coordinates,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = 100 - ((point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;

  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(94, Math.max(6, y)),
  };
}

function donationMarker(donation: Donation, organization?: Organization, profile?: Profile): MapMarker {
  const expiring = isExpiringSoon(donation.expiryDate);
  return {
    id: `marker-${donation.id}`,
    entityId: donation.id,
    type: 'donation',
    title: donation.title,
    description: donation.description,
    locationText: donation.pickupAddress,
    color: expiring ? 'red' : 'yellow',
    detailRoute: `/donations/${donation.id}`,
    navigationLabel: organization?.organizationName ?? profile?.name ?? 'Pickup point',
    meta: expiring ? 'Expiring soon' : 'Donation available',
    lat: donation.lat,
    lng: donation.lng,
  };
}

function requestMarker(request: FoodRequest, profile?: Profile): MapMarker {
  return {
    id: `marker-${request.id}`,
    entityId: request.id,
    type: 'request',
    title: request.title,
    description: request.description,
    locationText: request.locationText,
    color: request.urgency === 'critical' || request.urgency === 'high' ? 'red' : 'yellow',
    detailRoute: `/requests/${request.id}`,
    navigationLabel: profile?.name ?? 'Community request',
    meta: `${request.urgency.toUpperCase()} need`,
    lat: request.lat,
    lng: request.lng,
  };
}

function organizationMarker(organization: Organization): MapMarker {
  return {
    id: `marker-${organization.id}`,
    entityId: organization.id,
    type: 'organization',
    title: organization.organizationName,
    description: organization.organizationType,
    locationText: organization.address,
    color: 'green',
    detailRoute: '/dashboard/org',
    navigationLabel: 'Verified organization',
    meta: organization.verified ? 'Verified partner' : 'Community partner',
    lat: organization.lat,
    lng: organization.lng,
  };
}

function eventMarker(event: Event, organization?: Organization): MapMarker {
  return {
    id: `marker-${event.id}`,
    entityId: event.id,
    type: 'event',
    title: event.title,
    description: event.description,
    locationText: event.address,
    color: 'purple',
    detailRoute: `/events/${event.id}`,
    navigationLabel: organization?.organizationName ?? 'Community event',
    meta: 'Distribution event',
    lat: event.lat,
    lng: event.lng,
  };
}

export function buildMapMarkers(data: AppDataset): MapMarker[] {
  const donationMarkers = data.donations
    .filter((donation) => donation.status === 'active')
    .map((donation) =>
      donationMarker(
        donation,
        data.organizations.find((organization) => organization.id === donation.organizationId),
        data.profiles.find((profile) => profile.id === donation.profileId),
      ),
    );

  const requestMarkers = data.requests
    .filter((request) => request.status === 'active')
    .map((request) =>
      requestMarker(request, data.profiles.find((profile) => profile.id === request.profileId)),
    );

  const organizationMarkers = data.organizations
    .filter((organization) => organization.showOnMap)
    .map(organizationMarker);
  const eventMarkers = data.events
    .filter((event) => event.status !== 'completed')
    .map((event) =>
      eventMarker(event, data.organizations.find((organization) => organization.id === event.organizationId)),
    );

  const markers = [...donationMarkers, ...requestMarkers, ...organizationMarkers, ...eventMarkers];

  return markers;
}

export function buildNavigationUrl(locationText: string, lat: number, lng: number) {
  const query = encodeURIComponent(`${locationText} ${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getMarkerIcon(marker: MapMarker) {
  if (marker.type === 'user-location') {
    return '/location.png';
  }
  if (marker.type === 'organization') {
    return '/Organizations_and_pickup_hubs.png';
  }
  if (marker.type === 'event') {
    return '/Events.png';
  }
  if (marker.type === 'donation') {
    return marker.color === 'red' ? '/Urgent_requests_or_expiring_food.png' : '/Available_donations.png';
  }
  if (marker.type === 'request') {
    return '/Urgent_requests_or_expiring_food.png';
  }
  return '/Available_donations.png';
}
