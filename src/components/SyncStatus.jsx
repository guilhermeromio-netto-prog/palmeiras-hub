import { useEffect, useState } from 'react'
import {
  db,
  DEFAULT_ROOM,
  isInstantExpired,
  isInstantExpiringSoon,
  INSTANT_EXPIRES_ISO,
} from '../sync/instant'
import {
  getDisplayName,
  getRoomCode,
  setDisplayName,
  setRoomCode,
} from '../sync/identity'

function statusLabel(conn) {
  if (conn === 'authenticated' || conn === 'opened') return 'sincronizada'
  if (conn === 'connecting') return 'conectando…'
  if (conn === 'errored') return 'erro de sync'
  if (conn === 'closed') return 'offline'
  return 'conectando…'
}

function statusClass(conn) {
  if (conn === 'authenticated' || conn === 'opened') return 'sync-status--ok'
  if (conn === 'errored') return 'sync-status--err'
  if (conn === 'closed') return 'sync-status--off'
  return 'sync-status--pending'
}

/**
 * Status da sala + edição do código (padrão VERDAO) e nome na torcida.
 */
export default function SyncStatus({ compact = false }) {
  const conn = db.useConnectionStatus()
  const [room, setRoom] = useState(() => getRoomCode())
  const [name, setName] = useState(() => getDisplayName())
  const [draftRoom, setDraftRoom] = useState(room)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setDraftRoom(room)
  }, [room])

  function saveRoom(e) {
    e?.preventDefault?.()
    const next = setRoomCode(draftRoom)
    setRoom(next)
    setDraftRoom(next)
    setEditing(false)
    // avisa outras abas / remount via storage event
    try {
      window.dispatchEvent(new CustomEvent('palmeiras-hub-room', { detail: next }))
    } catch {
      /* */
    }
  }

  function onNameBlur() {
    const n = setDisplayName(name)
    setName(n)
  }

  const online = conn === 'authenticated' || conn === 'opened'
  const expired = isInstantExpired()
  const expiring = !expired && isInstantExpiringSoon(7)

  return (
    <section className={`sync-status card${compact ? ' sync-status--compact' : ''} ${statusClass(conn)}`}>
      <div className="sync-status__row">
        <span className="sync-status__dot" aria-hidden="true" />
        <div className="sync-status__text">
          <strong>
            {online ? 'Torcida online' : 'Torcida'} · {statusLabel(conn)}
          </strong>
          <p className="muted tiny">
            Sala <code>{room || DEFAULT_ROOM}</code>
            {online ? ' — mesmo código = mesmos dados no celular do pai' : ' — reconectando…'}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="sync-status__form">
          <label>
            <span>Seu nome na torcida</span>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={onNameBlur}
              placeholder="Ex.: Guilherme"
              autoComplete="nickname"
            />
          </label>

          {editing ? (
            <form className="sync-status__room-edit" onSubmit={saveRoom}>
              <label>
                <span>Código da sala</span>
                <input
                  type="text"
                  maxLength={16}
                  value={draftRoom}
                  onChange={(e) => setDraftRoom(e.target.value.toUpperCase())}
                  placeholder={DEFAULT_ROOM}
                  autoCapitalize="characters"
                />
              </label>
              <div className="sync-status__room-actions">
                <button type="submit" className="btn primary touch">
                  Entrar na sala
                </button>
                <button
                  type="button"
                  className="btn ghost touch"
                  onClick={() => {
                    setDraftRoom(room)
                    setEditing(false)
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className="btn ghost touch" onClick={() => setEditing(true)}>
              Trocar sala (padrão {DEFAULT_ROOM})
            </button>
          )}
        </div>
      )}

      {(expired || expiring) && (
        <p className="sync-status__warn muted tiny">
          {expired
            ? 'Backend de sync expirou — crie um app InstantDB free e defina VITE_INSTANT_APP_ID (ver README).'
            : `Sync gratuito válido até ${new Date(INSTANT_EXPIRES_ISO).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (SP). Depois: InstantDB free + VITE_INSTANT_APP_ID.`}
        </p>
      )}
    </section>
  )
}

