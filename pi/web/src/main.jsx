import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AlarmBanner from "./components/AlarmBanner";
import { avaliarAlarmes } from "./utils/alarms";

import "./style.css";

const MAX_POINTS = 60;

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

function criarTelemetriaAnterior() {
  return {
    time: new Date().toLocaleTimeString(),

    rpm: 900,
    map_kpa: 100,
    lambda1: 1.0,

    tps: 0,
    ect_c: 85,
    iat_c: 28,

    battery_v: 13.8,
    oil_bar: 4.0,
    fuel_bar: 3.1,
  };
}

function gerarTelemetria(anterior = criarTelemetriaAnterior()) {
  const rpm = limitar(anterior.rpm + (Math.random() - 0.5) * 280, 750, 6500);

  const mapKpa = limitar(
    anterior.map_kpa + (Math.random() - 0.5) * 12,
    30,
    220,
  );

  const tps = limitar(anterior.tps + (Math.random() - 0.5) * 12, 0, 100);

  return {
    time: new Date().toLocaleTimeString(),

    rpm: Math.round(rpm),

    map_kpa: Math.round(mapKpa),

    lambda1: Number((1 + (Math.random() - 0.5) * 0.04).toFixed(2)),

    tps: Math.round(tps),

    ect_c: Math.round(
      limitar(anterior.ect_c + (Math.random() - 0.5) * 2, 75, 110),
    ),

    iat_c: Math.round(
      limitar(anterior.iat_c + (Math.random() - 0.5) * 2, 20, 55),
    ),

    battery_v: Number(
      limitar(
        anterior.battery_v + (Math.random() - 0.5) * 0.15,
        12,
        14.8,
      ).toFixed(1),
    ),

    oil_bar: Number(
      limitar(anterior.oil_bar + (Math.random() - 0.5) * 0.3, 0.5, 6).toFixed(
        1,
      ),
    ),

    fuel_bar: Number(
      limitar(anterior.fuel_bar + (Math.random() - 0.5) * 0.2, 1, 5).toFixed(1),
    ),
  };
}

function aplicarModoSimulacao(ponto, anterior, modo) {
  const resultado = { ...ponto };

  switch (modo) {
    case "temperature":
      resultado.ect_c = Math.min(anterior.ect_c + 2, 115);
      break;

    case "battery":
      resultado.battery_v = Number(
        Math.max(anterior.battery_v - 0.2, 10.5).toFixed(1),
      );
      break;

    case "oil":
      resultado.oil_bar = Number(
        Math.max(anterior.oil_bar - 0.3, 0.3).toFixed(1),
      );
      break;

    case "fuel":
      resultado.fuel_bar = Number(
        Math.max(anterior.fuel_bar - 0.2, 0.8).toFixed(1),
      );
      break;

    case "normal":
    default:
      break;
  }

  return resultado;
}

function Card({ title, value }) {
  return (
    <div className="card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const [simulationMode, setSimulationMode] = useState("normal");

  const [telemetry, setTelemetry] = useState(() => [criarTelemetriaAnterior()]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((previous) => {
        const lastPoint = previous.at(-1) || criarTelemetriaAnterior();

        const generatedPoint = gerarTelemetria(lastPoint);

        const nextPoint = aplicarModoSimulacao(
          generatedPoint,
          lastPoint,
          simulationMode,
        );

        return [...previous.slice(-(MAX_POINTS - 1)), nextPoint];
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simulationMode]);

  const current = telemetry.at(-1) || criarTelemetriaAnterior();

  const alarms = avaliarAlarmes(current);

  return (
    <main>
      <h1>Pi-ECU Dashboard</h1>

      <p className="status">
        <span className="led"></span>
        Modo simulação — nenhum hardware conectado
      </p>

      <AlarmBanner alarms={alarms} />

      <div className="simulation-controls">
        <label htmlFor="simulation-mode">TESTE DE SIMULAÇÃO</label>

        <select
          id="simulation-mode"
          value={simulationMode}
          onChange={(event) => setSimulationMode(event.target.value)}
        >
          <option value="normal">Operação normal</option>

          <option value="temperature">Aumentar temperatura</option>

          <option value="battery">Reduzir bateria</option>

          <option value="oil">Reduzir pressão de óleo</option>

          <option value="fuel">Reduzir pressão de combustível</option>
        </select>
      </div>

      <section className="cards">
        <Card title="RPM" value={current.rpm} />

        <Card title="MAP" value={`${current.map_kpa} kPa`} />

        <Card title="Lambda" value={current.lambda1.toFixed(2)} />
      </section>

      <section className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={telemetry}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis yAxisId="rpm" domain={[0, 7000]} tickCount={8} />

            <YAxis yAxisId="map" orientation="right" domain={[0, 250]} hide />

            <Tooltip />

            <Legend />

            <Line
              yAxisId="rpm"
              type="monotone"
              dataKey="rpm"
              stroke="#f11631"
              strokeWidth={2}
              dot={false}
              name="RPM"
            />

            <Line
              yAxisId="map"
              type="monotone"
              dataKey="map_kpa"
              stroke="#00a8ff"
              strokeWidth={2}
              dot={false}
              name="MAP (kPa)"
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="secondary-cards">
        <Card title="TPS" value={`${current.tps} %`} />

        <Card title="ECT" value={`${current.ect_c} °C`} />

        <Card title="IAT" value={`${current.iat_c} °C`} />

        <Card title="Bateria" value={`${current.battery_v} V`} />

        <Card title="Óleo" value={`${current.oil_bar} bar`} />

        <Card title="Combustível" value={`${current.fuel_bar} bar`} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
