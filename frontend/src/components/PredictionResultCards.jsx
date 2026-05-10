import {
  Building2,
  Gauge,
  Languages,
  MessageSquare,
  PieChart,
  Sparkles,
  Target,
} from "lucide-react";

const MAIN_CLASS_COLORS = {
  Complaint: "#ef4444",
  Inquiry: "#6366F1",
  Feedback: "#22c55e",
};

const gridItems = [
  { key: "intent", label: "Intent", icon: Target },
  { key: "sentiment", label: "Sentiment", icon: MessageSquare },
  { key: "priority", label: "Priority", icon: Gauge },
  { key: "_probabilities", label: "Class probabilities", icon: PieChart },
  { key: "detected_language", label: "Language", icon: Languages },
  { key: "main_class", label: "Classification", icon: Building2 },
];

function formatPct(p) {
  if (p == null || Number.isNaN(Number(p))) return "—";
  return `${(Number(p) * 100).toFixed(1)}%`;
}

function ClassProbabilitiesCard({ prediction }) {
  const mainRows = prediction.main_class_probabilities || [];
  const intentRows = prediction.intent_probabilities || [];
  const topIntents = intentRows.slice(0, 6);

  return (
    <div className="flex min-h-[120px] flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-lg bg-[#6366F1]/10 p-2 text-[#6366F1]">
          <PieChart className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Class probabilities</span>
      </div>
      {mainRows.length ? (
        <ul className="space-y-1.5 text-sm">
          {mainRows.map((row) => (
            <li key={row.main_class} className="flex items-center justify-between gap-2">
              <span
                className="font-medium"
                style={{ color: MAIN_CLASS_COLORS[row.main_class] || "#111827" }}
              >
                {row.main_class}
              </span>
              <span className="tabular-nums text-[#111827]">{formatPct(row.probability)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#6B7280]">—</p>
      )}
      {topIntents.length ? (
        <div className="mt-3 border-t border-[#E5E7EB] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Intent scores (model)</p>
          <ul className="mt-2 max-h-[140px] space-y-1 overflow-y-auto text-xs text-[#374151]">
            {topIntents.map((row) => (
              <li key={row.intent} className="flex justify-between gap-2">
                <span className="truncate" title={row.intent}>
                  {row.intent}
                </span>
                <span className="shrink-0 tabular-nums text-[#6B7280]">{formatPct(row.probability)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function PredictionResultCards({ prediction }) {
  if (!prediction) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {gridItems.map(({ key, label, icon: Icon }) =>
          key === "_probabilities" ? (
            <ClassProbabilitiesCard key={key} prediction={prediction} />
          ) : (
            <div
              key={key}
              className="flex min-h-[120px] flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-[#6366F1]/10 p-2 text-[#6366F1]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</span>
              </div>
              <p className="text-base font-semibold text-[#111827]">{String(prediction[key] ?? "—")}</p>
            </div>
          ),
        )}
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-[#8B5CF6]/10 p-2 text-[#8B5CF6]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Recommended action</span>
        </div>
        <p className="text-sm leading-relaxed text-[#111827]">{prediction.recommended_action || "—"}</p>
        {prediction.action_source === "llm" ? (
          <p className="mt-3 text-xs text-[#6B7280]">Suggested via Groq (LLM).</p>
        ) : null}
      </div>
    </div>
  );
}
