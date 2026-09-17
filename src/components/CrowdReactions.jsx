import { useCallback, useMemo, useState } from 'react'
import { REACTION_EMOJIS, softHaptic } from '../utils/torcidaStorage'
import { reactionShareText } from '../utils/share'
import ShareButton from './ShareButton'
import { db, id } from '../sync/instant'
import { getClientId } from '../sync/identity'
import { useRoomCodeState } from '../hooks/useRoomCode'

/**
 * Reações sincronizadas na sala da família (InstantDB).
 */
export default function CrowdReactions({ matchId, matchLabel, compact = false }) {
  const room = useRoomCodeState()
  const matchKey = String(matchId || 'geral')
  const { data, isLoading } = db.useQuery({
    reactionEvents: {
      $: { where: { roomCode: room, matchId: matchKey } },
    },
  })
  const [flies, setFlies] = useState([])

  const counts = useMemo(() => {
    const out = {}
    for (const e of REACTION_EMOJIS) out[e] = 0
    for (const ev of data?.reactionEvents || []) {
      if (REACTION_EMOJIS.includes(ev.emoji)) out[ev.emoji] = (out[ev.emoji] || 0) + 1
    }
    return out
  }, [data?.reactionEvents])

  const onReact = useCallback(
    (emoji) => {
      if (!REACTION_EMOJIS.includes(emoji)) return
      softHaptic(14)
      db.transact(
        db.tx.reactionEvents[id()].update({
          roomCode: room,
          matchId: matchKey,
          emoji,
          at: Date.now(),
          clientId: getClientId(),
        })
      )
      const flyId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setFlies((prev) => [...prev, { id: flyId, emoji }])
      setTimeout(() => {
        setFlies((prev) => prev.filter((f) => f.id !== flyId))
      }, 900)
    },
    [room, matchKey]
  )

  const total = REACTION_EMOJIS.reduce((s, e) => s + (counts[e] || 0), 0)
  const shareEmoji =
    REACTION_EMOJIS.slice().sort((a, b) => (counts[b] || 0) - (counts[a] || 0))[0] || '💚'

  return (
    <section className={`crowd-react card${compact ? ' crowd-react--compact' : ''}`}>
      <header className="crowd-react__head">
        <h3 className="crowd-react__title">Reações da torcida</h3>
        <p className="muted tiny">
          {isLoading ? 'carregando sala…' : `sala ${room} · sincronizado`}
        </p>
      </header>
      <div className="crowd-react__bar" role="group" aria-label="Reações">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="crowd-react__btn touch"
            onClick={() => onReact(emoji)}
            aria-label={`Reagir com ${emoji}`}
          >
            <span className="crowd-react__emoji" aria-hidden="true">
              {emoji}
            </span>
            <span className="crowd-react__count">{counts[emoji] || 0}</span>
          </button>
        ))}
      </div>
      <div className="crowd-react__flies" aria-hidden="true">
        {flies.map((f) => (
          <span key={f.id} className="crowd-react__fly">
            {f.emoji}
          </span>
        ))}
      </div>
      <div className="crowd-react__foot">
        <span className="muted tiny">
          {total} reação{total === 1 ? '' : 'ões'} na sala
        </span>
        <ShareButton
          text={reactionShareText(shareEmoji, matchLabel)}
          label="Mande sua reação"
          className="share-btn--compact"
        />
      </div>
    </section>
  )
}
