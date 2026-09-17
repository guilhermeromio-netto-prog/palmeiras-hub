export default function StatusBanner({ data }) {
  if (!data) return null
  const isPartial = data.mode === 'partial'
  const time =
    data.updatedAtLabel ||
    (data.fetchedAt
      ? new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(data.fetchedAt))
      : null)

  const label = data.label || 'Fontes públicas'
  const sources = data.sources || []

  return (
    <footer
      className={`status-banner status-banner--footer ${isPartial ? 'partial' : 'live'}`}
      role="contentinfo"
    >
      <details className="status-banner__details">
        <summary className="status-banner__summary">
          <span className="dot" aria-hidden="true" />
          <span className="status-banner__summary-text">
            Fontes
            {time && <span className="status-banner__time"> · {time}</span>}
          </span>
        </summary>
        <p className="status-banner__body">
          {label}
          {time && !String(label).includes(time) && (
            <span> · Atualizado às {time}</span>
          )}
          {sources.length > 0 && (
            <span className="sources"> · {sources.join(' · ')}</span>
          )}
        </p>
      </details>
    </footer>
  )
}
