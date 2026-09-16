const LABELS = { W: 'V', D: 'E', L: 'D' }

export default function FormDots({ form = [] }) {
  if (!form.length) return <span className="muted">Sem forma recente</span>
  return (
    <div className="form-dots" aria-label="Forma recente">
      {form.map((r, i) => (
        <span key={`${r}-${i}`} className={`form-dot ${r.toLowerCase()}`} title={LABELS[r] || r}>
          {LABELS[r] || r}
        </span>
      ))}
    </div>
  )
}
