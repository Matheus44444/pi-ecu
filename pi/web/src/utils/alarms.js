export function avaliarAlarmes(telemetria) {
    const alarmes = [];

    if (!telemetria) {
        return alarmes;
    }

    if (telemetria.rpm >= 6000) {
        alarmes.push({
            nivel: "critico",
            mensagem: "Rotação elevada",
        });
    }

    if (telemetria.ect_c >= 105) {
        alarmes.push({
            nivel: "critico",
            mensagem: "Temperatura do motor muito alta",
        });
    } else if (telemetria.ect_c >= 98) {
        alarmes.push({
            nivel: "alerta",
            mensagem: "Temperatura do motor elevada",
        });
    }

    if (telemetria.battery_v < 12.0) {
        alarmes.push({
            nivel: "critico",
            mensagem: "Tensão da bateria baixa",
        });
    }

    if (telemetria.oil_bar < 1.2) {
        alarmes.push({
            nivel: "critico",
            mensagem: "Pressão de óleo baixa",
        });
    }

    if (telemetria.fuel_bar < 2.0) {
        alarmes.push({
            nivel: "alerta",
            mensagem: "Pressão de combustível baixa",
        });
    }

    if (
        telemetria.lambda1 < 0.85 ||
        telemetria.lambda1 > 1.15
    ) {
        alarmes.push({
            nivel: "alerta",
            mensagem: "Lambda fora da faixa configurada",
        });
    }

    if (telemetria.map_kpa > 210) {
        alarmes.push({
            nivel: "alerta",
            mensagem: "Pressão MAP elevada",
        });
    }

    return alarmes;
}