# Sprint 6 - Estados, responsividade e validacao final

Objetivo: fechar a remodelagem com estados de carregamento, erro, resultado desatualizado e validacao ampla.

## Escopo

- Exibir carregamento durante o calculo do ranking.
- Desabilitar `Revelar meu Top 3` enquanto estiver processando.
- Manter erros climaticos amigaveis sem quebrar a tela.
- Informar quando contexto automatico ainda precisa ser ativado ou atualizado.
- Permitir que o usuario use contexto manual quando automatico falhar.
- Marcar ranking como desatualizado quando filtros ou contexto ativo mudarem depois do calculo.
- Conferir desktop, tablet e mobile.
- Revisar textos para evitar promessas alem dos dados disponiveis.

## Fora do escopo

- Criar novas metricas de perfume.
- Alterar banco sem aprovacao explicita.
- Reescrever visual geral do Recomendador.
- Implementar historico de recomendacoes.

## Validacao

- `npm.cmd test`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `npm.cmd run build`.
- Teste manual do contexto automatico quando o navegador permitir geolocalizacao.
- Teste manual do contexto manual substituindo o automatico.
- Teste manual de estante vazia, um perfume, dois perfumes e tres ou mais perfumes.
- Verificacao visual desktop e mobile.
- `graphify update .`.

## Entrega final esperada

- Resumo dos arquivos alterados.
- Formula de pontuacao implementada.
- Campos reais usados.
- Campos ausentes ou mapeados de forma aproximada.
- Limitacoes conhecidas e proximos ajustes recomendados.
