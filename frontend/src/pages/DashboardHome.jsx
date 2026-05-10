import { useDashboardContext } from "../context/DashboardDataContext";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import KpiCards from "../components/dashboard/KpiCards";
import PredictionSection from "../components/PredictionSection";
import TableSection from "../components/TableSection";
import SettingsPanel from "../components/SettingsPanel";

export default function DashboardHome() {
  const { analytics, recentLogs, loading, error } = useDashboardContext();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <section id="overview" className="scroll-mt-24">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Dashboard</h1>
        <p className="mt-2 text-base text-[#6B7280]">Overview, analytics, predictions, and logs in one place.</p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800">{error}</div>
      ) : null}
      {loading && analytics.total_predictions === 0 ? (
        <p className="text-sm text-[#6B7280]">Loading dashboard data…</p>
      ) : null}

      <section id="kpi" className="scroll-mt-24">
        <KpiCards kpi={analytics.kpi} />
      </section>

      <section id="analytics" className="scroll-mt-24">
        <h2 className="mb-6 text-xl font-semibold text-[#111827]">Analytics</h2>
        <AnalyticsCharts analytics={analytics} />
      </section>

      <section id="predictions" className="scroll-mt-24">
        <h2 className="mb-6 text-xl font-semibold text-[#111827]">Predictions</h2>
        <PredictionSection />
      </section>

      <section id="logs" className="scroll-mt-24">
        <h2 className="mb-6 text-xl font-semibold text-[#111827]">Logs</h2>
        <TableSection recentLogs={recentLogs} />
      </section>

      <section id="settings" className="scroll-mt-24 pb-8">
        <h2 className="mb-6 text-xl font-semibold text-[#111827]">Settings</h2>
        <SettingsPanel />
      </section>
    </div>
  );
}
