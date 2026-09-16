const GROUPS = [
  { key: 'G', label: 'Goleiros' },
  { key: 'D', label: 'Defensores' },
  { key: 'M', label: 'Meias' },
  { key: 'F', label: 'Atacantes' },
]

export default function Squad({ data }) {
  const byPos = data.squadByPosition || {}
  const total = data.squad?.length || 0

  return (
    <div className="squad-block">
      <p className="lede tight">
        {total ? `${total} jogadores` : 'Elenco indisponível'} · fonte ESPN
        {data.cardsSeason ? ` · temporada ${data.cardsSeason}` : ''}
      </p>
      {!total && (
        <p className="muted empty-card">
          Não foi possível carregar o elenco nesta atualização. Toque em Atualizar.
        </p>
      )}
      {GROUPS.map((g) => {
        const list = byPos[g.key] || []
        if (!list.length) return null
        return (
          <div key={g.key} className="squad-group">
            <h3 className="section-title">
              {g.label} <span className="count-pill">{list.length}</span>
            </h3>
            <div className="list-stack">
              {list.map((p) => (
                <article key={p.id} className="card row-card player-row">
                  <div className="player-left">
                    <span className="jersey-badge" aria-label={p.jersey ? `Camisa ${p.jersey}` : 'Sem número'}>
                      {p.jersey || '—'}
                    </span>
                    <div>
                      <strong>{p.name}</strong>
                      <p className="muted">
                        {p.positionLabel}
                        {p.age != null ? ` · ${p.age} anos` : ''}
                        {p.nationality ? ` · ${p.nationality}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="row-card__right player-stats">
                    {p.appearances > 0 && (
                      <span className="muted tiny">{p.appearances} jog.</span>
                    )}
                    {(p.goals > 0 || p.assists > 0) && (
                      <span className="muted tiny">
                        {p.goals}G {p.assists}A
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
