# Diário de Uso — Fase 2

Esta coleção planeja a reformulação visual e funcional do atual menu `Jornada`.
O nome visível passa a ser `Diário de Uso`, porque o módulo registra experiências
reais e recorrentes, não uma jornada abstrata.

A Fase 1 em `docs/jornada-sprints/` permanece como histórico do contrato já
implementado. Esta Fase 2 reorganiza a experiência sem inventar dados, sem trocar
o modelo persistido e sem transformar o módulo em um dashboard administrativo.

## Diagnóstico

- O painel `Sua jornada` cresceu dentro da ficha do perfume e passou a competir
  com composição, desempenho e perfil sensorial.
- A rota principal mistura cabeçalho, abas, resumo, filtros, registros e
  Descobertas sem uma hierarquia editorial forte.
- O nome `Jornada` é genérico; `Diário de Uso` descreve diretamente o produto.
- A aba interna `Diário` ficaria redundante depois da renomeação do menu.
- Os dados existentes já sustentam uma visão geral, uma linha do tempo,
  Descobertas determinísticas e Memórias por fragrância.

## Direção do produto

O `Diário de Uso` terá três áreas claras:

1. `Visão geral`: leitura breve do período e acesso às Memórias Olfativas.
2. `Registros`: linha do tempo, busca, período e ações de cada uso.
3. `Descobertas`: padrões determinísticos derivados dos registros reais.

A Memória Olfativa deixa a ficha de detalhes e passa a viver na Visão geral do
Diário de Uso. Ela poderá apresentar o resumo de uma fragrância selecionada sem
criar um grande painel permanente para cada perfume.

## Princípios

- Preferir ritmo editorial, linhas, agrupamentos e tipografia a grades de cards.
- Mostrar poucos dados com hierarquia clara.
- Usar `Não encontrado` ou estados insuficientes quando o dado não existir.
- Nunca fabricar insights, porcentagens ou histórico.
- Preservar `/jornada` para evitar quebra de links; mudar apenas o nome visível.
- Manter filtros na URL e consultas autenticadas no servidor.
- Reutilizar regras, schemas e consultas existentes antes de criar contratos.
- Garantir desktop, tablet e mobile sem sobreposição ou rolagem horizontal.

## Ordem recomendada

1. `01-contrato-renomeacao.md`
2. `02-arquitetura-informacao.md`
3. `03-visao-geral-editorial.md`
4. `04-memoria-olfativa.md`
5. `05-registros-e-filtros.md`
6. `06-descobertas-integradas.md`
7. `07-migracao-do-detalhe.md`
8. `08-validacao-final.md`

## Como solicitar uma sprint

Para executar qualquer sprint, utilize sempre um único pedido como o exemplo
abaixo.

```text
Antes de iniciar, leia o arquivo docs/diario-de-uso-fase-2-sprints/README.md para entender as regras globais, os critérios de aceite e a forma de trabalho desta coleção de sprints.
Em seguida, execute somente a sprint descrita em docs/diario-de-uso-fase-2-sprints/XX-nome-da-sprint.md.
Não execute tarefas de outras sprints.

Antes de editar qualquer arquivo:
- use Graphify para localizar apenas as dependências necessárias;
- utilize skills somente quando forem adequadas ao tipo de trabalho;
- utilize plugins apenas quando houver benefício concreto na economia de tokens ou redução de leitura desnecessária.

Apresente um plano resumido da sprint antes de implementar.
Durante a implementação, mantenha-se estritamente dentro do escopo da sprint.
Ao final, execute apenas as validações previstas na própria sprint, atualize o Graphify com `graphify update .` quando houver alterações no código e encerre a execução.
```

## Contratos preservados

- rota protegida `/jornada`;
- tabela e RLS de `perfume_usage_entries`;
- criação, edição e exclusão de registros;
- filtros por período e fragrância;
- snapshots de perfumes removidos;
- regras determinísticas de Descobertas;
- resumo por fragrância já retornado por `getOwnJourneyPerfumeSummary`;
- isolamento dos dados pelo usuário autenticado.

## Fora do escopo da Fase 2

- novo modelo de banco sem necessidade comprovada;
- feed social, compartilhamento ou gamificação;
- textos gerados por IA;
- gráficos decorativos;
- metas e notificações;
- alteração do ranking do Recomendador;
- mudança da URL `/jornada`;
- dados editoriais ou históricos inventados.

## Critérios globais de aceite

- Menu, H1 e linguagem principal usam `Diário de Uso`.
- A navegação interna não repete a palavra `Diário`.
- A Memória Olfativa não aparece mais como painel na ficha do perfume.
- Visão geral, Registros e Descobertas têm responsabilidades distintas.
- Ações de registrar, editar e excluir continuam funcionando.
- Estados vazios e insuficientes são honestos.
- Layout permanece fluido de `320px` a desktop amplo.
- Testes, lint, typecheck e build são concluídos na validação final.
