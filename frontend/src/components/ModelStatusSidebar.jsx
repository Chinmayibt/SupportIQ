export default function ModelStatusSidebar({ status }) {
  return (
    <aside className="sidebar glass">
      <h3>Model Status</h3>
      <div><strong>Status:</strong> {status.status || "unknown"}</div>
      <div><strong>Active Version:</strong> {status.active_version || "model_v1.pkl"}</div>
      <div><strong>Last Retrained:</strong> {status.last_retrained_at || "N/A"}</div>
      <div><strong>Model Accuracy:</strong> {status.model_accuracy ?? "N/A"}</div>
      <div><strong>Total Predictions:</strong> {status.total_predictions ?? 0}</div>
    </aside>
  );
}
