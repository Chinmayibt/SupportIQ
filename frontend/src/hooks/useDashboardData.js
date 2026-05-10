import { useCallback, useEffect, useState } from "react";

/**
 * API origin for FastAPI (no trailing slash).
 * - If `VITE_API_BASE_URL` is set (e.g. http://localhost:8000), use it.
 * - Otherwise use `/api` so Vite dev proxy or a same-origin reverse proxy can reach the backend.
 * Avoid defaulting production builds to http://localhost:8000 (breaks real deployments).
 */
function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw != null && String(raw).trim() !== "") {
    return String(raw).replace(/\/+$/, "");
  }
  return "/api";
}

const API_BASE_URL = resolveApiBaseUrl();

const initialAnalytics = {
  total_predictions: 0,
  main_class_distribution: [],
  sentiment_distribution: [],
  language_distribution: [],
  kpi: { total_tickets: 0, complaints: 0, avg_confidence: 0, active_languages: 0 },
  category_distribution: [],
  ticket_trend: [],
  intent_distribution: [],
  prediction_log_exists: false,
};

export function useDashboardData(logLimit = 100) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [recentLogs, setRecentLogs] = useState([]);
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard?limit=${logLimit}`);
    if (!response.ok) throw new Error("Failed to load dashboard data.");
    const payload = await response.json();
    setAnalytics({ ...initialAnalytics, ...(payload.analytics || {}) });
    setRecentLogs(payload.recent_logs || []);
    setModelStatus(payload.model_status || null);
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

  return { analytics, recentLogs, modelStatus, loading, error, refresh, apiBase: API_BASE_URL };
}
