import FormDots from './FormDots'
import { formatDateTime } from '../utils/format'
import { matchDedupeKey } from '../utils/matchKey'
import { relegationLine } from '../utils/seasonContext'
import { MatchTeams } from './TeamLogo'

/**
 * Painel da temporada — posição, forma, próximos 5, folgas (só dados reais).
 */
export default function SeasonPanel({ data }) {
  const ctx = data?.seasonContext
  const stats = data?.stats
  const form = (data?.form || []).slice(0, 5)
  const next5 = (data?.upcoming || []).slice(0, 5)

  if (!ctx && !stats) {
    return (
      <section className="season-panel" aria-label="Painel da temporada">
        <h3 className="section-title">
          Painel da temporada <span className="pro-badge pro-badge--inline">PRO</span>
        </h3>
        <article className="card season-panel__card">
          <p className="muted">
            Classificação do Brasileirão indisponível nesta atualização. Não inventamos números.
          </p>
        </article>
      </section>
    )
  }

  const position = ctx?.position ?? stats?.position
  const points = ctx?.points ?? stats?.points
  const wdl = `${ctx?.won ?? stats?.won ?? '—'}-${ctx?.draw ?? stats?.draw ?? '—'}-${ctx?.lost ?? stats?.lost ?? '—'}`
  const gf = ctx?.goalsFor ?? stats?.goalsFor
  const ga = ctx?.goalsAgainst ?? stats?.goalsAgainst
  const rel = relegationLine(ctx)

  return (
    <section className="season-panel" aria-label="Painel da temporada">
      <h3 className="section-title">
        Painel da temporada <span className="pro-badge pro-badge--inline">PRO</span>
      </h3>
      <article className="card season-panel__card">
        <header className="season-panel__head">
          <div>
            <p className="eyebrow">{ctx?.competition || 'Brasileirão Série A'}</p>
            <p className="muted tiny">
              {ctx?.season ? `Temporada ${ctx.season}` : 'Dados ESPN'}
              {ctx?.played != null ? ` · ${ctx.played} jogos` : ''}
            </p>
          </div>
          {position != null && (
            <div className="season-panel__pos" aria-label={`${position}º lugar`}>
              <span className="season-panel__pos-num">{position}º</span>
              <span className="season-panel__pos-pts">{points ?? '—'} pts</span>
            </div>
          )}
        </header>

        <div className="season-panel__grid">
          <div className="season-panel__tile">
            <span className="season-panel__tile-val">{wdl}</span>
            <span className="season-panel__tile-lbl">V-E-D</span>
          </div>
          <div className="season-panel__tile">
            <span className="season-panel__tile-val">
              {gf != null && ga != null ? `${gf}:${ga}` : '—'}
            </span>
            <span className="season-panel__tile-lbl">GP:GC</span>
          </div>
          <div className="season-panel__tile season-panel__tile--form">
            <FormDots form={form} />
            <span className="season-panel__tile-lbl">Últimos 5</span>
          </div>
        </div>

        {(ctx?.gapToFirst != null || rel) && (
          <div className="season-panel__gaps">
            {ctx?.gapToFirst != null && (
              <p className="season-panel__gap">
                {ctx.position === 1
                  ? '★ Líder do Brasileirão'
                  : ctx.gapToFirst === 0
                    ? 'Empatado em pontos com o líder'
                    : (
                      <>
                        <strong>
                          {ctx.gapToFirst} pt{ctx.gapToFirst === 1 ? '' : 's'}
                        </strong>{' '}
                        atrás do 1º
                        {ctx.leaderName ? ` (${ctx.leaderName})` : ''}
                      </>
                    )}
              </p>
            )}
            {rel && <p className="season-panel__gap season-panel__gap--rel muted">{rel}</p>}
          </div>
        )}

        <div className="season-panel__next">
          <h4 className="season-panel__sub">Próximos 5</h4>
          {next5.length === 0 ? (
            <p className="muted tiny">Nenhum jogo futuro nas fontes agora.</p>
          ) : (
            <ul className="season-panel__fixtures">
              {next5.map((m) => {
                const homeName = m.homeTeam || (m.isHome ? 'Palmeiras' : m.opponent)
                const awayName = m.awayTeam || (m.isHome ? m.opponent : 'Palmeiras')
                return (
                  <li key={matchDedupeKey(m) || m.id} className="season-panel__fix">
                    <span className="pill tiny">{m.competitionCode || m.competition}</span>
                    <MatchTeams
                      homeName={homeName}
                      awayName={awayName}
                      homeEspnId={m.homeEspnId}
                      awayEspnId={m.awayEspnId}
                      homeLogoUrl={m.homeLogoUrl}
                      awayLogoUrl={m.awayLogoUrl}
                      size={18}
                      className="season-panel__teams"
                    />
                    <span className="muted tiny season-panel__when">
                      {formatDateTime(m.date)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </article>
    </section>
  )
}
