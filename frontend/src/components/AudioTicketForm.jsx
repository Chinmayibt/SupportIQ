import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function AudioTicketForm({ onPrediction }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitAudio() {
    if (!file) {
      setError("Please upload an audio file.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE_URL}/predict/audio`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Audio prediction failed.");
      }
      onPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card glass">
      <h3>Voice Ticket Support</h3>
      <input
        type="file"
        accept="audio/*,.m4a,.aac,.flac,.ogg,.wma,.webm,.mp4,.3gp,.amr"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={submitAudio} disabled={loading}>{loading ? "Transcribing..." : "Upload & Predict"}</button>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
