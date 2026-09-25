export default function ChannelDetails({ canal, valor, historico }) {
    if (!canal) {
        return (
            <section className="channel-details empty-details">
                Selecione um canal para visualizar detalhes
            </section>
        );
    }

    const valores = historico
        .map((item) => Number(item[canal.id]))
        .filter((item) => Number.isFinite(item));

    const minimo = valores.length > 0 ? Math.min(...valores) : 0;

    const maximo = valores.length > 0 ? Math.max(...valores) : 0;

    const media =
        valores.length > 0
            ? valores.reduce((a, b) => a + b, 0) / valores.length
            : 0;

    return (
        <section className="channel-details">
            <div className="details-header">
                <div>
                    <span>CANAL SELECIONADO</span>
                    <h2>{canal.nome}</h2>
                </div>

                <strong style={{ color: canal.cor }}>
                    {Number(valor).toFixed(1)} {canal.unidade}
                </strong>
            </div>

            <div className="details-grid">
                <div>
                    <span>MÍNIMO</span>
                    <strong>{minimo.toFixed(1)}</strong>
                </div>

                <div>
                    <span>MÁXIMO</span>
                    <strong>{maximo.toFixed(1)}</strong>
                </div>

                <div>
                    <span>MÉDIA</span>
                    <strong>{media.toFixed(1)}</strong>
                </div>

                <div>
                    <span>AMOSTRAS</span>
                    <strong>{valores.length}</strong>
                </div>
            </div>

            <div className="range-info">
                {canal.normalMin !== undefined && canal.normalMax !== undefined && (
                    <span>
                        Faixa normal: {canal.normalMin} até {canal.normalMax}{" "}
                        {canal.unidade}
                    </span>
                )}
            </div>
        </section>
    );
}
