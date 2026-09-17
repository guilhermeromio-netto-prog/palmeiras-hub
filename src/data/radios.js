/**
 * Rádios esportivas / noticiosas com stream HTTPS público verificado.
 * Nunca afirmar direitos de um jogo específico — programação varia.
 *
 * Preferir mounts StreamTheWorld MP3 (*_SC) — audio/mpeg, melhor no iOS.
 * AAC fica como fallback em streamUrls[]. Nunca hardcodar live.streamtheworld.com:443.
 * Streams checados em 2026-09. Se todos falharem, o player mostra link-out.
 */
const STW = 'https://playerservices.streamtheworld.com/api/livestream-redirect'

export const SPORTS_RADIOS = [
  {
    id: 'bandeirantes',
    name: 'Rádio Bandeirantes',
    short: 'Bandeirantes',
    city: 'SP',
    streamUrls: [
      `${STW}/RADIOBANDEIRANTES_SC`,
      `${STW}/RADIOBANDEIRANTESAAC.aac`,
    ],
    siteUrl: 'https://www.band.uol.com.br/radio',
    kind: 'stream',
  },
  {
    id: 'cbn-sp',
    name: 'CBN São Paulo',
    short: 'CBN',
    city: 'SP',
    streamUrls: [
      `${STW}/CBN_SP_SC`,
      `${STW}/CBN_SPAAC.aac`,
    ],
    siteUrl: 'https://cbn.globoradio.globo.com/',
    kind: 'stream',
  },
  {
    id: 'bandnews-sp',
    name: 'BandNews FM',
    short: 'BandNews',
    city: 'SP',
    streamUrls: [
      `${STW}/BANDNEWSFM_SP_SC`,
      `${STW}/BANDNEWSFM_SPAAC.aac`,
    ],
    siteUrl: 'https://www.band.uol.com.br/bandnews-fm',
    kind: 'stream',
  },
  {
    id: 'web-stream',
    name: 'Stream web (HTTPS)',
    short: 'Web HTTPS',
    city: 'web',
    streamUrls: ['https://stm01.virtualcast.com.br:8190/live'],
    siteUrl: 'https://stm01.virtualcast.com.br:8190/live',
    kind: 'stream',
    note: 'Mount genérico HTTPS verificado — marca desconhecida',
  },
  {
    id: 'jovem-pan',
    name: 'Jovem Pan',
    short: 'Jovem Pan',
    city: 'web',
    streamUrls: [],
    siteUrl: 'https://jovempan.com.br/ao-vivo/',
    kind: 'link',
    note: 'Stream direto indisponível — abra o player oficial',
  },
]

/** Compat: primeiro URL da lista (ou null). */
export function primaryStreamUrl(radio) {
  if (!radio) return null
  if (Array.isArray(radio.streamUrls) && radio.streamUrls.length) {
    return radio.streamUrls[0]
  }
  return radio.streamUrl || null
}

export const RADIO_DISCLAIMER =
  'Rádios esportivas (programação pode variar). Não garantimos narração deste jogo.'
