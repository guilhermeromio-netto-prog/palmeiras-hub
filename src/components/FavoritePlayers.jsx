export default function FavoritePlayers({ squad = [], favoriteIds = [] }) {
  const ids = new Set((favoriteIds || []).map(String))
  const favs = (squad || []).filter((p) => ids.has(String(p.id)))
  if (!favs.length) return null

  return (
    <section className="fav-players">
      <h3 className="section-title">Seus favoritos</h3>
      <div className="fav-players__grid">
        {favs.map((p) => (
          <article key={p.id} className="card fav-player-card">
            <span className="jersey-badge">{p.jersey || '—'}</span>
            <div>
              <strong>{p.shortName || p.name}</strong>
              <p className="muted tiny">{p.positionLabel}</p>
              {(p.goals > 0 || p.assists > 0) && (
                <p className="fav-player-card__stats">
                  {p.goals || 0}G · {p.assists || 0}A
                  {p.appearances > 0 ? ` · ${p.appearances} jog.` : ''}
                </p>
              )}
            </div>
            <span className="fav-star" aria-hidden="true">
              ★
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
