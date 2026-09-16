# Palmeiras Hub 🌿

App pessoal de torcedor do **Palmeiras**: próximo jogo, countdown, H2H, calendário, elenco, escalação/tática, cartões, tabelas de todos os campeonatos e notícias — UI em pt-BR, estética verdão (sem marcas oficiais do clube).

**PWA** instalável no celular. **Sem API keys.** A cada abertura da página o app busca dados frescos em fontes públicas (CORS liberado).

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
4. Confirme o nome **Palmeiras Hub**.

### Android (Chrome)
1. Abra o link no **Chrome**.
2. Menu **⋮** → **Instalar app** / **Adicionar à tela inicial** (o texto varia).
3. Confirme. O ícone verde abre em tela cheia (standalone).

O service worker faz cache dos assets estáticos; os dados de futebol/notícias continuam sendo buscados na rede a cada abertura (NetworkFirst nas APIs públicas).

## Fontes públicas (sem chave)

| Dado | Fonte |
|------|--------|
| Classificações (Brasileirão, Libertadores, Paulistão) | ESPN public API standings |
| Resultados / próximos jogos | ESPN schedule + scoreboards; fallback TheSportsDB |
| H2H (histórico do próximo adversário) | Confrontos com placar da agenda ESPN + TheSportsDB `searchevents` |
| Elenco (posição, número) | ESPN team roster |
| Cartões amarelos/vermelhos | Stats embutidos no roster ESPN |
| Escalação + formação (ex. 4-2-3-1) | ESPN match summary (última escalação publicada) |
| Artilharia | Wikipedia pt (Brasileirão) |
| Notícias | RSS via rss2json (Gazeta → Google Notícias → ge.globo) |

Cada seção mostra a origem e o banner **Atualizado às HH:MM** (America/Sao_Paulo).

**Nunca** inventamos placares, escalações “prováveis”, cartões ou placar ao vivo.

## Seções / recursos

| Aba / recurso | Conteúdo |
|-----|----------|
| **Início** | Próximo jogo, **countdown** (dias/h/min/s, fuso SP), H2H, forma V-E-D, atalhos |
| **Dia de jogo** | Tema mais intenso + banner quando há partida do Palmeiras no dia local SP |
| **WhatsApp** | Compartilhar próximo jogo, manchete ou resultado (`wa.me` / Web Share) |
| **Jogos** | Próximos + recentes (multi-competição) |
| **Time** | Elenco · Escalação (gramado CSS) · Cartões |
| **Tabelas** | Accordion com classificação + setas ↑↓→ + artilharia |
| **Notícias** | Manchetes com link ao original + share |

## Limitações honestas

- **Sem live match center**: após o horário de início, o countdown mostra “jogo em andamento / verifique fontes” — **não** há placar ao vivo nem polling durante a partida.
- **Copa do Brasil**: mata-mata — ESPN frequentemente não expõe tabela de pontos.
- **Escalação “provável”**: só mostramos a **última** formação publicada no resumo ESPN; se não houver, estado vazio.
- **Cartões**: refletem stats de temporada do roster ESPN (Brasileirão), não necessariamente todos os campeonatos.
- **Calendário longo**: scoreboards cobrem ~14 dias; TheSportsDB free reforça 1 próximo/1 último.
- **H2H**: só jogos com placar confirmado nas fontes; nomes de times são normalizados (ex. LDU / Liga de Quito).
- **Sem API-Football**: de propósito.
- **Agenda sem duplicatas**: jogos mesclados por dia (America/Sao_Paulo) + código da competição + mando (casa/fora).
- **Setas na tabela**: preferem `rankChange` da ESPN; se vier 0/ausente, comparam com o snapshot da visita anterior em `localStorage`.
- **Brasão / ícones PWA**: SVG próprio + PNGs gerados em `public/` (não hotlink oficial).

## Aviso

Projeto **não oficial**, feito por torcedor. Brasão estilizado inspirado nas cores clássicas (verde, branco e vermelho) — não é o escudo oficial registrado do SEP.
