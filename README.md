# Palmeiras Hub 🌿

App pessoal de torcedor do **Palmeiras**: próximo jogo, **onde assistir**, **ouvir no rádio**, **YouTube**, **placar ao vivo**, countdown, H2H, calendário, elenco, tabelas, notícias, e **torcida sincronizada** entre celulares (sala `VERDAO`).

**Live:** https://guilhermeromio-netto-prog.github.io/palmeiras-hub/

## Novidades v4.4.1 (Vídeo de fundo)

- **Fundo imersivo** — vídeo ambient de gramado/estádio em loop, mudo, `playsInline`, com poster `brand/bg-pitch.png`.
- **Legibilidade** — véu multi-camada (gradiente verde-escuro + blur/scrim) sobre o vídeo para cards brancos e painéis Pro manterem contraste.
- **Acessibilidade** — `prefers-reduced-motion: reduce` esconde/pausa o vídeo e usa só o pitch estático; toggle **Vídeo de fundo** nas Preferências (padrão ligado).
- **Performance** — pausa com `visibilitychange` quando a aba está oculta; assets WebM+MP4 leves em `public/brand/`.
- Fonte: Mixkit stock (royalty-free), comprimido com ffmpeg — ver `public/brand/VIDEO-CREDIT.txt`.

## Novidades v4.4.0 (Premium Pro craft)

- **Design tokens** — escala 8pt, raios SF-like, sombras em camadas suaves, stack tipográfica system/SF/Inter.
- **Surfaces** — cards brancos com hairline + elevação soft; painéis Pro escuros com gradiente rico e texto de alto contraste.
- **Dossiê & Painel da temporada** — layout editorial: chips segmentados, meta com ícones, hierarquia densa mas arejada.
- **Motion** — transição de abas refinada, press states 60fps-friendly; respeita `prefers-reduced-motion`.
- **Tab bar** — frost/blur premium, orbs iguais, labels nítidos.
- **Header / PRO** — top bar limpa, pill PRO sutil.
- **Tipografia** — títulos de jogo maiores, `tabular-nums` em placares/stats, meta mais quieta.
- **Empty / loading** — skeletons e empty states premium; contraste de tiles reforçado.
- Sem cards de feature novos; Home lean de v4.3 mantida.

## Novidades v4.3.0 (UX lean Pro)

- **Home deduplicada** — um dossiê + um painel da temporada; countdown/clima/onde assistir/H2H/stats/rádio/YouTube não empilham de novo quando o Pro já cobre.
- **Ordem padrão lean** — hero compacto → ao vivo → Dossiê Pro → Painel da temporada → ações rápidas → streak/Stories; Torcida em uma linha.
- **Mídia no dossiê** — rádio e YouTube atrás de “Rádio · YouTube” no dossiê (blocos separados opcionais nas preferências).
- **Visual mais calmo** — menos chrome, ticker mais fino, tiles com contraste garantido; Layout Pro compacto por padrão.
- Sem restaurar “Enquanto você saiu”.

## Novidades v4.2.0 (Pro)

- **Dossiê do próximo jogo** — adversário, competição, apito, local, onde assistir, clima, desfalques/suspensões (ESPN/notícias ou empty state honesto), snippet da última escalação, mini H2H (3) e situação na tabela.
- **Painel da temporada** — posição, pts, V-E-D, GP/GC, forma (5), próximos 5, folga p/ líder e zona (só com dados reais).
- **Agenda .ics** — “Adicionar ao calendário” (jogo único ou próximos) no dossiê e em Jogos.
- **Chrome Pro** — badge PRO no header/hero; Preferências → **Layout Pro (compacto)**.
- Sem paywall falso; sem restaurar “Enquanto você saiu”.

## Novidades v4.1.0

- **Polimento visual** — hierarquia e ritmo vertical mais calmos na Home; tipografia consistente; cards brancos limpos (sombra suave + borda 1px, sem sage sujo).
- **Hero / portal** — EntryGate e hero-campeão mais limpos e premium.
- **Stories, streak e convite** — visual mais intencional (não “bolted on”).
- **Ticker** mais fino; **ações rápidas** em pills refinadas; **tab bar** com glow/safe-area polidos e labels nítidos.
- Auditoria de contraste (chips/status/painéis escuros).

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
