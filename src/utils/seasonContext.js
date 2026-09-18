/**
 * Contexto da temporada (Brasileirão) — só com dados reais da tabela.
 * Nunca inventa pontos / posições / zona.
 */

/**
 * @param {{ table?: object[], competition?: string, season?: string }|null} standings
 * @param {object|null} stats — stats do Palmeiras (BSA)
 * @returns {object|null}
 */
export function buildSeasonContext(standings, stats) {
  const table = standings?.table || []
  if (!stats || !table.length) return null

  const our =
    table.find((r) => r.highlight || /palmeiras/i.test(r.team || '')) || null
  const position = our?.position ?? stats.position
  const points = our?.points ?? stats.points
  if (position == null || points == null) return null

  const leader = table.find((r) => r.position === 1) || [...table].sort((a, b) => a.position - b.position)[0]
  const firstRelegation = table.find((r) => r.position === 17) || null
  const lastSafe = table.find((r) => r.position === 16) || null

  let gapToFirst = null
  if (leader && position > 1) {
    gapToFirst = Math.max(0, (leader.points ?? 0) - points)
  } else if (leader && position === 1) {
    gapToFirst = 0
  }

  let gapToRelegation = null
  if (firstRelegation && position < 17) {
    // Folga para a zona: nossos pts − pts do 17º (pode ser 0 se empatados)
    gapToRelegation = points - (firstRelegation.points ?? 0)
  } else if (position >= 17 && lastSafe) {
    // Pontos necessários para sair (diferença até o 16º); null se não dá para calcular
    gapToRelegation = (lastSafe.points ?? 0) - points
  }

  return {
    competition: standings?.competition || 'Brasileirão Série A',
    season: standings?.season || null,
    position,
    points,
    played: our?.played ?? stats.played,
    won: our?.won ?? stats.won,
    draw: our?.draw ?? stats.draw,
    lost: our?.lost ?? stats.lost,
    goalsFor: our?.gf ?? stats.goalsFor,
    goalsAgainst: our?.ga ?? stats.goalsAgainst,
    leaderName: leader?.team || null,
    leaderPoints: leader?.points ?? null,
    gapToFirst,
    gapToRelegation,
    inRelegationZone: position >= 17,
    firstRelegationPoints: firstRelegation?.points ?? null,
    lastSafePoints: lastSafe?.points ?? null,
  }
}

/** One-liner honesto para o dossiê (só BSA). */
export function tableSituationLine(ctx, match) {
  if (!ctx) return null
  // Só no contexto Brasileirão (próximo jogo BSA ou sempre com dados BSA disponíveis)
  const isBsa =
    !match ||
    match.competitionCode === 'BSA' ||
    /brasileir/i.test(match.competition || '')
  if (match && !isBsa) {
    // Ainda mostramos a situação do Brasileirão como contexto de temporada
  }

  const pos = `${ctx.position}º · ${ctx.points} pts`
  if (ctx.position === 1) {
    return `${pos} — lidera o ${shortComp(ctx.competition)}`
  }
  if (ctx.gapToFirst != null && ctx.gapToFirst > 0) {
    const gap =
      ctx.gapToFirst === 1
        ? '1 pt atrás do líder'
        : `${ctx.gapToFirst} pts atrás do líder`
    return `${pos} — ${gap}${ctx.leaderName ? ` (${ctx.leaderName})` : ''}`
  }
  if (ctx.gapToFirst === 0 && ctx.position > 1) {
    return `${pos} — empatado em pontos com o líder`
  }
  return pos
}

function shortComp(name) {
  if (/brasileir/i.test(name || '')) return 'Brasileirão'
  return name || 'campeonato'
}

/** Linha de folga / zona (opcional, só se calculável). */
export function relegationLine(ctx) {
  if (!ctx || ctx.gapToRelegation == null) return null
  if (ctx.inRelegationZone) {
    if (ctx.gapToRelegation <= 0) {
      return 'Na zona de rebaixamento (17º–20º)'
    }
    return `${ctx.gapToRelegation} pt${ctx.gapToRelegation === 1 ? '' : 's'} para sair da zona (16º)`
  }
  if (ctx.gapToRelegation <= 0) {
    return 'Na fronteira da zona de rebaixamento'
  }
  return `Folga de ${ctx.gapToRelegation} pt${ctx.gapToRelegation === 1 ? '' : 's'} para a zona (17º)`
}
