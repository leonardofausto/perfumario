# Sprint 05 — Controle de níveis e reposição

## Objetivo

Adicionar acompanhamento qualitativo de frascos e decants sem utilizar ml ou porcentagens.

## Dependência

Executar após as Sprints 01 e 02.

## Escopo

- Modelar nível qualitativo.
- Modelar intenção de reposição.
- Criar migration quando necessário.
- Atualizar cadastro ou detalhe da fragrância.
- Criar controle por botões.
- Criar barra visual.
- Criar alertas.
- Integrar com Minha estante.
- Preparar resumo para Visão geral.
- Criar testes.

## Estados

- Não informado
- Cheio
- Pela metade
- No final
- Acabou

## Regra visual

A barra é apenas representação qualitativa.

Não exibir:

- ml;
- volume estimado;
- porcentagem;
- cálculo de borrifadas restantes;
- previsão exata de término.

## Tipo de recipiente

O controle deve respeitar:

- frasco;
- decant.

Reutilizar o campo atual do projeto quando existir.

## Intenções

### Frasco

- Comprar novamente
- Avaliar depois
- Não pretendo repor

### Decant

- Comprar outro decant
- Comprar o frasco
- Avaliar depois
- Não pretendo repor

## Regras

- Intenção é opcional.
- Intenção pode ser definida quando o nível estiver `No final` ou `Acabou`.
- Alterar o nível para `Cheio` não deve apagar intenção sem confirmação, salvo regra aprovada.
- `Não informado` não gera alerta.
- `Cheio` e `Pela metade` não geram alerta crítico.
- `No final` gera alerta de atenção.
- `Acabou` gera alerta de ação.
- Nível não altera automaticamente o Recomendador.
- O usuário pode desativar acompanhamento da intenção, se o modelo exigir.

## Minha estante

Nos cards, mostrar apenas indicador quando:

- No final;
- Acabou.

No detalhe, mostrar:

- tipo;
- nível;
- barra;
- intenção;
- última atualização.

## Visão geral

Preparar consultas para:

- itens no final;
- itens acabados;
- itens com intenção de compra;
- itens sem decisão.

A UI completa da Visão geral será feita na Sprint 08.

## Fora de escopo

- compras;
- preços;
- links de lojas;
- notificações push;
- decremento automático;
- estoque em ml;
- múltiplos frascos da mesma fragrância.

## Testes

- persistência de cada nível;
- `Não informado`;
- intenção compatível com tipo;
- alertas corretos;
- isolamento por usuário;
- alteração de tipo;
- responsividade;
- acessibilidade dos botões;
- ausência de porcentagem.

## Critérios de aceite

- Níveis aparecem corretamente.
- Barra muda conforme o estado.
- Nenhuma precisão falsa é mostrada.
- Intenção é persistida.
- Alertas derivam de dados reais.
- Minha estante permanece compacta.
- Usuário pode editar o nível no detalhe.
- Typecheck e testes passam.

## Validações

- migration e RLS, quando houver;
- testes unitários;
- testes de componente;
- e2e do fluxo;
- lint;
- typecheck;
- build;
- `graphify update .`.
