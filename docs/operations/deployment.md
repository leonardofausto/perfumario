# Operação e implantação

## Princípios

- Somente versões estáveis podem entrar em `dependencies` ou `devDependencies`; `npm run check:stable` bloqueia `alpha`, `beta`, `rc`, `canary`, `next` e equivalentes.
- O navegador recebe somente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Chaves administrativas, senha do banco e credenciais E2E ficam apenas nos cofres dos provedores. Nunca entram em arquivos versionados ou comandos gravados no histórico.
- A aplicação usa Supabase remoto; este projeto não depende de Docker.

## GitHub

O repositório oficial é `leonardofausto/perfumario`. Cada push executa o workflow `CI`, que valida política de versões, lint, tipos, testes, build e Playwright.

Secrets necessários no GitHub Actions:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `E2E_USER_EMAIL` e `E2E_USER_PASSWORD` somente quando houver uma conta exclusiva para E2E

Sem as credenciais E2E, a jornada autenticada é ignorada, mas o bloqueio anônimo e a responsividade pública continuam obrigatórios.

## Supabase

As migrations vivem em `supabase/migrations`. Antes de aplicar uma migration:

1. revisar SQL, RLS, grants e políticas de Storage;
2. executar as asserções em uma transação remota com `BEGIN` e `ROLLBACK` pelo plugin autenticado;
3. aplicar a migration pelo plugin;
4. comparar o histórico remoto com os arquivos locais;
5. executar os advisors de segurança e desempenho.

Não usar senha de banco em argumentos de terminal. Não é necessário iniciar Docker.

## Vercel

Variáveis necessárias em Development, Preview e Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Fluxo operacional:

```powershell
vercel link
vercel pull --yes
vercel build
vercel ls
```

Em Windows sem permissão para links simbólicos, `vercel build` pode concluir o Next.js e falhar apenas ao deduplicar funções com `EPERM`. Nesse caso, use `vercel deploy`, que realiza o mesmo build no ambiente Linux remoto da Vercel; não é necessário habilitar Docker.

Branches geram Preview Deployments; `main` é a origem da produção. A troca de segredos administrativos informados durante o bootstrap deve acontecer antes da liberação pública.

## Graphify

Depois de alterações de código:

```powershell
graphify update . --force
graphify affected requireUser --depth 3
graphify affected profiles --depth 3
graphify benchmark graphify-out/graph.json
```

Os artefatos de `graphify-out` são locais e não devem ser versionados.

## Verificação local

```powershell
npm ci
npm run verify
npx playwright install chromium
npm run test:e2e
```
