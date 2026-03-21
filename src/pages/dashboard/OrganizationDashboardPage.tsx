import {
  BarChart3,
  Clock3,
  MapPinned,
  PackageOpen,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DonationCard } from '@/components/cards/DonationCard';
import { EventCard } from '@/components/cards/EventCard';
import { RequestCard } from '@/components/cards/RequestCard';
import { AlertBanner } from '@/components/common/AlertBanner';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StatsCard } from '@/components/common/StatsCard';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/formatters';

export function OrganizationDashboardPage() {
  const { aiInsights, donations, requests, events, profiles } = useAppData();
  const { currentOrganization } = useAuth();

  if (!currentOrganization) {
    return null;
  }

  const activeDonations = donations.filter((donation) => donation.organizationId === currentOrganization.id);
  const urgentRequests = requests.filter((request) => request.urgency === 'high' || request.urgency === 'critical');
  const upcomingEvents = events.filter((event) => event.organizationId === currentOrganization.id);

  return (
    <div className="space-y-6">
      <AlertBanner
        title="Priority signal"
        message="East Zone demand is forecast to outpace available meal packs by tomorrow afternoon."
        tone="critical"
        actionLabel="Open AI Alerts"
        actionTo="/ai/alerts"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatsCard label="Meals Saved" value="4,820" change="+16% from last week" icon={<PackageOpen className="size-5" />} />
        <StatsCard label="People Helped" value="1,460" change="Across 7 neighborhoods" icon={<Users className="size-5" />} tone="success" />
        <StatsCard label="Donations Expired" value="18" change="Down 22% after routing changes" icon={<Clock3 className="size-5" />} tone="warning" />
        <StatsCard label="Community Reach" value="12.4 km" change="Average distribution radius this week" icon={<MapPinned className="size-5" />} />
        <StatsCard label="Requests Fulfilled" value="318" change="Critical requests first" icon={<BarChart3 className="size-5" />} tone="success" />
        <StatsCard label="Average Response Time" value="38 min" change="From alert to dispatch" icon={<Sparkles className="size-5" />} tone="critical" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Demand Forecasting"
            title="Predicted demand versus available supply"
            description="AI-style forecasting shows where your inventory will fall short over the next few days."
          />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiInsights.forecast}>
                <defs>
                  <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E53935" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="supplyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFC107" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e7c0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="demand" stroke="#E53935" fill="url(#demandFill)" strokeWidth={3} />
                <Area type="monotone" dataKey="supply" stroke="#FFC107" fill="url(#supplyFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Urgency Scoring"
            title="Request pressure mix"
            description="Critical and high-priority requests are elevated first."
          />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aiInsights.urgencyBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  fill="#E53935"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="surface-card p-6 xl:col-span-2">
          <SectionHeading
            eyebrow="Operational Feed"
            title="What needs action right now"
            description="Urgent requests, expiring donations, and upcoming events stay visible without context switching."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {urgentRequests.slice(0, 2).map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                requesterName={profiles.find((profile) => profile.id === request.profileId)?.name}
              />
            ))}
            {activeDonations.slice(0, 2).map((donation) => (
              <DonationCard key={donation.id} donation={donation} organizationName={currentOrganization.organizationName} />
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Smart Recommendations"
            title="AI next steps"
            description="Mock insights tuned for a realistic demo."
          />
          <div className="mt-6 space-y-3">
            {aiInsights.smartRecommendations.map((recommendation) => (
              <div key={recommendation} className="surface-muted p-4 text-sm text-brand-gray">
                <p className="font-medium text-brand-ink">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-6">
          <SectionHeading
            title="Upcoming events"
            description="Distribution events coordinated by your organization."
          />
          <div className="mt-6 grid gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} organizerName={currentOrganization.organizationName} />
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <SectionHeading title="Food expiry prioritization" description="Distribute these items first to reduce waste." />
          <div className="mt-6 space-y-4">
            {aiInsights.expiryQueue.map((item) => (
              <div key={item.donationId} className="surface-muted p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-brand-gray">{item.locationText}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    {item.hoursLeft}h left
                  </span>
                </div>
              </div>
            ))}
            <div className="rounded-[24px] border border-dashed border-brand-ink/12 p-4 text-sm text-brand-gray">
              Next operational review scheduled for {formatDateTime(new Date().toISOString())}.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
