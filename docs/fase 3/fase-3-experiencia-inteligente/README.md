# Fase 3 — Experiência Inteligente

Esta pasta organiza a Fase 3 do Perfumário em sprints pequenas, independentes e executáveis uma por vez.

O objetivo desta fase é transformar o Perfumário de uma estante digital com cadastro e recomendação em uma experiência inteligente de acompanhamento da coleção, uso real, elogios, análises e decisões de reposição.

Esta fase impacta vários módulos do sistema:

- Visão geral;
- Minha estante;
- Recomendador;
- Diário de uso;
- Análises;
- navegação global;
- banco de dados;
- contratos de domínio;
- testes;
- documentação.

A Fase 3 não deve ser executada em uma única rodada. Cada sprint possui escopo próprio, critérios de aceite, validações e dependências explícitas.

---

## Resultado esperado da fase

Ao final desta fase, o usuário deverá conseguir:

- compreender rapidamente o estado atual da coleção;
- visualizar indicadores e gráficos dinâmicos;
- registrar usos reais de fragrâncias;
- associar elogios, ocasião, clima e satisfação a cada uso;
- acompanhar o histórico individual de cada perfume;
- identificar padrões de uso;
- acompanhar frascos e decants por níveis qualitativos;
- receber alertas sobre itens no final ou finalizados;
- informar intenção de reposição;
- usar o histórico real como critério secundário do Recomendador;
- navegar por uma estrutura de menus mais clara e profissional.

---

## Arquitetura de menus aprovada

A navegação principal desta fase será composta por:

1. `Visão geral`
2. `Minha estante`
3. `Recomendador`
4. `Diário de uso`
5. `Análises`

### Responsabilidade de cada módulo

#### Visão geral

Apresentar o estado atual da coleção por meio de indicadores, gráficos resumidos, destaques, tendências e alertas.

A Visão geral deve ser predominantemente representativa. Ela não deve assumir tarefas completas de cadastro ou gerenciamento.

#### Minha estante

Gerenciar fragrâncias, informações editoriais, favoritos, imagens, tipo de recipiente, nível qualitativo e intenção de reposição.

#### Recomendador

Calcular o Top 3 com base nos dados da fragrância, contexto ativo e histórico real do usuário, mantendo explicabilidade e sem inventar informações.

#### Diário de uso

Registrar usos, elogios, ocasião, horário, ambiente, clima, satisfação e observações.

#### Análises

Apresentar gráficos, comparativos e padrões derivados da coleção e do Diário de uso.

---

## Princípios globais

- Manter a identidade editorial do Perfumário.
- Evitar aparência de ERP genérico.
- Priorizar elementos visuais sobre blocos extensos de texto.
- Usar gráficos somente quando houver dado real suficiente.
- Utilizar botões segmentados para filtros.
- Evitar selects e dropdowns nos filtros principais das telas analíticas.
- Não inventar métricas.
- Não exibir precisão inexistente.
- Não usar mililitros para representar nível de frascos ou decants.
- Não exibir porcentagens de conteúdo restante.
- Manter cada módulo com responsabilidade clara.
- Evitar duplicar funcionalidades completas em vários menus.
- Dashboard não deve substituir Minha estante, Diário de uso ou Análises.
- Ações de escrita devem ocorrer no módulo responsável.
- Alertas podem aparecer em mais de um módulo, mas sua manutenção deve ocorrer em um único fluxo.
- Dados devem permanecer escopados ao usuário autenticado.
- Toda alteração de banco deve incluir migration, RLS, grants e testes.
- Toda alteração relevante de código deve atualizar o Graphify.

---

## Níveis qualitativos aprovados

Os níveis de frasco e decant serão:

- `Não informado`
- `Cheio`
- `Pela metade`
- `No final`
- `Acabou`

Esses estados podem usar valores internos apenas para renderização visual, mas não representam mililitros nem medições exatas.

Valores técnicos sugeridos para desenho de barra:

- `Não informado`: sem preenchimento mensurável;
- `Cheio`: preenchimento visual completo;
- `Pela metade`: preenchimento visual intermediário;
- `No final`: preenchimento visual baixo;
- `Acabou`: sem preenchimento.

A interface não deve exibir números ou porcentagens.

---

## Intenções de reposição

Quando um item estiver `No final` ou `Acabou`, o usuário poderá definir uma intenção.

Para frasco:

- Comprar novamente;
- Avaliar depois;
- Não pretendo repor.

Para decant:

- Comprar outro decant;
- Comprar o frasco;
- Avaliar depois;
- Não pretendo repor.

A intenção não deve alterar automaticamente o ranking do Recomendador.

---

## Regras para o Recomendador

O histórico real poderá participar do ranking como critério secundário ou de desempate.

Podem influenciar:

- quantidade de usos;
- elogios;
- satisfação;
- sucesso por ocasião;
- sucesso por clima;
- desempenho percebido;
- tempo desde o último uso.

Não devem influenciar automaticamente:

