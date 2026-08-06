# Sprint 03 — Modelagem do Diário de uso

## Objetivo

Criar a fundação de banco e domínio para registrar usos reais de fragrâncias.

## Dependência

Executar após as Sprints 01 e 02.

## Escopo

- Definir entidade de uso.
- Criar migration.
- Criar RLS.
- Criar grants.
- Criar índices.
- Criar tipos.
- Criar validações Zod.
- Criar camada de consulta e mutação.
- Criar testes de banco e domínio.
- Preservar privacidade por usuário.
- Preparar dados para análises e Recomendador.

## Entidade principal

Cada registro representa um uso real de uma fragrância por um usuário.

Campos mínimos recomendados:

- `id`;
- `user_id`;
- `perfume_id`;
- `used_at`;
- `occasion_key`;
- `time_key`;
- `environment_key`;
- `compliments_count`;
- `satisfaction`;
- `performance_rating`;
- `weather_source`;
- `temperature`;
- `feels_like`;
- `weather_condition`;
- `season_key`;
- `city`;
- `notes`;
- `created_at`;
- `updated_at`.

## Regras de domínio

- Um uso pertence a um usuário.
- Um uso pertence a uma fragrância do mesmo usuário.
- Elogios são registrados como quantidade inteira igual ou maior que zero.
- Zero elogios é valor real e não campo ausente.
- Satisfação deve usar escala curta e documentada.
- Desempenho percebido deve ser opcional.
- Clima pode ser automático, manual ou ausente.
- Não copiar contexto automático para campos manuais.
- Observação é opcional.
- Data futura deve ser rejeitada ou limitada conforme decisão da arquitetura.
- Exclusão da fragrância deve seguir comportamento definido pelo projeto: restringir, cascata ou soft delete.
- Nenhuma consulta pode retornar usos de outro usuário.

## Escalas recomendadas

### Satisfação

Escala inteira de 1 a 5.

### Desempenho percebido

Escala inteira de 1 a 5.

Essas escalas são simples, visuais e adequadas a botões segmentados.

## Clima

Reutilizar o contexto climático existente quando possível.

Não tornar clima obrigatório.

## Migration

A migration deve incluir:

- tabela;
- foreign keys;
- constraints;
- índices;
- timestamps;
- RLS;
- policies;
- grants;
- comentários úteis.

## Consultas mínimas

- criar uso;
- atualizar uso;
- excluir uso;
- listar usos paginados;
- listar usos por fragrância;
- buscar uso por id;
- contar usos por período;
- buscar último uso;
- somar elogios por fragrância.

## Fora de escopo

- Interface final.
- Gráficos.
- Ranking do Recomendador.
- Notificações.
- Níveis de frasco.
- Importação de histórico.

## Testes obrigatórios

- usuário cria uso da própria fragrância;
- usuário não cria uso para fragrância alheia;
- usuário não lê uso alheio;
- usuário não altera uso alheio;
- usuário não exclui uso alheio;
- zero elogios é aceito;
- quantidade negativa é rejeitada;
- satisfação fora da escala é rejeitada;
- perfume inexistente é rejeitado;
- filtros de período funcionam;
- paginação funciona.

## Critérios de aceite

- Migration reversível ou segura.
- RLS validado.
- Contratos tipados.
- Validação centralizada.
- Consultas não dependem da UI.
- Dados suficientes para Análises e Recomendador.
- Nenhum dado fictício.
- Testes de domínio e banco passam.

## Validações

- testes da migration;
- testes RLS;
- testes unitários de schemas;
- lint;
- typecheck;
- `graphify update .`.
