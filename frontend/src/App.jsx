import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import AudioTicketForm from "./components/AudioTicketForm";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const initialAnalytics = {
  total_predictions: 0,
  main_class_distribution: [],
  sentiment_distribution: [],
  language_distribution: []
};

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [recentLogs, setRecentLogs] = useState([]);
  const [error, setError] = useState("");

  const hasAnalytics = useMemo(() => analytics.total_predictions > 0, [analytics]);

  async function loadAnalytics() {
    const response = await fetch(`${API_BASE_URL}/dashboard?limit=15`);
    if (!response.ok) throw new Error("Failed to load dashboard data.");
    const payload = await response.json();
    setAnalytics(payload.analytics || initialAnalytics);
    setRecentLogs(payload.recent_logs || []);
  }

  async function handlePredict() {
    if (!text.trim()) {
      setError("Please enter ticket text before prediction.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || "Prediction failed.");
      }
      const data = await response.json();
      setPrediction(data);
      await loadAnalytics();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics().catch(() => {});
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadAnalytics().catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="container dark">
      <header>
        <h1>AI Support Intelligence Platform</h1>
        <p className="subtitle">Real-time ticket automation with multilingual + voice intelligence.</p>
      </header>

      <div className="layout">
        <div className="main-content">
          <section className="card glass">
            <h2>Text Ticket Prediction</h2>
            <textarea
              rows="5"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter customer support message..."
            />
            <button onClick={handlePredict} disabled={loading}>
              {loading ? "Predicting..." : "Predict"}
            </button>
            {error ? <p className="error">{error}</p> : null}
          </section>

          <AudioTicketForm onPrediction={(data) => { setPrediction(data); loadAnalytics().catch(() => {}); }} />

          {prediction ? (
            <section className="grid">
              <div className="metric-card"><strong>Intent:</strong> {prediction.intent}</div>
              <div className="metric-card"><strong>Main Class:</strong> {prediction.main_class}</div>
              <div className="metric-card"><strong>Business Category:</strong> {prediction.business_category}</div>
              <div className="metric-card"><strong>Sentiment:</strong> {prediction.sentiment}</div>
              <div className="metric-card"><strong>Priority:</strong> {prediction.priority}</div>
              <div className="metric-card"><strong>Confidence:</strong> {prediction.confidence_score}</div>
              <div className="metric-card"><strong>Action Source:</strong> {prediction.action_source}</div>
              <div className="metric-card"><strong>Recommended Action (LLM/Rule Output):</strong> {prediction.recommended_action}</div>
              <div className="metric-card"><strong>Detected Language:</strong> {prediction.detected_language}</div>
              <div className="metric-card"><strong>Translated Text:</strong> {prediction.translated_text}</div>
              <div className="metric-card"><strong>Transcribed Audio Text:</strong> {prediction.transcript_text || "N/A"}</div>
            </section>
          ) : null}

          <section className="card glass">
            <h2>Real-Time Analytics</h2>
            <p><strong>Total Queries:</strong> {analytics.total_predictions}</p>
            {hasAnalytics ? (
              <div className="charts-grid">
                <Plot
                  data={[{ labels: (analytics.sentiment_distribution || []).map((x) => x.sentiment_normalized), values: (analytics.sentiment_distribution || []).map((x) => x.count), type: "pie" }]}
                  layout={{ title: "Sentiment (+/-/Neutral)", paper_bgcolor: "transparent", font: { color: "#e2e8f0" } }}
                  config={{ displayModeBar: false, responsive: true }}
                  style={{ width: "100%", height: "320px" }}
                />
                <Plot
                  data={[{ x: (analytics.language_distribution || []).map((x) => x.language_normalized), y: (analytics.language_distribution || []).map((x) => x.count), type: "bar" }]}
                  layout={{ title: "Language Distribution", paper_bgcolor: "transparent", font: { color: "#e2e8f0" } }}
                  config={{ displayModeBar: false, responsive: true }}
                  style={{ width: "100%", height: "320px" }}
                />
                <Plot
                  data={[{ x: (analytics.main_class_distribution || []).map((x) => x.main_class), y: (analytics.main_class_distribution || []).map((x) => x.count), type: "bar" }]}
                  layout={{ title: "Class Distribution (X) vs Queries (Y)", paper_bgcolor: "transparent", font: { color: "#e2e8f0" } }}
                  config={{ displayModeBar: false, responsive: true }}
                  style={{ width: "100%", height: "320px" }}
                />
              </div>
            ) : (
              <p>No prediction analytics available yet.</p>
            )}
          </section>

          <section className="card glass">
            <h2>Real-Time Prediction Logs</h2>
            <div className="logs-table">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Input Text</th>
                    <th>Detected Language</th>
                    <th>Translated Text</th>
                    <th>Transcript</th>
                    <th>Main Class</th>
                    <th>Intent</th>
                    <th>Business Category</th>
                    <th>Sentiment</th>
                    <th>Priority</th>
                    <th>Confidence</th>
                    <th>Recommended Action</th>
                    <th>Action Source</th>
                    <th>Model Version</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log, idx) => (
                    <tr key={`${log.timestamp}-${idx}`}>
                      <td>{log.timestamp}</td>
                      <td>{log.input_text || "N/A"}</td>
                      <td>{log.detected_language || "N/A"}</td>
                      <td>{log.translated_text || "N/A"}</td>
                      <td>{log.transcript_text || "N/A"}</td>
                      <td>{log.main_class}</td>
                      <td>{log.intent}</td>
                      <td>{log.business_category}</td>
                      <td>{log.sentiment}</td>
                      <td>{log.priority}</td>
                      <td>{log.confidence_score}</td>
                      <td>{log.recommended_action || "N/A"}</td>
                      <td>{log.action_source}</td>
                      <td>{log.model_version || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
