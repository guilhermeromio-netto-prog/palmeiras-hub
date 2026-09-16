import { useMemo, useState } from 'react'
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
import MatchDayBanner from './components/MatchDayBanner'
import NewsTicker from './components/NewsTicker'
import Preferences from './components/Preferences'
import FeedbackButton from './components/FeedbackButton'
import { isMatchDaySP, isTodaySP } from './utils/datetime'
import { matchTitle } from './utils/format'
import './App.css'

const CREST = `${import.meta.env.BASE_URL}palmeiras-crest.svg`

const TABS = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'calendar', label: 'Jogos', icon: '📅' },
  { id: 'team', label: 'Time', icon: '👕' },
  { id: 'tables', label: 'Tabelas', icon: '📊' },
  { id: 'news', label: 'Notícias', icon: '📰' },
]

export default function App() {
  const { prefs, update, toggleFavoritePlayer } = usePreferences()
  const [tab, setTab] = useState(prefs.defaultTab || 'home')
  const [prefsOpen, setPrefsOpen] = useState(false)
  const { data, loading, error, reload } = useHubData()
  const liveMatch = useLiveMatch(data)

  const matchDay = useMemo(() => (data ? isMatchDaySP(data) : false), [data])
  const todayTitle = useMemo(() => {
    if (!data || !matchDay) return ''
    const pool = [data.nextMatch, ...(data.upcoming || []), ...(data.recentResults || [])].filter(
      Boolean
    )
    const hit = pool.find((m) => isTodaySP(m.date))
    return hit ? matchTitle(hit) : ''
  }, [data, matchDay])

  const appClass = [
    'app',
    matchDay ? 'matchday' : '',
    prefs.fontSize === 'large' ? 'font-large' : '',
    prefs.compactMode ? 'compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={appClass}>
      <div className="pitch-bg" aria-hidden="true" />
      <header className="topbar">
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
            <span className="brand-sub">torcedor · pessoal</span>
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
      {data && <StatusBanner data={data} />}

      <main className="main">
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
                liveMatch={liveMatch}
                favoriteIds={prefs.favoritePlayerIds}
              />
            )}
            {tab === 'calendar' && <Calendar data={data} />}
            {tab === 'team' && (
              <Team
                data={data}
                favoriteIds={prefs.favoritePlayerIds}
                onToggleFavorite={toggleFavoritePlayer}
              />
            )}
            {tab === 'tables' && <Competitions data={data} />}
            {tab === 'news' && <News data={data} />}
          </>
        )}
      </main>

      <FeedbackButton />

      <Preferences
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        prefs={prefs}
        update={update}
      />

      <nav className="tabbar" aria-label="Seções">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
