# Palmeiras Hub 🌿

App pessoal de torcedor do **Palmeiras**: próximo jogo, calendário, elenco, escalação/tática, cartões, tabelas de todos os campeonatos e notícias — UI em pt-BR, estética verdão (sem marcas oficiais do clube).

**Sem API keys.** A cada abertura da página o app busca dados frescos em fontes públicas (CORS liberado).

## Como abrir

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run serve
```

`vite.config.js` mantém `base: '/palmeiras-hub/'` para GitHub Pages.

## Fontes públicas (sem chave)

| Dado | Fonte |
|------|--------|
| Classificações (Brasileirão, Libertadores, Paulistão) | ESPN public API standings |
| Resultados / próximos jogos | ESPN schedule + scoreboards; fallback TheSportsDB |
| Elenco (posição, número) | ESPN team roster |
| Cartões amarelos/vermelhos | Stats embutidos no roster ESPN |
| Escalação + formação (ex. 4-2-3-1) | ESPN match summary (última escalação publicada) |
| Artilharia | Wikipedia pt (Brasileirão) |
| Notícias | RSS via rss2json (Gazeta → Google Notícias → ge.globo) |

Cada seção mostra a origem e o banner **Atualizado às HH:MM** (America/Sao_Paulo).

**Nunca** inventamos placares, escalações “prováveis” ou cartões.

## Seções

| Aba | Conteúdo |
|-----|----------|
| **Início** | Próximo jogo, forma V-E-D, atalhos (elenco / tática / cartões) |
| **Jogos** | Próximos + recentes (multi-competição) |
| **Time** | Elenco · Escalação (gramado CSS) · Cartões |
| **Tabelas** | Accordion com classificação + setas ↑↓→ (ESPN `rankChange` ou delta localStorage) + artilharia |
| **Notícias** | Manchetes com link ao original |

## Limitações honestas

- **Copa do Brasil**: mata-mata — ESPN frequentemente não expõe tabela de pontos.
- **Escalação “provável”**: só mostramos a **última** formação publicada no resumo ESPN; se não houver, estado vazio.
- **Cartões**: refletem stats de temporada do roster ESPN (Brasileirão), não necessariamente todos os campeonatos.
- **Calendário longo**: scoreboards cobrem ~14 dias; TheSportsDB free reforça 1 próximo/1 último.
- **Sem API-Football**: de propósito.
- **Agenda sem duplicatas**: jogos mesclados por dia (America/Sao_Paulo) + código da competição + mando (casa/fora), para unificar ESPN e TheSportsDB mesmo com nomes diferentes (ex. Liga de Quito / LDU Quito).
- **Setas na tabela**: preferem `rankChange` da ESPN; se vier 0/ausente, comparam com o snapshot da visita anterior em `localStorage`.
- **Brasão**: SVG próprio verde-branco-vermelho em `public/` (Wikimedia bloqueou download neste ambiente; não hotlink).

## Aviso

Projeto **não oficial**, feito por torcedor. Brasão estilizado inspirado nas cores clássicas (verde, branco e vermelho) — não é o escudo oficial registrado do SEP.
