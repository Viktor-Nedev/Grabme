import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function DashboardLayout() {
  const { currentProfile } = useAuth();

  return (
    <section className="section-shell py-10">
      <div className="surface-card p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">Dashboard</p>
        <h1 className="mt-3 font-display text-3xl">
          {currentProfile?.role === 'organization' ? 'Organization operations' : 'Community access overview'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-brand-gray">
          Real-time donations, requests, events, and AI-guided actions are surfaced here for fast decisions.
        </p>
      </div>
      <div className="mt-6">
        <Outlet />
      </div>
    </section>
  );
}
