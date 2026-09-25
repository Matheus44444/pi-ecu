import React from "react";

function MetricCard({
  canal,
  channel,
  title,
  label,
  value = "—",
  unit,
  color,
}) {
  const definition = canal || channel || {};

  const nome =
    definition.nome ||
    definition.label ||
    title ||
    label ||
    "CANAL";

  const unidade =
    definition.unidade ||
    definition.unit ||
    unit ||
    "";

  const cor =
    definition.cor ||
    definition.color ||
    color ||
    "#16b9ff";

  return (
    <article
      className="metric-card"
      style={{
        "--metric-color": cor,
      }}
    >
      <span className="metric-card-label">
        {nome}
      </span>

      <strong className="metric-card-value">
        {value}
      </strong>

      <small className="metric-card-unit">
        {unidade}
      </small>
    </article>
  );
}

export default MetricCard;