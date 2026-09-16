/** Normaliza nomes de times para cruzar H2H entre fontes. */
export function normalizeTeamName(name) {
  if (!name) return ''
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\b(fc|cf|sc|ac|ec|cr|se|ss|aa|rcd|ud|cd|club|clube|futebol|sport|sports|de|da|do|dos|das|the)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const ALIASES = {
  'ldu quito': 'liga quito',
  'liga quito': 'liga quito',
  'liga deportiva universitaria': 'liga quito',
  'sao paulo': 'sao paulo',
  'sao paulo fc': 'sao paulo',
  'atletico mineiro': 'atletico mg',
  'atletico mg': 'atletico mg',
  'galo': 'atletico mg',
  'red bull bragantino': 'bragantino',
  'rb bragantino': 'bragantino',
  'bragantino': 'bragantino',
}

export function canonicalTeam(name) {
  const n = normalizeTeamName(name)
  if (!n) return ''
  if (ALIASES[n]) return ALIASES[n]
  // prefix match aliases
  for (const [k, v] of Object.entries(ALIASES)) {
    if (n.includes(k) || k.includes(n)) return v
  }
  return n
}

export function sameOpponent(a, b) {
  const ca = canonicalTeam(a)
  const cb = canonicalTeam(b)
  if (!ca || !cb) return false
  if (ca === cb) return true
  if (ca.length >= 4 && cb.length >= 4 && (ca.includes(cb) || cb.includes(ca))) return true
  return false
}
