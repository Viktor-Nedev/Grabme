import { useEffect, useState } from 'react';
import { Clock3, MapPinned, Plus, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AlertBanner } from '@/components/common/AlertBanner';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchBar } from '@/components/common/SearchBar';
import { SectionHeading } from '@/components/common/SectionHeading';
import { MapLegend } from '@/components/map/MapLegend';
import { MapSurface } from '@/components/map/MapSurface';
import { MapboxMap } from '@/components/map/MapboxMap';
import { MarkerPopup } from '@/components/map/MarkerPopup';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import { FOOD_CATEGORIES } from '@/utils/constants';
import { formatDistanceKm, isExpiringSoon } from '@/utils/formatters';
import { buildMapMarkers } from '@/utils/map';
import type { MapMarker } from '@/types';

export function MapPage() {
  const data = useAppData();
  const { donations, requests, organizations, events, profiles, aiInsights } = data;
  const { currentProfile, isAuthenticated } = useAuth();
  const protectedNavigate = useProtectedNavigation();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get('focus');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showDonations, setShowDonations] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showOrganizations, setShowOrganizations] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [nearMeOnly, setNearMeOnly] = useState(false);
  const [category, setCategory] = useState('all');
  const [mapStyle, setMapStyle] = useState<'custom' | 'satellite'>('custom');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'>(
    'idle',
  );
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const markers = buildMapMarkers({ profiles, organizations, donations, requests, events, comments: [], aiInsights }, currentProfile);
  const liveLocationMarker: MapMarker | null = userCoords
    ? {
        id: 'marker-live-location',
        entityId: 'live-location',
        type: 'user-location',
        title: 'Your live location',
        description: 'Shared from your device for nearby matches.',
        locationText: 'Live device location',
        color: 'blue',
        detailRoute: '/profile',
        navigationLabel: 'Your location',
        meta: 'Live location',
        lat: userCoords.lat,
        lng: userCoords.lng,
      }
    : null;
  const markersWithLive = liveLocationMarker ? [...markers, liveLocationMarker] : markers;

  const filteredMarkers = markersWithLive.filter((marker) => {
    if (marker.type === 'donation' && !showDonations) return false;
    if (marker.type === 'request' && !showRequests) return false;
    if (marker.type === 'organization' && !showOrganizations) return false;
    if (marker.type === 'event' && !showEvents) return false;
    if (urgentOnly && marker.color !== 'red') return false;
    if (expiringOnly && marker.type === 'donation') {
      const donation = donations.find((item) => item.id === marker.entityId);
      return donation ? isExpiringSoon(donation.expiryDate, 48) : false;
    }
    const origin = userCoords ?? (currentProfile ? { lat: currentProfile.lat, lng: currentProfile.lng } : null);
    if (nearMeOnly && origin) {
      const distance = Number(formatDistanceKm(origin.lat, origin.lng, marker.lat, marker.lng).replace(' km', ''));
      if (distance > 4) return false;
    }
    if (nearMeOnly && !origin) return false;
    if (category !== 'all') {
      if (marker.type === 'donation') {
        return donations.find((item) => item.id === marker.entityId)?.category === category;
      }
      if (marker.type === 'request') {
        return requests.find((item) => item.id === marker.entityId)?.foodType === category;
      }
      if (marker.type === 'event') {
        return events.find((item) => item.id === marker.entityId)?.foodType === category;
      }
    }
    if (query) {
      return `${marker.title} ${marker.description} ${marker.locationText}`.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  useEffect(() => {
    if (!focus) {
      return;
    }

    const [type, entityId] = focus.split(':');
    const focusedMarker = filteredMarkers.find((marker) => marker.type === type && marker.entityId === entityId);
    if (focusedMarker) {
      setSelectedId(focusedMarker.id);
      return;
    }

    setSelectedId(filteredMarkers[0]?.id ?? null);
  }, [filteredMarkers, focus]);

  const activeMarker = selectedId ? filteredMarkers.find((marker) => marker.id === selectedId) ?? null : null;
  const hasMapbox = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);
  const styleUrl =
    mapStyle === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/vikdev/cmlo8l453002c01qu7avs7rf3';

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section className="section-shell py-10">
      <SectionHeading
        eyebrow="Public Map"
        title="Live view of donations, requests, organizations, and events"
        description="This map stays visible to everyone. Protected actions still require login."
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => protectedNavigate('/requests/new')} className="btn-primary">
              <Plus className="size-4" />
              Create Request
            </button>
            <button type="button" onClick={() => protectedNavigate('/donations/new')} className="btn-secondary">
              Donate Food
            </button>
            <button type="button" onClick={() => protectedNavigate('/events/new')} className="btn-ghost">
              Join or Create Event
            </button>
          </div>
        }
      />

      {!isAuthenticated ? (
        <div className="mt-6">
          <AlertBanner
            title="Public preview mode"
            message="You can browse markers and open detail pages. Creating requests, donations, and event actions redirect to login."
            tone="info"
          />
        </div>
      ) : null}
      {!locationPromptDismissed ? (
        <div className="mt-4">
          <AlertBanner
            title="Share your location?"
            message="Enable live location to see yourself on the map and filter nearby items."
            tone="info"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestLocation}
              className="btn-secondary px-4 py-2 text-sm"
              disabled={locationStatus === 'requesting'}
            >
              {locationStatus === 'requesting' ? 'Requesting...' : 'Share location'}
            </button>
            <button
              type="button"
              onClick={() => setLocationPromptDismissed(true)}
              className="btn-ghost px-4 py-2 text-sm"
            >
              Not now
            </button>
          </div>
          {locationStatus === 'denied' ? (
            <p className="mt-2 text-xs text-red-600">Location access denied. You can enable it in your browser settings.</p>
          ) : null}
          {locationStatus === 'unsupported' ? (
            <p className="mt-2 text-xs text-red-600">Geolocation is not supported by this browser.</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.32fr_0.68fr]">
        <div className="space-y-4">
          <FilterBar title="Map controls">
            <div className="w-full space-y-3">
              <SearchBar value={query} onChange={setQuery} placeholder="Search markers or locations" />
              <div className="grid gap-3">
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    { label: 'Donations', value: showDonations, setter: setShowDonations },
                    { label: 'Requests', value: showRequests, setter: setShowRequests },
                    { label: 'Organizations', value: showOrganizations, setter: setShowOrganizations },
                    { label: 'Events', value: showEvents, setter: setShowEvents },
                  ].map((item) => (
                    <label key={item.label} className="flex items-center gap-3 rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                      <input type="checkbox" checked={item.value} onChange={() => item.setter((value: boolean) => !value)} />
                      {item.label}
                    </label>
                  ))}
                </div>
                <div className="grid gap-2">
                  <label className="flex items-center gap-3 rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                    <input type="checkbox" checked={urgentOnly} onChange={() => setUrgentOnly((value) => !value)} />
                    Urgent only
                  </label>
                  <label className="flex items-center gap-3 rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                    <input type="checkbox" checked={expiringOnly} onChange={() => setExpiringOnly((value) => !value)} />
                    Expiring soon
                  </label>
                  <label className="flex items-center gap-3 rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={nearMeOnly}
                      onChange={() => setNearMeOnly((value) => !value)}
                      disabled={!currentProfile && !userCoords}
                    />
                    Near me
                  </label>
                </div>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                  <option value="all">All categories</option>
                  {FOOD_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-3 rounded-full border border-brand-ink/10 bg-white px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={mapStyle === 'satellite'}
                    onChange={() => setMapStyle((value) => (value === 'satellite' ? 'custom' : 'satellite'))}
                  />
                  Satellite mode
                </label>
              </div>
            </div>
          </FilterBar>

          <MapLegend />

          <div className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand-ink">Visible markers</p>
                <p className="text-sm text-brand-gray">{filteredMarkers.length} items on the live map</p>
              </div>
              <div className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-semibold text-brand-ink">
                Public access
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {filteredMarkers.slice(0, 6).map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => setSelectedId(marker.id)}
                  className={`w-full rounded-[20px] border px-4 py-3 text-left transition ${
                    activeMarker?.id === marker.id ? 'border-brand-red bg-brand-red/5' : 'border-brand-ink/8 bg-white'
                  }`}
                >
                  <p className="font-semibold">{marker.title}</p>
                  <p className="mt-1 text-sm text-brand-gray">{marker.locationText}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">{marker.meta}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand-red" />
              <p className="font-semibold">Operational insight</p>
            </div>
            <p className="mt-3 text-sm text-brand-gray">
              {aiInsights.smartRecommendations[0] ?? 'No AI insights yet. Add requests or donations to generate signals.'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-brand-gray">
              <Clock3 className="size-4 text-brand-red" />
              Refreshed from the same live state as feeds and dashboards.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {hasMapbox ? (
            <div className="relative">
              <MapboxMap
                markers={filteredMarkers}
                selectedId={selectedId}
                onSelect={(marker: MapMarker) => setSelectedId(marker.id)}
                className="h-[720px]"
                styleUrl={styleUrl}
              />
              {activeMarker ? <MarkerPopup marker={activeMarker} onClose={() => setSelectedId(null)} /> : null}
            </div>
          ) : (
            <MapSurface
              markers={filteredMarkers}
              selectedId={selectedId}
              onSelect={(marker: MapMarker) => setSelectedId(marker.id)}
              className="h-[720px]"
            />
          )}
          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <MapPinned className="size-4 text-brand-red" />
              <p className="font-semibold">Map-ready structure</p>
            </div>
            <p className="mt-3 text-sm text-brand-gray">
              This implementation uses a structured placeholder map surface. Swap the marker renderer for Mapbox later without changing page-level state, marker data, or protected action logic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
