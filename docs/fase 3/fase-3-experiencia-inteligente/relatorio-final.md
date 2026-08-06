# Relatório final — Fase 3: Experiência inteligente

Data da validação: 3 de agosto de 2026.

## Status objetivo

- **Pronto para commit:** sim, após revisão do diff pretendido.
- **Pronto para push:** sim, preservadas as alterações não relacionadas já presentes no worktree.
- **Pronto para deploy:** não integralmente. O código, o build e as migrations passaram, mas os cenários E2E que exigem uma coleção com dados reais permanecem sem cobertura no ambiente atual. A conta dedicada está vazia e nenhum perfume ou histórico fictício foi criado para contornar essa condição.

## Sprints concluídas

As entregas das sprints 01 a 10 estão presentes no conjunto validado. A Sprint 11 revisou a integração, o banco remoto, os gates do projeto, os estados vazios e a responsividade sem iniciar trabalho de uma fase posterior.

## Migrations

Ordem local e remota confirmada:

1. `20260731185626_create_perfume_usage_entries.sql` — migration histórica recuperada do remoto.
2. `20260803140233_perfume_autofill_cache_and_rate_limit.sql` — migration canônica recuperada do remoto; a cópia local com timestamp divergente foi removida.
3. `20260803193538_usage_logs.sql` — diário de uso, constraints, FK composta, índices, RLS, policies e grants.
4. `20260803200551_perfume_container_status.sql` — nível do recipiente e intenção de reposição.
5. `20260803201649_analytics_snapshot_rpc.sql` — snapshot privado de análises, executado como invocador.
6. `20260803214248_phase_3_validation_indexes.sql` — índices das FKs compostas de `usage_logs` e da tabela legada.

A aplicação inicial de `usage_logs` detectou uma colisão entre o nome automático e o nome explícito de uma constraint. A constraint composta passou a se chamar `usage_logs_weather_payload_check`; o conteúdo da regra não mudou.

As quatro migrations da Fase 3 e de validação foram aplicadas com sucesso no banco remoto. A listagem final apresenta todos os timestamps locais e remotos alinhados.

## Compatibilidade e segurança dos dados

- `usage_logs` vincula `(perfume_id, user_id)` a um perfume do mesmo proprietário.
- RLS e policies restringem leitura, criação, alteração e exclusão ao usuário autenticado.
- A RPC de análises é `security invoker`, rejeita consulta cruzada e não possui grant para `anon`.
- As tabelas de cache e rate limit do preenchimento assistido permanecem sem policies deliberadamente: RLS está ativo, os papéis públicos não têm grants e o acesso é exclusivo do servidor.
- A tabela legada `perfume_usage_entries` contém 2 registros reais e foi preservada. Eles não foram convertidos porque o contrato antigo não contém todos os campos obrigatórios do novo diário; preencher lacunas inventaria dados.
- Os testes SQL usam transações com `rollback`; os usuários, perfumes e usos de teste não permanecem no banco.

## Arquivos principais

- Migrations em `supabase/migrations`.
- Testes de banco em `supabase/tests`.
- Contratos e consultas em `src/features/usage-log`, `src/features/analytics`, `src/features/dashboard`, `src/features/experience` e `src/features/recommender`.
- Interfaces em `src/components/usage-log`, `src/components/analytics`, `src/components/dashboard`, `src/components/collection` e `src/components/recommender`.
- Rotas privadas `/dashboard`, `/colecao`, `/diario`, `/analises` e `/recomendador`.
- Cenários de navegador em `tests/e2e`.

## Decisões da validação

- Preservar o histórico legado em vez de fazer uma migração incompleta ou destrutiva.
- Corrigir somente a colisão comprovada da constraint.
- Adicionar somente os dois índices apontados para as FKs compostas.
- Executar os testes SQL diretamente no banco remoto, dentro das próprias transações de rollback, porque o Docker local não estava disponível.
- Validar o Playwright em servidor de produção isolado; o servidor de desenvolvimento já aberto na porta 3000 apresentava falha de HMR e não era uma base confiável para interações client-side.
- Não criar perfumes, usos ou métricas artificiais para habilitar cenários E2E.

## Validações executadas

### Banco

