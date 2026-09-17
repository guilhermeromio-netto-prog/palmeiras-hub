import { useMemo } from 'react'
import { formatRelative } from '../utils/format'

function truncateTitle(title, max = 140) {
  const t = String(title || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trim()}…`
}

export default function NewsTicker({ news = [] }) {
  const items = useMemo(
    () => (news || []).filter((n) => n?.title && n?.url).slice(0, 28),
    [news]
  )
  if (items.length < 2) return null

  // Duplicar para loop contínuo do marquee
  const loop = [...items, ...items]
  // Duração bem mais lenta: ~9s por manchete (mín. 120s)
  const durationSec = Math.max(120, items.length * 9)

  return (
    <div className="news-ticker" aria-label="Manchetes em destaque">
      <span className="news-ticker__label" aria-hidden="true">
        📰
      </span>
      <div className="news-ticker__viewport">
        <div
          className="news-ticker__track"
          style={{ animationDuration: `${durationSec}s` }}
        >
          {loop.map((n, i) => (
            <a
              key={`${n.id}-${i}`}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-ticker__item"
              title={n.title}
            >
              <span className="news-ticker__src">{n.source}</span>
              <span className="news-ticker__headline">{truncateTitle(n.title)}</span>
              {n.publishedAt && (
                <span className="news-ticker__time">{formatRelative(n.publishedAt)}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
