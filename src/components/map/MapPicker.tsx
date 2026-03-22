import { useEffect, useRef } from 'react';
import mapboxgl, { type Map as MapboxMapInstance, type Marker as MapboxMarker } from 'mapbox-gl';
import { cn } from '@/utils/cn';

interface MapPickerProps {
  value: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
  className?: string;
  styleUrl?: string;
}

export function MapPicker({ value, onChange, className, styleUrl }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMapInstance | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token as string;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl ?? 'mapbox://styles/vikdev/cmlo8l453002c01qu7avs7rf3',
      center: [value.lng, value.lat],
      zoom: 12,
    });

    mapRef.current.on('click', (event) => {
      const coords = { lat: event.lngLat.lat, lng: event.lngLat.lng };
      onChange(coords);
    });
  }, [onChange, styleUrl, value.lat, value.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({ center: [value.lng, value.lat], zoom: 12, speed: 0.8 });

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: '#E53935' })
        .setLngLat([value.lng, value.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([value.lng, value.lat]);
    }
  }, [value.lat, value.lng]);

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className={cn('rounded-[24px] border border-dashed border-brand-ink/15 bg-brand-cream/40 p-5 text-sm text-brand-gray', className)}>
        Mapbox token missing. Set `VITE_MAPBOX_TOKEN` to enable map picking.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('h-72 overflow-hidden rounded-[24px] border border-white/70 shadow-[var(--shadow-card)]', className)}
    />
  );
}
