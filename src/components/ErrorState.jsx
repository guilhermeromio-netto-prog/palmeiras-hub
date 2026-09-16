export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box error" role="alert">
      <h2>Não foi possível atualizar</h2>
      <p>{message || 'Falha ao buscar dados nas fontes públicas. Tente novamente.'}</p>
      <p className="hint">
        Não inventamos placares. Confira sua conexão ou abra via{' '}
        <code>npx serve dist</code> / <code>npm run dev</code> (file:// pode bloquear fetches).
      </p>
      {onRetry && (
        <button type="button" className="btn primary" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  )
}
