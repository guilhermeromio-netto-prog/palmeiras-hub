import FormDots from './FormDots'
import BroadcastInfo from './BroadcastInfo'
import MatchWeather from './MatchWeather'
import AddToCalendar from './AddToCalendar'
import { MatchTeams } from './TeamLogo'
import { formatDate, formatDateTime, scoreLine } from '../utils/format'
import { formationLabel } from '../utils/formation'
import { matchDedupeKey } from '../utils/matchKey'
import { isTodaySP } from '../utils/datetime'
import { tableSituationLine } from '../utils/seasonContext'

function canShowWeather(match) {
  if (!match) return false
  return (
    match.status !== 'FINISHED' &&
    (match.status === 'SCHEDULED' || match.status === 'LIVE' || !match.status)
  )
}

function statusLabel(match, today) {
  if (today && match.status === 'SCHEDULED') return 'Hoje'
  if (match.status === 'FINISHED') return 'Encerrado'
  if (match.status === 'LIVE') return 'Em campo'
  if (match.status === 'SCHEDULED') return 'Próximo'
  return match.status || '—'
}

/**
 * Dossiê Pro do próximo (ou ao vivo) jogo — seções claras, dados honestos.
 */
export default function MatchDossier({
  match,
  data,
  upcoming = [],
  form,
}) {
  if (!match) {
    return (
      <article className="card dossier dossier--empty">
        <p className="muted">
          Nenhum jogo futuro encontrado nas fontes públicas neste momento. Confira os resultados
          recentes ou toque em Atualizar.
        </p>
        {form?.length > 0 && (
          <div className="match-card__form">
            <span className="label">Forma recente</span>
            <FormDots form={form} />
          </div>
        )}
      </article>
    )
  }

  const today = isTodaySP(match.date)
  const homeName = match.homeTeam || (match.isHome ? 'Palmeiras' : match.opponent) || '—'
  const awayName = match.awayTeam || (match.isHome ? match.opponent : 'Palmeiras') || '—'
  const score =
    match.score && (match.status === 'FINISHED' || match.status === 'LIVE') ? match.score : null

  const meetings = (data?.h2h?.meetings || []).slice(0, 3)
  const lineup = data?.lineup
  const availability = data?.availability
  const situation = tableSituationLine(data?.seasonContext, match)

  const startersPreview = (lineup?.starters || []).slice(0, 11)
  const formLabel = lineup?.formation ? formationLabel(lineup.formation) : null

  return (
    <article
      className={`card dossier${today ? ' dossier--hoje' : ''}${
        match.status === 'LIVE' ? ' dossier--live' : ''
      }`}
      aria-label="Dossiê do próximo jogo"
    >
      <header className="dossier__head">
        <div className="dossier__head-top">
          <span className="pill">{match.competition}</span>
          <span className={`pill status ${(match.status || '').toLowerCase()}`}>
            {statusLabel(match, today)}
          </span>
          <span className="pro-badge" title="Palmeiras Hub Pro">
            PRO
          </span>
        </div>
        <MatchTeams
          homeName={homeName}
          awayName={awayName}
          homeEspnId={match.homeEspnId}
          awayEspnId={match.awayEspnId}
          homeLogoUrl={match.homeLogoUrl}
          awayLogoUrl={match.awayLogoUrl}
          score={score}
          size={44}
          className="dossier__teams"
        />
        <dl className="dossier__meta">
          <div>
            <dt>Apito</dt>
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
        {form?.length > 0 && (
          <div className="dossier__form-row">
            <span className="label">Forma</span>
            <FormDots form={form} />
          </div>
        )}
      </header>

      <AddToCalendar match={match} upcoming={upcoming} />

      {situation && (
        <section className="dossier__section">
          <h4 className="dossier__section-title">Situação na tabela</h4>
          <p className="dossier__situation">{situation}</p>
          <p className="muted tiny">Brasileirão — só com dados ESPN da classificação.</p>
        </section>
      )}

      {canShowWeather(match) && (
        <section className="dossier__section dossier__section--weather">
          <MatchWeather match={match} />
        </section>
      )}

      <section className="dossier__section dossier__section--broadcast">
        <BroadcastInfo match={match} />
      </section>

      <section className="dossier__section">
        <h4 className="dossier__section-title">Desfalques e suspensões</h4>
        {availability?.empty !== false && !(availability?.items || []).length ? (
          <p className="muted tiny">
            Nenhum desfalque ou suspensão listado no elenco ESPN nem em manchetes desta
            atualização. Não inventamos.
          </p>
        ) : (
          <ul className="dossier__avail">
            {(availability?.items || []).slice(0, 8).map((item) => (
              <li key={item.id || item.detail} className={`dossier__avail-item kind-${item.kind}`}>
                {item.name ? (
                  <strong>
                    {item.jersey ? `${item.jersey} ` : ''}
                    {item.name}
                  </strong>
                ) : (
                  <strong className="dossier__avail-news">Notícia</strong>
                )}
                <span className="muted tiny">{item.detail}</span>
                {item.source && <span className="pill tiny">{item.source}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dossier__section">
        <h4 className="dossier__section-title">
          {lineup?.kind === 'last' || lineup?.label
            ? 'Última escalação'
            : 'Escalação'}
        </h4>
        {!lineup || !startersPreview.length ? (
          <p className="muted tiny">
            Nenhuma escalação com formação publicada nas fontes agora. Quando a ESPN tiver o
            resumo, aparece aqui — sem inventar “provável”.
          </p>
        ) : (
          <>
            <p className="dossier__lineup-meta">
              {formLabel && <span className="pill tiny">{formLabel}</span>}
              <span className="muted tiny">
                {lineup.label || lineup.competition || ''}
                {lineup.match?.date ? ` · ${formatDate(lineup.match.date)}` : ''}
              </span>
            </p>
            <p className="dossier__lineup-names">
              {startersPreview.map((p) => p.shortName || p.name).join(' · ')}
            </p>
          </>
        )}
      </section>

      <section className="dossier__section">
        <h4 className="dossier__section-title">
          Mini H2H
          {match.opponent ? ` · vs ${match.opponent}` : ''}
        </h4>
        {meetings.length === 0 ? (
          <p className="muted tiny">
            Sem confrontos anteriores com placar confirmado nesta atualização.
          </p>
        ) : (
          <ul className="dossier__h2h">
            {meetings.map((m) => (
              <li key={matchDedupeKey(m) || m.id} className="dossier__h2h-row">
                <span className="muted tiny">{formatDate(m.date)}</span>
                <span className="pill tiny">{m.competitionCode || m.competition}</span>
                <span className={`result-badge ${(m.result || '').toLowerCase()}`}>
                  {scoreLine(m)}
                </span>
                {m.result && <FormDots form={[m.result]} />}
              </li>
            ))}
          </ul>
        )}
        {data?.h2h?.source && (
          <p className="muted tiny">Fonte: {data.h2h.source}</p>
        )}
      </section>
    </article>
  )
}
