import MatchCard from './MatchCard'
import FormDots from './FormDots'
import Countdown from './Countdown'
import H2H from './H2H'
import ShareButton from './ShareButton'
import LiveMatchCenter from './LiveMatchCenter'
import SinceLastVisit from './SinceLastVisit'
import FavoritePlayers from './FavoritePlayers'
import CrowdReactions from './CrowdReactions'
import ScoreTip from './ScoreTip'
import BroadcastInfo from './BroadcastInfo'
import RadioListen from './RadioListen'
import YouTubeMatch from './YouTubeMatch'
import SyncStatus from './SyncStatus'
import { formatDate, formatDateTime, scoreLine, matchTitle } from '../utils/format'
import { formationLabel } from '../utils/formation'
import { matchDedupeKey } from '../utils/matchKey'
import { isTodaySP, msUntil } from '../utils/datetime'
import {
  nextMatchShareText,
  resultShareText,
} from '../utils/share'

const BASE = import.meta.env.BASE_URL
const CREST = `${BASE}palmeiras-crest.svg`
const HERO = `${BASE}brand/hero-campeao.png`

export default function Home({
  data,
  matchDay = false,
  liveMatch,
  favoriteIds = [],
  onOpenTorcida,
}) {
  const recent = (data.recentResults || []).slice(0, 3)
  const lineup = data.lineup
  const squadCount = data.squad?.length || 0
  const yellow = (data.cards || []).reduce((s, p) => s + (p.yellowCards || 0), 0)

  let displayMatch = data.nextMatch
  const upcoming = data.upcoming || []
  if (displayMatch?.date) {
    const ms = msUntil(displayMatch.date)
    if (ms != null && ms < -3 * 60 * 60 * 1000 && upcoming.length > 1) {
      displayMatch = upcoming[1]
    }
  }

  const shareNext = nextMatchShareText(displayMatch, { formatDateTime, matchTitle })
  const lastFinished = recent[0]
  const shareLast = lastFinished
    ? resultShareText(lastFinished, { formatDate, matchTitle, scoreLine })
    : null

  const showLive =
    liveMatch?.live ||
    liveMatch?.polling ||
    liveMatch?.candidate?.status === 'LIVE' ||
    liveMatch?.candidate?.status === 'FINISHED'

  const reactionMatch = liveMatch?.candidate || displayMatch
  const reactionId =
    (reactionMatch && (matchDedupeKey(reactionMatch) || reactionMatch.id)) || 'geral'
  const reactionLabel = reactionMatch ? matchTitle(reactionMatch) : 'Palmeiras'

  const finalScore =
    liveMatch?.live?.score ||
    (liveMatch?.candidate?.status === 'FINISHED' ? liveMatch?.candidate?.score : null)
  const finalStatus = liveMatch?.live?.status || liveMatch?.candidate?.status || displayMatch?.status

  return (
    <section className="page home">
      {/* 1) Hero + match-critical info first */}
      <div className="hero-campeao">
        <img
          className="hero-campeao__img"
          src={HERO}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero-campeao__veil" aria-hidden="true" />
        <div className="hero-campeao__copy">
          <img className="crest crest--hero" src={CREST} width={52} height={52} alt="" decoding="async" />
          <p className="eyebrow">{matchDay ? 'Dia de jogo' : 'Palmeiras Hub'}</p>
          <h2 className="hero-campeao__title">
            <span className="star-accent" aria-hidden="true">★</span>
            O Maior Campeão
            <span className="star-accent" aria-hidden="true">★</span>
          </h2>
          <p className="lede hero-campeao__lede">
            Avanti Palestra — jogos, elenco e tabelas com fontes públicas
            {liveMatch?.polling ? ' · placar ao vivo ativo' : ''}.
          </p>
        </div>
      </div>

      <SinceLastVisit data={data} />

      {showLive && (
        <LiveMatchCenter
          candidate={liveMatch.candidate}
          live={liveMatch.live}
          error={liveMatch.error}
          polling={liveMatch.polling}
        />
      )}

      <h3 className="section-title">Próximo confronto</h3>
      {displayMatch ? (
        <>
          <MatchCard
            match={displayMatch}
            form={data.form}
            featured
            emphasizeToday={isTodaySP(displayMatch.date)}
          />
          <Countdown match={displayMatch} pulse={matchDay} />
          <SyncStatus compact />
          <ScoreTip
            match={displayMatch}
            finalScore={finalScore}
            finalStatus={finalStatus}
          />
          <div className="share-row">
            <ShareButton text={shareNext} label="WhatsApp · próximo jogo" />
          </div>
        </>
      ) : (
        <article className="card match-card featured">
          <p className="muted">
            Nenhum jogo futuro encontrado nas fontes públicas neste momento. Confira os
            resultados recentes ou toque em Atualizar.
          </p>
          {data.form?.length > 0 && (
            <div className="match-card__form">
              <span className="label">Forma recente</span>
              <FormDots form={data.form} />
            </div>
          )}
        </article>
      )}

      {/* 2) Media: onde assistir, rádio, YouTube */}
      {displayMatch && (
        <div className="home-media">
          <h3 className="section-title">Onde acompanhar</h3>
          <BroadcastInfo match={displayMatch} />
          <RadioListen />
          <YouTubeMatch match={displayMatch} />
        </div>
      )}

      {/* 3) Torcida / reactions after primary match info */}
      {reactionMatch && (
        <CrowdReactions matchId={reactionId} matchLabel={reactionLabel} compact />
      )}

      <FavoritePlayers squad={data.squad} favoriteIds={favoriteIds} />

      {typeof onOpenTorcida === 'function' && (
        <button
          type="button"
          className="btn torcida-cta touch"
          onClick={onOpenTorcida}
        >
          💚 Abrir Torcida — mural, quiz e mais
        </button>
      )}

      {displayMatch && (
        <H2H h2h={data.h2h} opponent={displayMatch.opponent} />
      )}

      {data.stats && (
        <div className="stats-mini grid-4">
          <div className="stat-tile">
            <span className="num">{data.stats.position}º</span>
            <span className="lbl">Posição</span>
          </div>
          <div className="stat-tile">
            <span className="num">{data.stats.points}</span>
            <span className="lbl">Pontos</span>
          </div>
          <div className="stat-tile">
            <span className="num">
              {data.stats.won}-{data.stats.draw}-{data.stats.lost}
            </span>
            <span className="lbl">V-E-D</span>
          </div>
          <div className="stat-tile">
            <span className="num">
              {data.stats.goalsFor}:{data.stats.goalsAgainst}
            </span>
            <span className="lbl">Gols</span>
          </div>
        </div>
      )}

      <div className="quick-grid">
        {squadCount > 0 && (
          <div className="quick-tile card">
            <span className="quick-tile__num">{squadCount}</span>
            <span className="quick-tile__lbl">No elenco</span>
          </div>
        )}
        {lineup?.formation && (
          <div className="quick-tile card">
            <span className="quick-tile__num">{formationLabel(lineup.formation)}</span>
            <span className="quick-tile__lbl">Última tática</span>
          </div>
        )}
        {yellow > 0 && (
          <div className="quick-tile card">
            <span className="quick-tile__num">{yellow}</span>
            <span className="quick-tile__lbl">Amarelos</span>
          </div>
        )}
        {(data.competitions || []).length > 0 && (
          <div className="quick-tile card">
            <span className="quick-tile__num">{data.competitions.length}</span>
            <span className="quick-tile__lbl">Tabelas</span>
          </div>
        )}
      </div>

      <h3 className="section-title">Resultados recentes</h3>
      <div className="list-stack">
        {recent.length === 0 && (
          <p className="muted">Sem resultados recentes nesta atualização.</p>
        )}
        {recent.map((m, idx) => (
          <article key={matchDedupeKey(m) || m.id} className="card row-card">
            <div>
              <span className="pill tiny">{m.competition}</span>
              <strong>{matchTitle(m)}</strong>
              <p className="muted">
                {formatDate(m.date)} · {m.venue}
              </p>
              {idx === 0 && shareLast && (
                <div className="share-row share-row--inline">
                  <ShareButton
                    text={shareLast}
                    label="WhatsApp · resultado"
                    className="share-btn--compact"
                  />
                </div>
              )}
            </div>
            <div className="row-card__right">
              <span className={`result-badge ${(m.result || '').toLowerCase()}`}>
                {scoreLine(m) || '—'}
              </span>
              {m.result && <FormDots form={[m.result]} />}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
