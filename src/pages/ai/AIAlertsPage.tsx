import { Link } from 'react-router-dom';
import { AlertBanner } from '@/components/common/AlertBanner';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';

export function AIAlertsPage() {
  const { aiInsights } = useAppData();

  return (
    <div className="space-y-6">
      <AlertBanner
        title="Priority Center"
        message="Critical requests, expiring donations, and underserved zones are grouped here for rapid action."
        tone="critical"
      />

      <section className="surface-card p-6">
        <SectionHeading
          eyebrow="Alerts"
          title="Action queue"
          description="Fast triage for urgent requests, food expiry, and coverage gaps."
        />
        <div className="mt-6 space-y-4">
          {aiInsights.alerts.map((alert) => (
            <div key={alert.id} className="surface-muted p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{alert.title}</p>
                  <p className="mt-2 text-sm text-brand-gray">{alert.detail}</p>
                </div>
                <Link to={alert.route} className="btn-primary px-4 py-2 text-sm">
                  {alert.actionLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-6">
          <SectionHeading title="Expiring donations" description="Inventory that should move first." />
          <div className="mt-6 space-y-3">
            {aiInsights.expiryQueue.map((item) => (
              <div key={item.donationId} className="surface-muted p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-brand-gray">{item.locationText}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
                  {item.hoursLeft} hours left
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <SectionHeading title="Underserved zones" description="Where additional donation coverage is needed." />
          <div className="mt-6 space-y-3">
            {aiInsights.hotspots.map((hotspot) => (
              <div key={hotspot.id} className="surface-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{hotspot.area}</p>
                    <p className="mt-1 text-sm text-brand-gray">{hotspot.recommendation}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Risk {hotspot.riskScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
