export default function AlarmBanner({ alarms = [] }) {
    if (alarms.length === 0) {
        return (
            <div className="alarm-banner alarm-ok">
                SISTEMA NORMAL — NENHUM ALARME
            </div>
        );
    }

    return (
        <div className="alarm-list">
            {alarms.map((alarm, index) => (
                <div
                    key={`${alarm.mensagem}-${index}`}
                    className={`alarm-banner alarm-${alarm.nivel}`}
                >
                    {alarm.nivel.toUpperCase()} — {alarm.mensagem}
                </div>
            ))}
        </div>
    );
}
