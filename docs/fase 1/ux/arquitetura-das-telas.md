# Diretriz de UX - Arquitetura das telas

Antes de implementar uma nova tela ou alterar uma tela existente no fluxo de fragrancias, valide a responsabilidade da interface.

## Principio fundamental

Cada tela deve possuir uma responsabilidade principal.

Evite concentrar consulta, edicao e gerenciamento na mesma interface. O usuario deve entender rapidamente se a tela serve para gerenciar, editar ou conhecer uma fragrancia.

Quando houver duvida:

- Se a acao muda o registro, ela pertence a Colecao ou ao Cadastro.
- Se a acao organiza dados de entrada, ela pertence ao Cadastro.
- Se o conteudo ajuda a entender a fragrancia, ele pertence aos Detalhes.
- Acoes de navegacao, como voltar, podem existir onde forem necessarias.

## Responsabilidade por tela

### Colecao

Objetivo: gerenciar a estante de fragrancias.

Responsabilidades:

- Navegar pela colecao.
- Buscar e filtrar fragrancias.
- Favoritar.
- Editar.
- Excluir.

O clique no card deve abrir a tela de detalhes. Acoes administrativas devem acontecer na colecao, de forma discreta e sem competir com a imagem da fragrancia.

### Cadastro

Objetivo: criar ou editar informacoes da fragrancia.

Responsabilidades:

- Inserir dados.
- Atualizar informacoes.
- Organizar campos em grupos logicos.
- Priorizar rapidez e clareza de edicao.

O cadastro deve ser tratado como editor, nao como tela de consulta. Campos, controles e validacoes devem favorecer entrada de dados.

### Detalhes

Objetivo: apresentar a fragrancia.

Responsabilidades:

- Mostrar informacoes de forma progressiva.
- Priorizar leitura e consulta.
- Contar a historia da fragrancia.
- Apoiar descoberta e comparacao sensorial.

Evite acoes administrativas nos detalhes. A tela deve ter carater editorial e servir apenas para consulta, mantendo somente a navegacao necessaria.

## Hierarquia da informacao

Toda tela deve respeitar esta ordem de importancia:

1. Conteudo principal.
2. Informacoes complementares.
3. Metadados.
4. Acoes administrativas.

Nao destaque metadados acima do conteudo principal. Dados tecnicos devem apoiar a leitura, nao conduzir a experiencia.

## Organizacao visual

Sempre que possivel:

- Utilize grupos de informacao em vez de multiplos cards.
- Aproveite a largura da tela antes de aumentar a altura da pagina.
- Use colunas quando as informacoes forem complementares.
- Reserve largura total para conteudos naturalmente extensos.
- Evite repetir a mesma informacao em locais diferentes.

## Componentes e interacao

Priorize:

- Espacamento.
- Hierarquia tipografica.
- Alinhamento.
- Agrupamento logico.
- Estados de foco e interacao claros.

Evite:

- Excesso de bordas.
- Cards dentro de cards.
- Elementos decorativos sem funcao.
- Botoes duplicados.
- Acoes repetidas em telas diferentes.

## Filosofia do projeto

O sistema deve transmitir a sensacao de um catalogo editorial premium de fragrancias, nao de um painel administrativo generico.

Cada tela deve ser especializada:

- Colecao: gerenciar.
- Cadastro: editar.
- Detalhes: apresentar.

Essa separacao deve orientar decisoes futuras de UX, interface e organizacao de conteudo.
