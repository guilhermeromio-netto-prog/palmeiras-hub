# Palmeiras Hub 🌿

App pessoal de torcedor do **Palmeiras**: próximo jogo, calendário, estatísticas do Brasileirão e notícias — UI em pt-BR, estética verdão (sem marcas oficiais do clube).

**Sem API keys.** A cada abertura da página o app busca dados frescos em fontes públicas (CORS liberado).

## Como abrir (dados frescos a cada load)

### Opção 1 — recomendada: Vite / serve estático

```bash
npm install
npm run dev          # http://localhost:5173 — sem .env
```

Ou build estático:

```bash
npm run build
npx serve dist       # ou: npm run serve
```

Abra o endereço no navegador. Em `DOMContentLoaded` / boot do React, o app refetcha tudo.

### Opção 2 — abrir o HTML

- **Não dependa de `file://`**: a maioria dos browsers bloqueia `fetch` cross-origin a partir de arquivos locais.
- Depois do build, sirva a pasta `dist/`:

```bash
npm run build && npx serve dist
```

Ou use a extensão **Live Server** no editor apontando para `dist/` (ou `npm run dev` na raiz).

### Opção 3 — proxy Express opcional

Só se alguma fonte bloquear CORS no seu ambiente:

```bash
npm run dev:proxy    # Vite + Express /api/proxy
```

O caminho principal **não precisa** do Express.

## Fontes públicas (sem chave)

| Dado | Fonte |
|------|--------|
| Classificação / stats | ESPN public API (`site.api.espn.com` / `apis/v2/.../standings`) |
| Resultados e próximos jogos | ESPN schedule + scoreboards diários; fallback **TheSportsDB** (key pública `123`) |
| Artilharia | Wikipedia pt (página do Brasileirão da temporada) |
| Notícias | RSS via **rss2json.com**: Gazeta Esportiva Palmeiras → Google Notícias → ge.globo |

Cada seção mostra a origem e o banner exibe **Atualizado às HH:MM** (America/Sao_Paulo) a cada abertura.

Se uma fonte falhar: estado vazio + botão **Atualizar** / **Tentar de novo**. **Nunca** inventamos placares ao vivo.

## Seções

| Aba | Conteúdo |
|-----|----------|
| **Início** | Próximo jogo, forma V-E-D, mini stats, resultados recentes |
| **Calendário** | Próximos + recentes (Brasileirão / Libertadores quando a fonte cobrir) |
| **Estatísticas** | Tabela do Brasileirão (Palmeiras destacado), V-E-D, artilharia |
| **Notícias** | Manchetes com link ao original |

## Scripts

| Comando | Função |
|---------|--------|
| `npm run dev` | Só Vite (padrão, sem keys) |
| `npm run dev:proxy` | Vite + proxy Express opcional |
| `npm run build` | Gera `dist/` estático |
| `npm run serve` / `npx serve dist` | Abre o HTML buildado via HTTP |
| `npm start` | Produção: Express serve `dist/` + proxy |

## Variáveis de ambiente

Veja `.env.example`. Apenas `PORT` do proxy opcional. **Não commite `.env`.**

## Limitações honestas

- **CORS / `file://`**: abra via `http://localhost` (`npm run dev` ou `npx serve dist`).
- **Proxies públicos / rss2json**: rate limits e indisponibilidade ocasional.
- **ESPN scoreboards**: próximos jogos são descobertos na janela ~14 dias; calendário longo pode ficar incompleto.
- **TheSportsDB free**: costuma devolver só 1 próximo / 1 último — usado como reforço.
- **Wikipedia / ESPN**: dados editorialmente corretos, mas podem atrasar minutos/horas vs. placares ao vivo de apps pagos.
- **Sem API-Football / football-data**: de propósito — sem plano free com chave.

## Aviso

Projeto **não oficial**, feito por torcedor. Identidade visual geométrica própria — não reproduz logotipos ou marcas registradas do SEP.
