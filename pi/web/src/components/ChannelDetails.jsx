import TelemetryChart from "./TelemetryChart";

export default function ChannelDetails({
    channelId,
    channel,
    telemetry = [],
    data = {},
    values = {},
}) {
    const current = data || values || {};
    const value = current[channelId];

    const name =
        channel?.nome ||
        channel?.label ||
        channel?.name ||
        channelId;

    const unit =
        channel?.unidade ||
        channel?.unit ||
        "";

    const color =
        channel?.cor ||
        channel?.color ||
        "#00baff";

    return (
        <div className="channel-details-content">
            <div className="channel-details-value">
                <span>VALOR ATUAL</span>

                <strong style={{ color }}>
                    {value === undefined || value === null
                        ? "—"
                        : Number(value).toFixed(1)}
                </strong>

                <small>{unit}</small>
            </div>

            <div className="channel-details-chart">
                <TelemetryChart
                    telemetry={telemetry}
                    data={telemetry}
                    selectedChannels={[channelId]}
                    channels={channel ? [channel] : []}
                    showLegend
                    showGrid
                />
            </div>
        </div>
    );
}