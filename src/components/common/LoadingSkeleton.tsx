export function LoadingSkeleton({ className = 'h-24 w-full' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[24px] bg-white/70 ${className}`} />;
}
