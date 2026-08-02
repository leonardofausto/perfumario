# Perfumário — Coleção Persistente e Detalhe Editorial

**Data:** 26 de julho de 2026

**Status:** Aprovado pelo usuário

**Direção visual aprovada:** Opção A — Editorial equilibrada

## Objetivo

Transformar “Minha Coleção” em uma estante persistente por usuário, armazenada no Supabase, na qual cada card abre uma página dedicada ao perfume. A página de detalhe apresenta identidade, explicação da fragrância, famílias olfativas, pirâmide de notas, desempenho e adequação por estação, ocasião e horário.

O incremento também substitui o modal atual por rotas próprias de detalhe, cadastro e edição; cria armazenamento privado para imagens; migra os 16 perfumes iniciais; e garante a ordenação pedida para favoritos e não favoritos.

## Decisões aprovadas

- Os registros deixam de usar `localStorage` e passam a pertencer ao usuário autenticado no Supabase.
- Clicar no corpo do card abre `/colecao/[id]`.
- A edição acontece em `/colecao/[id]/editar`, sem usar o modal atual.
- O cadastro acontece em `/colecao/novo` e reutiliza o mesmo contrato de formulário da edição.
- O botão “Editar” altera os dados estruturados e o explicativo da fragrância.
- O botão “Excluir” remove da estante um perfume acabado ou indesejado.
- Favoritos aparecem antes dos demais.
- Favoritos são ordenados alfabeticamente entre si.
- Não favoritos também são ordenados alfabeticamente entre si.
- A grade mostra exatamente três cards por linha em desktop.
- Imagens são armazenadas em um bucket privado chamado `perfume-images`.
- A tela de detalhe usa a composição editorial equilibrada aprovada no companion visual.

## Escopo incluído

- Schema relacional para perfumes, notas olfativas e pontuações.
- RLS por proprietário em todas as tabelas.
- Bucket privado e políticas por prefixo do usuário.
- Migração idempotente dos 16 perfumes existentes.
- Busca, filtros e favoritos sobre dados do Supabase.
- Ordenação determinística no banco.
- Tela de detalhe responsiva e acessível.
- Pirâmide olfativa com formato visual de pirâmide.
- Famílias olfativas apresentadas como itens de cores sólidas.
- Gráfico-aranha para desempenho.
- Indicadores coloridos com ícones e percentuais para estações, ocasiões e horários.
- Rotas próprias de cadastro e edição.
- Exclusão confirmada e limpeza da imagem correspondente.
- Pesquisa de conteúdo e imagens em fontes primárias.
- Registro da origem do texto e da imagem de cada perfume.

## Fora do escopo

- Recomendação por IA.
- Clima em tempo real e geolocalização.
- Compartilhamento público da coleção.
- Controle de estoque, número de borrifadas ou volume restante.
- Mais de uma foto por perfume.
- Avaliações públicas, comentários ou dados de outros usuários.
- Editor de texto rico.

## Experiência da coleção

### Card

Cada card apresenta:

- imagem do frasco;
- marca;
- nome;
- concentração ou tipo;
- indicação “Decant” ou “Frasco inteiro”;
- famílias olfativas principais;
- controle de favorito.

O corpo do card é um link semântico para `/colecao/[id]`. O controle de favorito continua independente e não dispara a navegação.

Editar e excluir deixam de competir com o clique principal do card. Essas ações ficam na página de detalhe, onde há mais contexto e menor risco de acionamento acidental.

### Ordenação

A consulta do Supabase aplica:

1. `is_favorite` em ordem decrescente;
2. `name` em ordem alfabética crescente;
3. `brand` como desempate.

Ao favoritar ou desfavoritar, a interface atualiza imediatamente e confirma a mutação no servidor. Depois da confirmação, a lista é revalidada para refletir a ordenação oficial do banco.

### Grade responsiva

- Desktop a partir de 1024 px: três cards por linha.
- Tablet: dois cards por linha.
- Mobile: um card por linha.

Os cards mantêm altura visual consistente, mas títulos extensos não são truncados de forma que impeça identificar a fragrância.

## Página de detalhe

### Cabeçalho editorial

O topo usa duas colunas no desktop:

- coluna esquerda: imagem principal do frasco;
- coluna direita: marca, nome, concentração, formato na estante, favorito e ações.

As ações são:

- “Editar perfume”;
- “Excluir da estante”;
- favoritar ou desfavoritar.

No mobile, imagem e identidade formam uma única coluna.

### Explicativo

