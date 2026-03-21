import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export function DashboardLayout() {
  const { currentProfile } = useAuth();

  return (
    <section className="section-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <div className="space-y-6">
          <div className="surface-card bg-[linear-gradient(135deg,rgba(229,57,53,0.95),rgba(255,193,7,0.92))] p-6 text-brand-ink">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-ink/70">Active Workspace</p>
            <h1 className="mt-3 font-display text-3xl text-white">
              {currentProfile?.role === 'organization' ? 'Organization operations dashboard' : 'Community food access dashboard'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/85">
              Real-time donations, requests, events, and AI-guided actions are surfaced here for fast decisions.
            </p>
          </div>
          <Outlet />
        </div>
      </div>
    </section>
  );
}
