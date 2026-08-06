# Sprint 04 — Interface do Diário de uso

## Objetivo

Criar a experiência completa de registro, consulta, edição e exclusão de usos.

## Dependência

Executar após a Sprint 03.

## Escopo

- Tela principal do Diário de uso.
- Botão principal de registrar uso.
- Formulário de registro.
- Histórico em lista ou linha do tempo.
- Filtros por botões.
- Busca por fragrância, se necessária.
- Edição.
- Exclusão.
- Estados vazios.
- Loading e erro.
- Responsividade.
- Acessibilidade.

## Diretriz visual

A tela deve ser editorial, compacta e visual.

Evitar:

- formulário enorme;
- excesso de texto;
- selects em cascata;
- cards dentro de cards;
- emojis;
- tabelas densas no mobile.

## Cabeçalho

```text
Diário de uso
Registre e acompanhe suas experiências.
```

## Registro de uso

O formulário deve priorizar:

1. fragrância;
2. data e horário;
3. ocasião;
4. período;
5. ambiente;
6. elogios;
7. satisfação;
8. desempenho percebido;
9. clima;
10. observação.

## Controles

Usar botões segmentados para:

- ocasião;
- período;
- ambiente;
- elogios rápidos;
- satisfação;
- desempenho.

O seletor de fragrância pode usar busca acessível, pois a coleção pode crescer.

## Elogios

Permitir:

- zero;
- um;
- dois;
- três;
- quatro ou mais.

O valor persistido deve continuar numérico.

## Histórico

Cada registro deve mostrar de forma compacta:

- imagem;
- fragrância;
- data;
- ocasião;
- elogios;
- satisfação;
- clima resumido, quando disponível;
- ações.

Não repetir informações ausentes.

## Filtros

Filtros principais por botões:

- Hoje;
- 7 dias;
- 30 dias;
- Este ano;
- Tudo.

Filtros secundários podem incluir:

- Com elogios;
- Sem elogios;
- Mais recentes;
- Mais antigos.

## Estado vazio

Deve explicar o benefício do Diário sem inventar estatísticas.

A ação principal deve abrir o registro.

## Relação com a Dashboard

Não adicionar o formulário completo na Visão geral.

A Visão geral pode apontar para o Diário.

## Fora de escopo

- Gráficos avançados.
- Recomendações.
- Nível de frasco.
- Notificações.
- Calendário complexo.
- Gamificação.

## Testes

- criar uso;
- editar uso;
- excluir uso;
- zero elogios;
- campos opcionais;
- validações;
- filtros;
- paginação;
- estado vazio;
- mobile;
- teclado;
- leitor de tela nos controles.

## Critérios de aceite

- Fluxo de registro é rápido.
- Botões segmentados funcionam.
- Dados são persistidos.
- Histórico atualiza sem recarregamento desnecessário.
- Usuário não acessa registros alheios.
- Interface não exibe dados falsos.
- Mobile não possui scroll horizontal.
- Formulário não exige clima.
- Zero elogios é exibido corretamente.

## Validações

- testes de componente;
- testes de action;
- e2e do fluxo principal;
- lint;
- typecheck;
- build;
- `graphify update .`.
