# Sprint 12 — Pendências de validação e liberação

## Objetivo

Resolver as pendências registradas pela Sprint 11 e produzir uma decisão final,
baseada em evidências, sobre a liberação da Fase 3 para deploy.

Esta sprint não cria novas funcionalidades. Seu escopo é completar validações
que dependem do ambiente, tratar conscientemente o histórico legado e fechar a
configuração de segurança do Supabase Auth.

## Dependência

Executar somente após a Sprint 11 e usar como referência:

- `README.md` desta fase;
- `relatorio-final.md`;
- migrations de `perfume_usage_entries` e `usage_logs`;
- testes SQL e E2E existentes.

## Resultado esperado

Ao final da sprint:

- os cenários E2E privados terão sido executados com dados reais e consentidos;
- nenhum dado criado exclusivamente para validação permanecerá no ambiente;
- os 2 registros legados terão um destino explicitamente aprovado;
- a proteção contra senhas vazadas estará habilitada e verificada;
- os testes SQL terão sido repetidos localmente, se o Docker estiver disponível;
- o relatório final indicará objetivamente se a Fase 3 está pronta para deploy.

## Ordem obrigatória de execução

1. Auditar o ambiente e registrar o estado inicial.
2. Fechar a cobertura E2E com dados reais.
3. Decidir e executar, somente se aprovada, a destinação dos registros legados.
4. Habilitar e verificar a proteção contra senhas vazadas.
5. Repetir os gates finais e atualizar a documentação.

As etapas não devem ser executadas em paralelo quando compartilharem a conta
E2E ou o banco remoto.

## Bloco 1 — Auditoria inicial

### Descoberta obrigatória

Antes de editar ou alterar estado:

- executar consultas Graphify focadas nos testes E2E e contratos das tabelas;
- revisar `playwright.config.ts`, `.env.example` e os arquivos em `tests/e2e`;
- confirmar quais cenários estão sendo pulados e a razão de cada skip;
- consultar, sem expor credenciais, a conta dedicada e os dados privados que ela possui;
- consultar os 2 registros de `perfume_usage_entries` e seus perfumes relacionados;
- confirmar o estado atual da proteção contra senhas vazadas;
- verificar a disponibilidade do Docker e do Supabase local;
- registrar o status do worktree e preservar alterações preexistentes.

### Evidências mínimas

- quantidade de perfumes, usos e registros legados da conta em escopo;
- lista dos skips E2E atuais;
- estado do Docker;
- resultado dos advisors de segurança e performance;
- alinhamento das migrations locais e remotas.

Nenhuma consulta deve imprimir senhas, tokens, chaves administrativas ou
conteúdo privado desnecessário.

## Bloco 2 — Cobertura E2E com dados reais

### Cenários obrigatórios

- Diário: criar, editar, filtrar e excluir um uso privado.
- Análises: alternar período e dimensão com dados reais.
- Nível: alterar nível qualitativo em desktop e mobile e restaurar o valor original.
- Recomendador: aplicar contexto manual e revelar o ranking com candidato real.
- Shell e estados vazios: preservar os cenários já aprovados.
- Responsividade: manter as larguras 320, 375, 768, 1024 e 1440 px.

### Regras para os dados

- usar somente uma conta dedicada a testes;
- usar perfumes reais e consentidos já pertencentes à conta;
- não copiar dados pessoais de outro usuário;
- não inventar métricas editoriais, histórico ou origem de fragrâncias;
- dados transitórios de uso podem ser criados pelo teste somente quando forem
  identificáveis, privados e removidos no próprio fluxo;
- capturar o estado original antes de alterações;
- executar restauração em `finally` ou mecanismo equivalente;
- se a restauração automática falhar, interromper a sprint e limpar somente os
  registros identificados daquela execução;
- não manter fixtures permanentes apenas para fazer o teste passar.

### Configuração

- manter `E2E_USER_EMAIL` e `E2E_USER_PASSWORD` somente em ambiente não versionado;
- usar `E2E_PERFUME_ID` apenas para um perfume real da conta dedicada;
- não registrar valores secretos no relatório;
- não remover skips de funcionalidades deliberadamente desativadas, como o
  preenchimento assistido oculto por configuração.

### Critério do bloco

Os cenários privados da Fase 3 devem passar sem skips causados por ausência de
perfume ou histórico. Skips de funcionalidades fora do escopo ou desativadas
devem continuar explícitos e justificados.

## Bloco 3 — Destinação de `perfume_usage_entries`

### Decisão obrigatória

Antes de criar migration ou alterar dados, apresentar ao usuário:

1. os campos existentes nos 2 registros;
2. os campos obrigatórios de `usage_logs` que não possuem correspondência;
3. o perfume e proprietário associados, sem expor informação privada além do necessário;
4. as alternativas e seus efeitos.

### Alternativas permitidas

#### A. Preservação legada

- manter os registros e a tabela;
- documentar que eles não participam do Diário e das Análises da Fase 3;
- impedir remoção acidental;
- não duplicar registros em `usage_logs`.

#### B. Conversão assistida

