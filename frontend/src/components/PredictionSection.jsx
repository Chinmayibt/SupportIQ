import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useDashboardContext } from "../context/DashboardDataContext";
import PredictionResultCards from "./PredictionResultCards";
import AudioTicketForm from "./AudioTicketForm";

export default function PredictionSection() {
  const { refresh, apiBase } = useDashboardContext();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);

  async function handlePredict() {
    if (!text.trim()) {
      setError("Please enter ticket text before prediction.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }
      setPrediction(data);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#111827]">Text ticket</h3>
          <p className="mt-1 text-sm text-[#6B7280]">Enter a message and run classification.</p>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter customer support message..."
            className="mt-4 w-full resize-y rounded-2xl border border-[#E5E7EB] bg-[#F5F7FB] px-4 py-3 text-[#111827] placeholder:text-[#6B7280] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
          />
          <button
            type="button"
            onClick={handlePredict}
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6366F1]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 disabled:opacity-60 sm:w-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Predicting…" : "Predict"}
          </button>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        <div id="voice" className="scroll-mt-24">
          <AudioTicketForm
            onPrediction={async (data) => {
              setPrediction(data);
              await refresh();
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Results</h3>
        {prediction ? (
          <PredictionResultCards prediction={prediction} />
        ) : (
          <p className="text-sm text-[#6B7280]">Run a text or voice prediction to see structured results here.</p>
        )}
      </div>
    </div>
  );
}
