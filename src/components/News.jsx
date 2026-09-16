import { useMemo, useState } from 'react'
import { formatRelative } from '../utils/format'
import ShareButton from './ShareButton'
import { newsShareText } from '../utils/share'

export default function News({ data }) {
  const news = data.news || []
  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState('all')

  const sources = useMemo(() => {
    const s = new Set(news.map((n) => n.source).filter(Boolean))
    return ['all', ...s]
  }, [news])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return news.filter((n) => {
      if (source !== 'all' && n.source !== source) return false
      if (!q) return true
      const hay = `${n.title || ''} ${n.summary || ''} ${n.source || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [news, keyword, source])

  return (
    <section className="page news">
      <h2>Notícias</h2>
      <p className="lede">
        Manchetes de fontes brasileiras com link para o original
        {data.newsSource ? ` · via ${data.newsSource}` : ''}.
      </p>

      <div className="filters" aria-label="Filtros de notícias">
        <label className="filter-search">
          <span className="filter-label">Buscar</span>
          <input
            type="search"
            placeholder="Palavra-chave…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>
        <div className="filter-row">
          <span className="filter-label">Fonte</span>
          <div className="filter-chips">
            {sources.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip${source === s ? ' active' : ''}`}
                onClick={() => setSource(s)}
              >
                {s === 'all' ? 'Todas' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="list-stack">
        {filtered.map((n) => (
          <article key={n.id} className="card news-card news-card--block">
            <a href={n.url} target="_blank" rel="noopener noreferrer" className="news-card__link">
              <div className="news-card__meta">
                <span className="pill tiny">{n.source}</span>
                <span className="muted tiny">{formatRelative(n.publishedAt)}</span>
              </div>
              <h3>{n.title}</h3>
              {n.summary && <p className="muted">{n.summary}</p>}
              <span className="link-hint">Abrir matéria →</span>
            </a>
            <div className="share-row share-row--inline">
              <ShareButton
                text={newsShareText(n)}
                label="WhatsApp · manchete"
                className="share-btn--compact"
              />
            </div>
          </article>
        ))}
        {!filtered.length && <p className="muted">Nenhuma manchete com esses filtros.</p>}
      </div>
    </section>
  )
}
