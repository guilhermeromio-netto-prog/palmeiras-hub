import { scoreLine, matchTitle } from '../utils/format'
import { MatchTeams } from './TeamLogo'

export default function LiveMatchCenter({ candidate, live, error, polling }) {
  if (!candidate && !live) return null

  const status = live?.status || candidate?.status
  const isLive = status === 'LIVE'
  const isFt = status === 'FINISHED'
  const home = live?.homeTeam || candidate?.homeTeam
  const away = live?.awayTeam || candidate?.awayTeam
  const score = live?.score || candidate?.score || null
  const clock = live?.clock || (isLive ? 'Ao vivo' : isFt ? 'FT' : null)

  if (!isLive && !isFt && !polling) {
    return null
  }

  return (
    <section
      className={`live-center card${isLive ? ' live-center--live' : ''}${isFt ? ' live-center--ft' : ''}`}
      aria-live="polite"
    >
      <header className="live-center__head">
        {isLive ? (
          <span className="live-badge">
            <span className="live-badge__dot" aria-hidden="true" />
            AO VIVO
          </span>
        ) : isFt ? (
          <span className="pill status finished">Final</span>
        ) : (
          <span className="pill status scheduled">Aguardando</span>
        )}
        <span className="pill tiny">{candidate?.competition || 'Jogo'}</span>
        {clock && <span className="live-center__clock">{clock}</span>}
      </header>

      <MatchTeams
        homeName={home || candidate?.homeTeam}
        awayName={away || candidate?.awayTeam}
        homeEspnId={live?.homeEspnId || candidate?.homeEspnId}
        awayEspnId={live?.awayEspnId || candidate?.awayEspnId}
        homeLogoUrl={live?.homeLogoUrl || candidate?.homeLogoUrl}
        awayLogoUrl={live?.awayLogoUrl || candidate?.awayLogoUrl}
        score={score}
        size={44}
        className="live-center__teams"
      />

      {!score && (
        <p className="muted live-center__waiting">
          {error
            ? `Placar indisponível agora (${error}).`
            : isLive
              ? 'Buscando placar nas fontes públicas…'
              : 'Sem placar publicado ainda.'}
        </p>
      )}

      {live?.scorers?.length > 0 && (
        <div className="live-center__block">
          <span className="label">Gols</span>
          <ul className="live-list">
            {live.scorers.map((g, i) => (
              <li key={`${g.player}-${g.clock}-${i}`}>
                <strong>{g.player}</strong>
                {g.clock ? ` ${g.clock}` : ''}
                {g.penalty ? ' (pênalti)' : ''}
                {g.ownGoal ? ' (contra)' : ''}
                {g.team ? <span className="muted"> · {g.team}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {live?.cards?.length > 0 && (
        <div className="live-center__block">
          <span className="label">Cartões</span>
          <ul className="live-list">
            {live.cards.map((c, i) => (
              <li key={`${c.player}-${c.clock}-${i}`}>
                <span className={`card-chip ${c.color}`} aria-hidden="true">
                  {c.color === 'red' ? '🟥' : '🟨'}
                </span>{' '}
                <strong>{c.player}</strong>
                {c.clock ? ` ${c.clock}` : ''}
                {c.team ? <span className="muted"> · {c.team}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="muted tiny live-center__meta">
        {polling ? 'Atualiza a cada ~45s enquanto o jogo rola' : isFt ? 'Placar final (ESPN)' : 'ESPN'}
        {live?.fetchedAt
          ? ` · ${new Intl.DateTimeFormat('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }).format(new Date(live.fetchedAt))} (SP)`
          : ''}
      </p>
      {!score && scoreLine(candidate) && (
        <p className="muted tiny">Último placar conhecido no hub: {scoreLine(candidate)}</p>
      )}
      {!home && !away && (
        <h3 className="live-center__title sr-only">{matchTitle(candidate)}</h3>
      )}
    </section>
  )
}
