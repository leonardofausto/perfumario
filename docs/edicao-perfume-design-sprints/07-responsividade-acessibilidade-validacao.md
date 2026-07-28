# Sprint 7 - Responsividade, acessibilidade e validacao final

Objetivo: revisar a experiencia inteira depois das sprints visuais e fechar a qualidade da tela de edicao.

## Escopo

- Revisar a tela inteira contra as Web Interface Guidelines.
- Conferir labels, nomes, autocomplete, inputmode, tipos de input, foco visivel e erros inline.
- Conferir hierarquia de headings, legends e fieldsets.
- Conferir que botoes usam `<button>` e navegacao usa `<Link>` ou `<a>`.
- Conferir que imagens tem `alt`, dimensoes estaveis e nao causam layout shift.
- Conferir que animacoes, se existirem, respeitam `prefers-reduced-motion`.
- Conferir longos conteudos:
  - nome de perfume longo;
  - marca longa;
  - muitos acordes;
  - notas longas;
  - chips longos;
  - campos vazios.
- Fazer varredura visual em desktop, tablet e mobile.
- Remover inconsistencias finais de tipografia, espacamento, cor, radius e contraste.
- Atualizar testes que ficaram desalinhados com a nova estrutura visual.

## Fora do escopo

- Implementar novos campos.
- Alterar o fluxo de criacao ou edicao alem da tela ja redesenhada.
- Criar novas telas.
- Fazer refatoracoes amplas fora dos componentes tocados pelas sprints anteriores.

## Validacao

- `npm.cmd test` focado nos arquivos alterados.
- `npm.cmd test`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `npm.cmd run build`.
- Verificacao responsiva em 320px, 375px, 768px, 1024px e 1280px quando o ambiente permitir.
- Verificacao visual/manual da tela de edicao com dados completos e dados parciais.
- `graphify update .`.
