import { formatDate, scoreLine } from '../utils/format'
import FormDots from './FormDots'
import TeamLogo, { MatchTeams } from './TeamLogo'
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
          <div className="h2h-card__vs">
            <TeamLogo name="Palmeiras" size={36} />
            <div>
              <p className="eyebrow">vs</p>
              <h4 className="h2h-card__opp">
                <TeamLogo name={name} size={28} className="h2h-card__opp-logo" />
                {name}
              </h4>
            </div>
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
            {meetings.map((m) => {
              const homeName = m.homeTeam || (m.isHome ? 'Palmeiras' : m.opponent)
              const awayName = m.awayTeam || (m.isHome ? m.opponent : 'Palmeiras')
              return (
                <li key={matchDedupeKey(m) || m.id} className="h2h-row">
                  <div className="h2h-row__main">
                    <span className="pill tiny">{m.competition}</span>
                    <MatchTeams
                      homeName={homeName}
                      awayName={awayName}
                      homeEspnId={m.homeEspnId}
                      awayEspnId={m.awayEspnId}
                      homeLogoUrl={m.homeLogoUrl}
                      awayLogoUrl={m.awayLogoUrl}
                      size={22}
                      className="h2h-row__teams"
                    />
                    <span className="muted tiny">{formatDate(m.date)}</span>
                  </div>
                  <div className="h2h-row__score">
                    <span className={`result-badge ${(m.result || '').toLowerCase()}`}>
                      {scoreLine(m)}
                    </span>
                    {m.result && <FormDots form={[m.result]} />}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </article>
    </section>
  )
}
