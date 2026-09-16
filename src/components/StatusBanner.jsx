export default function StatusBanner({ data }) {
  if (!data) return null
  const isDemo = data.mode === 'demo'
  return (
    <div className={`status-banner ${isDemo ? 'demo' : 'live'}`} role="status">
      <span className="dot" aria-hidden="true" />
      <span>
        {data.label || (isDemo ? 'MODO DEMO' : 'Dados ao vivo')}
        {data.fetchedAt && (
          <small> · atualizado {new Date(data.fetchedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</small>
        )}
      </span>
    </div>
  )
}
