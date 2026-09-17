# InstantDB permanente (opcional)

O Hub já usa um app InstantDB **temporário** (sem login no provisionamento) com sala padrão `VERDAO`.  
Ele **expira em ~01/10/2026**. Até lá, quem tiver o link (e o app) sincroniza só abrindo o site — mesmo código = mesmos dados.

## Trocar para app permanente (gratuito)

1. Crie conta em https://www.instantdb.com (magic link).
2. Dashboard → New app → copie o **App ID**.
3. No projeto:

```bash
# Com Platform SDK / CLI (token do dashboard → Settings → Access Token)
npx instant-cli@latest init-without-files --title palmeiras-hub --token SEU_TOKEN
```

4. Empurre o schema e permissões abertas (guest) iguais a `src/sync/instant.js`:
   - entidades: `rooms`, `reactionEvents`, `tips`, `mural`, `quizScores`
   - rules: `view/create` = `'true'` (sem login no celular)
5. Build:

```bash
VITE_INSTANT_APP_ID=seu-uuid npm run build
```

6. Publique o `dist/` no `gh-pages` como de costume.

**Não** coloque o Admin Token no front nem no Git.
