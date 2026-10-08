import MetricCard from "../components/MetricCard";
import TelemetryChart from "../components/TelemetryChart";
import ChannelDetails from "../components/ChannelDetails";

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

function displayValue(value, channel) {
    if (value === undefined || value === null) return "—";

    const id = getId(channel);

    if (id === "rpm") return Math.round(value);
    if (id === "lambda1") return Number(value).toFixed(2);
    if (id === "battery_v") return Number(value).toFixed(1);

    return Number(value).toFixed(1);
}

export default function DashboardPage({
    telemetry = [],
    current = {},
    settings,
    activeAlarms = [],
    sessionNumber,
    sessionElapsed,
    sessionPaused = false,
    sessionTelemetry = [],
    channels = [],
    selectedChannel,
    selectedDefinition,
    onNewSession,
    onPauseSession,
    onFinishSession,
    onClearSession,
    onExportSession,
    onSelectChannel,
}) {
    const mainChannels = channels.length
        ? channels
        : [
            { id: "rpm", nome: "RPM", unidade: "rpm", cor: "#ff173d" },
            { id: "map_kpa", nome: "MAP", unidade: "kPa", cor: "#00baff" },
            { id: "tps", nome: "TPS", unidade: "%", cor: "#a978ff" },
            { id: "lambda1", nome: "Lambda", unidade: "λ", cor: "#00e58a" },
            { id: "ect_c", nome: "Temperatura do motor", unidade: "°C", cor: "#ff3151" },
            { id: "battery_v", nome: "Bateria", unidade: "V", cor: "#00e676" },
        ];

    const selected = selectedDefinition || mainChannels.find(
        (channel) => getId(channel) === selectedChannel,
    );

    return (
        <section className="dashboard-page">
            <section className="session-toolbar">
                <div className="session-identity">
                    <span className="section-kicker">SESSÃO DE TESTE</span>
                    <strong>#{String(sessionNumber ?? 1).padStart(3, "0")}</strong>
                </div>

                <div className="session-stats">
                    <div>
                        <span>DURAÇÃO</span>
                        <strong>{sessionElapsed ?? "00:00:00"}</strong>
                    </div>

                    <div>
                        <span>AMOSTRAS</span>
                        <strong>{sessionTelemetry.length}</strong>
                    </div>
                </div>

                <div className="session-actions">
                    <button
                        className="session-button session-button-primary"
                        type="button"
                        onClick={onNewSession}
                    >
                        NOVA SESSÃO
                    </button>

                    <button
                        className={`session-button ${sessionPaused ? "session-button-resume" : ""
                            }`}
                        type="button"
                        onClick={onPauseSession}
                    >
                        {sessionPaused ? "RETOMAR" : "PAUSAR"}
                    </button>

                    <button
                        className="session-button session-button-danger"
                        type="button"
                        onClick={onFinishSession}
                    >
                        ENCERRAR
                    </button>

                    <button
                        className="session-button session-button-export"
                        type="button"
                        onClick={onExportSession}
                    >
                        EXPORTAR CSV
                    </button>

                    <button
                        className="session-button session-button-danger"
                        type="button"
                        onClick={onClearSession}
                    >
                        LIMPAR
                    </button>
                </div>
            </section>

            {activeAlarms.length > 0 && (
                <section className="dashboard-alarm-summary">
                    <span>ALARMES ATIVOS</span>
                    <strong>{activeAlarms.length}</strong>
                </section>
            )}

            <section className="primary-metrics">
                {["rpm", "map_kpa", "tps", "lambda1", "ect_c", "battery_v"].map(
                    (id) => {
                        const channel = mainChannels.find(
                            (item) => getId(item) === id,
                        );

                        if (!channel) return null;

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
                    },
                )}
            </section>

            <section className="section-heading">
                <div>
                    <span className="section-kicker">MONITORAMENTO</span>
                    <h2>Telemetria em tempo real</h2>
                </div>

                <span className="sample-count">
                    {telemetry.length} amostras visíveis
                </span>
            </section>

            <section className="chart-box main-chart-box">
                <div className="chart-title">
                    LIVE TELEMETRY / CANAIS PRINCIPAIS
                </div>

                <TelemetryChart
                    telemetry={telemetry}
                    data={telemetry}
                    selectedChannels={settings?.mainChartChannels || ["rpm"]}
                    channels={mainChannels}
                    showLegend={settings?.showMainLegend ?? true}
                    showGrid={settings?.showGrid ?? true}
                />
            </section>

            {settings?.showSensorCards && (
                <section className="channel-grid">
                    {mainChannels
                        .filter(
                            (channel) =>
                                !["rpm", "map_kpa", "tps", "lambda1", "ect_c", "battery_v"].includes(
                                    getId(channel),
                                ),
                        )
                        .map((channel) => (
                            <button
                                type="button"
                                className={`sensor-card ${selectedChannel === getId(channel) ? "active" : ""
                                    }`}
                                key={getId(channel)}
                                onClick={() => onSelectChannel?.(getId(channel))}
                            >
                                <span className="sensor-card-label">
                                    {getName(channel)}
                                </span>

                                <strong>
                                    {displayValue(current[getId(channel)], channel)}
                                </strong>

                                <small>{getUnit(channel)}</small>
                            </button>
                        ))}
                </section>
            )}

            {settings?.showSelectedChart && selected && (
                <section className="selected-chart-box">
                    <div className="selected-chart-header">
                        <span>CANAL EM DETALHE</span>
                        <strong style={{ color: getColor(selected) }}>
                            {getName(selected)}
                        </strong>
                    </div>

                    <ChannelDetails
                        channel={selected}
                        channelId={selectedChannel}
                        telemetry={telemetry}
                        data={current}
                    />
                </section>
            )}
        </section>
    );
}