# Remodelagem do Recomendador por sprints

Esta pasta quebra a remodelagem do menu Recomendador em sprints pequenas, independentes e executaveis uma por vez. A meta e transformar o painel atual em um recomendador real de Top 3 por compatibilidade, usando somente perfumes da estante do usuario e somente dados realmente cadastrados.

O prompt amplo envolve contrato de dados, motor de pontuacao, contexto automatico/manual, desempate, motivos explicaveis, estados de carregamento, UI do ranking, responsividade, testes e build. Executar tudo em uma unica rodada aumenta o risco de misturar regras, inventar dados ou quebrar o contexto climatico. Por isso, cada sprint deve ser pedida e executada isoladamente.

## Como solicitar uma sprint

Para executar qualquer sprint, utilize sempre um unico pedido como o exemplo abaixo.

```text
Antes de iniciar, leia o arquivo docs/recomendador-sprints/README.md para entender as regras globais, criterios de aceite e a forma de trabalho desta colecao de sprints.
Em seguida, execute somente a sprint descrita em docs/recomendador-sprints/XX-nome-da-sprint.md.
Nao execute tarefas de outras sprints.

Antes de editar qualquer arquivo:
- use Graphify para localizar apenas as dependencias necessarias;
- utilize skills somente quando forem adequadas ao tipo de trabalho;
- utilize plugins apenas quando houver beneficio concreto na economia de tokens ou reducao de leitura desnecessaria.

Apresente um plano resumido da sprint antes de implementar.
Durante a implementacao, mantenha-se estritamente dentro do escopo da sprint.
Ao final, execute apenas as validacoes previstas na propria sprint, atualize o Graphify com `graphify update .` quando houver alteracoes no codigo e encerre a execucao.
```

## Ordem recomendada

1. `01-descoberta-contrato.md`
2. `02-motor-pontuacao.md`
3. `03-integracao-contexto-ranking.md`
4. `04-motivos-alertas.md`
5. `05-interface-top3.md`
6. `06-estados-validacao-final.md`

## Regras globais

- Usar somente perfumes pertencentes a estante do usuario.
- Nao criar perfumes, percentuais, motivos ou dados editoriais ficticios.
- Nao misturar contexto automatico e manual; apenas o modo ativo participa do calculo.
- O modo manual so fica ativo quando o usuario clicar em `Usar contexto manual`.
- O clima e a estacao devem vir do contexto ativo, nao de novos filtros na tela.
- Reutilizar os campos reais existentes antes de propor qualquer alteracao de banco.
- Ignorar campos ausentes sem erro e redistribuir pesos apenas entre criterios com dados validos.
- Nao favorecer perfume apenas por ter mais campos preenchidos.
- Manter zero como valor real e distinto de campo vazio ou nao informado.
- Preservar o layout e identidade visual atuais do Recomendador.
- Evitar colocar toda a logica dentro de `recommender-view.tsx`.
- Ao modificar codigo, atualizar o Graphify com `graphify update .`.

## Dados reais ja identificados

- `PerfumeSummary` usado hoje no Recomendador contem: identidade, imagem, favorito, `intensity`, `sweetness`, `freshness`, `elegance`, `sensuality` e `profileTags`.
- `PerfumeScore[]` contem percentuais por categoria: `performance`, `season`, `occasion`, `time`, `environment` e `accord`.
- `PerfumeScore[]` hoje aparece no detalhe (`PerfumeDetail`), mas nao esta em `PerfumeSummary`; o contrato do Recomendador precisa ser ampliado antes de usar desempenho, estacoes, ocasioes, horarios e ambientes no ranking.
- Metricas reais em `constants.ts`:
  - desempenho: `fixacao`, `projecao`, `rastro`, `versatilidade`, `presenca`;
  - estacoes: `primavera`, `verao`, `outono`, `inverno`;
  - ocasioes: `ar_livre`, `casual`, `encontro`, `festa`, `formal`, `trabalho`;
  - horarios: `manha`, `tarde`, `noite`, `madrugada`;
  - ambientes: `ar_livre`, `fechado`.
- Itens da UI sem chave direta confirmada no cadastro atual: `Academia`, `Passeio`, `Fim de tarde` e `Dia inteiro`. Essas opcoes precisam de mapeamento explicito ou ajuste de contrato em sprint propria.

## Criterios globais de aceite

- O Top 3 e calculado a partir da estante real do usuario.
- O ranking usa o contexto ativo, automatico ou manual, sem copiar valores entre modos.
- Perfumes com dados incompletos participam sem quebrar a tela.
- Estante vazia, um perfume, dois perfumes e tres ou mais perfumes tem estados corretos.
- O usuario consegue entender por que cada perfume foi recomendado.
- Motivos e alertas nascem dos criterios de pontuacao, nao de frases aleatorias.
- Alterar filtros depois de gerar o ranking marca o resultado como desatualizado ou exige novo clique para recalcular.
- Desktop e mobile permanecem sem sobreposicao, texto cortado indevido ou scroll horizontal inesperado.
- Testes focados, lint, typecheck e build passam ao final da sequencia completa.
