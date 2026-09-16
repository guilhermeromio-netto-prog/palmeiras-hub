import { useState } from 'react'
import { addMuralEntry, getMural, MAX_MSG, MAX_NAME } from '../utils/torcidaStorage'
import { muralInviteText } from '../utils/share'
import ShareButton from './ShareButton'

function formatWhen(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export default function CrowdWall() {
  const [entries, setEntries] = useState(() => getMural())
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setErr('')
    const msg = message.trim()
    if (!msg) {
      setErr('Escreva uma mensagem curta.')
      return
    }
    const next = addMuralEntry(name, msg)
    setEntries(next)
    setMessage('')
  }

  return (
    <section className="crowd-wall card">
      <header className="crowd-wall__head">
        <h3 className="crowd-wall__title">Mural da torcida</h3>
        <p className="muted tiny">mural deste aparelho / família</p>
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
            text={muralInviteText()}
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
