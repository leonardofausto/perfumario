# Sprint 1 - Descoberta e decisoes de arquitetura

Objetivo: analisar integralmente os contratos relevantes e produzir um diagnostico executavel antes de qualquer implementacao.

## Escopo

- Ler instrucoes, `package.json`, configuracoes, documentacao e arquitetura relacionada.
- Usar `graphify query`, `graphify explain` e, quando necessario, `graphify path` para mapear formulario, rotas de novo/edicao, schema, tipos, actions, queries, Supabase, testes, estilos e variaveis de ambiente.
- Confirmar nomes e representacoes reais de todos os campos solicitados.
- Auditar especialmente:
  - `bottleFormat` obrigatorio e o default `full_bottle`;
  - nulabilidade no banco/RPC e impacto de manter o novo cadastro vazio;
  - `inspirationKind` e `inspiredBy`;
  - chaves internas versus rotulos de ocasioes e horarios;
  - formato atual de notas, acordes e percentuais;
  - limites de Server Actions versus Route Handlers para um fluxo longo.
- Inventariar infraestrutura existente para cache, rate limiting, observabilidade e integracoes de IA.
- Avaliar provedores de pesquisa permitidos, termos, APIs, custos, disponibilidade regional e necessidade de chaves. Nao contratar nem configurar servicos nesta sprint.
- Escolher, com justificativa, o desenho minimo para pesquisa, extracao, cache e limites.

## Entrega obrigatoria

Criar um documento de descoberta dentro desta pasta contendo:

- diagnostico curto;
- arquitetura atual e fluxo de dados;
- arquivos que as proximas sprints provavelmente criarao e alterarao;
- matriz campo de formulario -> tipo/schema -> persistencia -> representacao do autofill;
- decisao para manter `bottleFormat` vazio sem quebrar registros existentes;
- provider de pesquisa recomendado e alternativas;
- modelo/SDK de IA recomendado e alternativas;
- cache/rate limit recomendados conforme infraestrutura real;
- variaveis de ambiente previstas, sem valores secretos;
- riscos legais, tecnicos, financeiros e de qualidade;
- criterios para considerar uma fonte realmente funcional.

## Decisoes que nao podem ser adiadas

- A resposta de autofill nao possui `bottleFormat` nem imagem.
- A referencia e um nome de fragrancia sem marca.
- A busca exige nome e aceita marca opcional.
- O endpoint roda somente no backend e valida entrada e saida.
- A interface sempre mostra previa e nunca dispara persistencia.

## Fora do escopo

- Codigo, migracoes, dependencias, chaves, endpoint, providers ou UI.
- Alteracao dos documentos das sprints seguintes, salvo correcao factual indispensavel.

## Validacao

- Confirmar cada descoberta com codigo, schema, migracao, documentacao oficial ou teste existente.
- Marcar claramente o que esta confirmado, proposto ou ainda limitado.
- Nao executar lint/build, pois esta sprint e exclusivamente documental.
