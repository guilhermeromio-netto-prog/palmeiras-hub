import { formatDate, scoreLine, matchTitle } from '../utils/format'
import FormDots from './FormDots'
import { matchDedupeKey } from '../utils/matchKey'

export default function H2H({ h2h, opponent }) {
  const name = h2h?.opponent || opponent
  const meetings = h2h?.meetings || []

  if (!name) return null

  return (
    <section className="h2h" aria-label="Histórico do confronto">
      <h3 className="section-title">Histórico do confronto</h3>
      <article className="card h2h-card">
        <header className="h2h-card__head">
          <div>
            <p className="eyebrow">vs</p>
            <h4>{name}</h4>
          </div>
          {h2h?.source && (
            <span className="pill tiny" title="Fonte dos placares">
              {h2h.source}
            </span>
          )}
        </header>

        {meetings.length === 0 ? (
          <p className="muted">
            Sem confrontos anteriores com placar confirmado nas fontes públicas desta
            atualização. Não inventamos resultados.
          </p>
        ) : (
          <ul className="h2h-list">
            {meetings.map((m) => (
              <li key={matchDedupeKey(m) || m.id} className="h2h-row">
                <div className="h2h-row__main">
                  <span className="pill tiny">{m.competition}</span>
                  <strong>{matchTitle(m)}</strong>
                  <span className="muted tiny">{formatDate(m.date)}</span>
                </div>
                <div className="h2h-row__score">
                  <span className={`result-badge ${(m.result || '').toLowerCase()}`}>
                    {scoreLine(m)}
                  </span>
                  {m.result && <FormDots form={[m.result]} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}
