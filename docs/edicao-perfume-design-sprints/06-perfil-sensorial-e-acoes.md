# Sprint 6 - Perfil sensorial e acoes

Objetivo: finalizar a leitura do perfil geral e deixar as acoes de cancelar/salvar com acabamento de produto.

## Escopo

- Redesenhar Perfil sensorial com o mesmo padrao das demais metricas:
  - intensidade;
  - docura;
  - frescor;
  - elegancia;
  - sensualidade.
- Melhorar Tags de perfil como um campo de chips consistente com Familias olfativas.
- Criar uma leitura visual compacta para o perfil sem esconder os inputs.
- Revisar mensagens de formulario:
  - erros inline;
  - mensagem geral com `role="status"` ou `aria-live`;
  - estado pendente de salvamento.
- Refinar a barra final:
  - cancelar com hierarquia secundaria;
  - salvar como acao primaria;
  - texto "Salvar alteracoes" com acento se a base ja estiver em UTF-8;
  - spinner ou estado visual durante `pending`;
  - foco e hover claros.
- Garantir que a barra sticky nao cubra campos no fim da pagina.

## Fora do escopo

- Criar historico de alteracoes.
- Criar autosave.
- Alterar actions de create/update fora do necessario para preservar estado visual.
- Mexer no shell global da aplicacao.

## Validacao

- Testes de renderizacao do perfil sensorial e tags.
- Testes de estado pendente se houver ajuste no botao.
- Verificacao de teclado ate o ultimo campo e ate salvar/cancelar.
- Verificacao de safe area e mobile.
- `npm.cmd test` focado.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
