# Entrega Sprint 1 - Contrato das opcoes reais

Esta entrega fecha o contrato para remodelar o painel `Ajustes da escolha / Qual e o plano?` usando somente dados reais ja presentes no projeto.

Nao houve alteracao funcional no Recomendador nesta sprint.

## Fontes revisadas

- `src/features/recommender/types.ts`
- `src/features/recommender/scoring-config.ts`
- `src/features/recommender/scoring.ts`
- `src/components/recommender/recommender-view.tsx`
- `src/features/perfumes/types.ts`
- `src/features/perfumes/constants.ts`
- `src/features/perfumes/schema.ts`
- `src/components/collection/perfume-form.tsx`
- `src/components/collection/suitability-grid.tsx`

## Inventario atual do painel

O painel atual usa selecao unica por grupo e expoe:

- `Ocasiao`: Trabalho, Encontro, Festa, Academia, Passeio, Formal.
- `Horario de uso`: Manha, Tarde, Fim de tarde, Noite, Dia inteiro.
- `Ambiente`: Ao ar livre, Fechado.
- `Intensidade`: Discreta, Equilibrada, Intensa.
- `Estilo`: Fresco, Elegante, Sensual, Doce, Casual.
- `Presenca`: Discreta, Marcante.
- `Objetivo`: Para o momento, Assinatura.

No contrato atual, `RecommenderSelection` guarda apenas uma string por grupo:

```ts
type RecommenderSelection = {
  ocasiao: string | null;
  horario: string | null;
  ambiente: string | null;
  intensidade: string | null;
  estilo: string | null;
  presenca: string | null;
  objetivo: string | null;
};
```

Esse formato nao atende a nova direcao, porque a pessoa pode querer combinar varias prioridades, por exemplo `Fixacao + Presenca` ou `Frescor + Elegancia`.

## Metricas reais disponiveis

### Desempenho

Fonte real: `PerfumeScore` com `category: "performance"`.

| Chave | Rotulo |
| --- | --- |
| `fixacao` | Fixacao |
| `projecao` | Projecao |
| `rastro` | Rastro |
| `versatilidade` | Versatilidade |
| `presenca` | Presenca |

### Perfil sensorial

Fonte real: campos percentuais de `PerfumeSummary`.

| Campo | Rotulo |
| --- | --- |
| `intensity` | Intensidade |
| `sweetness` | Docura |
| `freshness` | Frescor |
| `elegance` | Elegancia |
| `sensuality` | Sensualidade |

### Estacoes

Fonte real: `PerfumeScore` com `category: "season"`.

| Chave | Rotulo |
| --- | --- |
| `primavera` | Primavera |
| `verao` | Verao |
| `outono` | Outono |
| `inverno` | Inverno |

### Ocasioes

Fonte real: `PerfumeScore` com `category: "occasion"`.

| Chave | Rotulo de interface |
| --- | --- |
| `ar_livre` | Academia |
| `casual` | Casual |
| `encontro` | Encontro |
| `festa` | Festa |
| `formal` | Formal |
| `trabalho` | Trabalho |

Observacao: `ar_livre` em `occasion` hoje aparece como `Academia` no cadastro e no detalhe. Apesar do nome tecnico ser igual ao de ambiente, a categoria diferencia o significado.

### Melhor horario

Fonte real: `PerfumeScore` com `category: "time"`.

| Chave | Rotulo de interface |
| --- | --- |
| `manha` | Manha |
| `tarde` | Tarde |
| `noite` | Noite |
| `madrugada` | Dia inteiro |

Observacao: o cadastro e o detalhe usam `madrugada` com rotulo `Dia Inteiro`. A proxima sprint deve preservar o dado real existente, mas pode centralizar o rotulo para evitar espalhar essa equivalencia.

### Ambiente

Fonte real: `PerfumeScore` com `category: "environment"`.

| Chave | Rotulo |
| --- | --- |
| `ar_livre` | Ar livre |
| `fechado` | Fechado |

## Contrato final das selecoes

O novo painel deve trabalhar com selecao multipla por grupo. O contrato proposto para as proximas sprints e:

```ts
type RecommenderSelection = {
  performance: Array<
    "fixacao" | "projecao" | "rastro" | "versatilidade" | "presenca"
  >;
  sensory: Array<
    "intensity" | "sweetness" | "freshness" | "elegance" | "sensuality"
  >;
  seasons: Array<"primavera" | "verao" | "outono" | "inverno">;
  occasions: Array<
    "ar_livre" | "casual" | "encontro" | "festa" | "formal" | "trabalho"
  >;
  times: Array<"manha" | "tarde" | "noite" | "madrugada">;
  environments: Array<"ar_livre" | "fechado">;
};
```

