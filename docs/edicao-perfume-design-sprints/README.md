# Redesign da edicao de perfume por sprints

Esta pasta quebra a melhoria visual da tela de edicao de perfume em sprints pequenas, independentes e executaveis uma por vez. A meta e manter todos os topicos atuais da ficha, mas transformar a experiencia em uma tela mais moderna, profissional, consistente e rapida de revisar.

As capturas atuais mostram que a tela ja tem os dados principais, porem ainda parece simples demais: secoes com densidades diferentes, titulos sem o mesmo padrao visual, areas vazias em excesso, inputs numericos sem leitura editorial, composicao olfativa pouco aproveitada e uma hierarquia que nao ajuda o olhar a entender prioridade.

## Como solicitar uma sprint

Para executar qualquer sprint, utilize sempre um unico pedido como o exemplo abaixo.

```text
Antes de iniciar, leia o arquivo docs/edicao-perfume-design-sprints/README.md para entender as regras globais, criterios de aceite e a forma de trabalho desta colecao de sprints.
Em seguida, execute somente a sprint descrita em docs/edicao-perfume-design-sprints/XX-nome-da-sprint.md.
Nao execute tarefas de outras sprints.

Antes de editar qualquer arquivo:
- use Graphify para localizar apenas as dependencias necessarias;
- use a skill de frontend-design para orientar direcao visual quando houver decisao de layout, tipografia, cor ou microinteracao;
- use a skill web-design-guidelines para revisar acessibilidade, formulario, foco, conteudo, imagens e estados interativos;
- utilize plugins apenas quando houver beneficio concreto na economia de tokens ou reducao de leitura desnecessaria.

Apresente um plano resumido da sprint antes de implementar.
Durante a implementacao, mantenha-se estritamente dentro do escopo da sprint.
Ao final, execute apenas as validacoes previstas na propria sprint, atualize o Graphify com `graphify update .` quando houver alteracoes no codigo e encerre a execucao.
```

## Ordem recomendada

1. `01-direcao-visual-e-inventario.md`
2. `02-shell-e-navegacao-da-ficha.md`
3. `03-identidade-imagem-e-classificacao.md`
4. `04-composicao-olfativa-editorial.md`
5. `05-metricas-e-quando-usar.md`
6. `06-perfil-sensorial-e-acoes.md`
7. `07-responsividade-acessibilidade-validacao.md`

## Regras globais

- Nao remover nenhum topico existente: imagem, identidade, descricao, classificacao, familias, notas, acordes, desempenho, quando usar, perfil sensorial, tags, cancelar e salvar.
- Melhorar visualizacao e padronizacao antes de adicionar novas funcionalidades.
- Preservar a identidade do Perfumario, mas evitar uma tela bege/serifada generica; a ficha deve parecer um instrumento profissional de curadoria olfativa.
- Manter a edicao fiel aos dados reais: nao inventar familias, notas, explicativos ou metricas.
- Diferenciar valor zero de campo vazio ou nao informado.
- Manter registros antigos funcionando.
- Padronizar todos os titulos de secao com a mesma estrutura semantica e visual.
- Aproximar campos relacionados e reduzir grandes vazios, especialmente em desktop.
- Usar grids responsivos com dimensoes estaveis para inputs, chips, barras, previews e acoes.
- Priorizar labels claros, foco visivel, erros inline, estados de salvamento e navegacao por teclado.
- Ao modificar codigo, atualizar o Graphify com `graphify update .`.

## Direcao visual alvo

- Conceito: uma bancada de edicao olfativa, com a foto do frasco, blocos de dados escaneaveis e pequenas leituras visuais dos percentuais.
- Paleta: fundo neutro claro, superficie branca quente, tinta grafite, verde profundo para acao, cobre discreto para marcadores, azul-petroleo ou oliva frio como contraste secundario.
- Tipografia: display usada com mais contencao nos grandes titulos; labels, numeros e chips devem usar uma voz utilitaria e consistente.
- Assinatura visual: um trilho lateral ou superior de "camadas da ficha" que mostra as secoes como partes de uma ficha tecnica, sem transformar a pagina em um wizard bloqueado.
- Densidade: desktop deve parecer uma mesa de trabalho organizada; mobile deve virar uma sequencia limpa de paineis, sem scroll horizontal.

## Criterios globais de aceite

- A tela fica visualmente mais profissional sem perder nenhum campo.
- Todos os topicos aparecem com padrao de titulo, descricao, espacamento e alinhamento coerentes.
- A imagem do perfume vira um ponto forte no topo, sem ocupar espaco inutil.
- Identidade, classificacao e relacao com outra fragrancia ficam em um bloco compacto e escaneavel.
- Composicao olfativa deixa de parecer um conjunto solto de textareas e passa a ter leitura de piramide + acordes.
- Desempenho, Quando usar e Perfil sensorial usam barras, medidores ou campos numericos mais claros, mantendo edicao simples.
- A barra de acoes continua acessivel durante rolagem e funciona bem em mobile.
- Acessibilidade, foco, labels, erros e estados de salvamento seguem as Web Interface Guidelines.
- Desktop, tablet e mobile nao apresentam sobreposicao, texto cortado indevido ou scroll horizontal.
- Lint, typecheck, testes focados e build passam ao final da sequencia completa.
