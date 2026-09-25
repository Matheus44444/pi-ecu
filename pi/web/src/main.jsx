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
import ChannelDetails from "./components/ChannelDetails";
import MetricCard from "./components/MetricCard";
import SimulationPanel from "./components/SimulationPanel";

import { canais } from "./data/channels";
import { avaliarAlarmes } from "./utils/alarms";
import { exportarCSV } from "./utils/csvExport";

import "./style.css";

const MAX_POINTS = 60;

const valoresPadrao = {
  rpm: 900,
  map_kpa: 100,
  tps: 0,
  ect_c: 85,
  iat_c: 28,
  battery_v: 13.8,
  oil_bar: 4.0,
  fuel_bar: 3.1,
  lambda1: 1.0,
};

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

function criarTelemetriaAnterior(
  valores = valoresPadrao
) {
  return {
    time: new Date().toLocaleTimeString(),

    rpm: valores.rpm ?? 900,
    map_kpa: valores.map_kpa ?? 100,
    lambda1: valores.lambda1 ?? 1.0,

    tps: valores.tps ?? 0,
    ect_c: valores.ect_c ?? 85,
    iat_c: valores.iat_c ?? 28,

    battery_v: valores.battery_v ?? 13.8,
    oil_bar: valores.oil_bar ?? 4.0,
    fuel_bar: valores.fuel_bar ?? 3.1,
  };
}

function gerarTelemetria(
  anterior = criarTelemetriaAnterior()
) {
  const rpm = limitar(
    anterior.rpm + (Math.random() - 0.5) * 280,
    750,
    6500
  );

  const mapKpa = limitar(
    anterior.map_kpa + (Math.random() - 0.5) * 12,
    30,
    220
  );

  const tps = limitar(
    anterior.tps + (Math.random() - 0.5) * 12,
    0,
    100
  );

  return {
    time: new Date().toLocaleTimeString(),

    rpm: Math.round(rpm),
    map_kpa: Math.round(mapKpa),

    lambda1: Number(
      (
        anterior.lambda1 +
        (Math.random() - 0.5) * 0.04
      ).toFixed(2)
    ),

    tps: Math.round(tps),

    ect_c: Math.round(
      limitar(
        anterior.ect_c +
        (Math.random() - 0.5) * 2,
        75,
        110
      )
    ),

    iat_c: Math.round(
      limitar(
        anterior.iat_c +
        (Math.random() - 0.5) * 2,
        20,
        55
      )
    ),

    battery_v: Number(
      limitar(
        anterior.battery_v +
        (Math.random() - 0.5) * 0.15,
        12,
        14.8
      ).toFixed(1)
    ),

    oil_bar: Number(
      limitar(
        anterior.oil_bar +
        (Math.random() - 0.5) * 0.3,
        0.5,
        6
      ).toFixed(1)
    ),

    fuel_bar: Number(
      limitar(
        anterior.fuel_bar +
        (Math.random() - 0.5) * 0.2,
        1,
        5
      ).toFixed(1)
    ),
  };
}

