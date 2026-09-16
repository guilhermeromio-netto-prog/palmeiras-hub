import { useMemo } from 'react'

export default function NewsTicker({ news = [] }) {
  const items = useMemo(() => (news || []).filter((n) => n?.title && n?.url).slice(0, 16), [news])
  if (items.length < 2) return null

  // Duplicar para loop contínuo do marquee
  const loop = [...items, ...items]

  return (
    <div className="news-ticker" aria-label="Manchetes em destaque">
      <span className="news-ticker__label" aria-hidden="true">
        📰
      </span>
      <div className="news-ticker__viewport">
        <div className="news-ticker__track">
          {loop.map((n, i) => (
            <a
              key={`${n.id}-${i}`}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-ticker__item"
            >
              <span className="news-ticker__src">{n.source}</span>
              {n.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
