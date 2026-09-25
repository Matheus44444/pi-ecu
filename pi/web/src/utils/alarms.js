export function avaliarAlarmes(telemetria) {
    const alarmes = [];

    if (!telemetria) {
        return alarmes;
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

    return alarmes;
}