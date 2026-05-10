import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const LABELS = [
  { key: "complaint", label: "Complaint", color: "#c62828" },
  { key: "inquiry", label: "Inquiry", color: "#1565c0" },
  { key: "feedback", label: "Feedback", color: "#2e7d32" },
];

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modelReady, setModelReady] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => r.json())
      .then((d) => setModelReady(!!d.model_ready))
      .catch(() => setModelReady(false));
  }, []);

  const classify = async () => {
    const t = text.trim();
    if (!t) {
      setError("Enter a customer message to classify.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string" ? data.detail : "Classification failed.",
        );
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the API.");
    } finally {
      setLoading(false);
    }
  };

  const probs = result?.probabilities || {};
  const maxProb = Math.max(
    0.01,
    ...LABELS.map(({ key }) => Number(probs[key]) || 0),
  );

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Project 8 · Text classification</p>
        <h1>AI-Based Customer Support Classifier</h1>
        <p className="lede">
          Classify real customer support messages into{" "}
          <strong>complaint</strong>, <strong>inquiry</strong>, or{" "}
          <strong>feedback</strong>. Trained on the Twitter Customer Support
          (TWCS) dataset.
        </p>
        <div className="status-row">
          <span
            className={`pill ${modelReady ? "ok" : "warn"}`}
            title="Train the model if this shows offline"
          >
            {modelReady === null
              ? "Checking API…"
              : modelReady
                ? "Model ready"
                : "Model missing — run backend/train_model.py"}
          </span>
        </div>
      </header>

      <main className="card">
        <label htmlFor="msg">Customer query</label>
        <textarea
          id="msg"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. My internet has been down for two days and I need help."
        />
        <button type="button" onClick={classify} disabled={loading}>
          {loading ? "Classifying…" : "Classify"}
        </button>

        {error && <div className="alert error">{error}</div>}

        {result && (
          <section className="outcome" aria-live="polite">
            <h2>Prediction</h2>
            <p className="category-pill" data-cat={result.category}>
              {result.category}
            </p>
            {probs && Object.keys(probs).length > 0 && (
              <div className="probs">
                <h3>Class probabilities</h3>
                <ul>
                  {LABELS.map(({ key, label, color }) => (
                    <li key={key}>
                      <span className="prob-label" style={{ color }}>
                        {label}
                      </span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${((Number(probs[key]) || 0) / maxProb) * 100}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className="prob-val">
                        {((Number(probs[key]) || 0) * 100).toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="foot">
        <p>
          API: <code>{API_BASE}</code> ·{" "}
          <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer">
            OpenAPI docs
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
