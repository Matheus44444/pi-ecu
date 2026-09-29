import AlarmBanner from "../components/AlarmBanner";

export default function AlarmsPage({ activeAlarms }) {
    return (
        <section className="page-section">
            <div className="section-heading">
                <span className="section-kicker">SEGURANÇA</span>
                <h2>Alarmes ativos</h2>
            </div>

            <AlarmBanner
                alarms={activeAlarms}
                alarmes={activeAlarms}
            />
        </section>
    );
}