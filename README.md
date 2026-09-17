# Palmeiras Hub 🌿

App pessoal de torcedor do **Palmeiras**: próximo jogo, **onde assistir**, **ouvir no rádio**, **YouTube**, **placar ao vivo**, countdown, H2H, calendário, elenco, tabelas, notícias, e **torcida sincronizada** entre celulares (sala `VERDAO`).

**Live:** https://guilhermeromio-netto-prog.github.io/palmeiras-hub/

## Novidades v4.0.1

- Removido **Enquanto você saiu** (SinceLastVisit) da Home.
- **Portal de entrada** — splash Verdão 1× por dia (localStorage + data SP); toque ou auto ≤2.5s; respeita reduced-motion.
- **Cartão Stories** — arte 9:16 (PNG) do próximo jogo ou último resultado; Baixar + Compartilhar.
- **Sequência da Torcida** — check-in diário 🔥 N dias; local sempre; InstantDB best-effort.
- **Convite VERDAO** — one-tap com link + código da sala.

## Novidades v3.9

- **Modo estádio** — ambiência rica no dia de jogo (SP). Preferências → Automático / Sempre / Desligado.
- **Seu apelido** — campo destacado na Torcida (localStorage); aparece em mural, palpites e reações.
- **Ações rápidas** no Início: rádio, onde assistir, compartilhar próximo jogo.
- Skeletons verde/branco no carregamento + microinterações leves.


## Como abrir

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run serve
```

`vite.config.js` mantém `base: '/palmeiras-hub/'` para GitHub Pages.

## Torcida sincronizada (sala VERDAO)

Sem login. Backend: **InstantDB** (App ID público no client).

1. Abra o link em qualquer celular (ou instale o PWA).
2. Aba **Torcida** → sala padrão **`VERDAO`** (pode trocar o código se quiser outra sala).
3. O **mesmo código** = os mesmos dados em qualquer aparelho de quem tiver o link (e o app).
4. Status **“Torcida online · sincronizada”** = reações, palpites, mural e ranking do quiz iguais em todos.

O App ID padrão é de um projeto **temporário** (válido até ~**01/10/2026**). Depois disso, crie um app free em [instantdb.com](https://www.instantdb.com) e defina `VITE_INSTANT_APP_ID` no build — ver `scripts/setup-instant.md`. **Não é necessário criar conta Firebase.**

## Onde assistir / Rádio / YouTube

No card do próximo jogo:

- **Onde assistir** — canais de TV/streaming (imprensa + mapa típico).
- **Ouvir no rádio** — player HTML5 com emissoras esportivas (HTTPS). Programação pode variar; não afirmamos direitos do jogo.
- **YouTube** — vídeo oficial recente nos canais (CazéTV, Palmeiras, ge, JP) quando achamos; senão busca “Palmeiras [adversário] ao vivo” + links dos canais. No Brasileirão (Premiere PPV) avisamos que live no YT pode não existir.

- Tenta confirmar canais em manchetes (Google Notícias via rss2json).
- Se não achar: mapa **típico** da competição (ex.: Libertadores → Paramount+; Brasileirão → Premiere / SporTV).
- Se ainda incerto: **a confirmar** + link de busca. **Nunca inventamos** canal da rodada sem evidência.

## Fontes públicas (sem chave de futebol)

| Dado | Fonte |
|------|--------|
| Classificações / jogos / ao vivo | ESPN public API |
| Fallback agenda | TheSportsDB |
| H2H | ESPN + TheSportsDB |
| Artilharia | Wikipedia pt |
| Notícias + ticker | RSS via rss2json |
| Onde assistir | Google News RSS + mapa por competição |
| Rádio | Streams HTTPS públicos (Bandeirantes, CBN, BandNews, Energia 97) |
| YouTube | Feeds RSS de canais + busca |
| Sync torcida | InstantDB (guest, sala VERDAO) |

## PWA

### iPhone / iPad (Safari)
Compartilhar → **Adicionar à Tela de Início**.

### Android (Chrome)
Menu → **Instalar app**.

## Limitações honestas

- Ao vivo depende da ESPN publicar o summary.
- Sync InstantDB padrão **expira ~01/10/2026** (app temporário); troque o App ID para permanente (free).
- Onde assistir pode ficar “a confirmar” se a imprensa ainda não citou o canal.
- Streams de rádio podem cair ou bloquear; há link-out para o site da emissora.
- YouTube live de Brasileirão (Premiere) frequentemente **não** existe — o hub é honesto nisso.
- Projeto **não oficial**.

## Aviso

Feito por torcedor. Brasão estilizado — **não** é o escudo oficial do SEP.
