import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useDashboardContext } from "../context/DashboardDataContext";

export default function AudioTicketForm({ onPrediction }) {
  const { apiBase } = useDashboardContext();
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
      const response = await fetch(`${apiBase}/predict/audio`, { method: "POST", body: formData });
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
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#6366F1]/10 p-3 text-[#6366F1]">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#111827]">Voice ticket</h3>
          <p className="text-sm text-[#6B7280]">MP3, WAV, M4A, and other common formats.</p>
        </div>
      </div>
      <input
        type="file"
        accept="audio/*,.m4a,.aac,.flac,.ogg,.wma,.webm,.mp4,.3gp,.amr"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mt-4 block w-full text-sm text-[#6B7280] file:mr-4 file:rounded-xl file:border-0 file:bg-[#6366F1]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#6366F1] hover:file:bg-[#6366F1]/20"
      />
      <button
        type="button"
        onClick={submitAudio}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6366F1]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 disabled:opacity-60 sm:w-auto"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Transcribing…" : "Upload & predict"}
      </button>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
