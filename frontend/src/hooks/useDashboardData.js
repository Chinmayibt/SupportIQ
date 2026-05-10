import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const initialAnalytics = {
  total_predictions: 0,
  main_class_distribution: [],
  sentiment_distribution: [],
  language_distribution: [],
  kpi: { total_tickets: 0, complaints: 0, avg_confidence: 0, active_languages: 0 },
  category_distribution: [],
  ticket_trend: [],
};

export function useDashboardData(logLimit = 100) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard?limit=${logLimit}`);
    if (!response.ok) throw new Error("Failed to load dashboard data.");
    const payload = await response.json();
    setAnalytics({ ...initialAnalytics, ...(payload.analytics || {}) });
    setRecentLogs(payload.recent_logs || []);
  }, [logLimit]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    refresh()
      .catch((err) => {
        if (!cancelled) setError(err.message || "Load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh().catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { analytics, recentLogs, loading, error, refresh, apiBase: API_BASE_URL };
}
