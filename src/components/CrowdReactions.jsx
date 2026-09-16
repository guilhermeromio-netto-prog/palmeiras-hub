import { useCallback, useState } from 'react'
import {
  REACTION_EMOJIS,
  addReaction,
  getReactions,
  softHaptic,
} from '../utils/torcidaStorage'
import { reactionShareText } from '../utils/share'
import ShareButton from './ShareButton'

/**
 * Barra de reações — contagens só neste aparelho.
 */
export default function CrowdReactions({ matchId, matchLabel, compact = false }) {
  const id = matchId || 'geral'
  const [counts, setCounts] = useState(() => getReactions(id))
  const [flies, setFlies] = useState([])

  const onReact = useCallback(
    (emoji) => {
      softHaptic(14)
      const next = addReaction(id, emoji)
      setCounts({ ...next })
      const flyId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setFlies((prev) => [...prev, { id: flyId, emoji }])
      setTimeout(() => {
        setFlies((prev) => prev.filter((f) => f.id !== flyId))
      }, 900)
    },
    [id]
  )

  const total = REACTION_EMOJIS.reduce((s, e) => s + (counts[e] || 0), 0)
  const shareEmoji =
    REACTION_EMOJIS.slice().sort((a, b) => (counts[b] || 0) - (counts[a] || 0))[0] || '💚'

  return (
    <section className={`crowd-react card${compact ? ' crowd-react--compact' : ''}`}>
      <header className="crowd-react__head">
        <h3 className="crowd-react__title">Reações da torcida</h3>
        <p className="muted tiny">nesta torcida (este aparelho)</p>
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
        <span className="muted tiny">{total} reação{total === 1 ? '' : 'ões'} locais</span>
        <ShareButton
          text={reactionShareText(shareEmoji, matchLabel)}
          label="Mande sua reação"
          className="share-btn--compact"
        />
      </div>
    </section>
  )
}
