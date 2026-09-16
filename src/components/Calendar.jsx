import { useMemo, useState } from 'react'
import { formatDateTime, matchTitle, scoreLine } from '../utils/format'
import { matchDedupeKey } from '../utils/matchKey'

const COMP_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'BSA', label: 'Brasileirão' },
  { id: 'LIB', label: 'Libertadores' },
  { id: 'CDB', label: 'Copa do Brasil' },
  { id: 'PAU', label: 'Paulistão' },
  { id: 'other', label: 'Outras' },
]

const KNOWN = new Set(['BSA', 'LIB', 'CDB', 'PAU'])

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
        ) : m.status === 'LIVE' ? (
          <span className="pill status live">Ao vivo</span>
        ) : (
          <span className="pill status scheduled">Agendado</span>
        )}
      </div>
    </article>
  )
}

function passesFilters(m, competition, venue) {
  if (venue === 'home' && !m.isHome) return false
  if (venue === 'away' && m.isHome) return false
  if (competition === 'all') return true
  if (competition === 'other') return !KNOWN.has(m.competitionCode)
  return m.competitionCode === competition
}

export default function Calendar({ data }) {
  const [competition, setCompetition] = useState('all')
  const [venue, setVenue] = useState('all')

  const upcoming = useMemo(
    () => (data.upcoming || []).filter((m) => passesFilters(m, competition, venue)),
    [data.upcoming, competition, venue]
  )
  const recent = useMemo(
    () => (data.recentResults || []).filter((m) => passesFilters(m, competition, venue)),
    [data.recentResults, competition, venue]
  )

  return (
    <section className="page calendar">
      <h2>Jogos</h2>
      <p className="lede">
        Brasileirão, Libertadores, Paulistão e Copa do Brasil — próximos e recentes.
      </p>

      <div className="filters" aria-label="Filtros da agenda">
        <div className="filter-row">
          <span className="filter-label">Competição</span>
          <div className="filter-chips">
            {COMP_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip${competition === f.id ? ' active' : ''}`}
                onClick={() => setCompetition(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">Mando</span>
          <div className="filter-chips">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'home', label: 'Casa' },
              { id: 'away', label: 'Fora' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip${venue === f.id ? ' active' : ''}`}
                onClick={() => setVenue(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3 className="section-title">Próximos jogos</h3>
      <div className="list-stack">
        {upcoming.length === 0 && (
          <p className="muted empty-card">
            Nenhum jogo com esses filtros na janela atual das fontes.
          </p>
        )}
        {upcoming.map((m) => (
          <MatchRow key={matchDedupeKey(m) || m.id} m={m} />
        ))}
      </div>

      <h3 className="section-title">Resultados recentes</h3>
      <div className="list-stack">
        {recent.length === 0 && <p className="muted">Sem resultados com esses filtros.</p>}
        {recent.map((m) => (
          <MatchRow key={matchDedupeKey(m) || m.id} m={m} />
        ))}
      </div>
    </section>
  )
}
