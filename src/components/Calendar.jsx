import { formatDateTime, matchTitle, scoreLine } from '../utils/format'

function MatchRow({ m }) {
  return (
    <article className="card row-card">
      <div>
        <div className="row-top">
          <span className="pill tiny">{m.competition}</span>
          <span className="muted tiny">{m.isHome ? 'Casa' : 'Fora'}</span>
        </div>
        <strong>{matchTitle(m)}</strong>
        <p className="muted">{formatDateTime(m.date)} (SP)</p>
        <p className="muted">{m.venue}</p>
      </div>
      <div className="row-card__right">
        {m.status === 'FINISHED' ? (
          <span className={`result-badge ${(m.result || '').toLowerCase()}`}>
            {scoreLine(m)}
          </span>
        ) : (
          <span className="pill status scheduled">Agendado</span>
        )}
      </div>
    </article>
  )
}

export default function Calendar({ data }) {
  const upcoming = data.upcoming || []
  const recent = data.recentResults || []

  return (
    <section className="page calendar">
      <h2>Calendário</h2>
      <p className="lede">Brasileirão, Libertadores e Copa do Brasil — próximos e recentes.</p>

      <h3 className="section-title">Próximos jogos</h3>
      <div className="list-stack">
        {upcoming.length === 0 && <p className="muted">Nenhum jogo futuro na janela atual.</p>}
        {upcoming.map((m) => (
          <MatchRow key={m.id} m={m} />
        ))}
      </div>

      <h3 className="section-title">Resultados recentes</h3>
      <div className="list-stack">
        {recent.length === 0 && <p className="muted">Sem resultados recentes.</p>}
        {recent.map((m) => (
          <MatchRow key={m.id} m={m} />
        ))}
      </div>
    </section>
  )
}
