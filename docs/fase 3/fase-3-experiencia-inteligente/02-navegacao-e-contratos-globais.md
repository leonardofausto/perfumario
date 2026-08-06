# Sprint 02 — Navegação e contratos globais

## Objetivo

Preparar a estrutura global da Fase 3: navegação, rotas, contratos compartilhados e estados de compatibilidade, sem implementar os módulos completos.

## Dependência

Executar após a Sprint 01.

## Escopo

- Renomear menus conforme arquitetura aprovada.
- Adicionar rotas vazias ou shells dos novos módulos.
- Ajustar sidebar desktop.
- Ajustar navegação mobile.
- Preservar estados ativos.
- Preservar acessibilidade de navegação.
- Criar contratos globais compartilhados.
- Criar enums ou unions para níveis qualitativos.
- Criar contratos para intenção de reposição.
- Criar contratos-base para registros de uso.
- Criar contratos-base para agregações analíticas.
- Definir feature flags temporárias quando necessário.
- Evitar telas quebradas durante implementação incremental.

## Menus aprovados

- Visão geral
- Minha estante
- Recomendador
- Diário de uso
- Análises

## Regras de navegação

- A rota inicial autenticada deve apontar para Visão geral.
- Minha estante substitui apenas a nomenclatura de Coleção, sem perder funcionalidades.
- Recomendador mantém sua função atual.
- Diário de uso recebe rota própria.
- Análises recebe rota própria.
- O usuário deve identificar o item ativo.
- Ícones devem ser Lucide ou padrão equivalente existente.
- Não usar emojis.
- Títulos não devem quebrar sem necessidade.

## Contratos obrigatórios

### Nível qualitativo

```ts
type ContainerLevel =
  | "unknown"
  | "full"
  | "half"
  | "low"
  | "empty";
```

### Tipo de recipiente

Reutilizar o contrato atual, se existir. Caso não exista:

```ts
type ContainerType = "bottle" | "decant";
```

### Intenção de reposição

A intenção deve ser compatível com tipo de recipiente.

Não persistir rótulos traduzidos como regra de negócio. Persistir chaves estáveis.

### Registro de uso

Criar apenas contratos-base. Não criar migration nesta sprint, salvo se a arquitetura aprovada exigir contrato gerado diretamente do banco.

## Interface temporária

Rotas ainda não implementadas devem exibir:

- H1 do módulo;
- subtítulo curto;
- mensagem de funcionalidade em construção;
- navegação funcional;
- sem dados simulados;
- sem cards falsos.

## Fora de escopo

- CRUD do Diário.
- Gráficos.
- Dashboard final.
- Integração com Recomendador.
- Migration completa.
- Alertas de reposição.
- Lógica analítica.

## Testes

- Navegação desktop.
- Navegação mobile.
- Item ativo.
- Rotas protegidas.
- Redirecionamento de usuário não autenticado.
- Tipos compartilhados.
- Ausência de regressão em Minha estante e Recomendador.

## Critérios de aceite

- Os cinco menus aparecem.
- As rotas carregam sem erro.
- Nenhum módulo mostra dados fictícios.
- Minha estante preserva recursos existentes.
- Navegação mobile continua funcional.
- Contratos possuem nomes estáveis.
- Níveis qualitativos não usam ml ou porcentagem.
- Typecheck passa.

## Validações

- testes focados de navegação;
- lint dos arquivos alterados;
- typecheck;
- build apenas se a alteração de rotas exigir;
- `graphify update .`.
