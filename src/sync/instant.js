/**
 * InstantDB — sync da torcida entre aparelhos (sem login).
 * App ID é público (como Firebase config). Admin token NÃO vai no client.
 *
 * App temporário criado em 2026-09-16; expira ~2026-10-01.
 * Para permanente: crie conta free em https://instantdb.com e defina
 * VITE_INSTANT_APP_ID no build (ver README / scripts/setup-instant.md).
 */
import { init, i, id, tx, lookup } from '@instantdb/react'

/** Default Instant app for family room VERDAO (temporary until ~2026-10-01). */
export const DEFAULT_INSTANT_APP_ID = '5b938cde-137c-4fbf-9866-982c2071d4aa'
export const INSTANT_EXPIRES_ISO = '2026-10-01T00:12:37.343Z'
export const DEFAULT_ROOM = 'VERDAO'

export const APP_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_INSTANT_APP_ID) ||
  DEFAULT_INSTANT_APP_ID

export const schema = i.schema({
  entities: {
    rooms: i.entity({
      code: i.string().indexed().unique(),
      updatedAt: i.number().optional(),
    }),
    reactionEvents: i.entity({
      roomCode: i.string().indexed(),
      matchId: i.string().indexed(),
      emoji: i.string(),
      at: i.number().optional(),
      clientId: i.string().optional(),
    }),
    tips: i.entity({
      roomCode: i.string().indexed(),
      matchId: i.string().indexed(),
      name: i.string(),
      home: i.number(),
      away: i.number(),
      clientId: i.string().indexed().optional(),
      at: i.number().optional(),
    }),
    mural: i.entity({
      roomCode: i.string().indexed(),
      name: i.string(),
      message: i.string(),
      at: i.number().optional(),
    }),
    quizScores: i.entity({
      roomCode: i.string().indexed(),
      name: i.string(),
      score: i.number(),
      at: i.number().optional(),
    }),
  },
})

export const db = init({ appId: APP_ID, schema })

export { id, tx, lookup }

export function isInstantExpiringSoon(withinDays = 5) {
  try {
    const exp = new Date(INSTANT_EXPIRES_ISO).getTime()
    const left = exp - Date.now()
    return left > 0 && left < withinDays * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function isInstantExpired() {
  try {
    return Date.now() > new Date(INSTANT_EXPIRES_ISO).getTime()
  } catch {
    return false
  }
}
