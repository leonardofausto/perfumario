# Remodelagem dos ajustes de escolha do Recomendador

Esta pasta organiza a segunda frente do menu Recomendador: substituir o bloco atual `Ajustes da escolha / Qual e o plano?` por uma experiencia baseada nas metricas reais cadastradas nos perfumes.

A primeira colecao em `docs/recomendador-sprints/` fechou o contrato do ranking, motor de pontuacao, contexto automatico/manual, motivos, alertas, cards do Top 3 e estados finais. Esta nova colecao atua somente no painel de escolhas do usuario.

## Objetivo

Remodelar o bloco inferior esquerdo do Recomendador para usar criterios reais dos perfumes:

- Desempenho;
- Perfil sensorial;
- Estacoes;
- Ocasioes;
- Melhor horario;
- Ambiente.

O clima nao deve entrar neste bloco. Clima, cidade, temperatura e estacao ativa continuam vindo da area superior `Seu momento`, por contexto automatico ou manual.

## Como solicitar uma sprint

Para executar qualquer sprint, utilize sempre um unico pedido como o exemplo abaixo.

```text
Antes de iniciar, leia o arquivo docs/recomendador-ajustes-escolha-sprints/README.md para entender as regras globais, criterios de aceite e a forma de trabalho desta colecao de sprints.
Em seguida, execute somente a sprint descrita em docs/recomendador-ajustes-escolha-sprints/XX-nome-da-sprint.md.
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

1. `01-contrato-opcoes-reais.md`
2. `02-nova-interface-ajustes.md`
3. `03-integracao-motor-ajustes.md`
4. `04-validacao-visual-final.md`

## Regras globais

- Substituir as escolhas antigas quando elas nao existirem nos dados reais.
- Nao adicionar filtro de clima neste painel.
- Manter clima e estacao ativa vindos exclusivamente do contexto superior `Seu momento`.
- Usar selecao multipla dentro dos grupos quando fizer sentido para expressar prioridades do usuario.
- Nao criar metricas ficticias para o perfume.
- Nao alterar banco sem aprovacao explicita.
- Preservar a identidade visual atual do sistema, mas permitir remodelagem real do painel de escolhas.
- Manter o Top 3 calculado somente com perfumes da estante do usuario.
- Alterar escolhas depois de revelar o Top 3 deve manter ou reforcar o estado de resultado desatualizado.
- Ao modificar codigo, atualizar o Graphify com `graphify update .`.

## Opcoes alvo

### Desempenho

- Fixacao
- Projecao
- Rastro
- Versatilidade
- Presenca

### Perfil sensorial

- Intensidade
- Docura
- Frescor
- Elegancia
- Sensualidade

### Estacoes

- Primavera
- Verao
- Outono
- Inverno

### Ocasioes

- Academia
- Casual
- Encontro
- Festa
- Formal
- Trabalho

### Melhor horario

- Manha
- Tarde
- Noite
- Dia inteiro

### Ambiente

- Ar livre
- Fechado

## Criterios globais de aceite

- O painel `Qual e o plano?` deve parecer uma experiencia nova, nao apenas chips antigos reorganizados.
- As opcoes visiveis devem corresponder aos grupos alvo desta pasta.
- `Passeio` e `Fim de tarde` nao devem aparecer se nao houver metrica real correspondente.
- O clima nao deve ser exibido como filtro no painel de escolhas.
- Selecoes multiplas devem ser acessiveis por mouse e teclado.
- O motor deve consumir as novas escolhas sem copiar dados entre contexto automatico e manual.
- O ranking deve continuar explicavel e baseado em dados reais.
- Desktop e mobile devem permanecer sem sobreposicao, texto cortado indevido ou rolagem horizontal inesperada no layout principal.
