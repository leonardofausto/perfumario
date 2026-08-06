# Perfumário

Perfumário é uma aplicação web para organizar uma coleção particular de fragrâncias com uma experiência visual mais próxima de um catálogo editorial do que de um painel administrativo.

O projeto permite cadastrar, editar, consultar, favoritar e excluir perfumes da estante pessoal, mantendo os dados privados por usuário com Supabase Auth, Postgres, Storage e políticas de segurança no banco.

## Recursos principais

- Coleção privada de fragrâncias por usuário autenticado.
- Cadastro e edição de perfumes com imagem, identidade, descrição, pirâmide olfativa, acordes, desempenho e ocasiões de uso.
- Tela de detalhes com leitura editorial da fragrância.
- Visão geral privada com resumo real da estante e da atividade recente.
- Diário de uso, análises pessoais e controle qualitativo do nível dos frascos.
- Recomendador contextual que considera a coleção e o histórico do usuário.
- Favoritos, filtros por status e marca, paginação e ações administrativas nos cards da coleção.
- Upload de imagens privadas com suporte a JPG, PNG, AVIF e WebP.
- Validação de dados com Zod e ações de servidor no Next.js.
- Migrations e testes de RLS para manter o contrato do Supabase rastreável.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth, Postgres e Storage
- CSS Modules
- Lucide React
- Zod
- Vitest
- Playwright
- Graphify

## Requisitos

- Node.js 24.x
- npm
- Projeto Supabase configurado

## Variáveis de ambiente

Crie um arquivo `.env.local` a partir de `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
E2E_PERFUME_ID=
```

Somente variáveis públicas do Supabase devem ficar disponíveis para o navegador. Chaves administrativas e senhas de banco não devem ser versionadas.
As variáveis `E2E_*` são exclusivas de uma conta dedicada de testes e são
carregadas apenas pelo Playwright.

## Como rodar localmente

Instale as dependências:

```powershell
npm ci
```

Inicie o servidor de desenvolvimento:

```powershell
npm.cmd run dev
```

A aplicação fica disponível em:

```text
http://localhost:3000
```

## Scripts úteis

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run check:stable
npm.cmd run test:policy
npm.cmd run test:e2e
```

Validação completa:

```powershell
npm.cmd run verify
```

Testes end-to-end:

```powershell
npx playwright install chromium
npm.cmd run test:e2e
```

## Supabase

As migrations ficam em:

```text
supabase/migrations
```

O projeto usa Supabase remoto. Antes de aplicar mudanças de schema, revise migrations, RLS, grants e políticas de Storage. Dados e arquivos de perfumes devem permanecer sempre escopados ao usuário autenticado.

## Graphify

Após alterações de código, atualize o grafo local:

```powershell
graphify update .
```

Os artefatos em `graphify-out` são auxiliares locais do projeto e não fazem parte da documentação pública do produto.

## Diretriz de UX

A interface segue uma separação clara de responsabilidades:

- **Coleção:** gerenciar a estante.
- **Cadastro:** criar e editar informações.
- **Detalhes:** apresentar a fragrância para leitura e consulta.

Essa arquitetura evita misturar gerenciamento, edição e leitura na mesma tela, preservando uma experiência mais limpa, consistente e editorial.

## Repositório

```text
https://github.com/leonardofausto/perfumario
```
