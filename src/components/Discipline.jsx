export default function Discipline({ data }) {
  const cards = data.cards || []
  const yellowTotal = cards.reduce((s, p) => s + (p.yellowCards || 0), 0)
  const redTotal = cards.reduce((s, p) => s + (p.redCards || 0), 0)

  return (
    <div className="discipline-block">
      <p className="lede tight">
        Cartões amarelos e vermelhos
        {data.cardsSeason ? ` · ${data.cardsSeason}` : ''}
      </p>
      <p className="muted source-hint top">
        {data.cardsCompetition || 'Stats de temporada (ESPN)'} — só números oficiais da fonte.
      </p>

      <div className="stats-mini grid-2">
        <div className="stat-tile card-tile yellow">
          <span className="num">{yellowTotal}</span>
          <span className="lbl">Amarelos</span>
        </div>
        <div className="stat-tile card-tile red">
          <span className="num">{redTotal}</span>
          <span className="lbl">Vermelhos</span>
        </div>
      </div>

      {!cards.length && (
        <article className="card pad">
          <p className="muted">
            Nenhum cartão listado nesta temporada pela fonte, ou o elenco ainda não carregou.
          </p>
        </article>
      )}

      <div className="list-stack">
        {cards.map((p) => (
          <article key={p.id} className="card row-card">
            <div className="player-left">
              <span className="jersey-badge">{p.jersey || '—'}</span>
              <div>
                <strong>{p.name}</strong>
                <p className="muted">
                  {p.positionLabel}
                  {p.appearances ? ` · ${p.appearances} jogos` : ''}
                </p>
              </div>
            </div>
            <div className="card-counts">
              {p.yellowCards > 0 && (
                <span className="card-chip yellow" title="Amarelos">
                  <span className="card-icon" aria-hidden="true" />
                  {p.yellowCards}
                </span>
              )}
              {p.redCards > 0 && (
                <span className="card-chip red" title="Vermelhos">
                  <span className="card-icon" aria-hidden="true" />
                  {p.redCards}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
