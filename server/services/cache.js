const store = new Map()

export function getCache(key) {
  const hit = store.get(key)
  if (!hit) return null
  if (Date.now() > hit.expires) {
    store.delete(key)
    return null
  }
  return hit.value
}

export function setCache(key, value, ttlSeconds) {
  store.set(key, {
    value,
    expires: Date.now() + ttlSeconds * 1000,
  })
}

export function clearCache() {
  store.clear()
}
