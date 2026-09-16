export default function Stats({ data }) {
  const table = data.standings?.table || []
  const stats = data.stats
  const scorers = data.topScorers || []

  return (
    <section className="page stats">
      <h2>Estatísticas</h2>
      <p className="lede">
        {data.standings?.competition || 'Brasileirão'} · temporada{' '}
        {data.standings?.season || '—'}
      </p>

      {stats && (
        <div className="stats-mini grid-4">
          <div className="stat-tile">
            <span className="num">{stats.position}º</span>
            <span className="lbl">Colocação</span>
          </div>
          <div className="stat-tile">
            <span className="num">{stats.won}-{stats.draw}-{stats.lost}</span>
            <span className="lbl">V-E-D</span>
          </div>
          <div className="stat-tile">
            <span className="num">{stats.goalsFor}</span>
            <span className="lbl">Gols pró</span>
          </div>
          <div className="stat-tile">
            <span className="num">{stats.goalsAgainst}</span>
            <span className="lbl">Gols contra</span>
          </div>
        </div>
      )}

      <h3 className="section-title">Classificação</h3>
      <div className="table-wrap card">
        <table className="standings">
          <thead>
            <tr>
              <th>#</th>
              <th>Clube</th>
              <th>P</th>
              <th>J</th>
              <th>V</th>
              <th>E</th>
              <th>D</th>
              <th>GP</th>
              <th>GC</th>
              <th>SG</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => {
              const isPal = row.highlight || /palmeiras/i.test(row.team)
              return (
                <tr key={`${row.position}-${row.team}`} className={isPal ? 'highlight' : ''}>
                  <td>{row.position}</td>
                  <td>{row.team}</td>
                  <td><strong>{row.points}</strong></td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.draw}</td>
                  <td>{row.lost}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!table.length && <p className="muted pad">Tabela indisponível.</p>}
      </div>

      <h3 className="section-title">Artilharia</h3>
      <div className="list-stack">
        {scorers.length === 0 && (
          <p className="muted">Artilheiros indisponíveis nesta fonte.</p>
        )}
        {scorers.map((s, i) => (
          <article key={`${s.name}-${i}`} className="card row-card">
            <div>
              <span className="rank">#{i + 1}</span> <strong>{s.name}</strong>
              {s.team && <p className="muted">{s.team}</p>}
            </div>
            <div className="row-card__right scorers">
              <span>{s.goals} gols</span>
              {s.assists != null && <span className="muted">{s.assists} assist.</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