- nível do frasco;
- intenção de reposição;
- valor pago;
- tamanho da coleção;
- distribuição por marca;
- crescimento mensal da coleção.

O nível pode ser exibido como informação contextual sem reduzir a pontuação.

---

## Como solicitar uma sprint ao Codex

Use sempre um único pedido por sprint.

```text
Antes de iniciar, leia o arquivo docs\fase 3\fase-3-experiencia-inteligente/README.md para entender as regras globais, arquitetura, dependências, critérios de aceite e forma de trabalho desta fase.

Em seguida, execute somente a sprint descrita em docs\fase 3\fase-3-experiencia-inteligente/XX-nome-da-sprint.md.

Não execute tarefas de outras sprints.

Antes de editar qualquer arquivo:
- use Graphify para localizar apenas as dependências necessárias;
- leia os contratos, componentes, migrations, testes e estilos diretamente relacionados ao escopo;
- utilize skills somente quando forem adequadas ao tipo de trabalho;
- utilize plugins apenas quando houver benefício concreto;
- preserve os padrões existentes do projeto.

Apresente um plano resumido da sprint antes de implementar.

Durante a implementação:
- mantenha-se estritamente dentro do escopo da sprint;
- não antecipe funcionalidades futuras;
- não crie dados fictícios;
- não faça refatorações sem relação direta com o objetivo;
- mantenha dados privados escopados ao usuário autenticado.

Ao final:
- execute somente as validações previstas na sprint;
- atualize o Graphify com `graphify update .` quando houver alterações no código;
- informe arquivos alterados, decisões tomadas, validações executadas e pendências;
- encerre sem iniciar a próxima sprint.
```

---

## Ordem obrigatória

1. `01-descoberta-e-arquitetura.md`
2. `02-navegacao-e-contratos-globais.md`
3. `03-modelagem-diario-de-uso.md`
4. `04-interface-diario-de-uso.md`
5. `05-controle-de-niveis-e-reposicao.md`
6. `06-modelagem-das-analises.md`
7. `07-interface-de-analises.md`
8. `08-remodelagem-visao-geral.md`
9. `09-integracao-com-recomendador.md`
10. `10-polimento-visual-e-responsividade.md`
11. `11-testes-migracao-e-validacao-final.md`
12. `12-pendencias-de-validacao-e-liberacao.md`

---

## Dependências entre sprints

```text
01
└── 02
    ├── 03
    │   └── 04
    ├── 05
    └── 06
        └── 07

03 + 05 + 06 + 07
└── 08

03 + 06
└── 09

04 + 05 + 07 + 08 + 09
└── 10
    └── 11
        └── 12
```

Nenhuma sprint deve assumir que uma dependência futura já existe.

---

## Critérios globais de aceite

- A navegação principal utiliza os cinco menus aprovados.
- A Visão geral apresenta informação real e resumida.
- O Diário de uso permite criar e consultar registros privados.
- Os elogios são associados a um uso específico.
- Os níveis de frasco e decant são qualitativos.
- Nenhuma tela informa mililitros restantes.
- A intenção de reposição é persistida e editável.
- Análises usam somente dados reais.
- Filtros analíticos principais funcionam por botões.
- Gráficos reagem dinamicamente aos filtros.
- Estados vazios não exibem gráficos enganosos.
- O Recomendador usa histórico apenas conforme regras aprovadas.
- O sistema funciona com usuário sem registros de uso.
- Desktop e mobile não apresentam sobreposição ou scroll horizontal indevido.
- RLS impede acesso cruzado entre usuários.
- Lint, typecheck, testes e build passam ao final da fase.
- O Graphify está atualizado.

---

## Fora de escopo nesta fase

- medição exata em ml;
- integração com balanças ou sensores;
- compra automática;
- catálogo público;
- rede social;
- compartilhamento público de usos;
- gamificação extensa;
- importação automática de histórico externo;
- inteligência preditiva sem dados reais;
- notificações push obrigatórias;
- recomendação baseada em preço;
- alteração automática de estoque por quantidade de borrifadas.

---

## Convenções de documentação

Cada sprint deve conter:

- objetivo;
- contexto;
- escopo;
- fora de escopo;
- descoberta obrigatória;
- regras de domínio;
- proposta técnica;
- experiência de interface;
- arquivos prováveis;
- migrações e segurança;
- testes;
- critérios de aceite;
- validações finais;
- saída esperada.

Os arquivos prováveis são referências para descoberta e não autorização para editar sem inspeção.

---

## Encerramento da fase

A Fase 3 somente será considerada concluída quando:

- todas as sprints forem executadas;
- migrations estiverem aplicadas e validadas;
- RLS estiver testado;
- estados vazios estiverem tratados;
- responsividade estiver validada;
- integração com Recomendador estiver explicável;
- testes automatizados estiverem passando;
- build de produção estiver concluído;
- documentação estiver atualizada.
- as pendências ambientais e de segurança da Sprint 12 estiverem resolvidas ou
  registradas como bloqueios objetivos para deploy.
