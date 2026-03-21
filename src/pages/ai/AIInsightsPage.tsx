import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertBanner } from '@/components/common/AlertBanner';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StatsCard } from '@/components/common/StatsCard';
import { useAppData } from '@/hooks/useAppData';

export function AIInsightsPage() {
  const { aiInsights } = useAppData();

  return (
    <div className="space-y-6">
      <AlertBanner
        title="Forecast summary"
        message="Meal packs and infant nutrition have the sharpest projected demand gap over the next 24 hours."
        tone="warning"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Demand hotspots" value={String(aiInsights.hotspots.length)} change="Areas with low coverage and high request density" />
        <StatsCard label="Urgent queue" value="3" change="Critical requests within 2 km of your hub" tone="critical" />
        <StatsCard label="Expiring donations" value={String(aiInsights.expiryQueue.length)} change="Prioritize dispatch before 8 PM" tone="warning" />
        <StatsCard label="Forecast confidence" value="84%" change="Based on recent demand and supply patterns" tone="success" />
      </div>

      <section className="surface-card p-6">
        <SectionHeading
          eyebrow="Demand Forecasting"
          title="Predicted need by food category"
          description="A realistic AI-style lens on what your community will likely need next."
        />
        <div className="mt-6 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiInsights.categoryForecasts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e7c0" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="neededUnits" fill="#E53935" radius={[8, 8, 0, 0]} />
              <Bar dataKey="coverage" fill="#FFC107" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Hotspot Detection"
            title="Underserved zones"
            description="Neighborhoods with many requests and low donation coverage."
          />
          <div className="mt-6 space-y-4">
            {aiInsights.hotspots.map((hotspot) => (
              <div key={hotspot.id} className="surface-muted p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{hotspot.area}</p>
                    <p className="mt-1 text-sm text-brand-gray">{hotspot.recommendation}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Risk {hotspot.riskScore}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[18px] bg-white px-4 py-3 text-sm text-brand-gray">
                    Requests: <span className="font-semibold text-brand-ink">{hotspot.requestCount}</span>
                  </div>
                  <div className="rounded-[18px] bg-white px-4 py-3 text-sm text-brand-gray">
                    Coverage: <span className="font-semibold text-brand-ink">{hotspot.donationCoverage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <SectionHeading
            eyebrow="Smart Recommendations"
            title="Action-oriented prompts"
            description="The page focuses on response strategy, not simple matching."
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
    </div>
  );
}
