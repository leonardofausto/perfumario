# Perfumário — Fundação, Autenticação e Shell

**Data:** 22 de julho de 2026

**Status:** Aprovado pelo usuário

**Produto:** Perfumário — Nossa estante virtual inteligente

## Objetivo

Entregar a fundação técnica e visual do Perfumário com apresentação pública, autenticação privada por convite, perfil individual e uma área autenticada responsiva. O incremento termina com Dashboard, Minha Coleção, Recomendador e Histórico navegáveis, mas ainda sem implementar cadastro de perfumes ou recomendações por IA.

## Escopo

### Incluído

- Projeto Next.js com App Router, TypeScript estrito e integração com Supabase SSR.
- Apresentação pública do produto.
- Login dedicado por e-mail e senha.
- Recuperação e redefinição de senha.
- Sessão protegida e logout.
- Perfil com nome de exibição e avatar.
- Shell autenticado com sidebar e as quatro áreas iniciais.
- Estados vazios reais e bem acabados para funcionalidades futuras.
- Banco, RLS, Storage, migrations e automações de qualidade.
- Integrações de GitHub, Vercel, Supabase CLI e GRAPHIFY.

### Não incluído

- Cadastro, edição ou exclusão de perfumes.
- Recomendação por IA, clima ou localização.
- Histórico real de uso ou recomendações.
- Compartilhamento de estantes.
- Cadastro público, login social ou área administrativa de convites.
- Modo escuro.

## Usuários e acesso

O sistema começa como uma coleção privada por usuário. O primeiro usuário será convidado manualmente pelo painel do Supabase e definirá sua senha ao aceitar o convite. Não existe registro público. A arquitetura manterá o isolamento por usuário para que uma versão futura possa adicionar estantes compartilhadas sem comprometer a privacidade atual.

## Arquitetura

A aplicação usará Next.js App Router hospedado na Vercel. Páginas e layouts serão Server Components por padrão; Client Components serão reservados para formulários e interações que exigem estado no navegador. O Supabase fornecerá Auth, PostgreSQL e Storage.

A autorização será revalidada no servidor em cada operação sensível. Redirecionamentos na camada de navegação melhoram a experiência, mas não serão a única barreira de segurança. RLS será a fonte final de autorização no banco e no Storage.

Somente versões estáveis serão aceitas. Dependências identificadas como `alpha`, `beta`, `canary`, `rc` ou equivalentes não poderão entrar no projeto. O lockfile será versionado.

## Rotas e telas

### Área pública

- `/`: apresentação inspirada nas referências fornecidas, com proposta do produto e chamada para entrar.
- `/login`: página dedicada de login.
- `/recuperar-senha`: solicita o envio do link de recuperação.
- `/redefinir-senha`: permite definir uma nova senha a partir de uma sessão de recuperação válida.

Usuários já autenticados que acessarem páginas de autenticação serão encaminhados ao Dashboard.

### Área protegida

- `/dashboard`: resumo da estante e atalhos, inicialmente com métricas zeradas e estados vazios.
- `/colecao`: estado vazio orientando o futuro cadastro de perfumes.
- `/recomendador`: estado vazio explicando que as recomendações dependem de uma coleção cadastrada.
- `/historico`: estado vazio para recomendações e usos futuros.
- `/perfil`: edição de nome de exibição e avatar.

O menu do perfil também oferece “Editar perfil” e “Sair”. O e-mail é exibido, mas não pode ser alterado neste incremento.

## Direção visual

A interface seguirá diretamente as referências aprovadas:

- Fundo marfim quente e superfícies claras.
- Verde profundo como cor estrutural e de ação.
- Verde suave para estados secundários.
- Bordas em areia, sombras discretas e texto quase preto.
- Ícones lineares, tipografia sóbria e composição editorial.
- Espaço generoso e hierarquia clara, evitando excesso de elementos decorativos.

O login usa uma composição desktop 70/30: 70% para uma fotografia de perfumes com tratamento verde e 30% para o formulário em fundo marfim. A fotografia final deve ser limpa, própria para o projeto e em resolução adequada; o screenshot de referência não será usado como ativo de produção.

## Responsividade e acessibilidade

A responsividade é parte da arquitetura dos componentes. Serão validadas, no mínimo, as larguras de 320, 375, 768, 1024 e 1440 pixels.

- Desktop: sidebar fixa e conteúdo fluido.
- Tablet: sidebar compactável sem reduzir áreas de toque.
- Mobile: navegação em painel lateral; no login, a imagem vira um cabeçalho compacto e o formulário ocupa toda a largura.
- Áreas interativas terão tamanho confortável para toque.
- Navegação completa por teclado, foco visível e labels explícitos.
- Contraste compatível com WCAG AA para textos e controles essenciais.
- Animações respeitarão `prefers-reduced-motion`.

## Componentes e limites

- `PublicHeader`: identidade e entrada na área autenticada.
- `LoginForm`, `ForgotPasswordForm` e `ResetPasswordForm`: validação, submissão e feedback dos fluxos de Auth.
- `AppSidebar`: navegação principal responsiva.
- `UserMenu`: avatar, perfil e logout.
- `PageHeader`: título, descrição e ação contextual.
- `EmptyState`: apresentação consistente das áreas ainda sem dados.
- `ProfileForm` e `AvatarUpload`: edição isolada do perfil.

Cada componente terá uma responsabilidade clara. Componentes visuais não acessarão Supabase diretamente; operações de dados ficarão em módulos de servidor com contratos tipados.

