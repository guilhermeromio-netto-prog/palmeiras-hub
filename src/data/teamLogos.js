/**
 * Logos de clubes — ESPN CDN (HTTPS, CORS *) quando há id;
 * fallback por nome normalizado; cores para avatar de iniciais.
 */
import { normalizeTeamName, canonicalTeam } from '../utils/opponent.js'

export const ESPN_LOGO = (id) =>
  id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png` : null

/** @type {Record<string, { espnId: string, color?: string, altColor?: string, abbr?: string }>} */
const BY_CANONICAL = {
  palmeiras: { espnId: '2029', color: '417505', altColor: 'fafafc', abbr: 'PAL' },
  flamengo: { espnId: '819', color: 'C60000', altColor: '000000', abbr: 'FLA' },
  fluminense: { espnId: '3445', color: '7E0202', altColor: '417505', abbr: 'FLU' },
  'sao paulo': { espnId: '2026', color: 'C60000', altColor: '000000', abbr: 'SAO' },
  corinthians: { espnId: '874', color: '000000', altColor: 'fafafc', abbr: 'COR' },
  santos: { espnId: '2674', color: '000000', altColor: 'fafafc', abbr: 'SAN' },
  'atletico mg': { espnId: '7632', color: '000000', altColor: 'fafafc', abbr: 'CAM' },
  'atletico pr': { espnId: '3458', color: 'D80518', altColor: 'C60000', abbr: 'CAP' },
  athletico: { espnId: '3458', color: 'D80518', altColor: 'C60000', abbr: 'CAP' },
  botafogo: { espnId: '6086', color: '000000', altColor: 'fafafc', abbr: 'BOT' },
  'botafogo sp': { espnId: '10281', color: '000000', altColor: 'fafafc', abbr: 'BSP' },
  cruzeiro: { espnId: '2022', color: '0093EC', altColor: 'fafafc', abbr: 'CRU' },
  internacional: { espnId: '1936', color: 'C60000', altColor: '000000', abbr: 'INT' },
  gremio: { espnId: '6273', color: '0093EC', altColor: '000000', abbr: 'GRE' },
  vasco: { espnId: '3454', color: '000000', altColor: 'fafafc', abbr: 'VAS' },
  'vasco da gama': { espnId: '3454', color: '000000', altColor: 'fafafc', abbr: 'VAS' },
  bahia: { espnId: '9967', color: 'C60000', altColor: '0093EC', abbr: 'BAH' },
  vitoria: { espnId: '3457', color: 'C6101C', altColor: 'C60000', abbr: 'VIT' },
  bragantino: { espnId: '6079', color: '000000', altColor: 'fafafc', abbr: 'BRA' },
  mirassol: { espnId: '9169', color: 'FEDC00', altColor: '417505', abbr: 'MIR' },
  remo: { espnId: '4936', color: '265891', altColor: 'fafafa', abbr: 'REM' },
  chapecoense: { espnId: '9318', color: '417505', altColor: 'fafafc', abbr: 'CHA' },
  coritiba: { espnId: '3456', color: '417505', altColor: 'fafafc', abbr: 'CFC' },
  'ponte preta': { espnId: '3459', color: '000000', altColor: 'fafafc', abbr: 'PON' },
  guarani: { espnId: '3448', color: '417505', altColor: 'fafafc', abbr: 'GUA' },
  portuguesa: { espnId: '4773', color: '417505', altColor: 'C60000', abbr: 'POR' },
  novorizontino: { espnId: '18127', color: '000000', altColor: 'FEDC00', abbr: 'NOV' },
  'sao bernardo': { espnId: '11268', color: '000000', altColor: 'fafafc', abbr: 'SBE' },
  // Libertadores / CONMEBOL comuns
  'liga quito': { espnId: '4816', color: '1c1d5c', altColor: '000000', abbr: 'LDU' },
  'boca juniors': { espnId: '5', color: 'fcb000', altColor: '0060f0', abbr: 'BOC' },
  'river plate': { espnId: '16', color: 'FFFFFF', altColor: 'C60000', abbr: 'RIV' },
  penarol: { espnId: '2683', color: '000000', altColor: 'FEDC00', abbr: 'PEN' },
  nacional: { espnId: '2684', color: '345BBC', altColor: 'C60000', abbr: 'NAC' },
  'cerro porteno': { espnId: '2671', color: 'EF2D24', altColor: '000000', abbr: 'CCP' },
  libertad: { espnId: '2670', color: '212121', altColor: '000000', abbr: 'LIB' },
  'barcelona sc': { espnId: '2686', color: 'ffff00', altColor: '000000', abbr: 'BSC' },
  bolivar: { espnId: '2681', color: '3c96c4', altColor: '000000', abbr: 'BOL' },
  'independiente del valle': { espnId: '17086', color: '000D5D', altColor: '000000', abbr: 'IDV' },
  'estudiantes de la plata': { espnId: '8', color: 'C60000', altColor: '288A00', abbr: 'EST' },
  'rosario central': { espnId: '17', color: 'ffff00', altColor: '792DCD', abbr: 'ROS' },
  lanus: { espnId: '12', color: '9f0000', altColor: '1a1a1a', abbr: 'LAN' },
  'argentinos juniors': { espnId: '3', color: 'C60000', altColor: '0060f0', abbr: 'ARG' },
  universitario: { espnId: '2685', color: 'ffffbf', altColor: 'C60000', abbr: 'UNI' },
  'sporting cristal': { espnId: '2673', color: '3bb8e2', altColor: '000000', abbr: 'CRI' },
  'atletico junior': { espnId: '4815', color: 'C60000', altColor: '000055', abbr: 'JUN' },
  'independiente medellin': { espnId: '2690', color: 'd70000', altColor: '000000', abbr: 'DIM' },
  'independiente santa fe': { espnId: '5488', color: 'E33439', altColor: 'fafafc', abbr: 'SFE' },
  'deportivo tachira': { espnId: '4818', color: '1a1a1a', altColor: 'F8DD00', abbr: 'TAC' },
  'always ready': { espnId: '19425', color: 'ff0000', altColor: 'fafafc', abbr: 'ALR' },
  '2 de mayo': { espnId: '6097', color: '000000', altColor: 'C60000', abbr: '2DM' },
  'universidad catolica': { espnId: '885', color: '0a4f8d', altColor: '000000', abbr: 'UC' },
}

/** Extra aliases → canonical key in BY_CANONICAL */
const EXTRA_ALIASES = {
  'athletico pr': 'atletico pr',
  'athletico paranaense': 'atletico pr',
  'clube athletico paranaense': 'atletico pr',
  galo: 'atletico mg',
  mengao: 'flamengo',
  fla: 'flamengo',
  flu: 'fluminense',
  tricolor: 'sao paulo',
  peixe: 'santos',
  foga: 'botafogo',
  fogao: 'botafogo',
  ldu: 'liga quito',
  'ldu quito': 'liga quito',
  'liga deportiva universitaria': 'liga quito',
  'rb bragantino': 'bragantino',
  'red bull bragantino': 'bragantino',
  xeneize: 'boca juniors',
  'boca jrs': 'boca juniors',
}

function lookupMeta(name) {
  if (!name) return null
  const canon = canonicalTeam(name)
  const norm = normalizeTeamName(name)
  const key = EXTRA_ALIASES[canon] || EXTRA_ALIASES[norm] || canon || norm
  if (BY_CANONICAL[key]) return BY_CANONICAL[key]
  // fuzzy: try includes against known keys
  for (const [k, meta] of Object.entries(BY_CANONICAL)) {
    if (key && (key.includes(k) || k.includes(key)) && key.length >= 4 && k.length >= 4) {
      return meta
    }
  }
  return null
}

function hexColor(raw, fallback = '#006437') {
  if (!raw) return fallback
  const h = String(raw).replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(h)) return fallback
  return `#${h}`
}

export function teamInitials(name) {
  if (!name) return '?'
  const cleaned = String(name)
    .replace(/\b(FC|CF|SC|AC|EC|CR|SE|SS|AA|RB|CA)\b/gi, ' ')
    .replace(/[-–—]/g, ' ')
    .trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Resolve logo URL + colors for a club.
 * Priority: explicit logoUrl → espnId → name map → none (initials only).
 */
export function resolveTeamLogo({ name, espnId, logoUrl, color, altColor } = {}) {
  const meta = lookupMeta(name)
  const id = espnId != null && espnId !== '' ? String(espnId) : meta?.espnId || null
  const url =
    (logoUrl && String(logoUrl)) ||
    (id ? ESPN_LOGO(id) : null) ||
    (meta?.espnId ? ESPN_LOGO(meta.espnId) : null)

  return {
    url,
    espnId: id || meta?.espnId || null,
    color: hexColor(color || meta?.color, '#006437'),
    altColor: hexColor(altColor || meta?.altColor, '#fafafc'),
    initials: meta?.abbr || teamInitials(name),
    name: name || 'Time',
  }
}
