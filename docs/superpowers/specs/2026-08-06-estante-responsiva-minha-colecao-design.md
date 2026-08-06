# Estante responsiva de Minha coleção

## Objetivo

Redesenhar a galeria de **Minha coleção** para apresentar os perfumes como objetos sobre uma prateleira contínua, aumentar a densidade da coleção e preservar integralmente foto, marca e nome em qualquer largura de tela.

## Direção visual aprovada

A galeria adota a opção **A — Prateleira contínua**:

- fundo quente e discreto associado ao interior de uma estante;
- uma lâmina de madeira sob cada fileira, com profundidade sugerida por sombra;
- ausência de nichos individuais ou molduras pesadas;
- frascos centralizados e visualmente apoiados na prateleira;
- controles e tipografia subordinados às imagens dos perfumes.

A prateleira é construída com CSS e tokens visuais do projeto. Não depende de uma imagem decorativa externa.

## Grade responsiva

A grade usa colunas explícitas por faixa para manter uma composição previsível:

- desktop amplo: 4 perfumes por linha;
- tablet e desktop estreito: 3 colunas quando houver largura suficiente e 2 colunas antes de chegar ao mobile;
- mobile: exatamente 2 perfumes por linha, inclusive nas menores larguras suportadas pelo aplicativo;
- a grade nunca apresenta rolagem horizontal.

Os espaçamentos e paddings diminuem no mobile para preservar duas colunas sem reduzir a legibilidade. Os cards podem crescer verticalmente quando um nome exigir mais linhas.

## Imagens

- A área da imagem é menor que a implementação atual e mantém proporção estável.
- O frasco usa `object-fit: contain`; nunca é cortado, esticado ou deformado.
- O espaço reservado para a imagem evita mudança de layout durante o carregamento.
- A configuração responsiva de `sizes` acompanha quatro colunas no desktop e duas no mobile.
- O fallback sem imagem permanece identificável e proporcional à nova área visual.

## Marca e nome

Marca e nome são informações essenciais e permanecem sempre visíveis:

- não usar `line-clamp`;
- não usar `text-overflow: ellipsis`;
- não usar `white-space: nowrap`;
- não aplicar alturas fixas que cortem texto;
- permitir quebra natural e, para palavras excepcionalmente longas, quebra segura sem transbordamento;
- manter marca, nome e foto dentro do card em todas as larguras.

Cards da mesma linha acompanham a altura do item mais alto por comportamento natural da grade, preservando o alinhamento da prateleira.

## Ações do card

No desktop e tablet, as ações atuais permanecem visíveis individualmente:

- favoritar;
- editar;
- excluir.

No mobile:

- favoritar permanece como ação direta;
- editar e excluir ficam em um menu de três pontos;
- o menu tem rótulo acessível associado ao perfume;
- abrir, navegar e fechar o menu funciona por teclado;
- os alvos interativos preservam área de toque adequada;
- excluir continua exigindo a confirmação já existente.

O menu móvel não altera as rotas nem as ações de domínio existentes.

## Componentes e responsabilidades

- `CollectionView` continua responsável por filtros, ordenação, paginação e composição da grade.
- `PerfumeCard` continua responsável pela apresentação e pelas ações de um perfume.
- O menu de ações móvel é isolado no card ou em um pequeno componente dedicado, sem duplicar regras de negócio.
- `collection.module.css` concentra a grade, a aparência da prateleira e os breakpoints.

Nenhuma alteração no banco de dados, nos contratos de `PerfumeSummary` ou nas rotas é necessária.

## Acessibilidade e interação

- todos os botões preservam nomes acessíveis específicos para o perfume;
- foco de teclado permanece visível;
- o menu informa estado aberto/fechado e fecha com Escape e clique fora;
- a ordem de foco segue a ordem visual;
- efeitos de hover não são necessários para descobrir informações ou ações;
- transições respeitam `prefers-reduced-motion`.

## Estratégia de testes

### Testes de componente

- marca e nome completos aparecem no card;
- o card não introduz uma versão abreviada do nome;
- favoritar continua acionando a operação existente;
- editar e excluir permanecem disponíveis;
- o menu móvel expõe rótulos acessíveis e mantém a confirmação de exclusão;
- prioridade de imagens continua restrita aos primeiros itens visíveis.

### Testes visuais e responsivos

Validar pelo navegador ao menos:

- desktop amplo com 4 colunas;
- largura intermediária com transição para 3 e 2 colunas;
- mobile estreito com exatamente 2 colunas;
- perfume com marca e nome longos, sem reticências ou cortes;
- cards com e sem imagem;
- menu de três pontos aberto no mobile;
- ausência de rolagem horizontal.

## Critérios de aceite

1. A coleção apresenta uma prateleira contínua reconhecível e coerente com a identidade atual.
2. Desktop amplo exibe quatro perfumes por linha.
3. Mobile exibe sempre dois perfumes por linha.
4. Nenhum nome ou marca é abreviado, truncado ou substituído por reticências.
5. Fotos ficam completas, proporcionais e menores que na galeria atual.
6. Desktop mantém as três ações visíveis.
7. Mobile mantém o coração visível e reúne editar/excluir no menu de três pontos.
8. A página funciona sem rolagem horizontal e preserva navegação por teclado.

## Fora de escopo

- alterar filtros, ordenação ou paginação;
- mudar dados, rotas ou persistência;
- redesenhar as páginas de detalhe, criação ou edição;
- introduzir imagens de madeira baixadas ou novos serviços externos.
