# Sprint 7 — Migração da ficha do perfume

Objetivo: retirar o painel de Memória Olfativa da ficha sem perder os caminhos
úteis entre Coleção e Diário de Uso.

## Escopo

- Remover a seção visual `Sua jornada` de `PerfumeDetail`.
- Remover CSS, imports e testes exclusivos do painel antigo.
- Manter uma ação contextual compacta `Ver no Diário de Uso` quando houver
  registros.
- Manter `Registrar uso` com a fragrância pré-selecionada.
- Direcionar o link para `/jornada?view=overview&q=<fragrância>`.
- Evitar nova caixa grande ou repetição das métricas na ficha.
- Revisar a consulta da página de detalhe para não buscar resumo que deixou de
  ser renderizado, salvo se outra ação ainda depender dele.

## Resultado esperado

A ficha volta a priorizar identidade, composição, desempenho, perfil sensorial
e ocasiões. A memória de uso permanece acessível, mas pertence ao Diário.

## Fora do escopo

- Remodelar outras seções da ficha.
- Alterar dados do perfume.
- Remover a ação de registrar uso da Coleção se ela ainda estiver adequada.

## Validação

- Testar ficha com e sem registros.
- Testar links com fragrância pré-selecionada.
- Confirmar ausência das métricas antigas no detalhe.
- Confirmar redução de consultas desnecessárias.
- Testar desktop e mobile da ficha.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

