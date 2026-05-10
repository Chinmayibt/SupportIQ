import SettingsPanel from "../components/SettingsPanel";

export default function DashboardSettings() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-8">
      <h2 className="text-xl font-semibold text-[#111827]">Settings</h2>
      <SettingsPanel />
    </div>
  );
}