- solicitar ao responsável os valores ausentes de cada registro;
- mostrar uma prévia completa da conversão;
- exigir aprovação antes de persistir;
- inserir de forma idempotente e rastreável;
- conferir a associação ao mesmo usuário e perfume;
- preservar a origem legada para auditoria;
- somente depois da conferência decidir se o registro antigo permanece arquivado.

### Proibições

- não inferir ocasião, horário, ambiente, clima ou satisfação;
- não usar valores padrão apenas para satisfazer constraints;
- não excluir a tabela ou os registros sem backup e aprovação explícita;
- não converter registros de outro usuário;
- não misturar esta decisão com refatorações do Diário.

### Critério do bloco

O destino deve estar aprovado e documentado. Caso a decisão seja preservação,
nenhuma mutation é necessária. Caso seja conversão, migrations, RLS, grants,
testes e rollback devem acompanhar qualquer alteração estrutural.

## Bloco 4 — Proteção contra senhas vazadas

### Escopo

- confirmar a recomendação atual do Supabase para proteção contra senhas comprometidas;
- habilitar a proteção no projeto correto;
- verificar que login, redefinição de senha e conta E2E continuam funcionando;
- repetir o advisor de segurança;
- registrar a mudança sem revelar configurações sensíveis.

### Segurança operacional

- não alterar provedores, templates, política de convite ou duração de sessão;
- não redefinir senhas de usuários comuns;
- se a conta E2E precisar de nova senha, alterar somente a conta dedicada e
  atualizar apenas o ambiente local ou secreto correspondente;
- não reduzir requisitos de senha para manter compatibilidade com uma credencial antiga.

### Critério do bloco

O advisor não deve mais apresentar
`auth_leaked_password_protection`. Qualquer incompatibilidade encontrada deve
ser reportada antes de alterar outra configuração de autenticação.

## Bloco 5 — Supabase local

Se o Docker estiver disponível:

```powershell
supabase start
supabase db reset
supabase test db
```

Adaptar os comandos à CLI instalada sem alterar o conteúdo dos testes apenas
para fazê-los passar localmente.

Se o Docker continuar indisponível:

- registrar o impedimento com a mensagem real;
- não substituir esse gate por uma alegação de sucesso;
- repetir os testes SQL no remoto dentro de transações com rollback;
- manter a validação local como pendência operacional, sem bloquear os gates
  remotos que já possuam evidência equivalente.

## Arquivos prováveis

Referências para descoberta, não autorização automática de edição:

- `playwright.config.ts`;
- `.env.example`;
- `tests/e2e/analytics.spec.ts`;
- `tests/e2e/container-status.spec.ts`;
- `tests/e2e/recommender-history.spec.ts`;
- `tests/e2e/usage-diary.spec.ts`;
- `tests/e2e/phase-3-visual-polish.spec.ts`;
- `supabase/migrations/20260731185626_create_perfume_usage_entries.sql`;
- `supabase/migrations/20260803193538_usage_logs.sql`;
- `supabase/tests/usage_logs_rls.sql`;
- `supabase/tests/analytics_snapshot.sql`;
- `README.md`;
- `docs/fase 3/fase-3-experiencia-inteligente/relatorio-final.md`.

## Fora de escopo

- novas métricas ou gráficos;
- alterações no algoritmo do Recomendador;
- importação automática de histórico;
- criação de um sistema genérico de fixtures;
- exclusão automática de dados legados;
- redesign de telas;
- mudanças de autenticação além da proteção contra senhas vazadas;
- deploy antes da decisão final;
- tarefas de uma eventual Fase 4.

## Testes e validações

Executar somente após concluir os blocos aplicáveis:

```powershell
npm.cmd run check:stable
npm.cmd run test:policy
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
graphify update .
```

Também executar:

- testes SQL de RLS e análises;
- listagem local/remota das migrations;
- advisors de segurança e performance;
- `git diff --check`;
- verificação de que nenhum registro transitório do E2E permaneceu.

O `graphify update .` é necessário somente se houver alteração em código,
migration ou teste rastreado pelo grafo.

## Critérios de aceite

- E2E principal sem falhas.
- Nenhum cenário da Fase 3 pulado por falta de perfume ou histórico.
- Dados E2E transitórios removidos e estado original restaurado.
- Nenhum dado fictício ou métrica enganosa permanece.
- Destino dos 2 registros legados aprovado e documentado.
- Nenhuma conversão legada contém valores inferidos.
- Proteção contra senhas vazadas habilitada e ausente dos advisors.
- RLS e isolamento por usuário continuam aprovados.
- Migrations locais e remotas permanecem alinhadas.
- Lint, typecheck, testes e build passam.
- Mobile e desktop continuam aprovados.
- Relatório final e README refletem o resultado real.
- Existe uma indicação objetiva de pronto ou não pronto para deploy.

## Saída esperada

Atualizar `relatorio-final.md` com:

- decisão sobre os registros legados;
- dados E2E usados e restaurados, sem conteúdo privado ou segredos;
- cenários executados, passes e skips;
- resultado da proteção contra senhas vazadas;
- resultado do Supabase local ou impedimento comprovado;
- gates finais;
- riscos residuais;
- decisão final de commit, push e deploy.

Encerrar após essa decisão. Não iniciar outra fase.
