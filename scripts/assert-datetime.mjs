/**
 * Tiny assert: ESPN Z + SportsDB naive BRT both format to Oct 8 21:30 SP.
 * Run: node scripts/assert-datetime.mjs
 */
import { normalizeToIsoInstant } from '../src/utils/datetime.js'
import { formatDateTime } from '../src/utils/format.js'

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg)
    process.exitCode = 1
  } else {
    console.log('OK:', msg)
  }
}

const espn = normalizeToIsoInstant('2026-10-09T00:30Z', { assume: 'utc' })
const sportsdb = normalizeToIsoInstant('2026-10-08T21:30:00', {
  assume: 'america-sao-paulo',
})

assert(espn === '2026-10-09T00:30Z' || espn === '2026-10-09T00:30:00Z' || espn?.endsWith('Z'), `espn normalize → ${espn}`)
assert(sportsdb === '2026-10-08T21:30:00-03:00', `sportsdb normalize → ${sportsdb}`)

const labelEspn = formatDateTime(espn)
const labelSdb = formatDateTime(sportsdb)

// pt-BR short weekday: "qui." / "qui" ; day 08; month out; year 2026; 21:30
function looksLikeOct8_2130(label) {
  const s = String(label).toLowerCase()
  return (
    /qui/.test(s) &&
    /08|8/.test(s) &&
    /out/.test(s) &&
    /2026/.test(s) &&
    /21:30/.test(s)
  )
}

assert(looksLikeOct8_2130(labelEspn), `ESPN formatDateTime → ${labelEspn}`)
assert(looksLikeOct8_2130(labelSdb), `SportsDB formatDateTime → ${labelSdb}`)

// Naive WITHOUT normalize (the bug): should NOT match correct SP label when parsed as local...
// We only check that normalize path is correct above.

// Reject invalid
assert(normalizeToIsoInstant('not-a-date', { assume: 'utc' }) == null, 'reject invalid')
assert(normalizeToIsoInstant('2026-10-08T21:30:00') == null, 'reject naive without assume')

if (process.exitCode) {
  console.error('\nassert-datetime FAILED')
  process.exit(1)
}
console.log('\nassert-datetime PASSED')
