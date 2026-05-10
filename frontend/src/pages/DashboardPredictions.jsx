import PredictionSection from "../components/PredictionSection";

export default function DashboardPredictions() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <h2 className="text-xl font-semibold text-[#111827]">Predictions</h2>
      <PredictionSection mode="text" />
    </div>
  );
}