O texto é uma descrição editorial curta, original e objetiva. Ele explica:

- abertura da fragrância;
- evolução na pele;
- sensação predominante;
- perfil de uso;
- situações em que ela tende a funcionar melhor.

O texto não copia descrições comerciais extensas. Informações pesquisadas são parafraseadas e a URL da fonte é preservada.

### Identificação

Campos apresentados:

- marca;
- nome;
- concentração ou tipo;
- formato: `decant` ou `full_bottle`;
- famílias olfativas;
- indicação se é original, dupe ou inspiração;
- perfume de referência, quando houver.

`inspired_by` é obrigatório quando `inspiration_kind` for `dupe` ou `inspiration`, e deve permanecer vazio quando for `original`.

### Famílias olfativas

Cada família é mostrada em um chip de cor sólida. A cor é determinada por um mapa visual estável da aplicação, não por valores arbitrários salvos no banco.

Exemplos do mapa:

- cítrica: amarelo;
- aromática: verde;
- amadeirada: marrom;
- âmbar/oriental: cobre;
- floral: rosa;
- gourmand: caramelo;
- aquática: azul;
- couro: grafite;
- especiada: terracota;
- frutada: magenta.

Todo chip inclui texto; a cor nunca é a única forma de comunicar a família.

### Pirâmide olfativa

A pirâmide tem três níveis com larguras crescentes:

1. saída;
2. coração;
3. fundo.

Cada nível contém os nomes das notas na ordem cadastrada. Em leitores de tela, a mesma informação é exposta como três listas nomeadas. A pirâmide continua legível sem cor e em telas pequenas.

### Gráfico-aranha de desempenho

O gráfico inicial usa cinco eixos, todos de 0 a 100:

- fixação;
- projeção;
- rastro;
- versatilidade;
- presença.

O gráfico possui alternativa textual com o nome e percentual de cada eixo. Os valores são editoriais, usados para comparação interna da coleção, e não são apresentados como medição científica.

### Estações

Todas as quatro estações aparecem com ícone, cor e percentual:

- primavera;
- verão;
- outono;
- inverno.

### Ocasiões

O conjunto inicial é:

- trabalho;
- casual;
- encontro;
- formal;
- festa;
- atividade ao ar livre.

Cada item pode ter pontuação de 0 a 100. Itens sem avaliação não são inventados; aparecem como “Não avaliado” durante a edição incompleta.

### Horários

Todos os períodos aparecem com ícone, cor e percentual:

- manhã;
- tarde;
- noite;
- madrugada.

## Modelo de dados

### Valores controlados

Os valores controlados são colunas `text` protegidas por constraints `check`. Essa escolha mantém integridade sem tornar futuras ampliações tão rígidas quanto tipos enum PostgreSQL:

- `fragrance_concentration`: `parfum`, `extrait`, `eau_de_parfum`, `eau_de_toilette`, `eau_de_cologne`, `deo_colonia`, `body_splash`, `perfume_oil`, `other`;
- `bottle_format`: `decant`, `full_bottle`;
- `inspiration_kind`: `original`, `dupe`, `inspiration`;
- `note_layer`: `top`, `heart`, `base`;
- `score_category`: `performance`, `season`, `occasion`, `time`.

### Tabela `public.perfumes`

- `id uuid primary key default gen_random_uuid()`;
- `user_id uuid not null references auth.users(id) on delete cascade`;
- `legacy_key text`;
- `brand text not null`;
- `name text not null`;
- `description text not null default ''`;
- `concentration text not null` com a constraint de concentração;
- `bottle_format text not null` com a constraint de formato;
- `inspiration_kind text not null default 'original'` com a constraint de inspiração;
- `inspired_by text`;
- `olfactory_families text[] not null default '{}'`;
- `image_path text`;
- `image_source_url text`;
- `description_source_urls text[] not null default '{}'`;
- `is_favorite boolean not null default false`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Constraints:

- nome e marca não podem ser vazios após `trim`;
- `inspired_by` deve estar preenchido para `dupe` e `inspiration`;
- `inspired_by` deve ser nulo para `original`;
- `(user_id, legacy_key)` é único quando `legacy_key` estiver preenchido;
- `(id, user_id)` possui unicidade para permitir referências compostas seguras.

### Tabela `public.perfume_notes`

- `id uuid primary key default gen_random_uuid()`;
- `perfume_id uuid not null`;
- `user_id uuid not null`;
- `layer text not null` com a constraint de camada;
- `note text not null`;
- `display_order integer not null default 0`;
- `created_at timestamptz not null default now()`;
- foreign key composta `(perfume_id, user_id)` para `perfumes(id, user_id)` com `on delete cascade`;
- unicidade por `(perfume_id, layer, note)`.

