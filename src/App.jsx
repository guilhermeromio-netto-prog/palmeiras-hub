import { useCallback, useEffect, useMemo, useState } from 'react'
import { useHubData } from './hooks/useHubData'
import { usePreferences } from './hooks/usePreferences'
import { useLiveMatch } from './hooks/useLiveMatch'
import StatusBanner from './components/StatusBanner'
import Loading from './components/Loading'
import ErrorState from './components/ErrorState'
import Home from './components/Home'
import Calendar from './components/Calendar'
import Team from './components/Team'
import Competitions from './components/Competitions'
import News from './components/News'
import Torcida from './components/Torcida'
import MatchDayBanner from './components/MatchDayBanner'
import NewsTicker from './components/NewsTicker'
import Preferences from './components/Preferences'
import FeedbackButton from './components/FeedbackButton'
import EntryGate from './components/EntryGate'
import PitchParticles from './components/PitchParticles'
import ConfettiBurst from './components/ConfettiBurst'
import { isMatchDaySP, isTodaySP } from './utils/datetime'
import { isStadiumModeActive } from './utils/preferences'
import { matchTitle } from './utils/format'
import { matchDedupeKey } from './utils/matchKey'
import { didPalmeirasWin } from './utils/palmeirasWin'
import {
  confettiAlreadySeen,
  markConfettiSeen,
} from './utils/torcidaStorage'
import './App.css'

const BASE = import.meta.env.BASE_URL
const CREST = `${BASE}palmeiras-crest.svg`
const BG_PITCH = `${BASE}brand/bg-pitch.png`

const TABS = [
  { id: 'calendar', label: 'Jogos', icon: `${BASE}brand/btn-calendar.png` },
  { id: 'team', label: 'Time', icon: `${BASE}brand/btn-shield.png` },
  { id: 'home', label: 'Início', icon: `${BASE}brand/btn-ball.png`, primary: true },
  { id: 'torcida', label: 'Torcida', icon: `${BASE}brand/btn-torcida.png`, torcida: true },
  { id: 'tables', label: 'Tabelas', icon: `${BASE}brand/btn-trophy.png` },
  { id: 'news', label: 'Notícias', icon: `${BASE}brand/btn-ball.png`, news: true },
]

/** Scroll window + main app/page containers to top (tab / placar view changes). */
export function scrollAppToTop() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  } catch {
    window.scrollTo(0, 0)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    document.querySelectorAll('.app, .main, .page').forEach((el) => {
      try {
        el.scrollTop = 0
        el.scrollTo?.(0, 0)
      } catch {
        /* ignore */
      }
    })
  }
}

