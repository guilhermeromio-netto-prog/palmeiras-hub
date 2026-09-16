# Palmeiras Hub 🌿

App pessoal de torcedor do **Palmeiras**: próximo jogo, **placar ao vivo**, countdown, H2H, calendário com filtros, elenco com favoritos, escalação/tática, cartões, tabelas, notícias + ticker RSS, preferências locais e “desde a última vez” — UI em pt-BR, estética verdão (sem marcas oficiais do clube).

**UI next-gen:** fundo de estádio imersivo, hero “O Maior Campeão”, cards em glassmorphism e navegação liquid-glass com ícones de bola/troféu/escudo/calendário (arte inspirada no Verdão — **não** são marcas oficiais do clube).

**PWA** instalável no celular. **Sem API keys.** A cada abertura a página busca dados frescos em fontes públicas; se houver jogo ao vivo, o centro de partida faz polling na ESPN.

**Live:** https://guilhermeromio-netto-prog.github.io/palmeiras-hub/

## Como abrir

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run serve
```

`vite.config.js` mantém `base: '/palmeiras-hub/'` para GitHub Pages.

## Instalar no celular (PWA)

### iPhone / iPad (Safari)
1. Abra o link do Pages no **Safari**.
2. Toque em **Compartilhar** (□↑).
3. Escolha **Adicionar à Tela de Início**.

### Android (Chrome)
1. Abra o link no **Chrome**.
2. Menu **⋮** → **Instalar app** / **Adicionar à tela inicial**.

## Fontes públicas (sem chave)

| Dado | Fonte |
|------|--------|
| Classificações | ESPN public API standings |
| Resultados / próximos | ESPN schedule + scoreboards; fallback TheSportsDB |
| **Placar ao vivo** | ESPN match **summary** (poll ~45s só enquanto LIVE) |
| H2H | Agenda ESPN + TheSportsDB `searchevents` |
| Elenco / cartões | ESPN roster |
| Escalação + formação | ESPN match summary (última publicada) |
| Artilharia | Wikipedia pt |
| Notícias + ticker | RSS via rss2json (Gazeta / Google / ge.globo) |

**Nunca** inventamos placares, escalações “prováveis”, cartões ou gols.

## Interação (localStorage)

| Recurso | Detalhe |
|---------|---------|
| Preferências | Aba inicial, fonte normal/grande, modo compacto |
| Favoritos | Estrela 3–5 jogadores no Elenco → cards no Início |
| Filtros | Agenda por competição + casa/fora; notícias por palavra/fonte |
| Desde a última vez | Delta de posição, novos resultados e manchetes |
| Faltou algo? | Nota local ou share/WhatsApp (`wa.me` sem número fixo) |

## Live match center

1. Detecta jogo do Palmeiras **hoje** (fuso America/Sao_Paulo) com `espnEventId`.
2. Se status LIVE (ou janela 15 min antes → ~3 h após o apito sem FT), busca o **summary** ESPN.
3. Poll a cada **~45 s** só nessa janela; **para no FT** e mostra o placar final uma vez.
4. Exibe placar, minuto/status, gols e cartões quando a ESPN publica em `keyEvents`.

## Limitações honestas

- Ao vivo depende da ESPN publicar o evento/summary; se a API falhar, mostramos erro — **sem inventar placar**.
- Copa do Brasil: mata-mata — muitas vezes sem tabela de pontos.
- Escalação “provável”: só a **última** formação publicada.
- Cartões do elenco: stats de temporada do roster (Brasileirão).
- Sem API-Football (de propósito).

## Aviso

Projeto **não oficial**, feito por torcedor. Brasão estilizado — não é o escudo oficial do SEP.
