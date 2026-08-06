# Sprint 1 - Descoberta e contrato de dados

Objetivo: confirmar o contrato real do Recomendador antes de implementar o motor de pontuacao.

## Escopo

- Usar Graphify para localizar `RecommenderView`, pagina do Recomendador, queries de perfumes, tipos, constantes, schema, actions e testes existentes.
- Confirmar como `listOwnPerfumes()` filtra a estante atual do usuario.
- Mapear quais campos chegam hoje ao Recomendador via `PerfumeSummary`.
- Confirmar onde `PerfumeScore[]` e carregado hoje e decidir a menor alteracao segura para disponibilizar esses scores ao Recomendador.
- Mapear divergencias entre opcoes da UI e chaves reais do cadastro:
  - UI `Academia` sem chave direta em `OCCASION_METRICS`;
  - UI `Passeio` sem chave direta em `OCCASION_METRICS`;
  - UI `Fim de tarde` sem chave direta em `TIME_METRICS`;
  - UI `Dia inteiro` sem chave direta em `TIME_METRICS`;
  - `OCCASION_METRICS` possui `ar_livre`, enquanto ambiente tambem possui `ar_livre`.
- Definir os tipos do contexto ativo que o motor consumira, sem alterar comportamento dos botoes.

## Fora do escopo

- Implementar motor de pontuacao.
- Alterar visual do Top 3.
- Criar migracoes.
- Alterar cadastro de perfumes.
- Remover ou renomear filtros da tela.

## Entrega

- Plano tecnico curto com:
  - arquivos afetados;
  - campos reais disponiveis;
  - campos ausentes ou divergentes;
  - decisao sobre como carregar `PerfumeScore[]` no Recomendador;
  - assinatura proposta para o motor de pontuacao;
  - estrategia de testes.

## Validacao

- Confirmar que todos os campos citados no prompt foram classificados como disponiveis, ausentes ou dependentes de mapeamento.
- Confirmar se sera necessario criar um novo tipo como `RecommenderPerfume`.
- Confirmar que nenhuma mudanca de banco e obrigatoria para a primeira versao do ranking.
- Nao executar build completo nesta sprint, a menos que a descoberta indique necessidade.
