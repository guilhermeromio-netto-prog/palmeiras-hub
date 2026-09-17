import CrowdReactions from './CrowdReactions'
import ScoreTip from './ScoreTip'
import CrowdWall from './CrowdWall'
import QuizVerdao from './QuizVerdao'
import SyncStatus from './SyncStatus'
import RoomInvite from './RoomInvite'
import StreakBadge from './StreakBadge'
import StoriesCard from './StoriesCard'
import { matchTitle } from '../utils/format'
import { matchDedupeKey } from '../utils/matchKey'
import { msUntil } from '../utils/datetime'

/**
 * Aba Torcida — reações, palpite, mural e quiz sincronizados na sala.
 */
export default function Torcida({ data, liveMatch }) {
  let displayMatch = data?.nextMatch
  const upcoming = data?.upcoming || []
  if (displayMatch?.date) {
    const ms = msUntil(displayMatch.date)
    if (ms != null && ms < -3 * 60 * 60 * 1000 && upcoming.length > 1) {
      displayMatch = upcoming[1]
    }
  }

  const live = liveMatch?.live
  const candidate = liveMatch?.candidate
  const reactionMatch = candidate || displayMatch
  const matchId =
    (reactionMatch && (matchDedupeKey(reactionMatch) || reactionMatch.id)) || 'geral'
  const matchLabel = reactionMatch ? matchTitle(reactionMatch) : 'Palmeiras'

  const finalScore = live?.score || (candidate?.status === 'FINISHED' ? candidate?.score : null)
  const finalStatus = live?.status || candidate?.status || displayMatch?.status

  return (
    <section className="page torcida-page">
      <header className="torcida-page__hero card">
        <p className="eyebrow">Torcida</p>
        <h2>Avanti, família!</h2>
        <p className="lede">
          Sala <strong>VERDAO</strong> — o mesmo código = os mesmos dados em qualquer
          celular de quem tiver o link (e o app). Reações, palpite, mural e quiz juntos.
        </p>
      </header>

      <SyncStatus />

      <StreakBadge />

      <RoomInvite />

      <StoriesCard
        nextMatch={displayMatch}
        lastResult={(data?.recentResults || [])[0]}
      />

      <CrowdReactions matchId={matchId} matchLabel={matchLabel} />

      {displayMatch && (
        <ScoreTip
          match={displayMatch}
          finalScore={finalScore}
          finalStatus={finalStatus}
        />
      )}

      <CrowdWall />
      <QuizVerdao />
    </section>
  )
}
