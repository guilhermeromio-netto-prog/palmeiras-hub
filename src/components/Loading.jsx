export default function Loading({ label = 'Atualizando dados públicos…' }) {
  return (
    <div className="state-box loading" aria-busy="true" aria-live="polite">
      <div className="pitch-spinner" />
      <p>{label}</p>
    </div>
  )
}
