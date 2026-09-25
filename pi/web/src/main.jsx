import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import downloadTelemetryCsv from "./utils/csvExport";
import AlarmBanner from "./components/AlarmBanner";
import ChannelDetails from "./components/ChannelDetails";
import MetricCard from "./components/MetricCard";
import SimulationPanel from "./components/SimulationPanel";
import TelemetryChart from "./components/TelemetryChart";
import channels from "./data/channels";

const DEFAULT_VALUES = {
  rpm: 2500,
  map_kpa: 120,
  tps: 40,
  ect_c: 85,
  fuel_bar: 3.1,
  oil_bar: 4,
  lambda1: 0.94,
  iat_c: 35,
  battery_v: 13.7,
};

const DEFAULT_SETTINGS = {
  mainChartChannels: ["rpm", "map_kpa"],
  selectedChannel: "tps",
  showSelectedChart: false,
  showMainLegend: true,
  showSensorCards: true,
  showGrid: true,
  maxMainChannels: 2,
};

const FALLBACK_CHANNELS = [
  { id: "rpm", nome: "RPM", unidade: "rpm", cor: "#ff3151" },
  { id: "map_kpa", nome: "MAP", unidade: "kPa", cor: "#16b9ff" },
  { id: "lambda1", nome: "Lambda", unidade: "λ", cor: "#00d084" },
  { id: "tps", nome: "TPS", unidade: "%", cor: "#b085ff" },
  { id: "fuel_bar", nome: "Pressão de combustível", unidade: "bar", cor: "#ffd600" },
  { id: "oil_bar", nome: "Pressão de óleo", unidade: "bar", cor: "#ff9418" },
  { id: "ect_c", nome: "Temperatura do motor", unidade: "°C", cor: "#ff3151" },
  { id: "iat_c", nome: "Temperatura do ar", unidade: "°C", cor: "#00d9ff" },
  { id: "battery_v", nome: "Bateria", unidade: "V", cor: "#00e676" },
];

const CHANNEL_LIST = Array.isArray(channels) && channels.length ? channels : FALLBACK_CHANNELS;

function getId(channel) {
  return channel?.id || channel?.key || channel?.name;
}

function getName(channel) {
  return channel?.nome || channel?.label || channel?.name || getId(channel);
}

function getUnit(channel) {
  return channel?.unidade || channel?.unit || "";
}

function getColor(channel) {
  return channel?.cor || channel?.color || "#16b9ff";
}

function getChannel(id) {
  return CHANNEL_LIST.find((channel) => getId(channel) === id) || FALLBACK_CHANNELS.find((channel) => getId(channel) === id) || FALLBACK_CHANNELS[0];
}

function normalizeSettings(value) {
  const saved = value && typeof value === "object" ? value : {};
  const validIds = new Set(CHANNEL_LIST.map(getId));
  const selected = Array.isArray(saved.mainChartChannels)
    ? saved.mainChartChannels.filter((id) => validIds.has(id))
    : DEFAULT_SETTINGS.mainChartChannels;

  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    mainChartChannels: selected.length ? selected.slice(0, 4) : DEFAULT_SETTINGS.mainChartChannels,
    maxMainChannels: Math.max(1, Math.min(4, Number(saved.maxMainChannels) || 2)),
  };
}

function initialTelemetry() {
  return {
    time: new Date().toLocaleTimeString("pt-BR"),
    ...DEFAULT_VALUES,
  };
}

function nextTelemetry(previous) {
  const nextTps = Math.max(0, Math.min(100, previous.tps + (Math.random() - 0.5) * 4));
  const rpmTarget = 850 + nextTps * 42;
  const nextRpm = Math.max(700, Math.min(7000, previous.rpm + (rpmTarget - previous.rpm) * 0.12 + (Math.random() - 0.5) * 120));
  const mapTarget = 30 + nextTps * 1.7;
  const nextMap = Math.max(20, Math.min(250, previous.map_kpa + (mapTarget - previous.map_kpa) * 0.1 + (Math.random() - 0.5) * 4));

  return {
    time: new Date().toLocaleTimeString("pt-BR"),
    rpm: Math.round(nextRpm),
    map_kpa: Number(nextMap.toFixed(1)),
    tps: Number(nextTps.toFixed(1)),
    lambda1: Number(Math.max(0.7, Math.min(1.3, 1.02 - nextTps / 100 * 0.14 + (Math.random() - 0.5) * 0.025)).toFixed(2)),
    fuel_bar: Number((3.25 + nextTps / 100 * 0.25 + (Math.random() - 0.5) * 0.1).toFixed(2)),
    oil_bar: Number((2.4 + nextRpm / 2300 + (Math.random() - 0.5) * 0.15).toFixed(2)),
    ect_c: Number(Math.min(120, previous.ect_c + (Math.random() - 0.45) * 0.12).toFixed(1)),
    iat_c: Number((30 + nextTps / 100 * 16 + (Math.random() - 0.5)).toFixed(1)),
    battery_v: Number((13.7 + (Math.random() - 0.5) * 0.2).toFixed(2)),
  };
}

