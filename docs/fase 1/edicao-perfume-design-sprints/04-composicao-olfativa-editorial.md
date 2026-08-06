# Sprint 4 - Composicao olfativa editorial

Objetivo: fazer a area de notas e acordes parecer uma composicao olfativa de verdade, mantendo a edicao simples e confiavel.

## Escopo

- Reorganizar notas de saida, coracao e fundo como camadas conectadas.
- Manter textareas editaveis, mas melhorar sua leitura visual e alinhamento.
- Criar ou ajustar preview das notas para mostrar a piramide sem depender de dados novos.
- Melhorar a edicao de acordes principais:
  - manter textarea se for a opcao menos arriscada;
  - reforcar o formato `nome: intensidade`;
  - mostrar preview em barras com hierarquia clara;
  - tratar score vazio como nao informado.
- Evitar que a area fique estreita demais no desktop ou alta demais no mobile.
- Padronizar os textos auxiliares e erros da area.
- Garantir que nomes de acordes longos nao quebrem o layout.

## Fora do escopo

- Criar parsing complexo ou autocomplete.
- Validar fontes externas de notas.
- Alterar dados existentes ou preencher campos vazios.
- Mexer em desempenho, quando usar ou perfil sensorial.

## Validacao

- Testes de parsing/preview de acordes se houver mudanca.
- Testes de hidden input `notes` e `scores` se a estrutura mudar.
- Verificacao visual com poucos acordes, muitos acordes, score vazio e nome longo.
- `npm.cmd test` focado.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
