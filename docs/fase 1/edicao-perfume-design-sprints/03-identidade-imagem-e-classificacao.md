# Sprint 3 - Identidade, imagem e classificacao

Objetivo: melhorar o primeiro contato da edicao, deixando foto, marca, nome, formato, concentracao, relacao e classificacao mais escaneaveis.

## Escopo

- Transformar o bloco de imagem em um painel de capa mais forte e profissional.
- Manter a substituicao de arquivo simples, com informacao clara de que a imagem atual sera preservada.
- Garantir dimensoes estaveis para a miniatura e evitar layout shift.
- Agrupar identidade:
  - marca;
  - nome do perfume;
  - concentracao;
  - formato na estante;
  - relacao com outra fragrancia;
  - perfume de referencia quando aplicavel.
- Agrupar classificacao:
  - ano de lancamento;
  - categoria;
  - publico;
  - familias olfativas;
  - explicativo.
- Padronizar labels, selects, inputs e texto auxiliar.
- Melhorar chips de familias para parecerem parte do sistema visual, nao um elemento solto.
- Manter o comportamento condicional de `inspirationKind` sem apagar dados de forma silenciosa fora do contrato atual.

## Fora do escopo

- Buscar imagem na internet.
- Criar autocomplete de marca, familia ou perfume de referencia.
- Alterar schema ou campos persistidos.
- Reescrever a area de notas e acordes.

## Validacao

- Testes de renderizacao dos campos de identidade e classificacao.
- Testes do comportamento Original, Inspiracao e Dupe.
- Testes de tags/chips se o componente for alterado.
- Verificacao visual de nome longo e marca longa.
- `npm.cmd test` focado.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
