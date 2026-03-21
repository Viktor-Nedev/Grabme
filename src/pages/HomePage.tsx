import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, MapPinned, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DonationCard } from '@/components/cards/DonationCard';
import { EventCard } from '@/components/cards/EventCard';
import { RequestCard } from '@/components/cards/RequestCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StatsCard } from '@/components/common/StatsCard';
import { useAppData } from '@/hooks/useAppData';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import { QUICK_STATS, ROUTES } from '@/utils/constants';

export function HomePage() {
  const { donations, requests, events, organizations } = useAppData();
  const protectedNavigate = useProtectedNavigation();

  return (
    <div className="pb-20">
      <section className="section-shell grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className="inline-flex rounded-full bg-brand-yellow/30 px-4 py-2 text-sm font-semibold text-brand-ink">
            Hackathon-ready food rescue and food access platform
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight md:text-6xl">
            Redirect surplus food into neighborhoods that need it most.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-gray">
            Grabme connects NGOs, food banks, stores, and donors with people who need food right now. Live donations,
            urgent requests, and community pickup events stay visible on one public map.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={ROUTES.map} className="btn-primary">
              <MapPinned className="size-4" />
              Find Food Near You
            </Link>
            <Link to={ROUTES.map} className="btn-secondary">
              View Map
            </Link>
            <button type="button" onClick={() => protectedNavigate(ROUTES.requestNew)} className="btn-ghost">
              Make a Request
            </button>
            <button type="button" onClick={() => protectedNavigate(ROUTES.donationNew)} className="btn-ghost">
              Donate Food
            </button>
            <Link to={ROUTES.events} className="btn-ghost">
              Explore Events
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {QUICK_STATS.map((stat) => (
              <div key={stat.label} className="surface-muted p-4">
                <p className="font-display text-2xl">{stat.value}</p>
                <p className="mt-2 text-sm text-brand-gray">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="surface-card overflow-hidden p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] bg-brand-red p-6 text-white">
              <p className="text-sm uppercase tracking-[0.22em] text-white/70">Mission</p>
              <p className="mt-4 font-display text-3xl">Reduce waste. Increase access.</p>
              <p className="mt-4 text-sm text-white/85">
                Food rescue becomes actionable when organizations can see live demand and users can find help without friction.
              </p>
            </div>
            <div className="space-y-4">
              <div className="surface-muted p-4">
                <p className="text-sm font-semibold text-brand-red">Live operational view</p>
                <p className="mt-2 text-sm text-brand-gray">
                  Public map access for everyone, protected creation flows for authenticated users and organizations.
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-sm font-semibold text-brand-red">AI for action</p>
                <p className="mt-2 text-sm text-brand-gray">
                  Demand forecasting, hotspot detection, expiry prioritization, and rapid-response recommendation cards.
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-sm font-semibold text-brand-red">Role-based control</p>
                <p className="mt-2 text-sm text-brand-gray">
                  Users request help. Organizations mobilize food, events, and fulfillment with clear dashboards.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="section-shell py-8">
        <SectionHeading
          eyebrow="How It Works"
          title="A simple loop from available food to fulfilled need"
          description="Designed for fast scanning, fast posting, and clear action during a live demo."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <UtensilsCrossed className="size-6" />,
              title: 'Organizations post rescued food',
              description: 'Donations include expiry, pickup windows, food category, storage type, and exact location.',
            },
            {
              icon: <MapPinned className="size-6" />,
              title: 'Community members browse the live map',
              description: 'Everyone can inspect the map, open marker details, and navigate to food pickup points.',
            },
            {
              icon: <HeartHandshake className="size-6" />,
              title: 'Urgent needs surface to responders',
              description: 'Requests and AI alerts help organizations focus on the areas with the highest coverage gap.',
            },
          ].map((item) => (
            <div key={item.title} className="surface-card p-6">
              <div className="inline-flex rounded-2xl bg-brand-yellow/20 p-3 text-brand-red">{item.icon}</div>
              <h3 className="mt-5 font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm text-brand-gray">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-8">
        <SectionHeading
          eyebrow="Impact Preview"
          title="The startup-style overview judges expect to see"
          description="Live impact metrics, community signals, and mission progress are visible from the first screen."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Available donations" value={String(donations.length)} change="Live and map-visible now" />
          <StatsCard label="Active requests" value={String(requests.length)} change="Including urgent and critical needs" tone="critical" />
          <StatsCard label="Upcoming events" value={String(events.length)} change="Distribution and community pickups" tone="warning" />
          <StatsCard label="Partner organizations" value={String(organizations.length)} change="Food banks, NGOs, stores, and rescue teams" tone="success" />
        </div>
      </section>

      <section className="section-shell py-8">
        <SectionHeading
          eyebrow="Live Preview"
          title="Real data views already wired together"
          description="The feed cards below are pulled from the same state layer that powers details pages, dashboards, and the map."
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <DonationCard donation={donations[0]} organizationName="Hope Harvest Network" />
          <RequestCard request={requests[0]} requesterName="Maya Johnson" />
          <EventCard event={events[0]} organizerName="Hope Harvest Network" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={ROUTES.map} className="btn-primary">
            Open Public Map
            <ArrowRight className="size-4" />
          </Link>
          <Link to={ROUTES.auth} className="btn-ghost">
            Enter Demo Workspace
          </Link>
        </div>
      </section>
    </div>
  );
}
