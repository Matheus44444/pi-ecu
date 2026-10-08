import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import AlarmBanner from "./components/AlarmBanner";
import ChannelDetails from "./components/ChannelDetails";
import MetricCard from "./components/MetricCard";
import SimulationPanel from "./components/SimulationPanel";
import TelemetryChart from "./components/TelemetryChart";
import channels from "./data/channels";
import downloadTelemetryCsv from "./utils/csvExport";
import { avaliarAlarmes } from "./utils/alarms";
import DashboardPage from "./pages/DashboardPage";

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
  mainChartChannels: ["rpm"],
  selectedChannel: "lambda1",
  showSelectedChart: false,
  showMainLegend: true,
  showSensorCards: false,
  showGrid: true,
  maxMainChannels: 2,
};

const FALLBACK_CHANNELS = [
  { id: "rpm", nome: "RPM", unidade: "rpm", cor: "#ff173d" },
  { id: "map_kpa", nome: "MAP", unidade: "kPa", cor: "#00baff" },
  { id: "lambda1", nome: "Lambda", unidade: "λ", cor: "#00e58a" },
  { id: "tps", nome: "TPS", unidade: "%", cor: "#a978ff" },
  {
    id: "fuel_bar",
    nome: "Pressão de combustível",
    unidade: "bar",
    cor: "#ffd400",
  },
  { id: "oil_bar", nome: "Pressão de óleo", unidade: "bar", cor: "#ff8017" },
  { id: "ect_c", nome: "Temperatura do motor", unidade: "°C", cor: "#ff3151" },
  { id: "iat_c", nome: "Temperatura do ar", unidade: "°C", cor: "#00d9ff" },
  { id: "battery_v", nome: "Bateria", unidade: "V", cor: "#00e676" },
];

const CHANNEL_LIST =
  Array.isArray(channels) && channels.length ? channels : FALLBACK_CHANNELS;

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
  return channel?.cor || channel?.color || "#00baff";
}

function getChannel(id) {
  return (
    CHANNEL_LIST.find((channel) => getId(channel) === id) ||
    FALLBACK_CHANNELS.find((channel) => getId(channel) === id) ||
    FALLBACK_CHANNELS[0]
  );
}

function normalizeSettings(value) {
  const saved = value && typeof value === "object" ? value : {};
  const validIds = new Set(CHANNEL_LIST.map(getId));
  const selected = Array.isArray(saved.mainChartChannels)
    ? saved.mainChartChannels.filter((id) => validIds.has(id))
    : [];

  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    mainChartChannels: selected.length
      ? selected.slice(0, 4)
      : DEFAULT_SETTINGS.mainChartChannels,
    maxMainChannels: Math.max(
      1,
      Math.min(4, Number(saved.maxMainChannels) || 2),
    ),
  };
}

function initialTelemetry(values = DEFAULT_VALUES) {
  return {
    time: new Date().toLocaleTimeString("pt-BR"),
    ...values,
  };
}