## Dados

### Tabela `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `avatar_path text`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Um trigger idempotente cria o perfil quando um usuário é criado no Auth. Políticas RLS permitem `select` e `update` apenas quando `auth.uid() = id`. Criação direta pelo cliente não é necessária.

### Storage

O bucket de avatares será privado. Objetos serão organizados sob um prefixo derivado do ID do usuário. Políticas de Storage permitirão leitura e escrita somente dentro do próprio prefixo. URLs de exibição serão assinadas com duração limitada.

As tabelas de perfumes não fazem parte deste incremento. Quando criadas, terão proprietário explícito e RLS por `user_id`.

## Fluxos

### Login

1. O usuário informa e-mail e senha.
2. O servidor valida o formato e solicita autenticação ao Supabase.
3. Em sucesso, cookies de sessão seguros são atualizados e o usuário segue ao Dashboard.
4. Em falha, o formulário mantém o e-mail e mostra uma mensagem segura sem revelar se uma conta existe.

### Recuperação

1. O usuário informa o e-mail.
2. O sistema solicita o e-mail de recuperação com URL de retorno autorizada.
3. A interface mostra uma resposta neutra, exista ou não uma conta.
4. O link válido abre a redefinição; após a troca, a sessão local é encerrada e o usuário faz login novamente. Revogação global de outras sessões fica fora deste incremento.

### Perfil e avatar

1. O servidor confirma a sessão.
2. Nome e arquivo são validados.
3. O avatar é salvo no prefixo privado do usuário.
4. O perfil recebe o novo caminho apenas após upload bem-sucedido.
5. Substituições evitam deixar referências quebradas; falhas mantêm o avatar anterior.

## Erros e estados

- Skeletons representarão carregamentos que possam ser percebidos.
- Erros de campo aparecerão próximos ao campo correspondente.
- Erros gerais usarão uma mensagem clara e ação de nova tentativa quando aplicável.
- Formulários preservarão dados válidos após falhas.
- `not-found` e limites de erro manterão a identidade do produto.
- Logs de servidor não incluirão senha, tokens, cookies ou chaves.

## Segurança e segredos

A aplicação cliente receberá apenas a URL do Supabase e a chave publicável. Senha do banco, chaves secretas, `service_role` e segredo JWT nunca serão versionados, incluídos no bundle ou armazenados em arquivos de exemplo.

As credenciais compartilhadas durante o planejamento devem ser rotacionadas antes de produção. Arquivos `.env*` locais permanecem ignorados, exceto `.env.example` sem valores secretos.

## Testes e qualidade

- Testes unitários para schemas de validação e funções puras.
- Testes de componentes para formulários, sidebar, menu do usuário e estados vazios.
- Testes de integração para sessão, redirecionamentos, perfil e políticas de acesso.
- Teste ponta a ponta: login, Dashboard, edição do perfil e logout.
- Verificações responsivas nas cinco larguras definidas.
- Pipeline com build, tipos, lint e testes como requisitos obrigatórios.
- Verificação de que pacotes instalados são versões estáveis.

## GitHub, Vercel e Supabase

Os CLIs oficiais de GitHub, Vercel e Supabase serão instalados em versões estáveis e autenticados no ambiente local. A integração Git da Vercel criará Preview Deployments para branches e publicará produção a partir da branch principal. Não haverá um deploy manual duplicado para cada commit.

Migrations serão versionadas em `supabase/migrations`. Durante o desenvolvimento, o Codex executará validação local e, após sucesso, aplicará migrations aprovadas ao projeto vinculado usando o Supabase CLI. O pipeline verificará consistência e impedirá entrega quando houver falha ou migration local ainda não aplicada. Migrations não serão executadas indiscriminadamente em commits que alterem apenas o frontend.

## Operação assistida

Cada fase usará as skills e os plugins instalados que correspondam à atividade: Superpowers para processo e verificação, frontend-design para interface, Supabase para banco e segurança, Vercel para Next.js e deploy, e GitHub para repositório e automação. GRAPHIFY será usado junto dessas capacidades para navegação estrutural e análise de impacto; ferramentas especializadas continuam responsáveis por executar e validar suas próprias operações.

## GRAPHIFY

O GRAPHIFY será instalado para Codex no repositório e executará extração de código após o scaffold. Seu hook manterá o grafo atualizado após mudanças estruturais. Consultas `query`, `path`, `explain` e `affected` orientarão navegação e análise de impacto, reduzindo leituras amplas e repetitivas.

O GRAPHIFY será a ferramenta principal para compreensão estrutural depois que houver código indexável. Ele complementa, mas não substitui, Git, compilador, testes, CLIs oficiais ou verificações de segurança.

## Critérios de aceite

- Usuário convidado entra apenas com e-mail e senha.
- Recuperação e redefinição de senha funcionam.
- Visitante não autenticado não acessa rotas nem dados protegidos.
- Usuário autenticado navega por todas as áreas do shell e pode sair.
- Perfil e avatar respeitam isolamento por usuário.
- Login corresponde à composição 70/30 aprovada.
- Interface funciona nas cinco larguras-alvo e por teclado.
- Nenhum segredo aparece no Git, bundle ou logs.
- Build, tipos, lint e testes passam usando apenas dependências estáveis.
- Pushes geram os deployments esperados pela integração Git da Vercel.
- Migrations são reproduzíveis e as políticas RLS são verificadas.
- GRAPHIFY está instalado, atualizado e utilizável para análise de impacto.
