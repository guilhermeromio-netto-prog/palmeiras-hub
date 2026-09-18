import FormDots from './FormDots'
import Countdown from './Countdown'
import H2H from './H2H'
import ShareButton from './ShareButton'
import LiveMatchCenter from './LiveMatchCenter'
import ScoreTip from './ScoreTip'
import BroadcastInfo from './BroadcastInfo'
import RadioListen from './RadioListen'
import YouTubeMatch from './YouTubeMatch'
import MatchWeather from './MatchWeather'
import SyncStatus from './SyncStatus'
import StoriesCard from './StoriesCard'
import StreakBadge from './StreakBadge'
import MatchDossier from './MatchDossier'
import SeasonPanel from './SeasonPanel'
import { formatDate, formatDateTime, scoreLine, matchTitle } from '../utils/format'
import { formationLabel } from '../utils/formation'
import { matchDedupeKey } from '../utils/matchKey'
import { msUntil } from '../utils/datetime'
import {
  nextMatchShareText,
  resultShareText,
  shareOrWhatsApp,
} from '../utils/share'
import { DEFAULT_HOME_BLOCKS } from '../utils/preferences'

const BASE = import.meta.env.BASE_URL
const CREST = `${BASE}palmeiras-crest.svg`
const HERO = `${BASE}brand/hero-campeao.png`

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return false
  try {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add('quick-focus')
    window.setTimeout(() => el.classList.remove('quick-focus'), 1400)
  } catch {
    el.scrollIntoView()
  }
  return true
}

function canShowWeather(match) {
  if (!match) return false
  return (
    match.status !== 'FINISHED' &&
    (match.status === 'SCHEDULED' || match.status === 'LIVE' || !match.status)
  )
}

function isBlockOn(blocks, id) {
  return blocks.some((b) => b.id === id && b.visible !== false)
}

/**
 * Home lean Pro (v4.3):
 * hero compact → live → dossier → season → quick actions → streak/stories.
 * Duplicates (countdown/weather/broadcast/h2h/stats/radio/youtube) suppressed when Pro panels cover them.
 */
