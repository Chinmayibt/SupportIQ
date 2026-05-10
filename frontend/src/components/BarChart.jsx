import Plot from "react-plotly.js";

export default function BarChart({ title, items, keyName }) {
  const x = items.map((item) => item[keyName]);
  const y = items.map((item) => item.count);

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <Plot
        data={[
          {
            x,
            y,
            type: "bar",
            marker: { color: "#3b82f6" }
          }
        ]}
        layout={{
          autosize: true,
          margin: { l: 40, r: 20, t: 30, b: 70 },
          paper_bgcolor: "#ffffff",
          plot_bgcolor: "#ffffff"
        }}
        style={{ width: "100%", height: "300px" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
