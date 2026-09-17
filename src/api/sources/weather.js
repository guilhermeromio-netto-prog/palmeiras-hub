/**
 * Clima previsto no horário do jogo — Open-Meteo (sem API key).
 * Nunca inventa dados: falha → null / erro explícito.
 */
import { fetchJson } from './fetchJson.js'
import { STADIUMS, CITIES, HOME_DEFAULT } from '../../data/venues.js'

const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'

/** WMO weather_code → { label, icon } em pt-BR */
export function wmoLabel(code) {
  const c = Number(code)
  if (c === 0) return { label: 'Céu limpo', icon: '☀️' }
  if (c === 1) return { label: 'Predominantemente limpo', icon: '🌤️' }
  if (c === 2) return { label: 'Parcialmente nublado', icon: '⛅' }
  if (c === 3) return { label: 'Nublado', icon: '☁️' }
  if (c === 45 || c === 48) return { label: 'Neblina', icon: '🌫️' }
  if (c === 51 || c === 53 || c === 55) return { label: 'Garoa', icon: '🌦️' }
  if (c === 56 || c === 57) return { label: 'Garoa congelante', icon: '🌧️' }
  if (c === 61) return { label: 'Chuva fraca', icon: '🌧️' }
  if (c === 63) return { label: 'Chuva', icon: '🌧️' }
  if (c === 65) return { label: 'Chuva forte', icon: '🌧️' }
  if (c === 66 || c === 67) return { label: 'Chuva congelante', icon: '🌧️' }
  if (c === 71 || c === 73 || c === 75 || c === 77) return { label: 'Neve', icon: '🌨️' }
  if (c === 80) return { label: 'Pancadas fracas', icon: '🌦️' }
  if (c === 81) return { label: 'Pancadas de chuva', icon: '🌧️' }
  if (c === 82) return { label: 'Pancadas fortes', icon: '⛈️' }
  if (c === 85 || c === 86) return { label: 'Pancadas de neve', icon: '🌨️' }
  if (c === 95) return { label: 'Tempestade', icon: '⛈️' }
  if (c === 96 || c === 99) return { label: 'Tempestade com granizo', icon: '⛈️' }
  return { label: 'Condição indefinida', icon: '🌡️' }
}

function normalizeCityKey(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Extrai possível cidade de strings tipo "Arena do Grêmio, Porto Alegre". */
export function cityFromVenue(venue) {
  if (!venue || /a\s*definir|tbd|a\s*confirmar/i.test(venue)) return null
  const parts = String(venue)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length >= 2) return parts[parts.length - 1]
  return null
}

export function resolveKnownLocation(venue, isHome) {
  const v = String(venue || '').trim()
  if (v && !/a\s*definir|tbd|a\s*confirmar/i.test(v)) {
    for (const s of STADIUMS) {
      if (s.match.test(v)) {
        return { city: s.city, lat: s.lat, lon: s.lon, source: 'stadium' }
      }
    }
    const cityHint = cityFromVenue(v)
    if (cityHint) {
      const key = normalizeCityKey(cityHint)
      const hit = CITIES[key] || CITIES[cityHint.toLowerCase()]
      if (hit) return { ...hit, source: 'city' }
    }
    // venue pode ser só o nome da cidade
    const asCity = CITIES[normalizeCityKey(v)] || CITIES[v.toLowerCase()]
    if (asCity) return { ...asCity, source: 'city' }
  }
  if (isHome) {
    return {
      city: HOME_DEFAULT.city,
      lat: HOME_DEFAULT.lat,
      lon: HOME_DEFAULT.lon,
      source: 'home-default',
    }
  }
  return null
}

async function geocodeCity(name, signal) {
  const q = String(name || '').trim()
  if (!q) return null
  const url = `${GEOCODE}?name=${encodeURIComponent(q)}&count=5&language=pt&format=json`
  const json = await fetchJson(url, { signal, timeoutMs: 10000 })
  const results = json?.results
  if (!Array.isArray(results) || !results.length) return null
  // Prefer BR / countries common in CONMEBOL when ambiguous
  const prefer = results.find((r) =>
    ['BR', 'AR', 'UY', 'PY', 'CL', 'EC', 'CO', 'PE', 'BO', 'VE'].includes(r.country_code)
  )
  const r = prefer || results[0]
  if (r.latitude == null || r.longitude == null) return null
  return {
    city: r.name || q,
    lat: r.latitude,
    lon: r.longitude,
    source: 'geocode',
  }
}

