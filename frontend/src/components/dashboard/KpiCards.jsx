import { motion } from "framer-motion";
import { Globe, MessageSquareWarning, Ticket, TrendingUp } from "lucide-react";

export default function KpiCards({ kpi }) {
  const safe = kpi || {
    total_tickets: 0,
    complaints: 0,
    avg_confidence: 0,
    active_languages: 0,
  };
  const cards = [
    {
      label: "Total Tickets",
      value: safe.total_tickets,
      icon: Ticket,
      accent: "text-[#6366F1]",
      bg: "bg-[#6366F1]/10",
    },
    {
      label: "Complaints",
      value: safe.complaints,
      icon: MessageSquareWarning,
      accent: "text-[#8B5CF6]",
      bg: "bg-[#8B5CF6]/10",
    },
    {
      label: "Avg Confidence",
      value: typeof safe.avg_confidence === "number" ? safe.avg_confidence.toFixed(4) : safe.avg_confidence,
      icon: TrendingUp,
      accent: "text-[#6366F1]",
      bg: "bg-[#6366F1]/10",
    },
    {
      label: "Active Languages",
      value: safe.active_languages,
      icon: Globe,
      accent: "text-[#8B5CF6]",
      bg: "bg-[#8B5CF6]/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, accent, bg }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          className="flex min-h-[120px] flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-start justify-between">
            <span className="text-sm font-medium text-[#6B7280]">{label}</span>
            <div className={`rounded-xl p-2 ${bg}`}>
              <Icon className={`h-5 w-5 ${accent}`} />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
        </motion.div>
      ))}
    </div>
  );
}