export default function Home({
  data,
  matchDay = false,
  stadiumActive = false,
  liveMatch,
  favoriteIds = [],
  homeBlocks = DEFAULT_HOME_BLOCKS,
  onOpenTorcida,
}) {
  void favoriteIds // favoritos ficam na aba Time — Home lean

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

  const finalScore =
    liveMatch?.live?.score ||
    (liveMatch?.candidate?.status === 'FINISHED' ? liveMatch?.candidate?.score : null)
  const finalStatus = liveMatch?.live?.status || liveMatch?.candidate?.status || displayMatch?.status

  const blocks = Array.isArray(homeBlocks) && homeBlocks.length
    ? homeBlocks
    : DEFAULT_HOME_BLOCKS

  const dossierOn = isBlockOn(blocks, 'nextMatch')
  const seasonOn = isBlockOn(blocks, 'seasonPanel')
  const radioOn = isBlockOn(blocks, 'radio')
  const youtubeOn = isBlockOn(blocks, 'youtube')

  const renderBlock = (id) => {
    switch (id) {
      case 'nextMatch':
        return (
          <div
            key="nextMatch"
            id="home-next-match"
            className="home-block home-block--next home-block--dossier"
          >
            <h3 className="section-title">
              Dossiê do próximo jogo{' '}
              <span className="pro-badge pro-badge--inline">PRO</span>
            </h3>
            <MatchDossier
              match={displayMatch}
              data={data}
              upcoming={upcoming}
              form={data.form}
              includeMedia={!radioOn && !youtubeOn}
            />
            {displayMatch && (
              <div className="home-dossier-tools">
                <SyncStatus compact />
                <ScoreTip
                  match={displayMatch}
                  finalScore={finalScore}
                  finalStatus={finalStatus}
                />
                <div className="share-row">
                  <ShareButton text={shareNext} label="WhatsApp · próximo jogo" />
                </div>
              </div>
            )}
          </div>
        )

      case 'countdown':
        if (!displayMatch || dossierOn) return null
        return (
          <div key="countdown" className="home-block">
            <Countdown match={displayMatch} pulse={stadiumActive || matchDay} />
          </div>
        )

      case 'seasonPanel':
        return (
          <div key="seasonPanel" className="home-block home-block--season">
            <SeasonPanel data={data} />
          </div>
        )

      case 'weather': {
        if (dossierOn) return null
        if (!displayMatch || !canShowWeather(displayMatch)) return null
        return (
          <div key="weather" className="home-block home-block--weather card">
            <MatchWeather match={displayMatch} />
          </div>
        )
      }

      case 'broadcast': {
        if (dossierOn) return null
        if (!displayMatch) return null
        return (
          <div key="broadcast" className="home-block">
            <h3 className="section-title">Onde assistir</h3>
            <BroadcastInfo match={displayMatch} />
          </div>
        )
      }

      case 'radio':
        if (dossierOn) return null
        return (
          <div key="radio" className="home-block">
            <RadioListen />
          </div>
        )

      case 'youtube':
        if (dossierOn || !displayMatch) return null
        return (
          <div key="youtube" className="home-block">
            <YouTubeMatch match={displayMatch} />
          </div>
        )

      case 'torcidaCta':
        if (typeof onOpenTorcida !== 'function') return null
        return (
          <button
            key="torcidaCta"
            type="button"
            className="btn torcida-cta torcida-cta--oneline touch"
            onClick={onOpenTorcida}
          >
            💚 Torcida — mural, quiz e sala VERDAO
          </button>
        )

      case 'h2h':
        if (!displayMatch || dossierOn) return null
        return (
          <div key="h2h" className="home-block">
            <H2H h2h={data.h2h} opponent={displayMatch.opponent} />
          </div>
        )

      case 'stats':
        if (seasonOn) return null
        return (
          <div key="stats" className="home-block">
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
          </div>
        )

      case 'recent':
        return (
          <div key="recent" className="home-block">
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
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="page home home--lean">
      <div className="hero-campeao hero-campeao--compact">
        <img
          className="hero-campeao__img"
          src={HERO}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero-campeao__veil" aria-hidden="true" />
        <div className="hero-campeao__copy">
          <img
            className="crest crest--hero"
            src={CREST}
            width={40}
            height={40}
            alt=""
            decoding="async"
          />
          <p className="eyebrow">
            {matchDay ? 'Dia de jogo' : 'Palmeiras Hub'}{' '}
            <span className="pro-badge pro-badge--hero">PRO</span>
          </p>
          <h2 className="hero-campeao__title">
            <span className="star-accent" aria-hidden="true">
              ★
            </span>
            O Maior Campeão
            <span className="star-accent" aria-hidden="true">
              ★
            </span>
          </h2>
          <p className="lede hero-campeao__lede">
            {matchDay
              ? 'Dia de jogo — o essencial, aqui.'
              : liveMatch?.polling
                ? 'Placar ao vivo ativo'
                : 'Dossiê, temporada e torcida'}
          </p>
        </div>
      </div>

      {showLive && (
        <LiveMatchCenter
          candidate={liveMatch.candidate}
          live={liveMatch.live}
          error={liveMatch.error}
          polling={liveMatch.polling}
        />
      )}

      {blocks.filter((b) => b.visible !== false).map((b) => renderBlock(b.id))}

      <nav className="home-quick" aria-label="Ações rápidas">
        <button
          type="button"
          className="home-quick__btn touch"
          onClick={() => {
            if (!scrollToId('home-radio') && !scrollToId('dossier-media')) {
              scrollToId('home-next-match')
            }
          }}
        >
          <span aria-hidden="true">📻</span> Ouvir rádio
        </button>
        <button
          type="button"
          className="home-quick__btn touch"
          onClick={() => {
            if (!scrollToId('home-broadcast')) scrollToId('home-next-match')
          }}
        >
          <span aria-hidden="true">📺</span> Onde assistir
        </button>
        <button
          type="button"
          className="home-quick__btn touch"
          disabled={!shareNext}
          onClick={() => {
            if (shareNext) shareOrWhatsApp(shareNext)
          }}
        >
          <span aria-hidden="true">📲</span> Compartilhar
        </button>
      </nav>

      <div className="home-engage home-engage--compact">
        <StreakBadge compact />
        <StoriesCard nextMatch={displayMatch} lastResult={lastFinished} />
      </div>
    </section>
  )
}
