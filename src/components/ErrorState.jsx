export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box error" role="alert">
      <h2>Não foi possível atualizar</h2>
      <p>{message || 'Falha ao buscar dados. Tente novamente.'}</p>
      <p className="hint">
        Em modo live não inventamos placares. Verifique a API ou use o modo demo
        (sem chaves no <code>.env</code>).
      </p>
      {onRetry && (
        <button type="button" className="btn primary" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}
