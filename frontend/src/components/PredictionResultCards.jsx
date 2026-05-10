import {
  Building2,
  Gauge,
  Languages,
  Layers,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";

const items = [
  { key: "intent", label: "Intent", icon: Target },
  { key: "sentiment", label: "Sentiment", icon: MessageSquare },
  { key: "priority", label: "Priority", icon: Gauge },
  { key: "confidence_score", label: "Confidence", icon: Layers },
  { key: "detected_language", label: "Language", icon: Languages },
  { key: "business_category", label: "Business category", icon: Building2 },
];

export default function PredictionResultCards({ prediction }) {
  if (!prediction) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {items.map(({ key, label, icon: Icon }) => (
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
        ))}
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-[#8B5CF6]/10 p-2 text-[#8B5CF6]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Recommended action</span>
        </div>
        <p className="text-sm leading-relaxed text-[#111827]">{prediction.recommended_action || "—"}</p>
      </div>
    </div>
  );
}
