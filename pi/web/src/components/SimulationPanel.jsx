import React, { useEffect, useState } from "react";

const DEFAULT_VALUES = {
    rpm: 2500,
    map_kpa: 120,
    tps: 40,
    ect_c: 85,
    fuel_bar: 3.1,
    oil_bar: 4,
};

function SimulationPanel({
    valores,
    values,
    initialValues,
    onChange,
    onApply,
}) {
    const externalValues =
        valores || values || initialValues || DEFAULT_VALUES;

    const [localValues, setLocalValues] = useState({
        ...DEFAULT_VALUES,
        ...externalValues,
    });

    useEffect(() => {
        setLocalValues((current) => ({
            ...current,
            ...externalValues,
        }));
    }, [valores, values, initialValues]);

    function updateValue(field, value) {
        setLocalValues((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function applyValues() {
        onChange?.(localValues);
        onApply?.(localValues);
    }

    function restoreValues() {
        setLocalValues(DEFAULT_VALUES);
        onChange?.(DEFAULT_VALUES);
        onApply?.(DEFAULT_VALUES);
    }

    return (
        <section className="simulation-panel">
            <div className="simulation-panel-header">
                <span>CONFIGURAÇÃO DA SIMULAÇÃO</span>

                <div className="simulation-actions">
                    <button
                        className="restore-button"
                        type="button"
                        onClick={restoreValues}
                    >
                        RESTAURAR
                    </button>

                    <button
                        className="apply-button"
                        type="button"
                        onClick={applyValues}
                    >
                        APLICAR
                    </button>
                </div>
            </div>

            <div className="simulation-grid">
                <label>
                    RPM INICIAL
                    <input
                        type="number"
                        value={localValues.rpm}
                        onChange={(event) =>
                            updateValue("rpm", Number(event.target.value))
                        }
                    />
                </label>

                <label>
                    MAP INICIAL (KPA)
                    <input
                        type="number"
                        value={localValues.map_kpa}
                        onChange={(event) =>
                            updateValue("map_kpa", Number(event.target.value))
                        }
                    />
                </label>

                <label>
                    TPS (%)
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={localValues.tps}
                        onChange={(event) =>
                            updateValue("tps", Number(event.target.value))
                        }
                    />
                </label>

                <label>
                    ECT (°C)
                    <input
                        type="number"
                        value={localValues.ect_c}
                        onChange={(event) =>
                            updateValue("ect_c", Number(event.target.value))
                        }
                    />
                </label>

                <label>
                    PRESSÃO COMBUSTÍVEL (BAR)
                    <input
                        type="number"
                        step="0.1"
                        value={localValues.fuel_bar}
                        onChange={(event) =>
                            updateValue("fuel_bar", Number(event.target.value))
                        }
                    />
                </label>

                <label>
                    PRESSÃO ÓLEO (BAR)
                    <input
                        type="number"
                        step="0.1"
                        value={localValues.oil_bar}
                        onChange={(event) =>
                            updateValue("oil_bar", Number(event.target.value))
                        }
                    />
                </label>
            </div>
        </section>
    );
}

export default SimulationPanel;