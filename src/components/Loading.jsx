export default function Loading({ label = 'Carregando o Verdão…' }) {
  return (
    <div className="state-box loading" aria-busy="true" aria-live="polite">
      <div className="pitch-spinner" />
      <p>{label}</p>
    </div>
  )
}
