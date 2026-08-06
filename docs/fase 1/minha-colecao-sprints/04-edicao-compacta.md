# Sprint 4 - Tela de edicao compacta

Objetivo: reorganizar a tela de edicao para reduzir rolagem e aproximar conteudos relacionados.

## Escopo

- Reorganizar secoes:
  - Identidade e apresentacao;
  - Descricao e classificacao;
  - Composicao olfativa;
  - Desempenho;
  - Quando usar;
  - Perfil sensorial;
  - Imagem, revisao e acoes.
- Trazer a imagem para o inicio da tela, com miniatura atual, acao de substituicao e aviso de manutencao da imagem quando nenhum arquivo novo for selecionado.
- Adicionar ao formulario os campos persistidos na sprint de banco.
- Separar Desempenho de Quando usar.
- Usar inputs numericos para percentuais, aceitando vazio e limitando 0 a 100.
- Transformar familias olfativas em tags/chips quando compativel com os dados atuais.
- Melhorar edicao de acordes principais com preview em tempo real ou manter textarea com validacao e preview, escolhendo a opcao menos arriscada.
- Tornar a barra de acoes acessivel durante rolagem, respeitando mobile e safe area.
- Condicionar o campo Perfume de referencia a relacoes como Inspiracao ou Dupe, sem apagar dados silenciosamente.

## Fora do escopo

- Pagina de detalhes.
- Substituicao do radar.
- Novas migracoes.
- Autocomplete completo, se isso aumentar demais a complexidade. Pode ficar documentado como melhoria posterior.

## Validacao

- Testes de renderizacao dos novos campos.
- Testes de salvamento dos novos campos.
- Testes de relacao Original, Inspiracao e Dupe.
- Testes de tags e acordes.
- Verificacao responsiva minima em 320px, 375px, 768px, 1024px e 1280px quando o ambiente permitir.
- `npm.cmd test` focado.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