### Tabela `public.perfume_scores`

- `id uuid primary key default gen_random_uuid()`;
- `perfume_id uuid not null`;
- `user_id uuid not null`;
- `category text not null` com a constraint de categoria;
- `metric_key text not null`;
- `score smallint`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`;
- foreign key composta `(perfume_id, user_id)` para `perfumes(id, user_id)` com `on delete cascade`;
- unicidade por `(perfume_id, category, metric_key)`;
- `score` aceita somente valores entre 0 e 100 ou nulo para “Não avaliado”.

As chaves válidas de cada categoria são validadas no servidor e na interface. A migration também restringe as chaves iniciais por categoria para evitar registros impossíveis.

## Segurança e RLS

Todas as tabelas habilitam RLS.

Políticas de `select`, `insert`, `update` e `delete` exigem:

```sql
(select auth.uid()) = user_id
```

Políticas de atualização usam `using` e `with check`. Tabelas filhas preservam `user_id` e a foreign key composta impede associar notas ou pontuações ao perfume de outro usuário.

Server Components, Server Actions e Route Handlers revalidam o usuário com `requireUser()`. O proxy continua sendo apenas uma camada de navegação, não a fronteira final de autorização.

## Bucket `perfume-images`

Configuração:

- privado;
- limite de 5 MB por arquivo;
- MIME types: `image/jpeg`, `image/png` e `image/webp`;
- um arquivo principal por perfume.

Padrão de caminho:

```text
{user_id}/{perfume_id}/cover.webp
```

Políticas em `storage.objects` permitem leitura, inserção, atualização e exclusão somente quando o primeiro segmento do caminho é igual a `auth.uid()::text`.

A aplicação gera URL assinada no servidor. A URL assinada nunca é persistida, pois possui expiração; somente `image_path` é salvo.

## Pesquisa e ingestão de imagens

Ordem de preferência:

1. página oficial da marca;
2. página oficial do produto ou distribuidor autorizado;
3. fotografia própria fornecida pelo usuário.

Imagens de resultados de busca, marketplaces e agregadores não são copiadas automaticamente quando não houver origem e autorização claras. Um bucket privado reduz redistribuição, mas não substitui permissão de uso.

Para cada imagem:

- registrar `image_source_url`;
- baixar a maior versão adequada disponível;
- validar tipo real do arquivo;
- remover metadados desnecessários;
- ajustar para uma caixa máxima de 1200 × 1200 px sem distorção;
- converter para WebP;
- manter fundo transparente ou neutro;
- enviar para o caminho estável do perfume.

O processo é idempotente: repetir a importação atualiza o mesmo `cover.webp`, sem criar duplicatas.

## Migração dos perfumes existentes

A migration de schema não contém um UUID de usuário fixo.

Depois da aplicação do schema, uma rotina de importação autenticada e idempotente:

1. recebe explicitamente o usuário de destino sem versionar credenciais;
2. lê os 16 registros de `INITIAL_PERFUMES`;
3. insere ou atualiza por `(user_id, legacy_key)`;
4. pesquisa e valida a fonte primária;
5. prepara e envia a imagem;
6. insere notas e pontuações disponíveis;
7. registra as URLs das fontes;
8. confirma contagens e vínculos;
9. somente depois remove a dependência do seed local.

Se uma imagem confiável não estiver disponível, o perfume é migrado com placeholder visual e permanece utilizável. A ausência de imagem não bloqueia a migração dos dados.

## Fluxos de mutação

### Favoritar

1. interface aplica estado otimista;
2. Server Action confirma usuário e propriedade;
3. atualiza `is_favorite`;
4. revalida `/colecao`, `/colecao/[id]` e `/dashboard`;
5. em erro, interface desfaz o estado otimista e anuncia a falha.

### Editar

1. página carrega o perfume com notas e pontuações;
2. formulário valida todos os campos;
3. Server Action confirma propriedade;
4. atualiza dados principais;
5. substitui notas e pontuações dentro de uma operação consistente;
6. uma nova imagem é enviada antes de substituir `image_path`;
7. falhas preservam o registro anterior sempre que possível;
8. sucesso redireciona ao detalhe.

### Excluir

1. usuário confirma em diálogo acessível;
2. Server Action confirma propriedade;
3. exclui o registro principal; tabelas filhas são removidas por cascade;
4. tenta remover o objeto do bucket;
5. falha na limpeza do Storage é registrada para correção, sem restaurar o perfume removido;
6. usuário retorna à coleção com mensagem de sucesso.

## Componentes e limites

- `CollectionPage`: Server Component que carrega a coleção ordenada.
- `CollectionView`: busca e filtros interativos sobre o conjunto recebido.
- `PerfumeCard`: apresentação e navegação; não acessa Supabase.
- `FavoriteButton`: mutação otimista isolada.
- `PerfumeDetailPage`: Server Component que carrega um perfume do proprietário.
- `PerfumeIdentity`: imagem, identificação e ações.
- `OlfactoryFamilyChips`: mapa de cores sólidas.
- `OlfactoryPyramid`: três níveis e alternativa textual.
- `PerformanceRadar`: gráfico SVG acessível, sem dependência externa inicialmente.
- `SuitabilityGrid`: ícones, cores e percentuais para estações, ocasiões e horários.
- `PerfumeForm`: contrato compartilhado por cadastro e edição.
- módulos de servidor em `src/features/perfumes`: queries, schemas, mutations e Storage.

Componentes visuais recebem dados tipados por props e não instanciam clientes Supabase.

## Estados e erros

- coleção vazia oferece “Adicionar perfume”;
- card sem imagem usa placeholder consistente;
- detalhe inexistente ou de outro usuário retorna `notFound()`;
- notas ou pontuações incompletas exibem “Não avaliado”;
- upload inválido mostra erro de tipo ou tamanho;
- falha de carregamento preserva o shell e oferece nova tentativa;
- exclusão exige confirmação explícita;
- todas as mutações anunciam sucesso ou erro por região `aria-live`.

## Acessibilidade

- cards são links identificáveis por teclado;
- botões internos possuem nomes acessíveis;
- foco visível em cards e ações;
- pirâmide possui estrutura textual equivalente;
- gráfico-aranha possui lista equivalente de métricas;
- cores sempre são acompanhadas por texto, ícone ou percentual;
- diálogo de exclusão prende foco e restaura o foco ao fechar;
- alvos de toque têm tamanho confortável;
- animações respeitam `prefers-reduced-motion`.

## Testes

### Banco e políticas

- constraints de inspiração;
- intervalo de pontuações;
- cascade de notas e pontuações;
- isolamento entre dois usuários;
- políticas de Storage por prefixo;
- leitura e mutação apenas pelo proprietário.

### Unidade

- schemas de cadastro e edição;
- ordenação favoritos primeiro e alfabética dentro de cada grupo;
- mapa de famílias para cores;
- agrupamento da pirâmide;
- validação das chaves e pontuações;
- transformação do seed legado.

### Componentes

- clique no card navega ao detalhe;
- favorito não dispara navegação;
- pirâmide apresenta três níveis;
- gráfico possui alternativa textual;
- estações e horários completos aparecem;
- formulário condiciona `inspired_by`;
- exclusão exige confirmação.

### Integração

- cadastrar, visualizar, editar, favoritar e excluir;
- upload e substituição de imagem;
- usuário não consegue abrir ou editar perfume de outro usuário;
- dashboard reflete contagens persistidas.

### Navegador

- três cards por linha em 1024 e 1440 px;
- dois cards em tablet e um em mobile;
- ausência de overflow horizontal;
- navegação por teclado;
- detalhe responsivo;
- fluxo autenticado completo.

## Critérios de aceite

- A coleção não depende de `localStorage` ou `INITIAL_PERFUMES` em produção.
- Os 16 perfumes existentes são migrados uma única vez para o usuário correto.
- Cada card abre uma página de detalhe, não um modal.
- A edição acontece em rota própria e altera o explicativo.
- A exclusão remove o perfume da estante após confirmação.
- Favoritos aparecem primeiro e em ordem alfabética.
- Não favoritos também permanecem em ordem alfabética.
- Desktop apresenta três cards por linha.
- A imagem de cada perfume vem do bucket privado.
- A tela mostra concentração, formato, inspiração e referência.
- Famílias aparecem em cores sólidas com texto.
- A pirâmide possui saída, coração e fundo em formato de pirâmide.
- O desempenho aparece em gráfico-aranha com alternativa textual.
- Todas as estações e horários exibem percentuais.
- Ocasiões avaliadas exibem ícones, cores e percentuais.
- RLS impede acesso cruzado entre usuários.
- Testes, lint, tipos e build passam.
- O Graphify é atualizado após as mudanças estruturais.
