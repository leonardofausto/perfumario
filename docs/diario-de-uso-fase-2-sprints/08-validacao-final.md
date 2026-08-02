# Sprint 8 — Validação final

Objetivo: validar a Fase 2 completa sem adicionar funcionalidade.

## Auditoria funcional

- Navegação usa `Diário de Uso`.
- `/jornada` e links antigos continuam válidos.
- Visão geral, Registros e Descobertas preservam seus parâmetros.
- Registrar, editar e excluir uso funcionam.
- Memória Olfativa seleciona e resume uma fragrância.
- Perfume removido não gera link quebrado.
- A ficha do perfume não contém o painel antigo.
- Nenhum dado de outro usuário é consultado.

## Auditoria visual

- Verificar `1440px`, `1024px`, `768px`, `390px` e `320px`.
- Verificar zoom de `200%`.
- Confirmar ausência de sobreposição e rolagem horizontal.
- Confirmar foco visível e ordem de teclado.
- Confirmar que linhas e listas permanecem mais compactas que cards.
- Confirmar estados vazios, insuficientes, carregando e erro.

## Auditoria de cópia

- `Diário de Uso` é o nome visível principal.
- `Jornada` não aparece como nome do menu ou H1.
- A interface usa linguagem direta e consistente.
- Ausência de dados não é representada por conclusões ou zeros artificiais.

## Comandos

```powershell
npm.cmd run check:stable
npm.cmd run test:policy
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run verify
```

Quando o ambiente E2E estiver configurado:

```powershell
npm.cmd run test:e2e
```

Atualizar o grafo:

```powershell
graphify update .
```

## Fora do escopo

- Corrigir falhas preexistentes não relacionadas.
- Refatorar módulos adjacentes.
- Criar funcionalidade nova durante a validação.
