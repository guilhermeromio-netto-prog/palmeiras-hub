import { useMemo, useState } from 'react'
import { MAX_MSG, MAX_NAME } from '../utils/torcidaStorage'
import { muralInviteText } from '../utils/share'
import ShareButton from './ShareButton'
import { db, id } from '../sync/instant'
import { getDisplayName, setDisplayName } from '../sync/identity'
import { useRoomCodeState } from '../hooks/useRoomCode'

function formatWhen(ts) {
  if (ts == null) return ''
  try {
    const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return ''
  }
}

export default function CrowdWall() {
  const room = useRoomCodeState()
  const { data, isLoading } = db.useQuery({
    mural: {
      $: { where: { roomCode: room } },
    },
  })
  const [name, setName] = useState(() => getDisplayName())
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')

  const entries = useMemo(() => {
    const list = [...(data?.mural || [])]
    list.sort((a, b) => (b.at || 0) - (a.at || 0))
    return list.slice(0, 30)
  }, [data?.mural])

  function onSubmit(e) {
    e.preventDefault()
    setErr('')
    const msg = message.trim()
    if (!msg) {
      setErr('Escreva uma mensagem curta.')
      return
    }
    const n = String(name || 'Torcedor').trim().slice(0, MAX_NAME) || 'Torcedor'
    setDisplayName(n)
    db.transact(
      db.tx.mural[id()].update({
        roomCode: room,
        name: n,
        message: msg.slice(0, MAX_MSG),
        at: Date.now(),
      })
    )
    setMessage('')
  }

  return (
    <section className="crowd-wall card">
      <header className="crowd-wall__head">
        <h3 className="crowd-wall__title">Mural da torcida</h3>
        <p className="muted tiny">
          {isLoading ? 'carregando…' : `sala ${room} · todos na família veem`}
        </p>
      </header>

      <form className="crowd-wall__form" onSubmit={onSubmit}>
        <label>
          <span>Nome</span>
          <input
            type="text"
            maxLength={MAX_NAME}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Torcedor"
            autoComplete="nickname"
          />
        </label>
        <label>
          <span>Mensagem</span>
          <input
            type="text"
            maxLength={MAX_MSG}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Avanti Palestra!"
          />
        </label>
        {err && <p className="crowd-wall__err">{err}</p>}
        <div className="crowd-wall__actions">
          <button type="submit" className="btn primary touch">
            Publicar no mural
          </button>
          <ShareButton
            text={muralInviteText(room)}
            label="Compartilhar mural"
            className="share-btn--compact"
          />
        </div>
      </form>

      <ul className="crowd-wall__list">
        {entries.length === 0 && (
          <li className="muted">Nenhuma mensagem ainda. Seja o primeiro!</li>
        )}
        {entries.map((m) => (
          <li key={m.id} className="crowd-wall__item">
            <strong>{m.name}</strong>
            <span className="muted tiny">{formatWhen(m.at)} (SP)</span>
            <p>{m.message}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
