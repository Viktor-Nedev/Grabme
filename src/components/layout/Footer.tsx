import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="section-shell grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl">Grabme</p>
          <p className="mt-3 max-w-xl text-sm text-brand-gray">
            Built for food rescue, hunger response, and neighborhood-scale coordination. Grabme makes live donations,
            urgent requests, and community distribution visible in one place.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gray">Platform</p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link to={ROUTES.map}>Map</Link>
            <Link to={ROUTES.donationFeed}>Donations</Link>
            <Link to={ROUTES.requests}>Requests</Link>
            <Link to={ROUTES.events}>Events</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gray">Hackathon Demo</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-brand-gray">
            <p>Public map preview is always on.</p>
            <p>User and organization demo roles are available from the navbar.</p>
            <Link to={ROUTES.auth} className="inline-flex items-center gap-2 text-brand-red">
              Open Auth
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
