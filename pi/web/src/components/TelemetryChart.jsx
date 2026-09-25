import React, { useMemo } from "react";
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

const FALLBACK_CHANNELS = [
    { id: "rpm", nome: "RPM", unidade: "rpm", cor: "#f11631" },
    { id: "map_kpa", nome: "MAP", unidade: "kPa", cor: "#00a8ff" },
    { id: "lambda1", nome: "Lambda", unidade: "λ", cor: "#00d084" },
    { id: "tps", nome: "TPS", unidade: "%", cor: "#9c6cff" },
    { id: "fuel_bar", nome: "Pressão de combustível", unidade: "bar", cor: "#ffd600" },
    { id: "oil_bar", nome: "Pressão de óleo", unidade: "bar", cor: "#ff8a00" },
    { id: "ect_c", nome: "Temperatura do motor", unidade: "°C", cor: "#ff3151" },
    { id: "iat_c", nome: "Temperatura do ar", unidade: "°C", cor: "#00d9ff" },
    { id: "battery_v", nome: "Bateria", unidade: "V", cor: "#00e676" },
];

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
    return channel?.cor || channel?.color || "#00a8ff";
}

function normalizeData(data) {
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => ({
        ...item,
        time: item.time || item.timestamp || `${index + 1}s`,
    }));
}

function TelemetryChart({
    telemetry = [],
    data = [],
    selectedChannels = ["rpm", "map_kpa"],
    channels = FALLBACK_CHANNELS,
    showLegend = true,
    showGrid = true,
}) {
    const chartData = useMemo(
        () => normalizeData(telemetry.length ? telemetry : data),
        [telemetry, data]
    );

    const availableChannels = Array.isArray(channels) && channels.length
        ? channels
        : FALLBACK_CHANNELS;

    const activeChannels = Array.isArray(selectedChannels) && selectedChannels.length
        ? selectedChannels
        : ["rpm", "map_kpa"];

    if (!chartData.length) {
        return (
            <div className="telemetry-empty">
                Aguardando dados de telemetria...
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
                margin={{ top: 16, right: 12, left: 0, bottom: 5 }}
            >
                {showGrid && <CartesianGrid strokeDasharray="3 3" />}

                <XAxis
                    dataKey="time"
                    minTickGap={28}
                    tick={{ fill: "#73818b", fontSize: 9 }}
                />

                <YAxis
                    allowDecimals
                    tick={{ fill: "#73818b", fontSize: 9 }}
                />

                <Tooltip
                    contentStyle={{
                        border: "1px solid #3b4b57",
                        borderRadius: "4px",
                        color: "#dce7eb",
                        background: "#111b21",
                    }}
                />

                {showLegend && <Legend />}

                {activeChannels.map((channelId) => {
                    const channel = availableChannels.find(
                        (item) => getId(item) === channelId
                    );

                    const fallback = FALLBACK_CHANNELS.find(
                        (item) => getId(item) === channelId
                    );

                    const definition = channel || fallback;
                    if (!definition) return null;

                    return (
                        <Line
                            key={channelId}
                            type="monotone"
                            dataKey={channelId}
                            name={`${getName(definition)} (${getUnit(definition)})`}
                            stroke={getColor(definition)}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            connectNulls
                            isAnimationActive={false}
                        />
                    );
                })}
            </LineChart>
        </ResponsiveContainer>
    );
}

export default TelemetryChart;