import { formatRelative } from '../utils/format'
import ShareButton from './ShareButton'
import { newsShareText } from '../utils/share'

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
        {!news.length && <p className="muted">Nenhuma manchete no momento.</p>}
      </div>
    </section>
  )
}