function nextTelemetry(previous, override, manual) {
  if (manual) {
    return initialTelemetry({ ...DEFAULT_VALUES, ...override });
  }

  const tps = Math.max(
    0,
    Math.min(100, previous.tps + (Math.random() - 0.5) * 4),
  );
  const rpmTarget = 850 + tps * 42;
  const rpm = Math.max(
    700,
    Math.min(
      7000,
      previous.rpm +
        (rpmTarget - previous.rpm) * 0.12 +
        (Math.random() - 0.5) * 120,
    ),
  );
  const mapTarget = 30 + tps * 1.7;
  const map = Math.max(
    20,
    Math.min(
      250,
      previous.map_kpa +
        (mapTarget - previous.map_kpa) * 0.1 +
        (Math.random() - 0.5) * 4,
    ),
  );

  return {
    time: new Date().toLocaleTimeString("pt-BR"),
    rpm: Math.round(rpm),
    map_kpa: Number(map.toFixed(1)),
    tps: Number(tps.toFixed(1)),
    lambda1: Number(
      (1.02 - (tps / 100) * 0.14 + (Math.random() - 0.5) * 0.025).toFixed(2),
    ),
    fuel_bar: Number(
      (3.25 + (tps / 100) * 0.25 + (Math.random() - 0.5) * 0.1).toFixed(2),
    ),
    oil_bar: Number(
      (2.4 + rpm / 2300 + (Math.random() - 0.5) * 0.15).toFixed(2),
    ),
    ect_c: Number(
      Math.min(120, previous.ect_c + (Math.random() - 0.45) * 0.12).toFixed(1),
    ),
    iat_c: Number((30 + (tps / 100) * 16 + (Math.random() - 0.5)).toFixed(1)),
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

function formatSessionDuration(milliseconds) {
  const total = Math.floor(Math.max(0, milliseconds) / 1000);
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function readSessionRows() {
  try {
    const saved = sessionStorage.getItem("pi-ecu-current-session");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function App() {
  const [telemetry, setTelemetry] = useState(() => [initialTelemetry()]);
  const [sessionTelemetry, setSessionTelemetry] = useState(readSessionRows);
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionNumber, setSessionNumber] = useState(() =>
    Number(localStorage.getItem("pi-ecu-session-number") || 1),
  );
  const [sessionStartedAt, setSessionStartedAt] = useState(() =>
    Number(sessionStorage.getItem("pi-ecu-session-started-at") || Date.now()),
  );
  const [sessionAccumulatedMs, setSessionAccumulatedMs] = useState(() =>
    Number(sessionStorage.getItem("pi-ecu-session-accumulated-ms") || 0),
  );
  const [sessionRunStartedAt, setSessionRunStartedAt] = useState(() =>
    Number(
      sessionStorage.getItem("pi-ecu-session-run-started-at") || Date.now(),
    ),
  );
  const [sessionElapsed, setSessionElapsed] = useState(() =>
    Number(sessionStorage.getItem("pi-ecu-session-elapsed-ms") || 0),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState(
    () => localStorage.getItem("pi-ecu-display-mode") === "true",
  );
  const [browserFullscreen, setBrowserFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );
  const [settings, setSettings] = useState(() => {
    try {
      return normalizeSettings(
        JSON.parse(localStorage.getItem("pi-ecu-dashboard-settings") || "null"),
      );
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [simulationValues, setSimulationValues] = useState(() => ({
    ...DEFAULT_VALUES,
  }));
  const [manualSimulation, setManualSimulation] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(
    settings.selectedChannel || "lambda1",
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!sessionActive || sessionPaused) return;
      setTelemetry((currentRows) => {
        const previous =
          currentRows[currentRows.length - 1] || initialTelemetry();
        const next = nextTelemetry(
          previous,
          simulationValues,
          manualSimulation,
        );
        setSessionTelemetry((rows) => {
          const updated = [...rows, next];
          sessionStorage.setItem(
            "pi-ecu-current-session",
            JSON.stringify(updated),
          );
          return updated;
        });
        return [...currentRows, next].slice(-40);
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sessionActive, sessionPaused, simulationValues, manualSimulation]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!sessionActive || sessionPaused)
        setSessionElapsed(sessionAccumulatedMs);
      else
        setSessionElapsed(
          sessionAccumulatedMs + Date.now() - sessionRunStartedAt,
        );
    }, 250);
    return () => window.clearInterval(timer);
  }, [sessionActive, sessionPaused, sessionAccumulatedMs, sessionRunStartedAt]);

  useEffect(() => {
    localStorage.setItem(
      "pi-ecu-dashboard-settings",
      JSON.stringify({ ...settings, selectedChannel }),
    );
  }, [settings, selectedChannel]);

  useEffect(() => {
    localStorage.setItem("pi-ecu-display-mode", String(displayMode));
    document.body.classList.toggle("display-mode-active", displayMode);
  }, [displayMode]);

  useEffect(() => {
    sessionStorage.setItem(
      "pi-ecu-session-started-at",
      String(sessionStartedAt),
    );
    sessionStorage.setItem(
      "pi-ecu-session-accumulated-ms",
      String(sessionAccumulatedMs),
    );
    sessionStorage.setItem(
      "pi-ecu-session-run-started-at",
      String(sessionRunStartedAt),
    );
    sessionStorage.setItem("pi-ecu-session-elapsed-ms", String(sessionElapsed));
  }, [
    sessionStartedAt,
    sessionAccumulatedMs,
    sessionRunStartedAt,
    sessionElapsed,
  ]);

  useEffect(() => {
    const listener = () =>
      setBrowserFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  const current = telemetry[telemetry.length - 1] || initialTelemetry();
  const activeAlarms = useMemo(() => avaliarAlarmes(current), [current]);
  const selectedDefinition = useMemo(
    () => getChannel(selectedChannel),
    [selectedChannel],
  );

  function applySimulation(values) {
    const next = { ...DEFAULT_VALUES, ...values };
    setSimulationValues(next);
    setManualSimulation(true);
    setTelemetry([initialTelemetry(next)]);
  }

  function updateSetting(key, value) {
    setSettings((old) => ({ ...old, [key]: value }));
  }

  function toggleChartChannel(id) {
    setSettings((old) => {
      const ids = old.mainChartChannels || [];
      if (ids.includes(id))
        return ids.length === 1
          ? old
          : { ...old, mainChartChannels: ids.filter((item) => item !== id) };
      if (ids.length >= old.maxMainChannels) return old;
      return { ...old, mainChartChannels: [...ids, id] };
    });
  }

  function exportFullSession() {
    const rows = sessionTelemetry.length ? sessionTelemetry : telemetry;
    downloadTelemetryCsv(
      rows,
      `pi-ecu-sessao-${String(sessionNumber).padStart(3, "0")}.csv`,
    );
  }

  function startNewSession() {
    const next = sessionNumber + 1;
    const now = Date.now();
    setSessionNumber(next);
    setSessionStartedAt(now);
    setSessionRunStartedAt(now);
    setSessionAccumulatedMs(0);
    setSessionElapsed(0);
    setSessionTelemetry([]);
    setTelemetry([initialTelemetry(simulationValues)]);
    setSessionActive(true);
    setSessionPaused(false);
    sessionStorage.removeItem("pi-ecu-current-session");
    localStorage.setItem("pi-ecu-session-number", String(next));
  }

  function togglePauseSession() {
    if (!sessionActive) return;
    if (!sessionPaused) {
      const elapsed = sessionAccumulatedMs + Date.now() - sessionRunStartedAt;
      setSessionAccumulatedMs(elapsed);
      setSessionElapsed(elapsed);
      setSessionPaused(true);
    } else {
      setSessionRunStartedAt(Date.now());
      setSessionPaused(false);
    }
  }

  function finishSession() {
    if (!sessionActive) return;
    const elapsed = sessionPaused
      ? sessionAccumulatedMs
      : sessionAccumulatedMs + Date.now() - sessionRunStartedAt;
    setSessionAccumulatedMs(elapsed);
    setSessionElapsed(elapsed);
    setSessionActive(false);
    setSessionPaused(false);
  }

  function clearSession() {
    setSessionTelemetry([]);
    setTelemetry([initialTelemetry()]);
    setSessionElapsed(0);
    setSessionAccumulatedMs(0);
    sessionStorage.removeItem("pi-ecu-current-session");
  }

  async function toggleBrowserFullscreen() {
    try {
      if (!document.fullscreenElement)
        await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.warn(error);
    }
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
    return (
      <button
        className={`sensor-card ${selectedChannel === id ? "active" : ""}`}
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
    <main className={`app-shell ${displayMode ? "display-mode" : ""}`}>
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">PI-ECU / LABORATÓRIO DE TELEMETRIA</div>
          <h1>PI-ECU DASHBOARD</h1>
          <p className="connection-status">
            <span className="status-dot" /> MODO SIMULAÇÃO — NENHUM HARDWARE
            CONECTADO
          </p>
        </div>
        <div className="header-actions">
          <button
            className={`display-button ${displayMode ? "active" : ""}`}
            type="button"
            aria-pressed={displayMode}
            onClick={() => {
              setDisplayMode((value) => !value);
              setSettingsOpen(false);
            }}
          >
            {displayMode ? "▣ SAIR DISPLAY" : "▣ DISPLAY"}
          </button>
          <button
            className="fullscreen-button"
            type="button"
            onClick={toggleBrowserFullscreen}
          >
            ⛶ TELA CHEIA
          </button>
          <button
            className="csv-button"
            type="button"
            onClick={exportFullSession}
          >
            ↓ CSV SESSÃO
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

      <div
        className={`system-status ${activeAlarms.length ? "system-status-alarm" : ""}`}
      >
        <span className="status-dot" />
        {activeAlarms.length
          ? `${activeAlarms.length} ALARME${activeAlarms.length > 1 ? "S" : ""} ATIVO${activeAlarms.length > 1 ? "S" : ""}`
          : "SISTEMA NORMAL"}
        <span className="status-divider">•</span>
        {activeAlarms.length ? activeAlarms[0].mensagem : "NENHUM ALARME"}
      </div>
      <AlarmBanner
        alarms={activeAlarms}
        alarmes={activeAlarms}
        telemetry={current}
      />

      <DashboardPage
        telemetry={telemetry}
        current={current}
        settings={settings}
        activeAlarms={activeAlarms}
        sessionNumber={sessionNumber}
        sessionElapsed={formatSessionDuration(sessionElapsed)}
        sessionTelemetry={sessionTelemetry}
        sessionPaused={sessionPaused}
        channels={CHANNEL_LIST}
        selectedChannel={selectedChannel}
        selectedDefinition={selectedDefinition}
        onNewSession={startNewSession}
        onPauseSession={togglePauseSession}
        onFinishSession={finishSession}
        onClearSession={clearSession}
        onExportSession={exportFullSession}
        onSelectChannel={setSelectedChannel}
      />

      <section className="simulation-collapsed">
        <div>
          <span className="section-kicker">CONTROLE DA SIMULAÇÃO</span>
          <strong>Parâmetros iniciais do motor</strong>
          <small>RPM, MAP, TPS, temperatura e pressões</small>
        </div>

        <button
          type="button"
          onClick={() => setSimulationOpen((value) => !value)}
        >
          {simulationOpen ? "OCULTAR" : "ABRIR CONTROLES"}
        </button>
      </section>

      {simulationOpen && (
        <div className="simulation-panel-wrapper">
          <SimulationPanel
            valores={simulationValues}
            values={simulationValues}
            onChange={setSimulationValues}
            onApply={applySimulation}
          />
        </div>
      )}

      {settingsOpen && (
        <div
          className="settings-overlay"
          onClick={() => setSettingsOpen(false)}
        >
          <aside
            className="settings-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="settings-drawer-header">
              <div>
                <span>PI-ECU</span>
                <h2>CONFIGURAÇÕES</h2>
              </div>
              <button
                className="settings-close"
                type="button"
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </button>
            </div>
            <section className="settings-section">
              <h3>CANAIS DO GRÁFICO PRINCIPAL</h3>
              <p className="settings-help">
                Use até {settings.maxMainChannels} canais de cada vez.
              </p>
              <div className="settings-channel-list">
                {CHANNEL_LIST.map((channel) => {
                  const id = getId(channel);
                  return (
                    <label className="settings-check-row" key={id}>
                      <input
                        type="checkbox"
                        checked={settings.mainChartChannels.includes(id)}
                        onChange={() => toggleChartChannel(id)}
                      />
                      <span
                        className="channel-color"
                        style={{ backgroundColor: getColor(channel) }}
                      />
                      <span>{getName(channel)}</span>
                      <small>{getUnit(channel)}</small>
                    </label>
                  );
                })}
              </div>
            </section>
            <section className="settings-section">
              <h3>CANAL EM DETALHE</h3>
              <select
                className="settings-select"
                value={selectedChannel}
                onChange={(event) => setSelectedChannel(event.target.value)}
              >
                {CHANNEL_LIST.map((channel) => (
                  <option key={getId(channel)} value={getId(channel)}>
                    {getName(channel)}
                  </option>
                ))}
              </select>
              <label className="settings-check-row settings-spaced-row">
                <input
                  type="checkbox"
                  checked={settings.showSelectedChart}
                  onChange={(event) =>
                    updateSetting("showSelectedChart", event.target.checked)
                  }
                />
                <span>Mostrar canal em detalhe</span>
              </label>
            </section>
            <section className="settings-section">
              <h3>ELEMENTOS DA TELA</h3>
              <label className="settings-check-row">
                <input
                  type="checkbox"
                  checked={settings.showMainLegend}
                  onChange={(event) =>
                    updateSetting("showMainLegend", event.target.checked)
                  }
                />
                <span>Mostrar legenda do gráfico</span>
              </label>
              <label className="settings-check-row">
                <input
                  type="checkbox"
                  checked={settings.showSensorCards}
                  onChange={(event) =>
                    updateSetting("showSensorCards", event.target.checked)
                  }
                />
                <span>Mostrar sensores secundários</span>
              </label>
              <label className="settings-check-row">
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(event) =>
                    updateSetting("showGrid", event.target.checked)
                  }
                />
                <span>Mostrar grade do gráfico</span>
              </label>
            </section>
            <section className="settings-section">
              <h3>LIMITE DE CANAIS</h3>
              <select
                className="settings-select"
                value={settings.maxMainChannels}
                onChange={(event) => {
                  const maximum = Number(event.target.value);
                  setSettings((old) => ({
                    ...old,
                    maxMainChannels: maximum,
                    mainChartChannels: old.mainChartChannels.slice(0, maximum),
                  }));
                }}
              >
                <option value={1}>1 canal</option>
                <option value={2}>2 canais</option>
                <option value={3}>3 canais</option>
                <option value={4}>4 canais</option>
              </select>
            </section>
            <div className="settings-drawer-footer">
              <button
                className="restore-button"
                type="button"
                onClick={() => setSettings(DEFAULT_SETTINGS)}
              >
                RESTAURAR PADRÕES
              </button>
              <button
                className="apply-button"
                type="button"
                onClick={() => setSettingsOpen(false)}
              >
                FECHAR
              </button>
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
  </React.StrictMode>,
);
