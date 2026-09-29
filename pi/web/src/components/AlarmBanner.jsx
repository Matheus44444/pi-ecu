export default function AlarmBanner({ alarms = [], alarmes = [] }) {
    const activeAlarms = alarms.length ? alarms : alarmes;

    if (!activeAlarms.length) {
        return null;
    }

    return (
        <section className="active-alarms" aria-live="assertive">
            <div className="active-alarms-header">
                <span>ALARMES ATIVOS</span>
                <strong>{activeAlarms.length}</strong>
            </div>

            <div className="active-alarms-list">
                {activeAlarms.map((alarm, index) => {
                    const level = alarm.nivel || alarm.level || "alerta";
                    const message =
                        alarm.mensagem || alarm.message || "Alarme ativo";

                    return (
                        <article
                            className={`active-alarm ${level}`}
                            key={`${message}-${index}`}
                        >
                            <span className="active-alarm-icon">
                                {level === "critico" ? "!" : "⚠"}
                            </span>

                            <div>
                                <strong>{message}</strong>
                                <small>
                                    {level === "critico"
                                        ? "Condição crítica"
                                        : "Condição de alerta"}
                                </small>
                            </div>

                            <b>{level}</b>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}