import type { Coordinates, MapMarker } from '@/types';
import { MapSurface } from '@/components/map/MapSurface';
import { MapboxMap } from '@/components/map/MapboxMap';

export function MiniMapPreview({
  markers,
  center,
}: {
  markers: MapMarker[];
  center?: Coordinates;
}) {
  const hasMapbox = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);
  const styleUrl = 'mapbox://styles/vikdev/cmlo8l453002c01qu7avs7rf3';

  if (hasMapbox) {
    return (
      <MapboxMap
        markers={markers}
        className="h-64"
        styleUrl={styleUrl}
        focus={center ? { lat: center.lat, lng: center.lng, zoom: 12 } : undefined}
      />
    );
  }

  return <MapSurface markers={markers} compact showPopup={false} className="h-64" />;
}
