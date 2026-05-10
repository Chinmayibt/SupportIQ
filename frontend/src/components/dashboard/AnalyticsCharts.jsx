import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SENTIMENT_COLORS = {
  Positive: "#22c55e",
  Negative: "#ef4444",
  Neutral: "#94a3b8",
};

const MAIN_CLASS_COLORS = {
  Complaint: "#ef4444",
  Inquiry: "#6366F1",
  Feedback: "#22c55e",
};

function ChartCard({ title, children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className={[
        "flex min-h-[360px] flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 className="mb-4 text-base font-semibold text-[#111827]">{title}</h3>
      <div className="min-h-[280px] w-full min-w-0 flex-1">{children}</div>
    </motion.div>
  );
}

export default function AnalyticsCharts({ analytics }) {
  const sentimentData = (analytics.sentiment_distribution || []).map((row) => ({
    name: row.sentiment_normalized,
    value: row.count,
  }));
  const languageData = (analytics.language_distribution || []).map((row) => ({
    name: row.language_normalized,
    count: row.count,
  }));
  const mainClassData = (analytics.main_class_distribution || []).map((row) => ({
    name: row.main_class,
    count: row.count,
  }));
  const intentData = (analytics.intent_distribution || []).map((row) => ({
    intent: row.intent,
    queries: row.count,
  }));

  const emptyMsg = (
    <p className="flex h-[280px] items-center justify-center text-sm text-[#6B7280]">No data yet</p>
  );

  const mainClassHasData =
    mainClassData.length > 0 && mainClassData.some((d) => Number(d.count) > 0);
  const intentHasData =
    intentData.length > 0 && intentData.some((d) => Number(d.queries) > 0);
  const intentChartMinWidth = Math.max(480, intentData.length * 72);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="Sentiment distribution" delay={0}>
        {sentimentData.length && sentimentData.some((d) => d.value > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={2}
              >
                {sentimentData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SENTIMENT_COLORS[entry.name] || "#6366F1"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          emptyMsg
        )}
      </ChartCard>

      <ChartCard title="Language distribution" delay={0.05}>
        {languageData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={languageData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
              <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          emptyMsg
        )}
      </ChartCard>

      <ChartCard title="Main class distribution" delay={0.1}>
        {mainClassHasData ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mainClassData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {mainClassData.map((entry) => (
                  <Cell key={entry.name} fill={MAIN_CLASS_COLORS[entry.name] || "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          emptyMsg
        )}
      </ChartCard>

      <ChartCard title="Queries by intent" delay={0.12} className="lg:col-span-2 min-h-[420px]">
        {intentHasData ? (
          <div className="w-full overflow-x-auto pb-2">
            <div style={{ minWidth: intentChartMinWidth, height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={intentData}
                  margin={{ top: 8, right: 12, left: 4, bottom: 72 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="intent"
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    angle={-40}
                    textAnchor="end"
                    height={88}
                    interval={0}
                    label={{ value: "Intent", position: "insideBottom", offset: -56, fill: "#374151", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    allowDecimals={false}
                    label={{ value: "Number of queries", angle: -90, position: "insideLeft", fill: "#374151", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
                    formatter={(value) => [value, "Queries"]}
                    labelFormatter={(label) => `Intent: ${label}`}
                  />
                  <Bar dataKey="queries" radius={[8, 8, 0, 0]}>
                    {intentData.map((entry) => (
                      <Cell
                        key={entry.intent}
                        fill={entry.intent === "contact_human_agent" ? "#8B5CF6" : "#6366F1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          emptyMsg
        )}
      </ChartCard>
    </div>
  );
}