export async function resolveVenueLocation(venue, isHome, signal) {
  const known = resolveKnownLocation(venue, isHome)
  if (known) return known
  const hint = cityFromVenue(venue) || (venue && !/a\s*definir/i.test(venue) ? venue : null)
  if (!hint) return null
  try {
    return await geocodeCity(hint, signal)
  } catch {
    return null
  }
}

/** Instantâneo local America/Sao_Paulo → ms UTC (BR sem DST = UTC−3). */
function spLocalHourToUtcMs(localHour /* YYYY-MM-DDTHH:00 */) {
  return new Date(`${localHour}:00-03:00`).getTime()
}

function pickClosestHour(hourly, kickoffIso) {
  const times = hourly?.time
  if (!Array.isArray(times) || !times.length || !kickoffIso) return null
  const target = new Date(kickoffIso).getTime()
  if (Number.isNaN(target)) return null

  let bestIdx = -1
  let bestDiff = Infinity
  for (let i = 0; i < times.length; i++) {
    const ms = spLocalHourToUtcMs(times[i])
    if (Number.isNaN(ms)) continue
    const diff = Math.abs(ms - target)
    if (diff < bestDiff) {
      bestDiff = diff
      bestIdx = i
    }
  }
  // Só aceita se estiver a até ~90 min do horário (ou o slot horário mais próximo)
  if (bestIdx < 0 || bestDiff > 3 * 60 * 60 * 1000) return null

  const code = hourly.weather_code?.[bestIdx]
  const { label, icon } = wmoLabel(code)
  const temp = hourly.temperature_2m?.[bestIdx]
  const precip = hourly.precipitation_probability?.[bestIdx]
  const wind = hourly.wind_speed_10m?.[bestIdx]
  if (temp == null && code == null) return null

  return {
    atLocal: times[bestIdx],
    temperatureC: temp != null ? Math.round(temp) : null,
    precipProbability: precip != null ? Math.round(precip) : null,
    windKmh: wind != null ? Math.round(wind) : null,
    weatherCode: code,
    label,
    icon,
  }
}

/**
 * @returns {{
 *   ok: boolean,
 *   city: string,
 *   weather?: object,
 *   error?: string,
 *   locationSource?: string
 * }}
 */
export async function fetchMatchWeather({ venue, date, isHome = false, signal } = {}) {
  const cityFallback = cityFromVenue(venue)
  if (!date) {
    return {
      ok: false,
      city: cityFallback || (isHome ? HOME_DEFAULT.city : 'a confirmar'),
      error: 'Horário do jogo a confirmar',
    }
  }

  let location
  try {
    location = await resolveVenueLocation(venue, isHome, signal)
  } catch (err) {
    return {
      ok: false,
      city: cityFallback || 'a confirmar',
      error: err.message || 'Falha ao localizar o estádio',
    }
  }

  if (!location) {
    return {
      ok: false,
      city: cityFallback || 'a confirmar',
      error: 'Cidade do estádio a confirmar',
    }
  }

  try {
    const params = new URLSearchParams({
      latitude: String(location.lat),
      longitude: String(location.lon),
      hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
      timezone: 'America/Sao_Paulo',
      forecast_days: '16',
      wind_speed_unit: 'kmh',
    })
    const json = await fetchJson(`${FORECAST}?${params}`, { signal, timeoutMs: 12000 })
    if (json?.error) {
      return {
        ok: false,
        city: location.city,
        locationSource: location.source,
        error: json.reason || 'Open-Meteo retornou erro',
      }
    }
    const weather = pickClosestHour(json.hourly, date)
    if (!weather) {
      return {
        ok: false,
        city: location.city,
        locationSource: location.source,
        error: 'Sem previsão para o horário do jogo',
      }
    }
    return {
      ok: true,
      city: location.city,
      locationSource: location.source,
      weather,
      source: 'Open-Meteo',
    }
  } catch (err) {
    return {
      ok: false,
      city: location.city,
      locationSource: location.source,
      error: err.message || 'Falha ao buscar clima',
    }
  }
}
