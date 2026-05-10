import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

function ChartCard({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className="flex min-h-[360px] flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
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
  const categoryData = (analytics.category_distribution || []).map((row) => ({
    name: row.business_category,
    count: row.count,
  }));
  const trendData = (analytics.ticket_trend || []).map((row) => ({
    date: row.timestamp?.slice(0, 10) || row.timestamp,
    count: row.count,
  }));

  const emptyMsg = (
    <p className="flex h-[280px] items-center justify-center text-sm text-[#6B7280]">No data yet</p>
  );

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

      <ChartCard title="Ticket categories" delay={0.1}>
        {categoryData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} angle={-35} textAnchor="end" height={70} interval={0} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          emptyMsg
        )}
      </ChartCard>

      <ChartCard title="Ticket trends" delay={0.15}>
        {trendData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
              <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} dot={{ fill: "#6366F1", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          emptyMsg
        )}
      </ChartCard>
    </div>
  );
}
