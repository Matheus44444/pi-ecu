export function exportarCSV(registros) {
    if (!registros || registros.length === 0) {
        return;
    }

    const colunas = [
        "time",
        "rpm",
        "map_kpa",
        "lambda1",
        "tps",
        "ect_c",
        "iat_c",
        "battery_v",
        "oil_bar",
        "fuel_bar",
    ];

    const linhas = [
        colunas.join(","),
        ...registros.map((registro) =>
            colunas
                .map((coluna) => registro[coluna] ?? "")
                .join(",")
        ),
    ];

    const arquivo = new Blob(
        [`\ufeff${linhas.join("\n")}`],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = `telemetria-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}