- `supabase migration list --db-url ...`: versões locais e remotas alinhadas.
- `supabase db push --dry-run`: migrations previstas conferidas antes da aplicação.
- `supabase db push`: migrations aplicadas.
- `analytics_query_plan.sql`: passou.
- `analytics_snapshot.sql`: passou.
- `container_status_rls.sql`: passou.
- `perfumes_rls.sql`: passou.
- `profiles_rls.sql`: passou.
- `usage_logs_rls.sql`: passou.
- Advisor de segurança: sem erro de RLS da Fase 3; dois informes intencionais das tabelas server-only e um aviso de Auth.
- Advisor de performance: sem FK sem índice; somente índices ainda não utilizados, esperado imediatamente após sua criação.

### Aplicação

- `npm.cmd run check:stable`: passou.
- `npm.cmd run test:policy`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run typecheck`: passou.
- `npm.cmd test`: 58 arquivos e 298 testes passaram.
- `npm.cmd run build`: passou.
- `npm.cmd run test:e2e`: 6 cenários passaram e 6 foram pulados explicitamente; nenhuma falha.
- Playwright público, shell autenticado, responsividade e polimento multi-viewport: passaram.
- Playwright do Recomendador: contexto manual exercitado; ranking pulado porque a conta dedicada não possui perfumes.
- Playwright de preenchimento assistido: pulado porque a funcionalidade está deliberadamente oculta por configuração.
- `graphify update .`: grafo reconstruído com 2.488 nós, 3.475 arestas e 315 comunidades.

## Cenários cobertos

Os testes unitários, de integração e SQL cobrem:

- estados sem fragrâncias, sem usos e sem métricas;
- zero e múltiplos elogios;
- clima e satisfação presentes ou ausentes;
- períodos de 7, 30 e 90 dias, ano e todo o histórico;
- níveis não informado, cheio, metade, final e acabou;
- intenção de reposição e troca do tipo de recipiente;
- leitura, escrita, atualização e exclusão cruzadas;
- associação a perfume de outro usuário;
- Recomendador sem histórico, histórico incompleto, empate, explicações e independência do nível do frasco;
- contexto manual e contrato do contexto automático;
- larguras 320, 375, 768, 1024 e 1440 px, foco visível e movimento reduzido.

## Pendências e riscos residuais

1. Habilitar a proteção contra senhas vazadas no Supabase Auth: [documentação de segurança de senha](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
2. Executar os cenários E2E do diário, análises, nível do frasco e ranking com uma conta dedicada que já possua dados reais e consentidos. Não usar dados pessoais nem deixar fixtures no ambiente.
3. Definir, em uma sprint própria, se os 2 registros de `perfume_usage_entries` devem continuar somente como legado ou receber um fluxo assistido de conversão.
4. Repetir `supabase test db` em ambiente local com Docker para complementar a execução remota. A indisponibilidade do Docker não invalidou os scripts, que passaram diretamente no remoto.
5. O nome de exibição da conta E2E já estava alterado por uma execução anterior interrompida. O teste agora restaura o valor capturado durante uma execução bem-sucedida, mas a correção editorial desse valor exige uma decisão explícita do responsável pela conta.

## Instruções de deploy

1. Revisar e selecionar somente os arquivos pertencentes à Fase 3; o worktree contém alterações preexistentes.
2. Configurar as variáveis da aplicação sem expor chaves administrativas ao navegador.
3. Confirmar `supabase migration list --db-url <URL>` e executar `supabase db push --dry-run`.
4. Aplicar `supabase db push`.
5. Executar os gates listados nesta sprint.
6. Fazer o deploy da aplicação.
7. Validar login, estados vazios, Diário, Análises, Recomendador e isolamento entre usuários no ambiente implantado.

## Plano de rollback

- Em regressão de aplicação, reimplantar primeiro a versão anterior sem apagar dados.
- Não reverter migrations destrutivamente. Revogar temporariamente grants ou desabilitar as rotas afetadas enquanto o problema é corrigido.
- Antes de qualquer alteração incompatível em `usage_logs` ou nos campos de recipiente, exportar os dados afetados e criar uma migration corretiva aditiva.
- Os dois índices da migration de validação podem ser removidos por uma migration posterior, se houver evidência de impacto; não removê-los durante tráfego sem planejar o bloqueio.
- Não excluir `perfume_usage_entries` enquanto os registros legados não tiverem destino aprovado.
