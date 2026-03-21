import type { Coordinates, MapMarker } from '@/types';
import { MapSurface } from '@/components/map/MapSurface';

export function MiniMapPreview({
  markers,
  center,
}: {
  markers: MapMarker[];
  center?: Coordinates;
}) {
  const enrichedMarkers = center
    ? [
        ...markers,
      {
        id: 'preview-center',
        entityId: 'preview-center',
        type: 'user-location' as const,
        title: 'Reference point',
        description: 'Approximate saved location',
        locationText: 'Saved location',
          color: 'blue' as const,
          detailRoute: '/profile',
          navigationLabel: 'Reference',
          meta: 'Reference point',
          lat: center.lat,
          lng: center.lng,
        },
      ]
    : markers;

  return <MapSurface markers={enrichedMarkers} compact showPopup={false} className="h-64" />;
}
