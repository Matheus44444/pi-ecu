import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_VALUES = {
  rpm: 2500,
  map_kpa: 120,
  tps: 40,
  lambda1: 0.94,
  ect_c: 85,
  iat_c: 35,
  battery_v: 13.7,
  fuel_bar: 3.1,
  oil_bar: 4,
};

const PRESETS = {
  idle: {
    label: "Marcha lenta",
    values: { rpm: 900, map_kpa: 38, tps: 8, lambda1: 1, ect_c: 88, iat_c: 32, battery_v: 13.8, fuel_bar: 3.2, oil_bar: 2.8 },
  },
  cruise: {
    label: "Cruzeiro",
    values: { rpm: 2200, map_kpa: 75, tps: 24, lambda1: 1, ect_c: 92, iat_c: 36, battery_v: 13.9, fuel_bar: 3.3, oil_bar: 3.6 },
  },
  load: {
    label: "Alta carga",
    values: { rpm: 4800, map_kpa: 175, tps: 78, lambda1: 0.88, ect_c: 101, iat_c: 48, battery_v: 13.5, fuel_bar: 3.6, oil_bar: 4.5 },
  },
  critical: {
    label: "Teste de alarmes",
    values: { rpm: 6500, map_kpa: 220, tps: 90, lambda1: 0.8, ect_c: 115, iat_c: 55, battery_v: 11.3, fuel_bar: 1.5, oil_bar: 0.8 },
  },
};

const FIELDS = [
  ["rpm", "RPM", "rpm", 0, 9000, 50],
  ["map_kpa", "MAP", "kPa", 0, 300, 1],
  ["tps", "TPS", "%", 0, 100, 1],
  ["lambda1", "Lambda", "λ", 0.5, 1.5, 0.01],
  ["ect_c", "ECT", "°C", -40, 160, 1],
  ["iat_c", "IAT", "°C", -40, 120, 1],
  ["battery_v", "Bateria", "V", 8, 16, 0.1],
  ["fuel_bar", "Combustível", "bar", 0, 8, 0.1],
  ["oil_bar", "Óleo", "bar", 0, 10, 0.1],
];

function SimulationPanel({ valores, values, initialValues, onChange, onApply }) {
  const externalValues = valores || values || initialValues || DEFAULT_VALUES;
  const [localValues, setLocalValues] = useState({ ...DEFAULT_VALUES, ...externalValues });
  const [preset, setPreset] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLocalValues((current) => ({ ...current, ...externalValues }));
  }, [valores, values, initialValues]);

  const hasChanges = useMemo(
    () => FIELDS.some(([key]) => Number(localValues[key]) !== Number(externalValues[key])),
    [localValues, externalValues],
  );

  function updateValue(field, value) {
    setLocalValues((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function loadPreset(event) {
    const key = event.target.value;
    setPreset(key);
    if (!key || !PRESETS[key]) return;
    setLocalValues({ ...DEFAULT_VALUES, ...PRESETS[key].values });
    setMessage(`${PRESETS[key].label} carregada. Clique em aplicar.`);
  }

  function applyValues() {
    const next = { ...DEFAULT_VALUES, ...localValues };
    onChange?.(next);
    onApply?.(next);
    setMessage("Valores aplicados à telemetria.");
  }

  function restoreValues() {
    const next = { ...DEFAULT_VALUES };
    setLocalValues(next);
    setPreset("");
    onChange?.(next);
    onApply?.(next);
    setMessage("Valores padrão restaurados.");
  }

  return (
    <section className="simulation-panel" aria-label="Controle manual da simulação">
      <header className="simulation-panel-header">
        <div>
          <span className="section-kicker">SIMULAÇÃO MANUAL</span>
          <h3>Aplicar valores de teste</h3>
        </div>
        <span className={`simulation-state ${hasChanges ? "pending" : "applied"}`}>
          {hasChanges ? "ALTERAÇÕES PENDENTES" : "VALORES APLICADOS"}
        </span>
      </header>

      <div className="simulation-toolbar">
        <label className="simulation-preset">
          <span>PRESET DE TESTE</span>
          <select value={preset} onChange={loadPreset}>
            <option value="">Selecione um cenário</option>
            {Object.entries(PRESETS).map(([key, item]) => (
              <option value={key} key={key}>{item.label}</option>
            ))}
          </select>
        </label>
        <div className="simulation-actions">
          <button type="button" className="simulation-button restore" onClick={restoreValues}>RESTAURAR</button>
          <button type="button" className="simulation-button apply" onClick={applyValues} disabled={!hasChanges}>APLICAR VALORES</button>
        </div>
      </div>

      <div className="simulation-grid">
        {FIELDS.map(([key, label, unit, min, max, step]) => (
          <label className="simulation-field" key={key}>
            <span>{label} <small>({unit})</small></span>
            <div className="simulation-input-wrap">
              <input
                type="number"
                value={localValues[key] ?? ""}
                min={min}
                max={max}
                step={step}
                onChange={(event) => updateValue(key, Number(event.target.value))}
              />
              <b>{unit}</b>
            </div>
          </label>
        ))}
      </div>

      <footer className="simulation-footer">
        <span>{message || "Edite os valores e aplique para atualizar cards, gráfico e alarmes."}</span>
        <span className="simulation-shortcut">ENTER aplica · ESC restaura</span>
      </footer>
    </section>
  );
}

export default SimulationPanel;
