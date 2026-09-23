import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./style.css";

function App() {
  const [telemetry, setTelemetry] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const previous = telemetry.at(-1);

      const rpm = previous
        ? Math.max(700, Math.min(6500, previous.rpm + (Math.random() - 0.5) * 300))
        : 800;

      const map = previous
        ? Math.max(30, Math.min(220, previous.map_kpa + (Math.random() - 0.5) * 8))
        : 100;

      const point = {
        time: new Date().toLocaleTimeString(),
        rpm: Math.round(rpm),
        map_kpa: Math.round(map),
        lambda1: Number((1 + (Math.random() - 0.5) * 0.04).toFixed(2)),
      };

      setTelemetry((old) => [...old.slice(-59), point]);
    }, 1000);

    return () => clearInterval(timer);
  }, [telemetry]);

  const current = telemetry.at(-1) || {
    rpm: 800,
    map_kpa: 100,
    lambda1: 1.0,
  };

  return (
    <main>
      <h1>Pi-ECU Dashboard</h1>

      <p className="status">
        <span className="led"></span>
        Modo simulação — nenhum hardware conectado
      </p>

      <section className="cards">
        <Card title="RPM" value={current.rpm} />
        <Card title="MAP" value={`${current.map_kpa} kPa`} />
        <Card title="Lambda" value={current.lambda1} />
      </section>

      <section className="chart-box">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={telemetry}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="rpm"
              stroke="#e11d48"
              dot={false}
              name="RPM"
            />
            <Line
              type="monotone"
              dataKey="map_kpa"
              stroke="#2563eb"
              dot={false}
              name="MAP (kPa)"
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}

function Card({ title, value }) {
  return (
    <div className="card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
