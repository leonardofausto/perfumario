# Sprint 2 - Shell e navegacao da ficha

Objetivo: transformar a pagina em uma ficha de edicao mais profissional, com topo, trilho de secoes e acoes persistentes bem resolvidos.

## Escopo

- Reestruturar o topo da tela para reduzir o impacto exagerado do H1 em nomes longos.
- Manter o link Voltar, mas alinhar seu peso visual com o restante da tela.
- Criar um shell de edicao com largura, grid e ritmo de espacamento consistentes.
- Padronizar todos os cabecalhos de secao com o mesmo componente ou mesma estrutura.
- Avaliar um trilho de secoes ou indice lateral/superior para desktop, sem transformar o fluxo em wizard.
- Manter a rolagem natural e permitir que o usuario veja o progresso da ficha.
- Revisar a barra sticky de acoes:
  - salvar com icone;
  - cancelar como navegacao;
  - estado pendente;
  - safe area no mobile;
  - contraste e foco.
- Corrigir grandes vazios de desktop usando grids mais intencionais.

## Fora do escopo

- Redesenhar campos internos de composicao, metricas ou tags.
- Alterar regras de salvamento.
- Criar abas que escondam secoes obrigatorias sem necessidade.

## Validacao

- Teste focado de renderizacao da pagina/formulario se a estrutura mudar.
- Verificacao visual em desktop e mobile quando o ambiente permitir.
- Conferir sem scroll horizontal em 320px, 375px, 768px, 1024px e 1280px.
- `npm.cmd test` focado nos componentes alterados.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
