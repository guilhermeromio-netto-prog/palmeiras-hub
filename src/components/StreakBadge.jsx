import { useEffect, useState } from 'react'
import { getClientId, getDisplayName } from '../sync/identity'
import { db, id } from '../sync/instant'
import { useRoomCodeState } from '../hooks/useRoomCode'
import {
  readStreak,
  registerDailyCheckIn,
  streakLabel,
} from '../utils/streak'
import { dateKeySP } from '../utils/datetime'

/**
 * Sequência diária — registra check-in no open; mostra badge.
 * Sync InstantDB best-effort; local sempre funciona.
 */
export default function StreakBadge({ compact = false }) {
  const room = useRoomCodeState()
  const [streak, setStreak] = useState(() => readStreak())
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    const name = getDisplayName()
    const result = registerDailyCheckIn(name)
    setStreak(result)

    // Best-effort InstantDB — never invent multi-device if this fails
    let cancelled = false
    ;(async () => {
      try {
        const today = dateKeySP(new Date())
        if (!today || !result.isNewDay) {
          if (!cancelled) setSynced(false)
          return
        }
        await db.transact(
          db.tx.checkins[id()].update({
            roomCode: room,
            name: result.name || name || 'Torcedor',
            dateKey: today,
            streak: result.count,
            at: Date.now(),
            clientId: getClientId(),
          })
        )
        if (!cancelled) setSynced(true)
      } catch {
        if (!cancelled) setSynced(false)
      }
    })()

    const onName = () => {
      const n = getDisplayName()
      const r = registerDailyCheckIn(n)
      setStreak(r)
    }
    window.addEventListener('palmeiras-hub-display-name', onName)
    return () => {
      cancelled = true
      window.removeEventListener('palmeiras-hub-display-name', onName)
    }
  }, [room])

  const label = streakLabel(streak.count)
  if (!label) {
    return (
      <div className={`streak-badge streak-badge--empty${compact ? ' streak-badge--compact' : ''} card`}>
        <p className="streak-badge__text">
          🔥 Abra o hub amanhã pra começar a sequência
        </p>
      </div>
    )
  }

  return (
    <div
      className={`streak-badge${compact ? ' streak-badge--compact' : ''} card`}
      aria-label={label}
    >
      <span className="streak-badge__fire" aria-hidden="true">
        🔥
      </span>
      <div className="streak-badge__body">
        <strong className="streak-badge__count">{label}</strong>
        <p className="muted tiny">
          {streak.name ? `${streak.name} · ` : ''}
          sala {room}
          {synced ? ' · sync' : ' · neste aparelho'}
        </p>
      </div>
    </div>
  )
}
