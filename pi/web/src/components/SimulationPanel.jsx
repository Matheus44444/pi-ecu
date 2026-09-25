export default function SimulationPanel({
    valores,
    onChange,
    onApply,
    onReset,
}) {
    function alterarCampo(campo, valor) {
        onChange({
            ...valores,
            [campo]: Number(valor),
        });
    }

    return (
        <section className="simulation-panel">
            <div className="panel-title">
                <span>CONFIGURAÇÃO DA SIMULAÇÃO</span>

                <div className="panel-actions">
                    <button type="button" onClick={onReset}>
                        RESTAURAR
                    </button>

                    <button type="button" className="apply-button" onClick={onApply}>
                        APLICAR
                    </button>
                </div>
            </div>

            <div className="simulation-fields">
                <label>
                    RPM inicial
                    <input
                        type="number"
                        min="0"
                        max="10000"
                        value={valores.rpm}
                        onChange={(event) => alterarCampo("rpm", event.target.value)}
                    />
                </label>

                <label>
                    MAP inicial (kPa)
                    <input
                        type="number"
                        min="0"
                        max="300"
                        value={valores.map_kpa}
                        onChange={(event) => alterarCampo("map_kpa", event.target.value)}
                    />
                </label>

                <label>
                    TPS (%)
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={valores.tps}
                        onChange={(event) => alterarCampo("tps", event.target.value)}
                    />
                </label>

                <label>
                    ECT (°C)
                    <input
                        type="number"
                        min="0"
                        max="150"
                        value={valores.ect_c}
                        onChange={(event) => alterarCampo("ect_c", event.target.value)}
                    />
                </label>

                <label>
                    Pressão combustível (bar)
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={valores.fuel_bar}
                        onChange={(event) => alterarCampo("fuel_bar", event.target.value)}
                    />
                </label>

                <label>
                    Pressão óleo (bar)
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={valores.oil_bar}
                        onChange={(event) => alterarCampo("oil_bar", event.target.value)}
                    />
                </label>
            </div>
        </section>
    );
}
