import { useEffect, useRef } from 'react';
import mapboxgl, { type Map as MapboxMapInstance, type Marker as MapboxMarker } from 'mapbox-gl';
import type { MapMarker } from '@/types';
import { cn } from '@/utils/cn';
import { DEFAULT_COORDS } from '@/utils/constants';
import { getMarkerIcon } from '@/utils/map';

interface MapboxMapProps {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (marker: MapMarker) => void;
  className?: string;
  styleUrl?: string;
  focus?: { lat: number; lng: number; zoom?: number; key?: number };
  onError?: (message?: string) => void;
}

export function MapboxMap({ markers, selectedId, onSelect, className, styleUrl, focus, onError }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMapInstance | null>(null);
  const markerRefs = useRef<Map<string, MapboxMarker>>(new Map());
  const hasLoadedRef = useRef(false);
  const errorReportedRef = useRef(false);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token as string;
    const initial = focus ?? markers[0] ?? DEFAULT_COORDS;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl ?? 'mapbox://styles/mapbox/light-v11',
      center: [initial.lng, initial.lat],
      zoom: 11.5,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    mapRef.current.once('load', () => {
      hasLoadedRef.current = true;
      mapRef.current?.resize();
    });
    mapRef.current.on('error', (event) => {
      if (hasLoadedRef.current || errorReportedRef.current) {
        return;
      }
      errorReportedRef.current = true;
      onError?.(event.error?.message);
    });
  }, [markers, focus, styleUrl]);

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
      const isLocation = marker.type === 'user-location';
      const size = isLocation
        ? marker.id === selectedId
          ? 44
          : 36
        : marker.id === selectedId
          ? 64
          : 52;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '9999px';
      el.style.background = 'transparent';
      el.style.border = 'none';
      el.style.cursor = 'pointer';
      el.style.padding = '0';

      const img = document.createElement('img');
      img.src = getMarkerIcon(marker);
      img.alt = marker.title;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.filter = 'drop-shadow(0 10px 16px rgba(0,0,0,0.25))';
      el.appendChild(img);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo({
      center: [focus.lng, focus.lat],
      zoom: focus.zoom ?? 12.5,
      speed: 0.9,
    });
  }, [focus?.key, focus?.lat, focus?.lng, focus?.zoom]);

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
