import { useState } from 'react';
import { Menu, Settings, UserRound, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/cn';

const publicLinks = [
  { label: 'Map', to: ROUTES.map },
  { label: 'Donations', to: ROUTES.donationFeed },
  { label: 'Requests', to: ROUTES.requests },
  { label: 'Events', to: ROUTES.events },
];

export function Navbar() {
  const { currentProfile, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardRoute =
    currentProfile?.role === 'organization' ? ROUTES.orgDashboard : ROUTES.userDashboard;

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between gap-4 py-2 px-2 sm:px-3 lg:px-4">
        <Link to={ROUTES.home} className="flex items-center gap-3">
          <div className="rounded-2xl p-0">
            <img
              src="/image.png"
              alt="Grabme logo"
              className="h-16 w-16 origin-left scale-125 object-contain"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <NavLink
              to={dashboardRoute}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-brand-gray transition hover:text-brand-red hover:drop-shadow-[0_0_10px_rgba(229,57,53,0.45)]',
                  isActive && 'text-brand-ink'
                )
              }
            >
              Dashboard
            </NavLink>
          ) : null}
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-brand-gray transition hover:text-brand-red hover:drop-shadow-[0_0_10px_rgba(229,57,53,0.45)]',
                  isActive && 'text-brand-ink'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <NavLink
              to={ROUTES.chat}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-brand-gray transition hover:text-brand-red hover:drop-shadow-[0_0_10px_rgba(229,57,53,0.45)]',
                  isActive && 'text-brand-ink'
                )
              }
            >
              Chat
            </NavLink>
          ) : null}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && currentProfile ? (
            <>
              <Link to={ROUTES.profile} className="rounded-full border border-brand-ink/10 bg-white/70 p-2 text-brand-gray transition hover:-translate-y-0.5 hover:text-brand-ink">
                <UserRound className="size-4" />
              </Link>
              <Link to={ROUTES.settings} className="rounded-full border border-brand-ink/10 bg-white/70 p-2 text-brand-gray transition hover:-translate-y-0.5 hover:text-brand-ink">
                <Settings className="size-4" />
              </Link>
            </>
          ) : (
            <Link to={ROUTES.auth} className="btn-primary px-4 py-2 text-sm">
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-2xl border border-brand-ink/10 p-2 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="section-shell border-t border-brand-ink/8 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-brand-gray"
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <Link to={ROUTES.chat} onClick={() => setMobileOpen(false)} className="btn-ghost text-sm">
                Chat
              </Link>
            ) : null}
            {isAuthenticated && currentProfile ? (
              <>
                <Link to={dashboardRoute} onClick={() => setMobileOpen(false)} className="btn-ghost text-sm">
                  Dashboard
                </Link>
                <Link to={ROUTES.profile} onClick={() => setMobileOpen(false)} className="btn-ghost text-sm">
                  Profile
                </Link>
                <Link to={ROUTES.settings} onClick={() => setMobileOpen(false)} className="btn-ghost text-sm">
                  Settings
                </Link>
              </>
            ) : (
              <Link to={ROUTES.auth} onClick={() => setMobileOpen(false)} className="btn-primary text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
