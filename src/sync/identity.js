/** Identidade local do aparelho + sala da família (sem login). */

const CLIENT_KEY = 'palmeiras-hub-client-id-v1'
const ROOM_KEY = 'palmeiras-hub-room-v1'
const DISPLAY_NAME_KEY = 'palmeiras-hub-display-name-v1'
const DEFAULT_ROOM = 'VERDAO'

function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* */
  }
}

export function getClientId() {
  let id = safeGet(CLIENT_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    safeSet(CLIENT_KEY, id)
  }
  return id
}

export function normalizeRoomCode(raw) {
  const code = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 16)
  return code || DEFAULT_ROOM
}

export function getRoomCode() {
  return normalizeRoomCode(safeGet(ROOM_KEY) || DEFAULT_ROOM)
}

export function setRoomCode(code) {
  const next = normalizeRoomCode(code)
  safeSet(ROOM_KEY, next)
  return next
}

export function getDisplayName() {
  return String(safeGet(DISPLAY_NAME_KEY) || '').trim().slice(0, 20)
}

export function setDisplayName(name) {
  const n = String(name || '').trim().slice(0, 20)
  safeSet(DISPLAY_NAME_KEY, n)
  return n
}

export { DEFAULT_ROOM }
