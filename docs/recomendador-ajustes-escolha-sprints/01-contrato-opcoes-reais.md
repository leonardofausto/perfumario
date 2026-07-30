# Sprint 1 - Contrato das opcoes reais

Objetivo: definir o contrato das novas escolhas do painel `Qual e o plano?`, removendo dependencias de opcoes antigas sem metrica real direta.

## Escopo

- Inventariar as opcoes atuais do painel `Ajustes da escolha`.
- Confirmar, via tipos/configuracoes existentes, quais metricas reais estao disponiveis para:
  - desempenho;
  - perfil sensorial;
  - estacoes;
  - ocasioes;
  - horarios;
  - ambientes.
- Definir um novo contrato de selecao multipla para o Recomendador.
- Registrar quais opcoes antigas serao removidas:
  - `Passeio`, se nao houver metrica real;
  - `Fim de tarde`, se nao houver metrica real.
- Registrar que clima nao entra neste painel e continua exclusivo do contexto superior.
- Definir nomes curtos e textos de interface para cada grupo.
- Definir quais arquivos provavelmente serao alterados nas sprints seguintes.

## Fora do escopo

- Alterar codigo de componente.
- Alterar motor de pontuacao.
- Criar novos estilos.
- Alterar banco de dados.
- Implementar validacao visual.

## Validacao

- Revisar `src/features/recommender/types.ts`.
- Revisar `src/features/recommender/scoring-config.ts`.
- Revisar `src/features/recommender/scoring.ts`.
- Revisar `src/components/recommender/recommender-view.tsx`.
- Revisar constantes/tipos de perfumes quando necessario para confirmar nomes reais de metricas.
- Criar um documento de entrega da sprint com:
  - contrato final das selecoes;
  - opcoes removidas;
  - opcoes mantidas;
  - riscos e limites conhecidos.
- `graphify update .` se houver alteracao em docs.

## Entrega esperada

- Documento `01-entrega-contrato-opcoes-reais.md` nesta pasta.
- Nenhuma alteracao funcional no Recomendador.
