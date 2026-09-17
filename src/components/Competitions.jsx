import { useMemo, useState } from 'react'
import { movementGlyph } from '../utils/standingsMovement'
import { formatDateTime, scoreLine } from '../utils/format'
import { matchDedupeKey } from '../utils/matchKey'
import TeamLogo, { MatchTeams } from './TeamLogo'

function MovementCell({ row }) {
  const g = movementGlyph(row.movement)
  return (
    <span className={`move move--${g.tone}`} title={g.label} aria-label={g.label}>
      {g.symbol}
    </span>
  )
}

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
            <th aria-label="Movimento" />
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
                <td className="pos-cell">{row.position}</td>
                <td className="move-cell">
                  <MovementCell row={row} />
                </td>
                <td className="team-cell">
                  <span className="team-cell__inner">
                    <TeamLogo name={row.team} espnId={row.espnId} logoUrl={row.logoUrl} size={22} />
                    <span>{row.team}</span>
                  </span>
                </td>
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

function KnockoutPath({ matches = [], note }) {
  if (!matches.length) {
    return <p className="muted pad">Chaveamento indisponível nesta atualização.</p>
  }
  return (
    <div className="knockout-path pad">
      {note && <p className="muted knockout-path__note">{note}</p>}
      <div className="list-stack knockout-path__list">
        {matches.map((m) => {
          const homeName = m.homeTeam || (m.isHome ? 'Palmeiras' : m.opponent) || '—'
          const awayName = m.awayTeam || (m.isHome ? m.opponent : 'Palmeiras') || '—'
          return (
            <article key={matchDedupeKey(m) || m.id} className="card row-card knockout-leg">
              <div>
                <div className="row-top">
                  <span className="pill tiny">{m.isHome ? 'Casa' : 'Fora'}</span>
                  {m.status === 'FINISHED' && m.score && (
                    <span className="muted tiny">Placar final</span>
                  )}
                </div>
                <MatchTeams
                  homeName={homeName}
                  awayName={awayName}
                  homeEspnId={m.homeEspnId}
                  awayEspnId={m.awayEspnId}
                  homeLogoUrl={m.homeLogoUrl}
                  awayLogoUrl={m.awayLogoUrl}
                  size={22}
                  className="calendar-row__teams"
                />
                <p className="muted">{formatDateTime(m.date)} (SP)</p>
                <p className="muted">{m.venue || 'Local a definir'}</p>
              </div>
              <div className="row-card__right">
                {m.status === 'FINISHED' ? (
                  <span className={`result-badge ${(m.result || '').toLowerCase()}`}>
                    {scoreLine(m)}
                  </span>
                ) : m.status === 'LIVE' ? (
                  <span className="pill status live">Ao vivo</span>
                ) : (
                  <span className="pill status scheduled">Agendado</span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default function Competitions({ data, onViewChange }) {
  const comps = data.competitions || []
  const scorers = data.topScorers || []
  const stats = data.stats

  const list = useMemo(() => {
    if (comps.length > 0) return comps
    if (data.standings?.table?.length) {
      return [
        {
          competition: data.standings.competition,
          competitionCode: 'BSA',
          group: null,
          season: data.standings.season,
          table: data.standings.table,
        },
      ]
    }
    return []
  }, [comps, data.standings])

  const [open, setOpen] = useState(list[0] ? keyOf(list[0], 0) : null)

  return (
    <section className="page competitions">
      <h2>Campeonatos</h2>
      <p className="lede">
        Classificação com setas de movimento (↑↓→) vs rodada anterior — Palmeiras em destaque.
        Copa do Brasil aparece como chaveamento (mata-mata).
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
          const isKnockout = c.kind === 'knockout' || c.hasTable === false || c.competitionCode === 'CDB'
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
                  <span className="muted tiny">
                    {' '}
                    · {c.season || '—'}
                    {isKnockout ? ' · mata-mata' : ''}
                  </span>
                </span>
                <span className="chev" aria-hidden="true">
                  {isOpen ? '▾' : '▸'}
                </span>
              </button>
              {isOpen &&
                (isKnockout ? (
                  <KnockoutPath matches={c.matches || []} note={c.note} />
                ) : (
                  <StandingsTable table={c.table} />
                ))}
            </div>
          )
        })}
      </div>

      <p className="source-hint">
        Fonte: ESPN · Setas: rankChange quando a API envia; senão, delta da visita anterior
        (localStorage). Copa do Brasil (mata-mata) mostra o caminho / pernas agendadas — sem
        tabela de pontos.
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
