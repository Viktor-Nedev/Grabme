import { BarChart3, CalendarRange, HeartHandshake, LayoutDashboard, Settings, Sparkles, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';

const userItems = [
  { label: 'Dashboard', to: ROUTES.userDashboard, icon: LayoutDashboard },
  { label: 'Requests', to: ROUTES.requests, icon: HeartHandshake },
  { label: 'Events', to: ROUTES.events, icon: CalendarRange },
  { label: 'Profile', to: ROUTES.profile, icon: UserRound },
  { label: 'Settings', to: ROUTES.settings, icon: Settings },
];

const orgItems = [
  { label: 'Dashboard', to: ROUTES.orgDashboard, icon: LayoutDashboard },
  { label: 'AI Insights', to: ROUTES.aiInsights, icon: BarChart3 },
  { label: 'Priority Center', to: ROUTES.aiAlerts, icon: Sparkles },
  { label: 'Events', to: ROUTES.events, icon: CalendarRange },
  { label: 'Profile', to: ROUTES.profile, icon: UserRound },
  { label: 'Settings', to: ROUTES.settings, icon: Settings },
];

export function Sidebar() {
  const { currentProfile } = useAuth();
  const items = currentProfile?.role === 'organization' ? orgItems : userItems;

  return (
    <aside className="surface-card h-fit p-4">
      <div className="rounded-[22px] bg-brand-red px-4 py-5 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Workspace</p>
        <p className="mt-2 font-display text-2xl">{currentProfile?.role === 'organization' ? 'Org Hub' : 'Community Hub'}</p>
      </div>
      <nav className="mt-4 flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-brand-gray transition hover:bg-brand-yellow/15 hover:text-brand-ink',
                  isActive && 'bg-brand-yellow/25 text-brand-ink',
                )
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
