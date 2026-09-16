const TABS = [
  { id: 'home', label: 'Início' },
  { id: 'calendar', label: 'Jogos' },
  { id: 'team', label: 'Time' },
  { id: 'tables', label: 'Tabelas' },
  { id: 'news', label: 'Notícias' },
]

export default function Preferences({ open, onClose, prefs, update }) {
  if (!open) return null

  return (
    <div className="prefs-overlay" role="dialog" aria-modal="true" aria-label="Preferências">
      <div className="prefs-sheet card">
        <header className="prefs-sheet__head">
          <h2>Preferências</h2>
          <button type="button" className="btn ghost touch" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        <label className="prefs-field">
          <span>Aba inicial</span>
          <select
            value={prefs.defaultTab}
            onChange={(e) => update({ defaultTab: e.target.value })}
          >
            {TABS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="prefs-field">
          <legend>Tamanho da fonte</legend>
          <div className="prefs-seg">
            <button
              type="button"
              className={prefs.fontSize === 'normal' ? 'active' : ''}
              onClick={() => update({ fontSize: 'normal' })}
            >
              Normal
            </button>
            <button
              type="button"
              className={prefs.fontSize === 'large' ? 'active' : ''}
              onClick={() => update({ fontSize: 'large' })}
            >
              Grande
            </button>
          </div>
        </fieldset>

        <label className="prefs-check">
          <input
            type="checkbox"
            checked={Boolean(prefs.compactMode)}
            onChange={(e) => update({ compactMode: e.target.checked })}
          />
          <span>Modo compacto (menos espaço entre cards)</span>
        </label>

        <p className="muted tiny prefs-note">
          Salvo só neste navegador/dispositivo (localStorage). Favoritos de jogadores: até 5 no
          Elenco.
        </p>
      </div>
    </div>
  )
}
