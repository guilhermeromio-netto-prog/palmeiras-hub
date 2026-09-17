/**
 * Rádios esportivas / noticiosas com stream HTTPS público verificado.
 * Nunca afirmar direitos de um jogo específico — programação varia.
 *
 * Streams checados em 2026-09 (StreamTheWorld / hosts HTTPS).
 * Se um stream cair, o player mostra link-out para o site oficial.
 */
export const SPORTS_RADIOS = [
  {
    id: 'bandeirantes',
    name: 'Rádio Bandeirantes',
    short: 'Bandeirantes',
    city: 'SP',
    streamUrl:
      'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOBANDEIRANTESAAC.aac',
    siteUrl: 'https://www.band.uol.com.br/radio',
    kind: 'stream',
  },
  {
    id: 'cbn-sp',
    name: 'CBN São Paulo',
    short: 'CBN',
    city: 'SP',
    streamUrl:
      'https://playerservices.streamtheworld.com/api/livestream-redirect/CBN_SPAAC.aac',
    siteUrl: 'https://cbn.globoradio.globo.com/',
    kind: 'stream',
  },
  {
    id: 'bandnews-sp',
    name: 'BandNews FM',
    short: 'BandNews',
    city: 'SP',
    streamUrl:
      'https://playerservices.streamtheworld.com/api/livestream-redirect/BANDNEWSFM_SPAAC.aac',
    siteUrl: 'https://www.band.uol.com.br/bandnews-fm',
    kind: 'stream',
  },
  {
    id: 'energia97',
    name: 'Energia 97',
    short: 'Energia 97',
    city: 'SP',
    streamUrl: 'https://streaming.inweb.com.br/energia',
    siteUrl: 'https://www.energia97fm.com.br/',
    kind: 'stream',
  },
  {
    id: 'jovem-pan',
    name: 'Jovem Pan',
    short: 'Jovem Pan',
    city: 'web',
    streamUrl: null,
    siteUrl: 'https://jovempan.com.br/ao-vivo/',
    kind: 'link',
    note: 'Stream direto indisponível — abra o player oficial',
  },
]

export const RADIO_DISCLAIMER =
  'Rádios esportivas (programação pode variar). Não garantimos narração deste jogo.'
