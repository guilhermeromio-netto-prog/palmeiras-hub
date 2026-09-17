import { useState } from 'react'
import { getRoomCode } from '../sync/identity'
import { useRoomCodeState } from '../hooks/useRoomCode'
import { roomInviteText, shareOrWhatsApp } from '../utils/share'

/**
 * Convite one-tap da sala VERDAO — copia / compartilha link + código.
 */
export default function RoomInvite() {
  const room = useRoomCodeState() || getRoomCode()
  const [flash, setFlash] = useState('')

  async function copyInvite() {
    const text = roomInviteText(room)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setFlash('Copiado ✓')
      } else {
        setFlash('Veja o texto abaixo')
      }
    } catch {
      setFlash('Não deu pra copiar — use Compartilhar')
    }
    window.setTimeout(() => setFlash(''), 2000)
  }

  async function shareInvite() {
    const text = roomInviteText(room)
    await shareOrWhatsApp(text)
    setFlash('Convite enviado ✓')
    window.setTimeout(() => setFlash(''), 2000)
  }

  return (
    <aside className="room-invite card" aria-label="Convidar para a sala">
      <header className="room-invite__head">
        <p className="eyebrow">Convite</p>
        <h3>Chama a galera</h3>
        <p className="lede room-invite__lede">
          Entra no Palmeiras Hub comigo — sala <strong>{room}</strong>
        </p>
      </header>

      <div className="room-invite__code" aria-label={`Código ${room}`}>
        <span className="room-invite__code-label">Sala</span>
        <code className="room-invite__code-value">{room}</code>
      </div>

      <p className="muted tiny room-invite__hint">
        Mesmo link + mesmo código = mural, palpites e reações juntos.
      </p>

      <div className="room-invite__actions">
        <button type="button" className="btn primary touch" onClick={shareInvite}>
          <span aria-hidden="true">📲</span> Convidar
        </button>
        <button type="button" className="btn ghost touch" onClick={copyInvite}>
          Copiar convite
        </button>
      </div>
      {flash && (
        <p className="muted tiny room-invite__flash" aria-live="polite">
          {flash}
        </p>
      )}
    </aside>
  )
}
