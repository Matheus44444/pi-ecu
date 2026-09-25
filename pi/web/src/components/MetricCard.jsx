function calcularEstado(canal, valor) {
  if (!Number.isFinite(valor)) {
    return "normal";
  }

  const possuiLimiteInferior =
    canal.normalMin !== undefined ||
    canal.id === "fuel_bar" ||
    canal.id === "oil_bar" ||
    canal.id === "battery_v";

  if (
    possuiLimiteInferior &&
    canal.critico !== undefined &&
    valor <= canal.critico
  ) {
    return "critico";
  }

  if (
    possuiLimiteInferior &&
    canal.alerta !== undefined &&
    valor <= canal.alerta
  ) {
    return "alerta";
  }

  if (canal.normalMax !== undefined && valor > canal.normalMax) {
    if (canal.critico !== undefined && valor >= canal.critico) {
      return "critico";
    }

    return "alerta";
  }

  if (
    !possuiLimiteInferior &&
    canal.alerta !== undefined &&
    valor >= canal.alerta
  ) {
    return "alerta";
  }

  if (
    !possuiLimiteInferior &&
    canal.critico !== undefined &&
    valor >= canal.critico
  ) {
    return "critico";
  }

  return "normal";
}

export default function MetricCard({ canal, valor, selecionado, onClick }) {
  const valorNumerico = Number(valor);
  const estado = calcularEstado(canal, valorNumerico);

  return (
    <button
      type="button"
      className={[
        "metric-card",
        `metric-${estado}`,
        selecionado ? "metric-selected" : "",
      ].join(" ")}
      onClick={() => onClick(canal.id)}
      style={{ "--metric-color": canal.cor }}
    >
      <span>{canal.nome}</span>

      <strong>
        {Number.isFinite(valorNumerico) ? valorNumerico : "--"}

        <small>{canal.unidade}</small>
      </strong>

      <em>clique para detalhes</em>
    </button>
  );
}
