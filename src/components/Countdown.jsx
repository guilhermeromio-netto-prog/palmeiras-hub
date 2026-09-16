import { useEffect, useState } from 'react'
import { countdownParts, isTodaySP } from '../utils/datetime'

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function Countdown({ match, pulse = false }) {
  const [parts, setParts] = useState(() => (match?.date ? countdownParts(match.date) : null))

  useEffect(() => {
    if (!match?.date) {
      setParts(null)
      return undefined
    }
    const tick = () => setParts(countdownParts(match.date))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [match?.date])

  if (!match?.date || !parts) return null

  const today = isTodaySP(match.date)
  const inProgress = parts.past || match.status === 'LIVE'

  if (inProgress) {
    return (
      <div className={`countdown countdown--live${pulse ? ' countdown--pulse' : ''}`} role="status">
        <p className="countdown__label">Jogo em andamento</p>
        <p className="countdown__hint">
          Verifique fontes (ESPN, ge.globo etc.) — não exibimos placar ao vivo aqui.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`countdown${today ? ' countdown--hoje' : ''}${pulse ? ' countdown--pulse' : ''}`}
      role="timer"
      aria-live="polite"
      aria-label={`Contagem regressiva: ${parts.days} dias, ${parts.hours} horas, ${parts.mins} minutos, ${parts.secs} segundos`}
    >
      <p className="countdown__label">
        {today ? (
          <>
            <span className="countdown__hoje-badge">Hoje</span> falta para o apito inicial
          </>
        ) : (
          'Falta para o próximo apito'
        )}
      </p>
      <div className="countdown__grid">
        <div className="countdown__unit">
          <span className="countdown__num">{parts.days}</span>
          <span className="countdown__lbl">dias</span>
        </div>
        <div className="countdown__unit">
          <span className="countdown__num">{pad(parts.hours)}</span>
          <span className="countdown__lbl">horas</span>
        </div>
        <div className="countdown__unit">
          <span className="countdown__num">{pad(parts.mins)}</span>
          <span className="countdown__lbl">min</span>
        </div>
        <div className="countdown__unit">
          <span className="countdown__num">{pad(parts.secs)}</span>
          <span className="countdown__lbl">seg</span>
        </div>
      </div>
      <p className="countdown__tz">Horário de Brasília (America/Sao_Paulo)</p>
    </div>
  )
}
