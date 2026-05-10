import { useDashboardContext } from "../context/DashboardDataContext";
import TableSection from "../components/TableSection";

export default function DashboardLogs() {
  const { recentLogs, error } = useDashboardContext();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800">{error}</div>
      ) : null}

      <h2 className="text-xl font-semibold text-[#111827]">Logs</h2>
      <TableSection recentLogs={recentLogs} />
    </div>
  );
}
