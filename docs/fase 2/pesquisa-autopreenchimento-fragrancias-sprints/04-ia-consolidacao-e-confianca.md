# Sprint 4 - IA, consolidacao e confianca

Objetivo: transformar evidencias em uma resposta estruturada, validada e auditavel, sem confiar diretamente no modelo.

## Escopo

- Integrar o SDK/modelo aprovado na Sprint 1 exclusivamente no backend.
- Enviar apenas consulta, enums reais, rubricas, URLs, titulos e conteudo permitido dentro dos limites.
- Separar instrucao confiavel do sistema e conteudo externo delimitado como dado nao confiavel.
- Solicitar saida estruturada compatível com o schema da Sprint 2.
- Validar a resposta; permitir no maximo uma tentativa de reparo estruturado e retornar erro controlado se continuar invalida.
- Consolidar valores por prioridade de fonte, consenso, conflito e inferencia.
- Preservar valores concorrentes nos metadados sem combinar piramides indiscriminadamente.
- Calcular confianca por campo e geral sem aumentar artificialmente a cobertura.
- Classificar Original, Inspiracao ou Dupe apenas com evidencia suficiente; similaridade isolada nao basta.
- Gerar explicativo autoral, curto e sustentado, sem copiar texto extenso.

## Guardas obrigatorias

- A IA nao pode retornar/aplicar `bottleFormat` ou imagem.
- Original limpa a referencia.
- Inspiracao/Dupe usam somente nome da referencia, sem marca.
- Ausencia de dado produz `null`/ausente e metadado `unavailable`, nunca invencao.
- Conflitos reduzem confianca e geram aviso.

## Testes obrigatorios

- Saida valida, parcial e totalmente invalida.
- Uma unica tentativa de reparo.
- Divergencia e prioridade entre fontes.
- Inferencia identificada e confianca reduzida.
- Prompt injection em conteudo externo ignorada.
- Piramide oficial prevalecendo sem fusao artificial.
- Similaridade isolada classificada como Original.
- Fakhar Black com referencia normalizada para `Y Eau de Parfum`.
- Nenhum dado proibido no resultado.

## Fora do escopo

- Rota consumida pelo frontend, cache, rate limit e UI.

## Validacao

- Testes deterministas com modelo simulado.
- Teste real opcional e controlado somente com credencial aprovada, custo delimitado e resultado rotulado como amostra, nao como garantia geral.
- Typecheck e `graphify update .`.
