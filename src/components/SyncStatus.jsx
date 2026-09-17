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

function notifyDisplayName(n) {
  try {
    window.dispatchEvent(new CustomEvent('palmeiras-hub-display-name', { detail: n }))
  } catch {
    /* */
  }
}

/**
 * Status da sala + edição do código (padrão VERDAO) e apelido na torcida.
 */
export default function SyncStatus({ compact = false }) {
  const conn = db.useConnectionStatus()
  const [room, setRoom] = useState(() => getRoomCode())
  const [name, setName] = useState(() => getDisplayName())
  const [draftRoom, setDraftRoom] = useState(room)
  const [editing, setEditing] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setDraftRoom(room)
  }, [room])

  useEffect(() => {
    const onName = (e) => {
      if (typeof e?.detail === 'string') setName(e.detail)
      else setName(getDisplayName())
    }
    const onStorage = (e) => {
      if (e.key === 'palmeiras-hub-display-name-v1') setName(getDisplayName())
    }
    window.addEventListener('palmeiras-hub-display-name', onName)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('palmeiras-hub-display-name', onName)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  function saveRoom(e) {
    e?.preventDefault?.()
    const next = setRoomCode(draftRoom)
    setRoom(next)
    setDraftRoom(next)
    setEditing(false)
    try {
      window.dispatchEvent(new CustomEvent('palmeiras-hub-room', { detail: next }))
    } catch {
      /* */
    }
  }

  function persistName(raw) {
    const n = setDisplayName(raw)
    setName(n)
    notifyDisplayName(n)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1400)
    return n
  }

  function onNameBlur() {
    persistName(name)
  }

  function onNameKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      persistName(name)
      e.currentTarget.blur()
    }
  }

  const online = conn === 'authenticated' || conn === 'opened'
  const expired = isInstantExpired()
  const expiring = !expired && isInstantExpiringSoon(7)
  const nick = (name || '').trim()

  return (
    <section
      className={`sync-status sync-panel${compact ? ' sync-status--compact' : ''} ${statusClass(conn)}`}
    >
      <div className="sync-status__row">
        <span className="sync-status__dot" aria-hidden="true" />
        <div className="sync-status__text">
          <strong>
            {online ? 'Torcida online' : 'Torcida'} · {statusLabel(conn)}
          </strong>
          <p className="muted tiny">
            Sala <code>{room || DEFAULT_ROOM}</code>
            {online
              ? ' — o mesmo código = os mesmos dados em qualquer celular de quem tiver o link (e o app)'
              : ' — reconectando…'}
          </p>
        </div>
      </div>

      <div className={`sync-status__nick${compact ? ' sync-status__nick--compact' : ''}`}>
        <label className="sync-status__nick-label">
          <span className="sync-status__nick-title">
            Seu apelido
            {nick ? (
              <span className="sync-status__nick-pill" title="Apelido na torcida">
                {nick}
              </span>
            ) : (
              <span className="sync-status__nick-pill sync-status__nick-pill--empty">
                defina o seu
              </span>
            )}
          </span>
          <input
            type="text"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={onNameBlur}
            onKeyDown={onNameKey}
            placeholder="Ex.: Guilherme"
            autoComplete="nickname"
            aria-label="Seu apelido na torcida"
          />
        </label>
        <p className="muted tiny sync-status__nick-hint">
          {savedFlash
            ? 'Apelido salvo neste aparelho ✓'
            : 'Aparece no mural, palpites e reações · salvo só neste navegador'}
        </p>
      </div>

      {!compact && (
        <div className="sync-status__form">
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
