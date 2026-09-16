import { useState } from 'react'
import { useHubData } from './hooks/useHubData'
import StatusBanner from './components/StatusBanner'
import Loading from './components/Loading'
import ErrorState from './components/ErrorState'
import Home from './components/Home'
import Calendar from './components/Calendar'
import Team from './components/Team'
import Competitions from './components/Competitions'
import News from './components/News'
import './App.css'

const TABS = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'calendar', label: 'Jogos', icon: '📅' },
  { id: 'team', label: 'Time', icon: '👕' },
  { id: 'tables', label: 'Tabelas', icon: '📊' },
  { id: 'news', label: 'Notícias', icon: '📰' },
]

export default function App() {
  const [tab, setTab] = useState('home')
  const { data, loading, error, reload } = useHubData()

  return (
    <div className="app">
      <div className="pitch-bg" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <div className="monogram sm" aria-hidden="true">
            <span>P</span>
          </div>
          <div>
            <strong>Palmeiras Hub</strong>
            <span className="brand-sub">torcedor · pessoal</span>
          </div>
        </div>
        <button type="button" className="btn ghost" onClick={reload} disabled={loading}>
          {loading ? 'Atualizando…' : 'Atualizar'}
        </button>
      </header>

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
            {tab === 'home' && <Home data={data} />}
            {tab === 'calendar' && <Calendar data={data} />}
            {tab === 'team' && <Team data={data} />}
            {tab === 'tables' && <Competitions data={data} />}
            {tab === 'news' && <News data={data} />}
          </>
        )}
      </main>

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