function aplicarModoSimulacao(
  ponto,
  anterior,
  modo
) {
  const resultado = { ...ponto };

  switch (modo) {
    case "temperature":
      resultado.ect_c = Math.min(
        anterior.ect_c + 2,
        115
      );
      break;

    case "battery":
      resultado.battery_v = Number(
        Math.max(
          anterior.battery_v - 0.2,
          10.5
        ).toFixed(1)
      );
      break;

    case "oil":
      resultado.oil_bar = Number(
        Math.max(
          anterior.oil_bar - 0.3,
          0.3
        ).toFixed(1)
      );
      break;

    case "fuel":
      resultado.fuel_bar = Number(
        Math.max(
          anterior.fuel_bar - 0.2,
          0.8
        ).toFixed(1)
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

  const [mainChartChannels, setMainChartChannels] =
    useState(() => {
      try {
        const salvo = localStorage.getItem(
          "pi-ecu-main-chart-channels"
        );

        const canaisSalvos = salvo
          ? JSON.parse(salvo)
          : ["rpm", "map_kpa"];

        return Array.isArray(canaisSalvos) &&
          canaisSalvos.length > 0
          ? canaisSalvos.slice(0, 3)
          : ["rpm", "map_kpa"];
      } catch {
        return ["rpm", "map_kpa"];
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "pi-ecu-main-chart-channels",
      JSON.stringify(mainChartChannels)
    );
  }, [mainChartChannels]);
  
  const [simulationValues, setSimulationValues] =
    useState(valoresPadrao);

  const [activeValues, setActiveValues] =
    useState(valoresPadrao);

  const [simulationMode, setSimulationMode] =
    useState("normal");

  const [selectedChannel, setSelectedChannel] =
    useState("fuel_bar");

  const [telemetry, setTelemetry] = useState([
    criarTelemetriaAnterior(valoresPadrao),
  ]);

  function aplicarConfiguracao() {
    const novoPonto =
      criarTelemetriaAnterior(simulationValues);

    setActiveValues({
      ...simulationValues,
    });

    setTelemetry([novoPonto]);

    localStorage.setItem(
      "pi-ecu-telemetry",
      JSON.stringify([novoPonto])
    );
  }

  function restaurarConfiguracao() {
    const valoresRestaurados = {
      ...valoresPadrao,
    };

    const novoPonto =
      criarTelemetriaAnterior(
        valoresRestaurados
      );

    setSimulationValues(valoresRestaurados);
    setActiveValues(valoresRestaurados);
    setTelemetry([novoPonto]);

    localStorage.setItem(
      "pi-ecu-telemetry",
      JSON.stringify([novoPonto])
    );
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((previous) => {
        const lastPoint =
          previous.at(-1) ||
          criarTelemetriaAnterior(
            activeValues
          );

        const generatedPoint =
          gerarTelemetria(lastPoint);

        const nextPoint =
          aplicarModoSimulacao(
            generatedPoint,
            lastPoint,
            simulationMode
          );

        return [
          ...previous.slice(-(MAX_POINTS - 1)),
          nextPoint,
        ];
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simulationMode, activeValues]);

  useEffect(() => {
    localStorage.setItem(
      "pi-ecu-telemetry",
      JSON.stringify(telemetry)
    );
  }, [telemetry]);

  const current =
    telemetry.at(-1) ||
    criarTelemetriaAnterior(
      activeValues
    );

  const alarms = avaliarAlarmes(current);

  const selectedDefinition =
    canais.find(
      (canal) => canal.id === selectedChannel
    ) || canais[0];

  const chartChannels = canais.filter(
    (canal) =>
      !["rpm", "map_kpa", "lambda1"].includes(canal.id)
  );
  
  function alternarCanalGrafico(canalId) {
    setMainChartChannels((atuais) => {
      if (atuais.includes(canalId)) {
        return atuais.filter(
          (id) => id !== canalId
        );
      }

      if (atuais.length >= 3) {
        return atuais;
      }

      return [...atuais, canalId];
    });
  }

  return (
    <main>
      <h1>Pi-ECU Dashboard</h1>

      <p className="status">
        <span className="led"></span>
        Modo simulação — nenhum hardware conectado
      </p>

      <AlarmBanner alarms={alarms} />

      <div className="simulation-controls">
        <label htmlFor="simulation-mode">
          TESTE DE SIMULAÇÃO
        </label>

        <select
          id="simulation-mode"
          value={simulationMode}
          onChange={(event) =>
            setSimulationMode(event.target.value)
          }
        >
          <option value="normal">
            Operação normal
          </option>

          <option value="temperature">
            Aumentar temperatura
          </option>

          <option value="battery">
            Reduzir bateria
          </option>

          <option value="oil">
            Reduzir pressão de óleo
          </option>

          <option value="fuel">
            Reduzir pressão de combustível
          </option>
        </select>
      </div>

      <SimulationPanel
        valores={simulationValues}
        onChange={setSimulationValues}
        onApply={aplicarConfiguracao}
        onReset={restaurarConfiguracao}
      />

      <button
        className="export-button"
        onClick={() => exportarCSV(telemetry)}
      >
        EXPORTAR CSV
      </button>

      <section className="cards">
        <Card
          title="RPM"
          value={current.rpm}
        />

        <Card
          title="MAP"
          value={`${current.map_kpa} kPa`}
        />

        <Card
          title="Lambda"
          value={current.lambda1.toFixed(2)}
        />
      </section>

      <section className="chart-selector">
        <div className="chart-selector-title">
          CANAIS DO GRÁFICO PRINCIPAL
        </div>

        <div className="chart-selector-options">
          <label className="chart-option">
            <input
              type="checkbox"
              checked={mainChartChannels.includes("rpm")}
              onChange={() =>
                alternarCanalGrafico("rpm")
              }
            />

            <span>RPM</span>
          </label>

          <label className="chart-option">
            <input
              type="checkbox"
              checked={mainChartChannels.includes("map_kpa")}
              onChange={() =>
                alternarCanalGrafico("map_kpa")
              }
            />

            <span>MAP</span>
          </label>

          <label className="chart-option">
            <input
              type="checkbox"
              checked={mainChartChannels.includes("lambda1")}
              onChange={() =>
                alternarCanalGrafico("lambda1")
              }
            />

            <span>LAMBDA</span>
          </label>

          {chartChannels.map((canal) => (
            <label
              className="chart-option"
              key={canal.id}
            >
              <input
                type="checkbox"
                checked={mainChartChannels.includes(canal.id)}
                onChange={() =>
                  alternarCanalGrafico(canal.id)
                }
              />

              <span>{canal.nome}</span>
            </label>
          ))}
        </div>

        <small>
          Selecione até três canais
        </small>
      </section>

      <section className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={telemetry}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />
            <YAxis />

            <Tooltip />
            <Legend />

            {mainChartChannels.map((canalId) => {
              const canal = canais.find(
                (item) => item.id === canalId
              );

              if (!canal) {
                return null;
              }

              return (
                <Line
                  key={canal.id}
                  type="monotone"
                  dataKey={canal.id}
                  stroke={canal.cor}
                  strokeWidth={2}
                  dot={false}
                  name={`${canal.nome} (${canal.unidade})`}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="selected-chart-box">
        <div className="selected-chart-header">
          <span>CANAL EM DETALHE</span>

          <strong
            style={{
              color: selectedDefinition.cor,
            }}
          >
            {selectedDefinition.nome}
          </strong>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={telemetry}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis
              domain={[
                selectedDefinition.minimo ?? "auto",
                selectedDefinition.maximo ?? "auto",
              ]}
            />

            <Tooltip
              formatter={(value) =>
                `${Number(value).toFixed(2)} ${selectedDefinition.unidade
                }`
              }
            />

            <Line
              type="monotone"
              dataKey={selectedDefinition.id}
              stroke={selectedDefinition.cor}
              strokeWidth={3}
              dot={false}
              name={`${selectedDefinition.nome} (${selectedDefinition.unidade})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="channel-grid">
        {canais
          .filter(
            (canal) =>
              ![
                "rpm",
                "map_kpa",
                "lambda1",
              ].includes(canal.id)
          )
          .map((canal) => (
            <MetricCard
              key={canal.id}
              canal={canal}
              valor={current[canal.id]}
              selecionado={
                selectedChannel === canal.id
              }
              onClick={setSelectedChannel}
            />
          ))}
      </section>

      <ChannelDetails
        canal={selectedDefinition}
        valor={current[selectedChannel]}
        historico={telemetry}
      />
    </main>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);