# Palmeiras Hub 🌿

App pessoal de torcedor do **Palmeiras**: próximo jogo, calendário, estatísticas do Brasileirão e notícias — UI em pt-BR, estética verdão (sem usar marcas oficiais do clube).

## Stack

- **Frontend:** Vite + React (mobile-first)
- **Backend/proxy:** Express (CORS + agregação de dados)
- **Fontes de dados (gratuitas):**
  - [API-Football](https://www.api-football.com/) (api-sports.io) — preferencial se houver chave
  - [football-data.org](https://www.football-data.org/) — alternativa free
  - RSS do ge.globo (Palmeiras) para notícias
  - **Modo DEMO** com dados de exemplo rotulados quando não há chave de API

## Como rodar

```bash
npm install
cp .env.example .env   # opcional — preencha chaves se quiser modo live
npm run dev
```

- App: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3001](http://localhost:3001) (`/api/hub`, `/api/health`)

Produção local:

```bash
npm run build
npm start
```

## Variáveis de ambiente

Veja `.env.example`:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do Express (padrão `3001`) |
| `API_FOOTBALL_KEY` | Chave API-Football / api-sports |
| `FOOTBALL_DATA_API_KEY` | Token football-data.org |
| `FORCE_DEMO` | `true` força dados de exemplo |
| `CACHE_TTL_SECONDS` | Cache em memória no servidor (padrão `120`) |

**Não commite o arquivo `.env`.**

Cadastros gratuitos:

1. API-Football: https://dashboard.api-football.com/
2. football-data.org: https://www.football-data.org/client/register

## Como o refresh funciona

1. Ao **abrir o app** (e ao clicar em **Atualizar**), o front chama `GET /api/hub?refresh=1`.
2. O servidor busca (ou revalida) jogos, tabela, artilheiros e RSS.
3. Há um **cache curto** em memória no Express; cada start do client força revalidação.
4. Sem chaves → **MODO DEMO** (banner amarelo). Com chave → **dados ao vivo**.
5. Se a API live falhar, o app **não inventa placares**: mostra erro ou cai para demo claramente rotulado.
6. No **plano Free** da API-Football, só certas temporadas estão liberadas (em geral **2022–2024**). O servidor tenta a temporada civil atual e, se bloqueada, usa automaticamente a mais recente disponível — sempre rotulada no banner e na aba Estatísticas.

## Seções

| Aba | Conteúdo |
|-----|----------|
| **Início** | Card do próximo jogo (adversário, competição, data/hora America/Sao_Paulo, local), forma V-E-D, mini stats |
| **Calendário** | Próximos jogos + resultados (Brasileirão / Libertadores / Copa do Brasil quando a fonte cobrir) |
| **Estatísticas** | Tabela do Brasileirão com Palmeiras destacado, V-E-D, gols, artilharia |
| **Notícias** | Manchetes com link para o original |

## Scripts

| Comando | Função |
|---------|--------|
| `npm run dev` | Express + Vite juntos |
| `npm run build` | Build do frontend em `dist/` |
| `npm start` | Serve API + `dist/` em produção |
| `npm run dev:server` / `dev:web` | Processos separados |

## Aviso

Projeto **não oficial**, feito por torcedor. Identidade visual geométrica própria — não reproduz logotipos ou marcas registradas do SEP.
