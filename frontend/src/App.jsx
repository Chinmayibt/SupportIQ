import { useMemo, useState } from "react";
import BarChart from "./components/BarChart";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const initialAnalytics = {
  total_predictions: 0,
  most_common_issues: [],
  sentiment_distribution: [],
  category_distribution: [],
  priority_distribution: []
};

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [error, setError] = useState("");

  const hasAnalytics = useMemo(() => analytics.total_predictions > 0, [analytics]);

  async function loadAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    if (!response.ok) {
      throw new Error("Failed to load analytics.");
    }
    const data = await response.json();
    setAnalytics(data);
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

  return (
    <main className="container">
      <h1>AI-Powered Customer Support Ticket Classification System</h1>
      <p className="subtitle">Classify intent, category, sentiment, priority, and recommended action.</p>

      <section className="card">
        <h2>Predict Ticket</h2>
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

      {prediction ? (
        <section className="grid">
          <div className="metric-card"><strong>Intent:</strong> {prediction.intent}</div>
          <div className="metric-card"><strong>Business Category:</strong> {prediction.business_category}</div>
          <div className="metric-card"><strong>Sentiment:</strong> {prediction.sentiment}</div>
          <div className="metric-card"><strong>Priority:</strong> {prediction.priority}</div>
          <div className="metric-card"><strong>Confidence:</strong> {prediction.confidence_score}</div>
          <div className="metric-card"><strong>Recommended Action:</strong> {prediction.recommended_action}</div>
        </section>
      ) : null}

      <section className="card">
        <h2>Analytics Dashboard</h2>
        <p><strong>Total Predictions:</strong> {analytics.total_predictions}</p>
        {hasAnalytics ? (
          <div className="charts-grid">
            <BarChart title="Most Common Issues" items={analytics.most_common_issues.slice(0, 10)} keyName="intent" />
            <BarChart title="Sentiment Distribution" items={analytics.sentiment_distribution} keyName="sentiment" />
            <BarChart title="Category Distribution" items={analytics.category_distribution} keyName="business_category" />
            <BarChart title="Priority Distribution" items={analytics.priority_distribution} keyName="priority" />
          </div>
        ) : (
          <p>No prediction analytics available yet.</p>
        )}
      </section>
    </main>
  );
}
