# Sprint 11 — Testes, migração e validação final

## Objetivo

Validar a Fase 3 como um conjunto integrado e preparar a entrega segura.

## Dependência

Executar após todas as sprints anteriores.

## Escopo

- Revisar migrations.
- Revisar RLS.
- Revisar grants.
- Revisar índices.
- Revisar contratos.
- Executar testes unitários.
- Executar testes de integração.
- Executar testes e2e.
- Executar lint.
- Executar typecheck.
- Executar build.
- Validar estados vazios.
- Validar responsividade.
- Validar regressões.
- Atualizar documentação.
- Atualizar Graphify.

## Cenários obrigatórios

### Usuário sem fragrâncias

- Visão geral;
- Minha estante;
- Diário;
- Análises;
- Recomendador.

### Usuário com fragrâncias e sem usos

- Visão geral;
- Diário;
- Análises;
- Recomendador.

### Usuário com usos

- zero elogios;
- vários elogios;
- sem clima;
- com clima;
- sem satisfação;
- com satisfação;
- períodos diferentes.

### Níveis

- não informado;
- cheio;
- pela metade;
- no final;
- acabou;
- intenção de reposição;
- troca de tipo.

### Segurança

- leitura cruzada;
- escrita cruzada;
- update cruzado;
- delete cruzado;
- associação a perfume alheio.

### Recomendador

- sem histórico;
- histórico incompleto;
- empate;
- nível sem impacto;
- explicações;
- contexto manual;
- contexto automático.

## Revisão de migrations

Confirmar:

- ordem;
- nomes;
- rollback ou segurança;
- constraints;
- foreign keys;
- índices;
- RLS;
- policies;
- grants;
- comentários;
- compatibilidade com dados existentes.

## Comandos esperados

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

Adaptar apenas quando o ambiente exigir.

## Documentação

Atualizar:

- README raiz, se necessário;
- documentação do banco;
- documentação das rotas;
- documentação do Recomendador;
- documentação de UX;
- changelog, se existir;
- instruções de execução.

## Relatório final

Criar:

```text
docs/fase-3-experiencia-inteligente/relatorio-final.md
```

O relatório deve conter:

- sprints concluídas;
- migrations;
- arquivos principais;
- decisões;
- testes executados;
- resultados;
- pendências;
- riscos residuais;
- instruções de deploy;
- plano de rollback.

## Critérios de aceite

- Todas as sprints estão concluídas.
- Migrations aplicam com segurança.
- RLS passa.
- Lint passa.
- Typecheck passa.
- Testes passam.
- Build passa.
- E2E principal passa.
- Mobile e desktop validados.
- Documentação atualizada.
- Graphify atualizado.
- Nenhum dado fictício permanece.
- Nenhuma métrica enganosa permanece.
- Nenhum menu possui responsabilidade duplicada relevante.

## Saída esperada

Relatório final completo e indicação objetiva de pronto ou não pronto para commit, push e deploy.