Regras do contrato:

- Cada grupo aceita zero, uma ou varias opcoes selecionadas.
- Array vazio significa que o grupo nao deve influenciar o ranking.
- As opcoes selecionadas devem usar chaves tecnicas reais, nao rotulos.
- Os rotulos devem ficar centralizados em uma configuracao de UI/mapeamento.
- O motor deve calcular compatibilidade a partir dos valores reais dos perfumes.
- Nenhum dado do contexto automatico ou manual deve ser copiado para estas selecoes.

## Grupos e textos de interface

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

## Opcoes removidas

- `Passeio`: nao ha metrica real direta. Hoje ele e uma aproximacao composta de `casual` e `ar_livre`, entao deve sair do painel novo.
- `Fim de tarde`: nao ha metrica real direta. Hoje ele e uma aproximacao composta de `tarde` e `noite`, entao deve sair do painel novo.
- `Objetivo`: deve sair do novo painel porque `Para o momento` e `Assinatura` nao existem como metrica direta. A logica de versatilidade pode continuar existindo no motor, mas nao deve ser exposta como escolha sem contrato real nesta frente.
- Intensidade em faixas (`Discreta`, `Equilibrada`, `Intensa`): deve ser substituida pela escolha direta da metrica real `Intensidade`.
- Presenca em faixas (`Discreta`, `Marcante`): deve ser substituida pela escolha direta da metrica real `Presenca`.
- `Estilo`: deve ser substituido pelo grupo `Perfil sensorial`, usando as metricas reais `Frescor`, `Elegancia`, `Sensualidade` e `Docura`. `Casual` passa a pertencer somente a `Ocasioes`.

## Opcoes mantidas

Mantidas como dados reais, mas reorganizadas no novo contrato:

- Trabalho, Encontro, Festa, Academia, Formal e Casual em `Ocasioes`.
- Manha, Tarde, Noite e Dia inteiro em `Melhor horario`.
- Ar livre e Fechado em `Ambiente`.
- Fixacao, Projecao, Rastro, Versatilidade e Presenca em `Desempenho`.
- Intensidade, Docura, Frescor, Elegancia e Sensualidade em `Perfil sensorial`.
- Primavera, Verao, Outono e Inverno em `Estacoes`.

## Clima

Clima nao entra no painel `Ajustes da escolha`.

Cidade, temperatura, sensacao, clima, estacao, chuva e vento continuam pertencendo exclusivamente ao card superior `Seu momento`, com origem no contexto automatico ou manual conforme o modo ativo.

O filtro de `Estacoes` deste painel representa preferencia do usuario sobre as metricas cadastradas no perfume. Ele nao substitui a estacao ativa do contexto superior.

## Arquivos provaveis das proximas sprints

- `src/features/recommender/types.ts`: atualizar `RecommenderSelection` para arrays tipados.
- `src/features/recommender/scoring-config.ts`: substituir mapeamentos antigos por configuracao centralizada das opcoes reais.
- `src/features/recommender/scoring.ts`: calcular criterios a partir das selecoes multiplas.
- `src/features/recommender/reasons.ts`: ajustar motivos e alertas para as novas contribuicoes.
- `src/components/recommender/recommender-view.tsx`: remodelar o painel, estado de selecao e payload enviado ao motor.
- `src/components/recommender/recommender.module.css`: criar a nova apresentacao visual do painel.
- `src/components/recommender/recommender-view.test.tsx`: cobrir renderizacao, selecao multipla, ausencia de opcoes removidas e estado desatualizado.
- `src/features/recommender/scoring.test.ts`: cobrir pontuacao com selecoes multiplas.
- `src/features/recommender/reasons.test.ts`: cobrir novos motivos e alertas quando necessario.

## Riscos e limites conhecidos

- `occasion.ar_livre` e `environment.ar_livre` usam a mesma chave tecnica, mas categorias diferentes. O mapeamento deve sempre considerar `category + metricKey`.
- `time.madrugada` esta rotulado como `Dia inteiro`. A proxima sprint deve preservar compatibilidade com dados existentes e evitar renomear banco sem aprovacao.
- O grupo `Estacoes` no painel pode coexistir com a estacao do contexto superior. O motor precisa tratar esses sinais como criterios diferentes para nao duplicar peso de forma confusa.
- A selecao multipla aumenta o numero de combinacoes possiveis; a sprint do motor deve definir media, peso e redistribuicao quando um grupo estiver vazio.
- Nenhuma migration foi identificada como necessaria para esta remodelagem.
