import { useMemo, useState } from "react";

export default function TableSection({ recentLogs }) {
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedLogs = useMemo(() => {
    return [...recentLogs].sort((a, b) => {
      let aVal = a[sortField] ?? "";
      let bVal = b[sortField] ?? "";
      if (sortField === "timestamp") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [recentLogs, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / itemsPerPage));
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#6B7280]">Latest predictions (newest activity first)</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F5F7FB] disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-[#6B7280]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F5F7FB] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white shadow-sm">
            <tr>
              {[
                ["timestamp", "Time"],
                ["input_text", "Input text"],
                ["intent", "Intent"],
                ["sentiment", "Sentiment"],
                ["priority", "Priority"],
                ["confidence_score", "Confidence"],
              ].map(([field, label]) => (
                <th key={field} className="whitespace-nowrap px-6 py-4 font-semibold text-[#111827]">
                  <button
                    type="button"
                    onClick={() => handleSort(field)}
                    className="flex items-center gap-1 rounded text-left text-[#111827] hover:text-[#6366F1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
                  >
                    {label}
                    <span className="text-[#6B7280]">{sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : ""}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#6B7280]">
                  No logs yet.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, idx) => (
                <tr
                  key={`${log.timestamp}-${idx}`}
                  className="border-b border-[#E5E7EB] transition-colors hover:bg-[#F5F7FB]/80"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-[#6B7280]">{log.timestamp}</td>
                  <td className="max-w-[220px] truncate px-6 py-4 text-[#111827]" title={log.input_text || ""}>
                    {log.input_text || "—"}
                  </td>
                  <td className="px-6 py-4 text-[#111827]">{log.intent ?? "—"}</td>
                  <td className="px-6 py-4 text-[#111827]">{log.sentiment ?? "—"}</td>
                  <td className="px-6 py-4 text-[#111827]">{log.priority ?? "—"}</td>
                  <td className="px-6 py-4 text-[#111827]">{log.confidence_score ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
