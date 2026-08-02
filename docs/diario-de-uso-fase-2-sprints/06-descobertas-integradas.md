# Sprint 6 — Descobertas integradas

Objetivo: alinhar Descobertas à nova arquitetura sem alterar fórmulas confiáveis.

## Escopo

- Mover a experiência existente para `view=discoveries`.
- Reutilizar `getOwnJourneyDiscoveries`.
- Tornar o período explícito e sincronizado com a URL.
- Organizar descobertas por relevância em uma lista editorial.
- Mostrar valor, detalhe, período e tamanho da amostra quando o contrato
  disponível permitir.
- Preservar estado `insufficient` sem métricas artificiais.
- Oferecer caminho direto para registrar uso ou consultar Registros.
- Tratar falha da consulta com ação de tentar novamente preservando o período.

## Regras

- Fórmulas permanecem fora de componentes React.
- Uma descoberta só aparece com amostra mínima já definida no domínio.
- Empates e zeros seguem critérios determinísticos existentes.
- Não repetir na Visão geral todos os conteúdos desta área.

## Fora do escopo

- Novas fórmulas sem pesquisa específica.
- Gráficos.
- Texto gerado por IA.
- Alteração do Recomendador.

## Validação

- Testar estados suficiente, insuficiente e erro.
- Testar período e amostra.
- Testar que nenhuma fórmula foi duplicada na interface.
- Testar responsividade e ordem de leitura.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

