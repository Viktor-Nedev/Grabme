import { useEffect, useRef } from 'react';
import mapboxgl, { type Map as MapboxMapInstance, type Marker as MapboxMarker } from 'mapbox-gl';
import type { MapMarker } from '@/types';
import { cn } from '@/utils/cn';

interface MapboxMapProps {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (marker: MapMarker) => void;
  className?: string;
  styleUrl?: string;
}

function markerColor(color: MapMarker['color']) {
  switch (color) {
    case 'red':
      return '#EF4444';
    case 'yellow':
      return '#FFC107';
    case 'green':
      return '#10B981';
    case 'blue':
      return '#38BDF8';
    default:
      return '#8B5CF6';
  }
}

export function MapboxMap({ markers, selectedId, onSelect, className, styleUrl }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMapInstance | null>(null);
  const markerRefs = useRef<Map<string, MapboxMarker>>(new Map());

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token as string;
    const initial = markers[0] ?? { lat: 41.8781, lng: -87.6298 };
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl ?? 'mapbox://styles/mapbox/light-v11',
      center: [initial.lng, initial.lat],
      zoom: 11.5,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
  }, [markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleUrl) return;
    map.setStyle(styleUrl);
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current.clear();

    markers.forEach((marker) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.style.width = marker.id === selectedId ? '18px' : '14px';
      el.style.height = marker.id === selectedId ? '18px' : '14px';
      el.style.borderRadius = '9999px';
      el.style.background = markerColor(marker.color);
      el.style.boxShadow = '0 10px 25px rgba(0,0,0,0.18)';
      el.style.border = '3px solid rgba(255,255,255,0.9)';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        onSelect?.(marker);
      });

      const mapMarker = new mapboxgl.Marker(el).setLngLat([marker.lng, marker.lat]).addTo(map);
      markerRefs.current.set(marker.id, mapMarker);
    });
  }, [markers, onSelect, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const marker = markers.find((item) => item.id === selectedId);
    if (!marker) return;

    map.flyTo({ center: [marker.lng, marker.lat], zoom: 12.5, speed: 0.8 });
  }, [markers, selectedId]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-[32px] border border-white/70 shadow-[var(--shadow-card)]',
        className,
      )}
    />
  );
}
