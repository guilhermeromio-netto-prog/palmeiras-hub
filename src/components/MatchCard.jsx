import { formatDateTime, matchTitle, scoreLine } from '../utils/format'
import FormDots from './FormDots'

export default function MatchCard({ match, form, featured = false }) {
  if (!match) {
    return (
      <article className="card match-card empty">
        <p>Nenhum jogo agendado no momento.</p>
      </article>
    )
  }

  const score = scoreLine(match)

  return (
    <article className={`card match-card ${featured ? 'featured' : ''}`}>
      <header className="match-card__head">
        <span className="pill">{match.competition}</span>
        <span className={`pill status ${match.status?.toLowerCase()}`}>
          {match.status === 'FINISHED' ? 'Encerrado' : match.status === 'SCHEDULED' ? 'Próximo' : match.status}
        </span>
      </header>
      <h3 className="match-card__title">{matchTitle(match)}</h3>
      {score && <p className="match-card__score">{score}</p>}
      <dl className="match-meta">
        <div>
          <dt>Data / hora</dt>
          <dd>{formatDateTime(match.date)} <small>(SP)</small></dd>
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
      {form && (
        <div className="match-card__form">
          <span className="label">Forma recente</span>
          <FormDots form={form} />
        </div>
      )}
    </article>
  )
}
