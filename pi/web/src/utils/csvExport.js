function escapeCsvValue(value) {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function formatCsvNumber(value) {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    if (typeof value === "number") {
        return value.toString().replace(".", ",");
    }

    return String(value).replace(".", ",");
}

function telemetryToCsv(rows = []) {
    if (!Array.isArray(rows) || rows.length === 0) {
        return "";
    }

    const preferredColumns = [
        "time",
        "timestamp",
        "rpm",
        "map_kpa",
        "tps",
        "lambda1",
        "fuel_bar",
        "oil_bar",
        "ect_c",
        "iat_c",
        "battery_v",
    ];

    const discoveredColumns = Object.keys(rows[0]);
    const columns = [
        ...preferredColumns.filter((column) => discoveredColumns.includes(column)),
        ...discoveredColumns.filter((column) => !preferredColumns.includes(column)),
    ];

    const header = columns.map(escapeCsvValue).join(";");
    const body = rows.map((row) =>
        columns
            .map((column) => escapeCsvValue(formatCsvNumber(row[column])))
            .join(";")
    );

    return [header, ...body].join("\r\n");
}

function downloadTelemetryCsv(
    rows = [],
    filename = "pi-ecu-telemetria.csv"
) {
    const csv = telemetryToCsv(rows);

    if (!csv) {
        return false;
    }

    const blob = new Blob(["\ufeff", csv], {
        type: "text/csv;charset=utf-8;",
    });

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

export {
    telemetryToCsv,
    downloadTelemetryCsv,
};

export default downloadTelemetryCsv;