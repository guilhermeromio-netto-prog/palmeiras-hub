import { useMemo, useState } from 'react'
import { getTip, saveTip, tipResult } from '../utils/torcidaStorage'
import { tipShareText } from '../utils/share'
import ShareButton from './ShareButton'
import { matchTitle } from '../utils/format'
import { matchDedupeKey } from '../utils/matchKey'

/**
 * Palpite de placar antes do apito; após FT mostra acerto/erro.
 * Ordem: time da casa × visitante (igual ao card).
 */
export default function ScoreTip({ match, finalScore = null, finalStatus = null }) {
  const matchId = match ? matchDedupeKey(match) || String(match.id) || 'next' : 'next'
  const label = match ? matchTitle(match) : 'Próximo jogo'
  const homeName = match?.homeTeam || (match?.isHome ? 'Palmeiras' : match?.opponent) || 'Casa'
  const awayName = match?.awayTeam || (match?.isHome ? match?.opponent : 'Palmeiras') || 'Fora'

  const [tip, setTip] = useState(() => getTip(matchId))
  const [home, setHome] = useState(() => tip?.home ?? 1)
  const [away, setAway] = useState(() => tip?.away ?? 0)

  const status = String(finalStatus || match?.status || '').toUpperCase()
  const isFt = status === 'FINISHED' || status === 'FT'
  const isLive = status === 'LIVE' || status === 'IN_PLAY'
  const kickedOff = isFt || isLive

  const score = finalScore || (isFt || isLive ? match?.score : null) || null
  const outcome = useMemo(() => tipResult(tip, score), [tip, score])

  function onSave(e) {
    e.preventDefault()
    if (kickedOff && !tip) return
    const saved = saveTip(matchId, home, away)
    setTip(saved)
  }

  if (!match) return null

  return (
    <section className="score-tip card">
      <header className="score-tip__head">
        <h3 className="score-tip__title">Palpite do placar</h3>
        <p className="muted tiny">salvo neste aparelho</p>
      </header>

      {tip ? (
        <div className="score-tip__saved">
          <p>
            Seu palpite:{' '}
            <strong>
              {homeName} {tip.home} × {tip.away} {awayName}
            </strong>
          </p>
          {isFt && score && outcome === 'hit' && (
            <p className="score-tip__result score-tip__result--hit">🎯 Acertou o placar!</p>
          )}
          {isFt && score && outcome === 'miss' && (
            <p className="score-tip__result score-tip__result--miss">
              Placar final: {score.home} × {score.away} — quase, Avanti!
            </p>
          )}
          {!isFt && kickedOff && (
            <p className="muted tiny">Jogo em andamento — conferimos no FT.</p>
          )}
          <div className="share-row share-row--inline">
            <ShareButton
              text={tipShareText(tip, label)}
              label="WhatsApp · meu palpite"
              className="share-btn--compact"
            />
          </div>
          {!kickedOff && (
            <button
              type="button"
              className="btn ghost touch score-tip__edit"
              onClick={() => setTip(null)}
            >
              Alterar palpite
            </button>
          )}
        </div>
      ) : kickedOff ? (
        <p className="muted">Palpite só antes do apito. Próximo jogo libera de novo.</p>
      ) : (
        <form className="score-tip__form" onSubmit={onSave}>
          <p className="muted tiny score-tip__hint">{label}</p>
          <div className="score-tip__inputs">
            <label>
              <span>{homeName}</span>
              <input
                type="number"
                min={0}
                max={15}
                value={home}
                onChange={(e) => setHome(e.target.value)}
                inputMode="numeric"
                aria-label={`Gols ${homeName}`}
              />
            </label>
            <span className="score-tip__x" aria-hidden="true">
              ×
            </span>
            <label>
              <span>{awayName}</span>
              <input
                type="number"
                min={0}
                max={15}
                value={away}
                onChange={(e) => setAway(e.target.value)}
                inputMode="numeric"
                aria-label={`Gols ${awayName}`}
              />
            </label>
          </div>
          <button type="submit" className="btn primary touch">
            Salvar palpite
          </button>
        </form>
      )}
    </section>
  )
}
