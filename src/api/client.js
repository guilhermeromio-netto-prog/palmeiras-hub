/**
 * Cada abertura do app (e o botão Atualizar) busca dados frescos
 * em fontes públicas — sem API keys.
 */
import { buildHubFromPublicSources } from './sources/hub.js'

export async function fetchHub({ signal } = {}) {
  return buildHubFromPublicSources({ signal })
}
