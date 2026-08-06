# Sprint 2 - Contratos, normalizacao e rubricas

Objetivo: criar o nucleo deterministico e testado que transforma resultados externos em dados compativeis com o Perfumario.

## Pre-condicao

- Sprint 1 aprovada, incluindo nomes reais, dependencias escolhidas e decisao de nulabilidade de `bottleFormat`.

## Escopo

- Criar tipos e schemas separados para consulta, fonte, valor por campo, conflitos, avisos e resposta consolidada.
- Reutilizar enums e constantes atuais em vez de duplicar listas.
- O schema de saida deve omitir por construcao `bottleFormat` e imagem.
- Normalizar:
  - nome e marca;
  - concentracao, categoria e publico;
  - ano;
  - relacao e referencia;
  - piramide em strings unidas exatamente por ` - `;
  - acordes em linhas `Nome: valor`, sem `%`, sem duplicidade e em ordem decrescente;
  - inteiros e clamp de 0 a 100.
- Implementar a regra `original -> inspiredBy = null`.
- Para `inspiration` ou `dupe`, remover marca/fabricante/prefixos da referencia e rejeitar resultado vazio.
- A remocao de marca deve usar marca de referencia sustentada pelos dados da fonte; nao cortar palavras por coincidencia cega.
- Codificar rubricas de fixacao, projecao, rastro, versatilidade, presenca, perfil sensorial e uso.
- Definir metadados por campo: valor, confianca, origem, fontes, conflitos e inferencia.
- Corrigir o novo cadastro para nao assumir Frasco, incluindo schema/persistencia somente conforme a decisao da Sprint 1. Registros existentes devem continuar validos.

## Testes obrigatorios

- Normalizacao de nome, concentracao, publico e categoria.
- Piramide com separador exato, remocao de vazios/duplicados e preservacao de acentos.
- Acordes no formato exato, ordenacao, deduplicacao e valores validos.
- Clamp e coerencia basica das rubricas.
- `original` sempre sem referencia.
- Inspiracao e Dupe exigindo referencia.
- Remocao da marca da referencia.
- Fakhar Black -> `Y Eau de Parfum`, nunca `Yves Saint Laurent Y Eau de Parfum`.
- Perfume apenas semelhante permanecendo Original.
- Ausencia estrutural de `bottleFormat` e imagem.
- Novo cadastro sem default de formato; edicao preservando o valor carregado.

## Fora do escopo

- Rede, providers, IA, endpoint, cache e interface de busca.

## Validacao

- Executar os testes unitarios novos e os testes focados de schema/formulario afetados.
- Executar typecheck.
- Atualizar o Graphify.
