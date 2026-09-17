/**
 * Portal de entrada — uma vez por dia (fuso SP), via localStorage.
 */
import { dateKeySP } from './datetime.js'

const GATE_KEY = 'palmeiras-hub-entry-gate-day-v1'

export function shouldShowEntryGate() {
  try {
    const today = dateKeySP(new Date())
    if (!today) return false
    const seen = localStorage.getItem(GATE_KEY)
    return seen !== today
  } catch {
    return false
  }
}

export function markEntryGateSeen() {
  try {
    const today = dateKeySP(new Date())
    if (today) localStorage.setItem(GATE_KEY, today)
  } catch {
    /* private / quota */
  }
}

export function prefersReducedMotion() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  } catch {
    return false
  }
}
