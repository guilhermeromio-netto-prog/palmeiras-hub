import { useMemo, useState } from 'react'
import { tipResult } from '../utils/torcidaStorage'
import { tipShareText } from '../utils/share'
import ShareButton from './ShareButton'
import { matchTitle } from '../utils/format'
import { matchDedupeKey } from '../utils/matchKey'
import { db, id } from '../sync/instant'
import { getClientId, getDisplayName } from '../sync/identity'
import { useRoomCodeState } from '../hooks/useRoomCode'

/**
 * Palpites sincronizados na sala — cada aparelho/pessoa tem o seu.
 */
export default function ScoreTip({ match, finalScore = null, finalStatus = null }) {
  const room = useRoomCodeState()
  const matchId = match ? matchDedupeKey(match) || String(match.id) || 'next' : 'next'
  const label = match ? matchTitle(match) : 'Próximo jogo'
  const homeName = match?.homeTeam || (match?.isHome ? 'Palmeiras' : match?.opponent) || 'Casa'
  const awayName = match?.awayTeam || (match?.isHome ? match?.opponent : 'Palmeiras') || 'Fora'
  const clientId = getClientId()

  const { data } = db.useQuery({
    tips: {
      $: { where: { roomCode: room, matchId: String(matchId) } },
    },
  })

  const tips = data?.tips || []
  const myTip = tips.find((t) => t.clientId === clientId) || null

  const [editing, setEditing] = useState(false)
  const [home, setHome] = useState(1)
  const [away, setAway] = useState(0)
  const [name, setName] = useState(() => getDisplayName() || 'Torcedor')

  const status = String(finalStatus || match?.status || '').toUpperCase()
  const isFt = status === 'FINISHED' || status === 'FT'
  const isLive = status === 'LIVE' || status === 'IN_PLAY'
  const kickedOff = isFt || isLive

  const score = finalScore || (isFt || isLive ? match?.score : null) || null
  const tipForResult = myTip
    ? { home: myTip.home, away: myTip.away }
    : null
  const outcome = useMemo(() => tipResult(tipForResult, score), [tipForResult, score])

  const others = tips
    .filter((t) => t.clientId !== clientId)
    .slice()
    .sort((a, b) => (b.at || 0) - (a.at || 0))

  function onSave(e) {
    e.preventDefault()
    if (kickedOff && !myTip) return
    const h = Math.max(0, Math.min(15, Math.floor(Number(home))))
    const a = Math.max(0, Math.min(15, Math.floor(Number(away))))
    if (Number.isNaN(h) || Number.isNaN(a)) return
    const display = String(name || getDisplayName() || 'Torcedor').trim().slice(0, 20) || 'Torcedor'
    const payload = {
      roomCode: room,
      matchId: String(matchId),
      name: display,
      home: h,
      away: a,
      clientId,
      at: Date.now(),
    }
    if (myTip?.id) {
      db.transact(db.tx.tips[myTip.id].update(payload))
    } else {
      db.transact(db.tx.tips[id()].update(payload))
    }
    setEditing(false)
  }

  if (!match) return null

  const showForm = (!myTip || editing) && !kickedOff

  return (
    <section className="score-tip card">
      <header className="score-tip__head">
        <h3 className="score-tip__title">Palpite do placar</h3>
        <p className="muted tiny">sala {room} · família sincronizada</p>
      </header>

      {myTip && !editing ? (
        <div className="score-tip__saved">
          <p>
            Seu palpite ({myTip.name || 'você'}):{' '}
            <strong>
              {homeName} {myTip.home} × {myTip.away} {awayName}
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
              text={tipShareText({ home: myTip.home, away: myTip.away }, label)}
              label="WhatsApp · meu palpite"
              className="share-btn--compact"
            />
          </div>
          {!kickedOff && (
            <button
              type="button"
              className="btn ghost touch score-tip__edit"
              onClick={() => {
                setHome(myTip.home)
                setAway(myTip.away)
                setName(myTip.name || getDisplayName() || 'Torcedor')
                setEditing(true)
              }}
            >
              Alterar palpite
            </button>
          )}
        </div>
      ) : kickedOff && !myTip ? (
        <p className="muted">Palpite só antes do apito. Próximo jogo libera de novo.</p>
      ) : showForm ? (
        <form className="score-tip__form" onSubmit={onSave}>
          <p className="muted tiny score-tip__hint">{label}</p>
          <label className="score-tip__name">
            <span>Nome</span>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Torcedor"
            />
          </label>
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
            Salvar palpite na sala
          </button>
        </form>
      ) : null}

      {others.length > 0 && (
        <ul className="score-tip__family">
          <li className="muted tiny">Palpites da sala</li>
          {others.map((t) => (
            <li key={t.id}>
              <strong>{t.name || 'Torcedor'}</strong>:{' '}
              {t.home} × {t.away}
              {isFt && score && tipResult(t, score) === 'hit' ? ' 🎯' : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
