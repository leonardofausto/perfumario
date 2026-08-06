# Sprint 7 - Edicao, comparacao e aplicacao seletiva

Objetivo: integrar a busca na edicao sem apagar ou sobrescrever dados existentes sem consentimento por campo.

## Escopo

- Reutilizar integralmente o pipeline e a UI base da Sprint 6.
- Comparar valor atual e encontrado com normalizacao apropriada por tipo.
- Exibir somente diferencas relevantes, com valor atual, encontrado, confianca, origem, conflitos e inferencia.
- Permitir selecionar tudo, desmarcar tudo e escolher campo por campo.
- Campos existentes ficam preservados por padrao ate selecao e aplicacao explicitas.
- Campos iguais nao precisam ser tratados como alteracao.
- `bottleFormat` e imagem nao aparecem na lista e nunca mudam.
- Aplicar relacao/referencia como uma unidade coerente:
  - selecionar Original implica limpar referencia;
  - Inspiracao/Dupe exigem referencia valida sem marca;
  - nao permitir estado intermediario incoerente.
- Depois de aplicar, permitir edicao manual e manter o salvamento no botao normal do formulario.
- Uma nova busca substitui apenas a previa, nunca o cadastro persistido.

## Testes obrigatorios

- Pesquisa no modo edicao.
- Preservacao de todos os campos por padrao.
- Selecao individual, selecionar tudo e desmarcar tudo.
- Comparacao de texto, enum, numero, notas, acordes e grupos de scores.
- Aplicacao somente dos campos selecionados.
- Formato e imagem ausentes e inalterados.
- Troca para Original limpando/desabilitando referencia.
- Inspiracao/Dupe com referencia sem marca.
- Edicao manual posterior.
- Ausencia de autosave, redirect ou Server Action de persistencia.
- Resultados parciais e conflitos revisaveis.

## Fora do escopo

- Mudancas de regra no pipeline e novos providers, salvo correcao de defeito descoberta por teste.

## Validacao

- Testes focados do formulario em edicao e fluxo compartilhado.
- Lint dos arquivos tocados, typecheck e verificacao visual/teclado.
- `graphify update .`.
