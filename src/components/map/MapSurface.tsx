import { useEffect, useState } from 'react';
import { DEFAULT_MAP_BOUNDS } from '@/utils/constants';
import { cn } from '@/utils/cn';
import { projectToMap } from '@/utils/map';
import type { MapMarker } from '@/types';
import { MarkerPopup } from '@/components/map/MarkerPopup';

interface MapSurfaceProps {
  markers: MapMarker[];
  className?: string;
  selectedId?: string | null;
  onSelect?: (marker: MapMarker) => void;
  compact?: boolean;
  showPopup?: boolean;
}

function markerColor(color: MapMarker['color']) {
  switch (color) {
    case 'red':
      return 'bg-red-500 ring-red-200';
    case 'yellow':
      return 'bg-brand-yellow ring-brand-yellow/40';
    case 'green':
      return 'bg-emerald-500 ring-emerald-200';
    case 'blue':
      return 'bg-sky-500 ring-sky-200';
    default:
      return 'bg-violet-500 ring-violet-200';
  }
}

export function MapSurface({
  markers,
  className,
  selectedId,
  onSelect,
  compact = false,
  showPopup = true,
}: MapSurfaceProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(selectedId ?? markers[0]?.id ?? null);
  const activeId = selectedId ?? internalSelectedId;
  const activeMarker = markers.find((marker) => marker.id === activeId) ?? markers[0] ?? null;

  useEffect(() => {
    if (!selectedId) {
      setInternalSelectedId(markers[0]?.id ?? null);
    }
  }, [markers, selectedId]);

  const handleSelect = (marker: MapMarker) => {
    if (!selectedId) {
      setInternalSelectedId(marker.id);
    }
    onSelect?.(marker);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,248,225,0.92))] shadow-[var(--shadow-card)]',
        compact ? 'min-h-[220px]' : 'min-h-[420px]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.25),_transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.8),rgba(229,57,53,0.06))]" />
      <div className="absolute inset-x-6 top-10 h-px rotate-[12deg] bg-brand-ink/8" />
      <div className="absolute inset-x-10 top-28 h-px -rotate-[10deg] bg-brand-ink/8" />
      <div className="absolute left-20 top-6 bottom-12 w-px rotate-[6deg] bg-brand-ink/8" />
      <div className="absolute right-24 top-10 bottom-10 w-px -rotate-[8deg] bg-brand-ink/8" />

      {markers.map((marker) => {
        const position = projectToMap(marker, DEFAULT_MAP_BOUNDS);
        const isActive = activeMarker?.id === marker.id;

        return (
          <button
            key={marker.id}
            type="button"
            onClick={() => handleSelect(marker)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition hover:scale-110"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            aria-label={marker.title}
          >
            <span
              className={cn(
                'relative flex size-4 rounded-full ring-8 shadow-lg',
                markerColor(marker.color),
                isActive && 'size-5',
              )}
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-30" />
            </span>
          </button>
        );
      })}

      {!compact && showPopup && activeMarker ? <MarkerPopup marker={activeMarker} /> : null}
    </div>
  );
}
