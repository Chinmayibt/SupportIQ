import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useDashboardContext } from "../context/DashboardDataContext";

export default function RetrainModelButton({ className = "" }) {
  const { apiBase, refresh } = useDashboardContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRetrain() {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${apiBase}/model/retrain`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = data.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d?.msg || JSON.stringify(d)).join("; ")
              : detail
                ? JSON.stringify(detail)
                : "Retrain request failed.";
        throw new Error(msg);
      }
      const acc = data.last_accuracy;
      setMessage(
        `Done. Active ${data.active_version ?? "model"}${acc != null ? ` · validation accuracy ${Number(acc).toFixed(4)}` : ""}.`,
      );
      await refresh();
    } catch (err) {
      setError(err.message || "Retrain failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleRetrain}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6366F1]/90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {loading ? "Retraining (may take a few minutes)…" : "Retrain model"}
      </button>
      {message ? <p className="mt-2 text-sm text-[#059669]">{message}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <p className="mt-2 text-xs text-[#6B7280]">
        Runs the same pipeline as <code className="rounded bg-[#F5F7FB] px-1">src/retrain.py</code> on the server:
        trains on the dataset, writes a new versioned artifact, updates <code className="rounded bg-[#F5F7FB] px-1">model_registry.json</code>, and reloads inference.
      </p>
    </div>
  );
}
