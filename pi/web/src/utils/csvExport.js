function escapeCsvValue(value) {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function formatCsvNumber(value) {
    if (value === null || value === undefined || value === "") return "";
    return String(value).replace(".", ",");
}

export function telemetryToCsv(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) return "";
    const preferred = ["time", "timestamp", "rpm", "map_kpa", "tps", "lambda1", "fuel_bar", "oil_bar", "ect_c", "iat_c", "battery_v"];
    const discovered = Object.keys(rows[0]);
    const columns = [...preferred.filter((column) => discovered.includes(column)), ...discovered.filter((column) => !preferred.includes(column))];
    return [columns.map(escapeCsvValue).join(";"), ...rows.map((row) => columns.map((column) => escapeCsvValue(formatCsvNumber(row[column]))).join(";"))].join("\r\n");
}

export function alarmsToCsv(events = []) {
    if (!Array.isArray(events) || events.length === 0) return "";
    const columns = ["timestamp", "time", "channel", "level", "value", "message", "type"];
    return [columns.map(escapeCsvValue).join(";"), ...events.map((event) => [event.timestamp, event.time, event.channel || event.canal, event.level || event.nivel, formatCsvNumber(event.value), event.message || event.mensagem, event.type || event.tipo].map(escapeCsvValue).join(";"))].join("\r\n");
}

export function buildSessionCsv(rows = [], events = []) {
    const telemetry = telemetryToCsv(rows);
    const alarms = alarmsToCsv(events);
    return alarms ? `${telemetry}\r\n\r\nALARMES DA SESSÃO\r\n${alarms}` : telemetry;
}

export function downloadTelemetryCsv(rows = [], filename = "pi-ecu-telemetria.csv", events = []) {
    const csv = buildSessionCsv(rows, events);
    if (!csv) return false;
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}

export default downloadTelemetryCsv;