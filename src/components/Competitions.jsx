import { useState } from 'react'

function StandingsTable({ table }) {
  if (!table?.length) {
    return <p className="muted pad">Tabela indisponível.</p>
  }
  return (
    <div className="table-wrap">
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
                <td>
                  <strong>{row.points}</strong>
                </td>
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
    </div>
  )
}

export default function Competitions({ data }) {
  const comps = data.competitions || []
  const scorers = data.topScorers || []
  const stats = data.stats
  const [open, setOpen] = useState(comps[0] ? keyOf(comps[0], 0) : null)

  // Fallback: if competitions empty but standings.table exists
  const list =
    comps.length > 0
      ? comps
      : data.standings?.table?.length
        ? [
            {
              competition: data.standings.competition,
              competitionCode: 'BSA',
              group: null,
              season: data.standings.season,
              table: data.standings.table,
            },
          ]
        : []

  return (
    <section className="page competitions">
      <h2>Campeonatos</h2>
      <p className="lede">
        Classificação de todas as competições em que o Palmeiras aparece nas fontes públicas.
      </p>

      {stats && (
        <div className="stats-mini grid-4">
          <div className="stat-tile">
            <span className="num">{stats.position}º</span>
            <span className="lbl">Brasileirão</span>
          </div>
          <div className="stat-tile">
            <span className="num">
              {stats.won}-{stats.draw}-{stats.lost}
            </span>
            <span className="lbl">V-E-D</span>
          </div>
          <div className="stat-tile">
            <span className="num">{stats.goalsFor}</span>
            <span className="lbl">Gols pró</span>
          </div>
          <div className="stat-tile">
            <span className="num">{stats.points}</span>
            <span className="lbl">Pontos</span>
          </div>
        </div>
      )}

      {!list.length && (
        <article className="card pad">
          <p className="muted">Nenhuma tabela disponível nesta atualização.</p>
        </article>
      )}

      <div className="accordion">
        {list.map((c, i) => {
          const k = keyOf(c, i)
          const isOpen = open === k
          const title = c.group ? `${c.competition} · ${c.group}` : c.competition
          return (
            <div key={k} className={`accordion-item card ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="accordion-head"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : k)}
              >
                <span>
                  <strong>{title}</strong>
                  <span className="muted tiny"> · {c.season || '—'}</span>
                </span>
                <span className="chev" aria-hidden="true">
                  {isOpen ? '▾' : '▸'}
                </span>
              </button>
              {isOpen && <StandingsTable table={c.table} />}
            </div>
          )
        })}
      </div>

      <p className="source-hint">
        Fonte: ESPN · Copa do Brasil (mata-mata) pode não ter tabela de pontos.
      </p>

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
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function keyOf(c, i) {
  return `${c.competitionCode || c.competition}-${c.group || 'main'}-${i}`
}
