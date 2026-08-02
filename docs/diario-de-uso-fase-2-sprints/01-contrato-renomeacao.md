# Sprint 1 — Contrato e renomeação

Objetivo: renomear a experiência visível de `Jornada` para `Diário de Uso` e
congelar os contratos que a reformulação deve preservar.

## Escopo

- Alterar o item da navegação principal para `Diário de Uso`.
- Alterar H1, descrições, labels ARIA e textos contextuais do módulo.
- Manter a rota `/jornada` e os parâmetros existentes nesta sprint.
- Substituir referências visíveis como `Ver na Jornada` por linguagem do Diário.
- Mapear testes e documentos que ainda exigem o nome antigo.
- Registrar `Jornada` apenas como nome técnico legado quando a renomeação de
  arquivos não trouxer benefício funcional.

## Decisões

- Não renomear tabela, migrations ou rota.
- Não fazer migração massiva de nomes internos nesta sprint.
- O nome da entidade de produto é `Diário de Uso`.
- `Memória Olfativa` é uma seção do Diário, não outro item do menu.

## Fora do escopo

- Alterar layout.
- Mover a Memória Olfativa.
- Modificar consultas ou ações.
- Renomear diretórios de código apenas por estética.

## Validação

- Testes focados da navegação, shell e página `/jornada`.
- Busca por cópia visível `Jornada` nos componentes afetados.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

