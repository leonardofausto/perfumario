# Sprint 5 - Interface do Top 3

Objetivo: substituir o estado vazio por cards de ranking ricos, preservando o painel lateral atual.

## Escopo

- Manter o painel `Top 3 da sua colecao`.
- Antes do calculo, manter o estado vazio existente.
- Apos o calculo, exibir ate tres cards com:
  - posicao;
  - imagem;
  - nome;
  - marca;
  - compatibilidade em porcentagem;
  - barra visual de compatibilidade;
  - ate tres motivos;
  - um ponto de atencao quando relevante;
  - acao para abrir detalhes do perfume.
- Usar estilos do `recommender.module.css`, preservando cores, tipografia, bordas e espacamentos atuais.
- Garantir que cards funcionem com imagem ausente.
- Garantir que textos nao quebrem o layout em desktop e mobile.

## Fora do escopo

- Alterar formula de pontuacao.
- Alterar contexto automatico ou manual.
- Criar nova pagina de detalhes.
- Buscar perfumes fora da estante carregada.

## Validacao

- Testar ranking com imagem e sem imagem.
- Testar um, dois e tres cards.
- Testar clique/acao de abrir detalhes.
- Testar barra de compatibilidade com percentuais baixos, medios e altos.
- Verificar responsividade em desktop e mobile.
- `npm.cmd test -- src/components/recommender/recommender-view.test.tsx`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
