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

  return (
    <div className={`status-banner ${isPartial ? 'partial' : 'live'}`} role="status">
      <span className="dot" aria-hidden="true" />
      <span>
        {data.label || 'Fontes públicas'}
        {time && !String(data.label || '').includes(time) && (
          <small> · Atualizado às {time}</small>
        )}
        {data.sources?.length > 0 && (
          <small className="sources"> · {data.sources.join(' · ')}</small>
        )}
      </span>
    </div>
  )
}
