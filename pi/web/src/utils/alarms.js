export function avaliarAlarmes(telemetria) {
    if (!telemetria) return [];
    const alarms = [];
    const add = (canal, nivel, mensagem, valor) => alarms.push({ canal, nivel, mensagem, valor });

    if (Number(telemetria.rpm) >= 6000) add("rpm", "critico", "Rotação elevada", telemetria.rpm);
    if (Number(telemetria.ect_c) >= 105) add("ect_c", "critico", "Temperatura do motor muito alta", telemetria.ect_c);
    else if (Number(telemetria.ect_c) >= 98) add("ect_c", "alerta", "Temperatura do motor elevada", telemetria.ect_c);
    if (Number(telemetria.battery_v) < 12) add("battery_v", "critico", "Tensão da bateria baixa", telemetria.battery_v);
    if (Number(telemetria.oil_bar) < 1.2) add("oil_bar", "critico", "Pressão de óleo baixa", telemetria.oil_bar);
    if (Number(telemetria.fuel_bar) < 2) add("fuel_bar", "alerta", "Pressão de combustível baixa", telemetria.fuel_bar);
    if (Number(telemetria.lambda1) < 0.85 || Number(telemetria.lambda1) > 1.15) add("lambda1", "alerta", "Lambda fora da faixa configurada", telemetria.lambda1);
    if (Number(telemetria.map_kpa) > 210) add("map_kpa", "alerta", "Pressão MAP elevada", telemetria.map_kpa);

    return alarms;
}

export function alarmSignature(alarm) {
    return `${alarm.canal || "geral"}:${alarm.nivel}:${alarm.mensagem}`;
}