import { formatDateTime, scoreLine } from '../utils/format'
import FormDots from './FormDots'
import { MatchTeams } from './TeamLogo'
import { isTodaySP } from '../utils/datetime'
import MatchWeather from './MatchWeather'

export default function MatchCard({ match, form, featured = false, emphasizeToday = false, showWeather: showWeatherProp }) {
  if (!match) {
    return (
      <article className="card match-card empty">
        <p>Nenhum jogo agendado no momento.</p>
      </article>
    )
  }

  const score = match.score
  const today = emphasizeToday || isTodaySP(match.date)
  const homeName = match.homeTeam || (match.isHome ? 'Palmeiras' : match.opponent) || '—'
  const awayName = match.awayTeam || (match.isHome ? match.opponent : 'Palmeiras') || '—'
  const showWeather =
    showWeatherProp !== false &&
    featured &&
    match.status !== 'FINISHED' &&
    (match.status === 'SCHEDULED' || match.status === 'LIVE' || !match.status)

  return (
    <article
      className={`card match-card ${featured ? 'featured' : ''}${today ? ' match-card--hoje' : ''}`}
    >
      <header className="match-card__head">
        <span className="pill">{match.competition}</span>
        <span className={`pill status ${match.status?.toLowerCase()}`}>
          {today && match.status === 'SCHEDULED'
            ? 'Hoje'
            : match.status === 'FINISHED'
              ? 'Encerrado'
              : match.status === 'SCHEDULED'
                ? 'Próximo'
                : match.status === 'LIVE'
                  ? 'Em campo'
                  : match.status}
        </span>
      </header>

      <MatchTeams
        homeName={homeName}
        awayName={awayName}
        homeEspnId={match.homeEspnId}
        awayEspnId={match.awayEspnId}
        homeLogoUrl={match.homeLogoUrl}
        awayLogoUrl={match.awayLogoUrl}
        score={score && (match.status === 'FINISHED' || match.status === 'LIVE') ? score : null}
        size={featured ? 40 : 32}
        className="match-card__teams"
      />

      {score && match.status === 'FINISHED' && !featured && (
        <p className="match-card__score sr-only">{scoreLine(match)}</p>
      )}

      <dl className="match-meta">
        <div>
          <dt>Data / hora</dt>
          <dd>
            {formatDateTime(match.date)} <small>(SP)</small>
            {today && match.status === 'SCHEDULED' && (
              <span className="hoje-inline"> · hoje</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Local</dt>
          <dd>{match.venue || 'A definir'}</dd>
        </div>
        <div>
          <dt>Mando</dt>
          <dd>{match.isHome ? 'Casa' : 'Fora'}</dd>
        </div>
      </dl>

      {showWeather && <MatchWeather match={match} />}

      {form && (
        <div className="match-card__form">
          <span className="label">Forma recente</span>
          <FormDots form={form} />
        </div>
      )}
    </article>
  )
}