export default function App() {
  const {
    prefs,
    update,
    toggleFavoritePlayer,
    moveHomeBlock,
    setHomeBlockVisible,
    resetHomeBlocks,
  } = usePreferences()
  const [tab, setTab] = useState(prefs.defaultTab || 'home')
  const [prefsOpen, setPrefsOpen] = useState(false)
  const { data, loading, error, reload } = useHubData()
  const liveMatch = useLiveMatch(data)
  const [confetti, setConfetti] = useState(false)
  const [parallax, setParallax] = useState(0)

  const matchDay = useMemo(() => (data ? isMatchDaySP(data) : false), [data])
  const stadiumActive = useMemo(
    () => isStadiumModeActive(prefs, matchDay),
    [prefs, matchDay],
  )
  const todayTitle = useMemo(() => {
    if (!data || !matchDay) return ''
    const pool = [data.nextMatch, ...(data.upcoming || []), ...(data.recentResults || [])].filter(
      Boolean
    )
    const hit = pool.find((m) => isTodaySP(m.date))
    return hit ? matchTitle(hit) : ''
  }, [data, matchDay])

  const liveStatus = liveMatch?.live?.status || liveMatch?.candidate?.status
  const arenaLive = matchDay && liveStatus === 'LIVE'

  // Confetti: FT + vitória verificada (uma vez por jogo neste aparelho)
  useEffect(() => {
    const live = liveMatch?.live
    const candidate = liveMatch?.candidate
    if (!live && !candidate) return
    const status = live?.status || candidate?.status
    if (status !== 'FINISHED') return

    const payload = {
      status: 'FINISHED',
      score: live?.score || candidate?.score,
      homeTeam: live?.homeTeam || candidate?.homeTeam,
      awayTeam: live?.awayTeam || candidate?.awayTeam,
      isHome: candidate?.isHome,
      result: candidate?.result,
    }
    if (!payload.score || payload.score.home == null || payload.score.away == null) return
    if (!didPalmeirasWin(payload)) return

    const id =
      (candidate && (matchDedupeKey(candidate) || candidate.id || candidate.espnEventId)) ||
      'ft-win'
    if (confettiAlreadySeen(id)) return
    markConfettiSeen(id)
    setConfetti(true)
  }, [liveMatch?.live, liveMatch?.candidate])

  const onConfettiDone = useCallback(() => setConfetti(false), [])

  // Scroll to top on every tab change
  useEffect(() => {
    scrollAppToTop()
  }, [tab])

  // Parallax leve no scroll (hero via CSS var)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = Math.min(120, window.scrollY || 0)
        setParallax(y * 0.22)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const selectTab = useCallback((id) => {
    setTab(id)
    // Immediate scroll so it feels instant even before paint
    scrollAppToTop()
  }, [])

  const themeAccent = prefs.themeAccent || 'verde'
  const appClass = [
    'app',
    'app--glass',
    matchDay ? 'matchday' : '',
    stadiumActive ? 'stadium-mode' : '',
    arenaLive ? 'arena-mode' : '',
    prefs.fontSize === 'large' ? 'font-large' : '',
    prefs.compactMode ? 'compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={appClass}
      data-theme={themeAccent}
      style={{ '--hero-parallax': `${parallax}px` }}
    >
      <div
        className="pitch-bg"
        aria-hidden="true"
        style={{ '--pitch-img': `url(${BG_PITCH})` }}
      />
      <PitchParticles />
      <ConfettiBurst active={confetti} onDone={onConfettiDone} />
      <EntryGate />

      <header className="topbar topbar--glass">
        <div className="brand">
          <img
            className="crest crest--header"
            src={CREST}
            width={44}
            height={44}
            alt=""
            decoding="async"
          />
          <div>
            <strong>Palmeiras Hub</strong>
            <span className="brand-sub">
              <span className="star-accent" aria-hidden="true">★</span>
              O Maior Campeão
              <span className="star-accent" aria-hidden="true">★</span>
            </span>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="btn ghost touch"
            onClick={() => setPrefsOpen(true)}
            aria-label="Preferências"
            title="Preferências"
          >
            ⚙️
          </button>
          <button type="button" className="btn ghost touch" onClick={reload} disabled={loading}>
            {loading ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>
      </header>

      {data?.news?.length > 0 && <NewsTicker news={data.news} />}
      {matchDay && <MatchDayBanner matchTitle={todayTitle} />}

      <main className="main main--tab-fade" key={tab}>
        {loading && !data && <Loading />}
        {error && !data && <ErrorState message={error} onRetry={reload} />}
        {data && (
          <>
            {loading && (
              <p className="muted pad-refresh" aria-live="polite">
                Atualizando fontes públicas…
              </p>
            )}
            {tab === 'home' && (
              <Home
                data={data}
                matchDay={matchDay}
                stadiumActive={stadiumActive}
                liveMatch={liveMatch}
                favoriteIds={prefs.favoritePlayerIds}
                homeBlocks={prefs.homeBlocks}
                onOpenTorcida={() => selectTab('torcida')}
              />
            )}
            {tab === 'calendar' && <Calendar data={data} onViewChange={scrollAppToTop} />}
            {tab === 'team' && (
              <Team
                data={data}
                favoriteIds={prefs.favoritePlayerIds}
                onToggleFavorite={toggleFavoritePlayer}
              />
            )}
            {tab === 'torcida' && <Torcida data={data} liveMatch={liveMatch} />}
            {tab === 'tables' && <Competitions data={data} onViewChange={scrollAppToTop} />}
            {tab === 'news' && <News data={data} />}
          </>
        )}
      </main>

      {data && <StatusBanner data={data} />}

      <FeedbackButton />

      <Preferences
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        prefs={prefs}
        update={update}
        moveHomeBlock={moveHomeBlock}
        setHomeBlockVisible={setHomeBlockVisible}
        resetHomeBlocks={resetHomeBlocks}
      />

      <nav className="tabbar tabbar--liquid tabbar--six" aria-label="Seções">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={[
              'tab-liquid',
              tab === t.id ? 'active' : '',
              t.primary ? 'tab-liquid--primary' : '',
              t.news ? 'tab-liquid--news' : '',
              t.torcida ? 'tab-liquid--torcida' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => selectTab(t.id)}
            aria-label={t.fullLabel || t.label}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="tab-liquid__orb">
              <img src={t.icon} alt="" width={56} height={56} decoding="async" />
              {t.news && (
                <span className="tab-liquid__badge" aria-hidden="true">
                  📰
                </span>
              )}
            </span>
            <span className="tab-liquid__label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
