import SimulationPanel from "../components/SimulationPanel";

export default function SimulationPage({
    simulationValues,
    onChange,
    onApply,
}) {
    return (
        <section className="page-section">
            <div className="section-heading">
                <span className="section-kicker">SIMULAÇÃO</span>
                <h2>Controle manual do motor</h2>
            </div>

            <SimulationPanel
                valores={simulationValues}
                values={simulationValues}
                onChange={onChange}
                onApply={onApply}
            />
        </section>
    );
}