function displayValue(value, channel) {
  if (value === undefined || value === null) return "—";
  const id = getId(channel);
  if (id === "rpm") return Math.round(value);
  if (id === "lambda1") return Number(value).toFixed(2);
  if (id === "battery_v") return Number(value).toFixed(1);
  return Number(value).toFixed(1);
}

function App() {
  const [telemetry, setTelemetry] = useState(() => [initialTelemetry()]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem("pi-ecu-dashboard-settings") || "null"));
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [simulationValues, setSimulationValues] = useState(() => ({ ...DEFAULT_VALUES }));
  const [selectedChannel, setSelectedChannel] = useState(settings.selectedChannel || "tps");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTelemetry((current) => {
        const previous = current[current.length - 1] || initialTelemetry();
        return [...current, nextTelemetry(previous)].slice(-40);
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("pi-ecu-dashboard-settings", JSON.stringify({ ...settings, selectedChannel }));
  }, [settings, selectedChannel]);

  const current = telemetry[telemetry.length - 1] || initialTelemetry();
  const selectedDefinition = useMemo(() => getChannel(selectedChannel), [selectedChannel]);

  function updateSetting(key, value) {
    setSettings((old) => ({ ...old, [key]: value }));
  }

  function toggleChartChannel(id) {
    setSettings((old) => {
      const currentIds = old.mainChartChannels || [];
      if (currentIds.includes(id)) {
        if (currentIds.length === 1) return old;
        return { ...old, mainChartChannels: currentIds.filter((item) => item !== id) };
      }
      if (currentIds.length >= old.maxMainChannels) return old;
      return { ...old, mainChartChannels: [...currentIds, id] };
    });
  }

  function resetAll() {
    setSettings(DEFAULT_SETTINGS);
    setSimulationValues(DEFAULT_VALUES);
    setSelectedChannel(DEFAULT_SETTINGS.selectedChannel);
  }

  function renderPrimaryMetric(id) {
    const channel = getChannel(id);

    return (
      <MetricCard
        key={id}
        canal={channel}
        channel={channel}
        title={getName(channel)}
        label={getName(channel)}
        value={displayValue(current[id], channel)}
        unit={getUnit(channel)}
        color={getColor(channel)}
      />
    );
  }

  function renderSensorCard(channel) {
    const id = getId(channel);
    const active = selectedChannel === id;

    return (
      <button
        className={`sensor-card ${active ? "active" : ""}`}
        key={id}
        type="button"
        onClick={() => setSelectedChannel(id)}
        style={{ "--channel-color": getColor(channel) }}
      >
        <span className="sensor-card-label">{getName(channel)}</span>
        <strong>{displayValue(current[id], channel)}</strong>
        <small>{getUnit(channel)}</small>
        <em>CLIQUE PARA SELECIONAR</em>
      </button>
    );
  }

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">PI-ECU / LABORATÓRIO DE TELEMETRIA</div>
          <h1>PI-ECU DASHBOARD</h1>
          <p className="connection-status"><span className="status-dot" /> MODO SIMULAÇÃO — NENHUM HARDWARE CONECTADO</p>
        </div>

        <div className="header-actions">
          <button
            className="csv-button"
            type="button"
            onClick={() => {
              downloadTelemetryCsv(
                telemetry,
                `pi-ecu-${new Date()
                  .toISOString()
                  .slice(0, 19)
                  .replace(/:/g, "-")}.csv`
              );
            }}
          >
            ↓ EXPORTAR CSV
          </button>

          <button
            className="settings-button"
            type="button"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙ CONFIGURAÇÕES
          </button>
        </div>

      </header>

      <div className="system-status">
        <span className="status-dot" />
        SISTEMA NORMAL
        <span className="status-divider">•</span>
        NENHUM ALARME
      </div>

      <AlarmBanner />

      <section className="primary-metrics">
        {[
          "rpm",
          "map_kpa",
          "tps",
          "lambda1",
          "ect_c",
          "battery_v",
        ].map(renderPrimaryMetric)}
      </section>

      <section className="section-heading">
        <div>
          <span className="section-kicker">MONITORAMENTO</span>
          <h2>Telemetria em tempo real</h2>
        </div>
        <span className="sample-count">{telemetry.length} amostras</span>
      </section>

      <section className="chart-box main-chart-box">
        <div className="chart-title">LIVE TELEMETRY / CANAIS PRINCIPAIS</div>
        <TelemetryChart
          telemetry={telemetry}
          data={telemetry}
          selectedChannels={settings.mainChartChannels}
          channels={CHANNEL_LIST}
          showLegend={settings.showMainLegend}
          showGrid={settings.showGrid}
        />
      </section>

      {settings.showSensorCards && (
        <>
          <section className="section-heading compact-heading">
            <div>
              <span className="section-kicker">SENSORES</span>
              <h2>Canais disponíveis</h2>
            </div>
            <span className="section-hint">Clique para selecionar</span>
          </section>

          <section className="channel-grid">
            {CHANNEL_LIST.filter((channel) => !["rpm", "map_kpa", "tps", "lambda1", "ect_c", "battery_v"].includes(getId(channel))).map(renderSensorCard)}
          </section>
        </>
      )}

      {settings.showSelectedChart && (
        <section className="selected-chart-box">
          <div className="selected-chart-header">
            <span>CANAL EM DETALHE</span>
            <strong style={{ color: getColor(selectedDefinition) }}>{getName(selectedDefinition)}</strong>
          </div>
          <ChannelDetails channelId={selectedChannel} telemetry={telemetry} data={current} />
        </section>
      )}

      <section className="simulation-collapsed">
        <div>
          <span className="section-kicker">CONTROLE DA SIMULAÇÃO</span>
          <strong>Parâmetros iniciais do motor</strong>
          <small>RPM, MAP, TPS, temperatura e pressões</small>
        </div>
        <button type="button" onClick={() => setSimulationOpen((value) => !value)}>
          {simulationOpen ? "OCULTAR" : "ABRIR CONTROLES"}
        </button>
      </section>

      {simulationOpen && (
        <SimulationPanel
          valores={simulationValues}
          values={simulationValues}
          onChange={setSimulationValues}
          onApply={setSimulationValues}
        />
      )}

      <section className="selected-channel-footer">
        <span>CANAL SELECIONADO</span>
        <strong style={{ color: getColor(selectedDefinition) }}>{getName(selectedDefinition)}</strong>
      </section>

      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <aside className="settings-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="settings-drawer-header">
              <div>
                <span>PI-ECU</span>
                <h2>CONFIGURAÇÕES</h2>
              </div>
              <button className="settings-close" type="button" onClick={() => setSettingsOpen(false)} aria-label="Fechar configurações">×</button>
            </div>

            <section className="settings-section">
              <h3>CANAIS DO GRÁFICO PRINCIPAL</h3>
              <p className="settings-help">Use até {settings.maxMainChannels} canais de cada vez. Para melhor leitura, combine sinais de escala semelhante.</p>
              <div className="settings-channel-list">
                {CHANNEL_LIST.map((channel) => {
                  const id = getId(channel);
                  return (
                    <label className="settings-check-row" key={id}>
                      <input type="checkbox" checked={settings.mainChartChannels.includes(id)} onChange={() => toggleChartChannel(id)} />
                      <span className="channel-color" style={{ backgroundColor: getColor(channel) }} />
                      <span>{getName(channel)}</span>
                      <small>{getUnit(channel)}</small>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="settings-section">
              <h3>CANAL EM DETALHE</h3>
              <select className="settings-select" value={selectedChannel} onChange={(event) => setSelectedChannel(event.target.value)}>
                {CHANNEL_LIST.map((channel) => <option key={getId(channel)} value={getId(channel)}>{getName(channel)}</option>)}
              </select>
              <label className="settings-check-row settings-spaced-row">
                <input type="checkbox" checked={settings.showSelectedChart} onChange={(event) => updateSetting("showSelectedChart", event.target.checked)} />
                <span>Mostrar canal em detalhe</span>
              </label>
            </section>

            <section className="settings-section">
              <h3>ELEMENTOS DA TELA</h3>
              <label className="settings-check-row"><input type="checkbox" checked={settings.showMainLegend} onChange={(event) => updateSetting("showMainLegend", event.target.checked)} /><span>Mostrar legenda do gráfico</span></label>
              <label className="settings-check-row"><input type="checkbox" checked={settings.showSensorCards} onChange={(event) => updateSetting("showSensorCards", event.target.checked)} /><span>Mostrar sensores secundários</span></label>
              <label className="settings-check-row"><input type="checkbox" checked={settings.showGrid} onChange={(event) => updateSetting("showGrid", event.target.checked)} /><span>Mostrar grade do gráfico</span></label>
            </section>

            <section className="settings-section">
              <h3>LIMITE DE CANAIS</h3>
              <select className="settings-select" value={settings.maxMainChannels} onChange={(event) => {
                const maximum = Number(event.target.value);
                setSettings((old) => ({ ...old, maxMainChannels: maximum, mainChartChannels: old.mainChartChannels.slice(0, maximum) }));
              }}>
                <option value={1}>1 canal</option>
                <option value={2}>2 canais</option>
                <option value={3}>3 canais</option>
                <option value={4}>4 canais</option>
              </select>
            </section>

            <div className="settings-drawer-footer">
              <button className="restore-button" type="button" onClick={resetAll}>RESTAURAR PADRÕES</button>
              <button className="apply-button" type="button" onClick={() => setSettingsOpen(false)}>FECHAR</button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);