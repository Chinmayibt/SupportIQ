import PredictionSection from "../components/PredictionSection";

export default function DashboardVoice() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <h2 className="text-xl font-semibold text-[#111827]">Voice support</h2>
      <PredictionSection mode="voice" />
    </div>
  );
}
