import { formatRelative } from '../utils/format'

export default function News({ data }) {
  const news = data.news || []

  return (
    <section className="page news">
      <h2>Notícias</h2>
      <p className="lede">
        Manchetes de fontes brasileiras com link para o original
        {data.newsSource ? ` · via ${data.newsSource}` : ''}.
      </p>

      <div className="list-stack">
        {news.map((n) => (
          <a
            key={n.id}
            className="card news-card"
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="news-card__meta">
              <span className="pill tiny">{n.source}</span>
              <span className="muted tiny">{formatRelative(n.publishedAt)}</span>
            </div>
            <h3>{n.title}</h3>
            {n.summary && <p className="muted">{n.summary}</p>}
            <span className="link-hint">Abrir matéria →</span>
          </a>
        ))}
        {!news.length && <p className="muted">Nenhuma manchete no momento.</p>}
      </div>
    </section>
  )
}
