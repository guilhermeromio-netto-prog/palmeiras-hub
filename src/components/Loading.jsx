/**
 * Skeleton loaders — placeholders verde/branco enquanto o hub carrega.
 */
export default function Loading({ label = 'Atualizando dados públicos…', variant = 'hub' }) {
  if (variant === 'news') {
    return (
      <div className="skeleton-pack skeleton-pack--news" aria-busy="true" aria-live="polite">
        <span className="sr-only">{label}</span>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card skeleton-card--news">
            <div className="skeleton-line skeleton-line--pill" />
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--body" />
            <div className="skeleton-line skeleton-line--short" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="skeleton-pack skeleton-pack--hub" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="skeleton-hero">
        <div className="skeleton-line skeleton-line--crest" />
        <div className="skeleton-line skeleton-line--eyebrow" />
        <div className="skeleton-line skeleton-line--hero-title" />
        <div className="skeleton-line skeleton-line--lede" />
      </div>
      <div className="skeleton-card skeleton-card--featured">
        <div className="skeleton-line skeleton-line--pill" />
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--body" />
        <div className="skeleton-row">
          <div className="skeleton-line skeleton-line--half" />
          <div className="skeleton-line skeleton-line--half" />
        </div>
      </div>
      <div className="skeleton-row skeleton-row--tiles">
        <div className="skeleton-tile" />
        <div className="skeleton-tile" />
        <div className="skeleton-tile" />
      </div>
      <div className="skeleton-card">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--body" />
        <div className="skeleton-line skeleton-line--short" />
      </div>
      <p className="skeleton-label muted tiny">{label}</p>
    </div>
  )
}
