import { useDashboardContext } from "../context/DashboardDataContext";
import KpiCards from "../components/dashboard/KpiCards";
import RecommendedActionsChecklist from "../components/dashboard/RecommendedActionsChecklist";
import RetrainModelButton from "../components/RetrainModelButton";

export default function DashboardOverview() {
  const { analytics, modelStatus, loading, error, apiBase } = useDashboardContext();
  const total = analytics.total_predictions ?? analytics.kpi?.total_tickets ?? 0;
  const showEmptyHint = !loading && !error && total === 0;
  const logExists = analytics.prediction_log_exists;
  const skipped = analytics.prediction_rows_skipped;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Dashboard</h1>
        <p className="mt-2 text-base text-[#6B7280]">
          KPIs are computed from prediction logs on the API. Use <strong>Predictions</strong> or{" "}
          <strong>Voice</strong> to record tickets, then numbers update here and under Analytics.
        </p>
        {!loading && !error ? (
          <p className="mt-2 text-xs text-[#6B7280]">
            API base: <code className="rounded bg-[#F5F7FB] px-1">{apiBase}</code>
            {" · "}
            Logged rows (API): <strong>{total}</strong>
            {typeof logExists === "boolean" ? (
              <>
                {" · "}
                Server log file: {logExists ? "present" : "missing"}
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      {!error ? <KpiCards kpi={analytics.kpi} /> : null}

      <RecommendedActionsChecklist />

      {error ? (
        <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800">
          <p>{error}</p>
          <p className="text-red-700">
            Ensure the FastAPI server is running (e.g. port 8000) and the UI can reach{" "}
            <code className="rounded bg-red-100 px-1">{apiBase}</code>. For{" "}
            <code className="rounded bg-red-100 px-1">npm run dev</code>, either omit{" "}
            <code className="rounded bg-red-100 px-1">VITE_API_BASE_URL</code> in <code>.env</code> so requests use
            the Vite <code className="rounded bg-red-100 px-1">/api</code> proxy, or set it to a URL this browser can
            reach (avoid <code className="rounded bg-red-100 px-1">localhost</code> when opening the app from another
            device).
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#111827]">Model and follow-ups</h2>
        {modelStatus ? (
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-[#6B7280]">Status</dt>
              <dd className="font-medium capitalize text-[#111827]">{modelStatus.status ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Active version</dt>
              <dd className="font-medium text-[#111827]">{modelStatus.active_version ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Last retrained</dt>
              <dd className="font-medium text-[#111827]">{modelStatus.last_retrained_at ?? "—"}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-[#6B7280]">Loading model status…</p>
        )}
        <p className="mt-3 text-xs text-[#6B7280]">
          <strong>Last retrained</strong> updates after you retrain. Use the button below to run the same pipeline as{" "}
          <code className="rounded bg-[#F5F7FB] px-1">src/retrain.py</code>.
        </p>
        <div className="mt-4 border-t border-[#E5E7EB] pt-4">
          <RetrainModelButton />
        </div>
      </div>

      {loading && total === 0 && !error ? (
        <p className="text-sm text-[#6B7280]">Loading dashboard data…</p>
      ) : null}

      {typeof skipped === "number" && skipped > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-950">
          The API found <strong>{skipped}</strong> row(s) in <code>logs/predictions.csv</code> but none passed
          validation (e.g. missing or invalid <code>main_class</code>). Check CSV columns against the current schema.
        </div>
      ) : null}

      {showEmptyHint ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-950">
          {logExists === false ? (
            <p>
              This API instance has <strong>no</strong> <code>logs/predictions.csv</code> yet (or it cannot see the
              file). Run predictions against <strong>this same server</strong>, or mount a shared <code>logs/</code>{" "}
              volume in Docker.
            </p>
          ) : (
            <p>
              No usable prediction rows yet. Run at least one classification from <strong>Predictions</strong> or{" "}
              <strong>Voice</strong> while this API is up.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
