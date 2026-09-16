import { placeOnPitch, formationLabel } from '../utils/formation'
import { formatDate, scoreLine } from '../utils/format'

export default function Lineup({ data }) {
  const lineup = data.lineup

  if (!lineup) {
    return (
      <div className="lineup-block">
        <p className="lede tight">Escalação e tática</p>
        <article className="card pad">
          <p className="muted">
            Nenhuma escalação com formação encontrada nas fontes públicas neste momento.
            Quando o ESPN publicar o resumo de um jogo do Verdão, a formação (ex.: 4-2-3-1)
            aparece aqui — sem inventar.
          </p>
        </article>
      </div>
    )
  }

  const placed = placeOnPitch(lineup.starters || [], lineup.formation)
  const formLabel = formationLabel(lineup.formation)
  const matchScore = lineup.match?.score
    ? `${lineup.match.score.home} × ${lineup.match.score.away}`
    : scoreLine(lineup.match)

  return (
    <div className="lineup-block">
      <p className="lede tight">
        {lineup.label || 'Última escalação'}
        {lineup.formation ? ` · ${formLabel}` : ''}
      </p>

      <article className="card lineup-meta">
        <div>
          <span className="pill tiny">{lineup.competition || 'Competição'}</span>
          <strong className="lineup-match">
            {lineup.match?.homeTeam} × {lineup.match?.awayTeam}
          </strong>
          <p className="muted">
            {formatDate(lineup.match?.date)}
            {matchScore ? ` · ${matchScore}` : ''}
          </p>
        </div>
        {lineup.formation && (
          <div className="formation-badge" aria-label={`Formação ${formLabel}`}>
            <span className="formation-badge__label">Formação</span>
            <span className="formation-badge__value">{formLabel}</span>
          </div>
        )}
      </article>

      <div className="pitch" role="img" aria-label={`Escalação em ${formLabel || 'formação desconhecida'}`}>
        <div className="pitch__field">
          <div className="pitch__halfway" />
          <div className="pitch__circle" />
          <div className="pitch__box pitch__box--top" />
          <div className="pitch__box pitch__box--bottom" />
          {placed.map((p) => (
            <div
              key={p.id || `${p.jersey}-${p.name}`}
              className="pitch-player"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={p.name}
            >
              <span className="pitch-player__num">{p.jersey || '·'}</span>
              <span className="pitch-player__name">{shortName(p)}</span>
            </div>
          ))}
        </div>
      </div>

      {lineup.bench?.length > 0 && (
        <>
          <h3 className="section-title">Banco</h3>
          <div className="bench-chips">
            {lineup.bench.map((p) => (
              <span key={p.id || p.name} className="bench-chip">
                {p.jersey ? `${p.jersey} ` : ''}
                {p.shortName || p.name}
              </span>
            ))}
          </div>
        </>
      )}

      <p className="source-hint">Fonte: ESPN · última escalação publicada (não é “provável” inventada)</p>
    </div>
  )
}

function shortName(p) {
  const n = p.shortName || p.name || ''
  const parts = n.trim().split(/\s+/)
  if (parts.length <= 1) return n.slice(0, 10)
  return parts[parts.length - 1].slice(0, 10)
}
