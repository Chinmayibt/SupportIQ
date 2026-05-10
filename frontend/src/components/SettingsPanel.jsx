import { useDashboardContext } from "../context/DashboardDataContext";
import RetrainModelButton from "./RetrainModelButton";

export default function SettingsPanel() {
  const { apiBase } = useDashboardContext();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#111827]">Model retraining</h3>
        <p className="mt-2 text-sm text-[#6B7280]">
          Refresh <strong>Last retrained</strong> and the active model version on the dashboard by retraining on the
          server (requires dataset and training dependencies installed where the API runs).
        </p>
        <div className="mt-4">
          <RetrainModelButton />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#111827]">API base URL</h3>
        <p className="mt-2 break-all font-mono text-sm text-[#6B7280]">{apiBase}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Set <code className="rounded bg-[#F5F7FB] px-2 py-0.5">VITE_API_BASE_URL</code> in{" "}
          <code className="rounded bg-[#F5F7FB] px-2 py-0.5">.env</code> for production builds, or leave unset to use{" "}
          <code className="rounded bg-[#F5F7FB] px-2 py-0.5">/api</code> with the dev proxy.
        </p>
      </div>
    </div>
  );
}
