import { useEffect, useState } from 'react'
import { resolveTeamLogo } from '../data/teamLogos'

/**
 * Escudo do clube com fallback de iniciais (nunca quebra o layout se 404).
 */
export default function TeamLogo({
  name,
  espnId,
  logoUrl,
  color,
  altColor,
  size = 28,
  className = '',
  title,
}) {
  const resolved = resolveTeamLogo({ name, espnId, logoUrl, color, altColor })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [resolved.url, name, espnId])

  const label = title || resolved.name
  const dim = typeof size === 'number' ? `${size}px` : size

  if (!resolved.url || failed) {
    return (
      <span
        className={`team-logo team-logo--fallback ${className}`.trim()}
        style={{
          width: dim,
          height: dim,
          background: `linear-gradient(135deg, ${resolved.color}, ${resolved.altColor})`,
          color: contrastText(resolved.color),
        }}
        title={label}
        aria-hidden={label ? undefined : true}
        role="img"
        aria-label={label}
      >
        <span className="team-logo__initials">{resolved.initials}</span>
      </span>
    )
  }

  return (
    <img
      className={`team-logo ${className}`.trim()}
      src={resolved.url}
      alt=""
      width={typeof size === 'number' ? size : undefined}
      height={typeof size === 'number' ? size : undefined}
      style={{ width: dim, height: dim }}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      title={label}
      onError={() => setFailed(true)}
    />
  )
}

/** Home × Away com escudos. */
export function MatchTeams({
  homeName,
  awayName,
  homeEspnId,
  awayEspnId,
  homeLogoUrl,
  awayLogoUrl,
  size = 36,
  score,
  className = '',
}) {
  return (
    <div className={`match-teams ${className}`.trim()}>
      <div className="match-teams__side">
        <TeamLogo name={homeName} espnId={homeEspnId} logoUrl={homeLogoUrl} size={size} />
        <span className="match-teams__name">{homeName || '—'}</span>
      </div>
      <div className="match-teams__mid" aria-hidden="true">
        {score ? (
          <span className="match-teams__score">
            {score.home} <span>×</span> {score.away}
          </span>
        ) : (
          <span className="match-teams__vs">×</span>
        )}
      </div>
      <div className="match-teams__side match-teams__side--away">
        <TeamLogo name={awayName} espnId={awayEspnId} logoUrl={awayLogoUrl} size={size} />
        <span className="match-teams__name">{awayName || '—'}</span>
      </div>
    </div>
  )
}

function contrastText(bgHex) {
  const h = String(bgHex || '#000').replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h.slice(0, 6)
  const r = parseInt(full.slice(0, 2), 16) || 0
  const g = parseInt(full.slice(2, 4), 16) || 0
  const b = parseInt(full.slice(4, 6), 16) || 0
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? '#111' : '#fff'
}
