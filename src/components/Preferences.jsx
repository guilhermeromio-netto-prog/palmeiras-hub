import {
  THEME_ACCENTS,
  STADIUM_MODES,
  homeBlockLabel,
} from '../utils/preferences'

const TABS = [
  { id: 'home', label: 'Início' },
  { id: 'calendar', label: 'Jogos' },
  { id: 'team', label: 'Time' },
  { id: 'torcida', label: 'Torcida' },
  { id: 'tables', label: 'Tabelas' },
  { id: 'news', label: 'Notícias' },
]

export default function Preferences({
  open,
  onClose,
  prefs,
  update,
  moveHomeBlock,
  setHomeBlockVisible,
  resetHomeBlocks,
}) {
  if (!open) return null

  const blocks = prefs.homeBlocks || []

  return (
    <div className="prefs-overlay" role="dialog" aria-modal="true" aria-label="Preferências">
      <div className="prefs-sheet card">
        <header className="prefs-sheet__head">
          <h2>Preferências</h2>
          <button type="button" className="btn ghost touch" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        <fieldset className="prefs-field">
          <legend>Tema do torcedor</legend>
          <div className="prefs-seg prefs-seg--3">
            {THEME_ACCENTS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-chip theme-chip--${t.id}${
                  prefs.themeAccent === t.id ? ' active' : ''
                }`}
                onClick={() => update({ themeAccent: t.id })}
                aria-pressed={prefs.themeAccent === t.id}
              >
                <span className="theme-chip__swatch" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
          <p className="muted tiny prefs-hint">
            Muda a ênfase do gradiente e dos botões — continua tricolor Palmeiras.
          </p>
        </fieldset>

        <fieldset className="prefs-field">
          <legend>Modo estádio</legend>
          <div className="prefs-seg prefs-seg--3">
            {STADIUM_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={prefs.stadiumMode === m.id ? 'active' : ''}
                onClick={() => update({ stadiumMode: m.id })}
                aria-pressed={prefs.stadiumMode === m.id}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="muted tiny prefs-hint">
            Automático liga a ambiência rica quando há jogo do Palmeiras hoje
            (horário de Brasília). Sempre ligado / Desligado forçam o modo.
          </p>
        </fieldset>

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
          <span>Layout Pro (compacto) — cards e espaçamento mais densos</span>
        </label>

        <label className="prefs-check">
          <input
            type="checkbox"
            checked={prefs.videoBg !== false}
            onChange={(e) => update({ videoBg: e.target.checked })}
          />
          <span>Vídeo de fundo — imersão Verdão 3D em loop (sempre silencioso)</span>
        </label>
        <p className="muted tiny prefs-hint">
          Desliga automaticamente se o sistema pedir menos movimento
          (prefers-reduced-motion). Overlay escuro mantém o texto legível.
        </p>

        <fieldset className="prefs-field prefs-home-blocks">
          <legend>Início — ordem e visibilidade</legend>
          <p className="muted tiny prefs-hint">
            Use ↑ ↓ para reordenar e o olho para mostrar/ocultar. Padrão lean: dossiê + painel
            cobrem clima, H2H e stats; rádio/YouTube ficam no dossiê.
          </p>
          <ul className="prefs-blocks">
            {blocks.map((b, i) => (
              <li key={b.id} className={`prefs-block${b.visible ? '' : ' prefs-block--hidden'}`}>
                <label className="prefs-block__vis">
                  <input
                    type="checkbox"
                    checked={b.visible !== false}
                    onChange={(e) => setHomeBlockVisible?.(b.id, e.target.checked)}
                    aria-label={`${b.visible ? 'Ocultar' : 'Mostrar'} ${homeBlockLabel(b.id)}`}
                  />
                </label>
                <span className="prefs-block__label">{homeBlockLabel(b.id)}</span>
                <div className="prefs-block__moves">
                  <button
                    type="button"
                    className="btn ghost touch prefs-block__move"
                    disabled={i === 0}
                    onClick={() => moveHomeBlock?.(b.id, 'up')}
                    aria-label={`Subir ${homeBlockLabel(b.id)}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn ghost touch prefs-block__move"
                    disabled={i === blocks.length - 1}
                    onClick={() => moveHomeBlock?.(b.id, 'down')}
                    aria-label={`Descer ${homeBlockLabel(b.id)}`}
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn ghost touch prefs-reset"
            onClick={() => resetHomeBlocks?.()}
          >
            Restaurar ordem padrão
          </button>
        </fieldset>

        <p className="muted tiny prefs-note">
          Salvo só neste navegador/dispositivo (localStorage). Favoritos de jogadores: até 5 no
          Elenco.
        </p>
      </div>
    </div>
  )
}
