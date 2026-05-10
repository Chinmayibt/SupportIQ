import { useDashboardContext } from "../context/DashboardDataContext";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";

export default function DashboardAnalytics() {
  const { analytics, error } = useDashboardContext();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800">{error}</div>
      ) : null}

      <div>
        <h2 className="text-xl font-semibold text-[#111827]">Analytics</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Distributions from logged predictions.</p>
      </div>

      <AnalyticsCharts analytics={analytics} />
    </div>
  );
}
