# Remodelagem de Minha Colecao por sprints

Esta pasta quebra o prompt amplo de remodelagem da area Minha Colecao em arquivos menores, um por sprint, para economizar tokens, reduzir risco de regressao e facilitar validacoes incrementais.

O prompt original envolve tela de edicao, pagina de detalhes, novos campos persistidos, Supabase, tipos, validacoes, componentes compartilhados, acessibilidade, responsividade, testes e build. Executar tudo em uma unica rodada consome muito contexto e torna mais facil misturar escopos. Por isso, cada sprint deve ser pedida e executada isoladamente.

## Como solicitar uma sprint

Para executar qualquer sprint, utilize sempre um único pedido como o exemplo abaixo.

```text
Antes de iniciar, leia o arquivo docs/minha-colecao-sprints/README.md para entender as regras globais, critérios de aceite e a forma de trabalho desta coleção de sprints.
Em seguida, execute somente a sprint descrita em docs/minha-colecao-sprints/XX-nome-da-sprint.md.
Não execute tarefas de outras sprints.

Antes de editar qualquer arquivo:
- use Graphify para localizar apenas as dependências necessárias;
- utilize skills somente quando forem adequadas ao tipo de trabalho;
- utilize plugins apenas quando houver benefício concreto na economia de tokens ou redução de leitura desnecessária.

Apresente um plano resumido da sprint antes de implementar.
Durante a implementação, mantenha-se estritamente dentro do escopo da sprint.
Ao final, execute apenas as validações previstas na própria sprint, atualize o Graphify com `graphify update .` quando houver alterações no código e encerre a execução.
```


## Ordem recomendada

1. `01-descoberta-plano.md`
2. `02-banco-tipos-contratos.md`
3. `03-primitivas-ui.md`
4. `04-edicao-compacta.md`
5. `05-detalhes-metricas.md`
6. `06-tipografia-consistencia.md`
7. `07-validacao-final.md`

## Regras globais

- Economizar tokens com buscas direcionadas, Graphify quando ajudar, leitura seletiva de arquivos e reaproveitamento de descobertas.
- Usar skills relevantes ao tipo de trabalho, sem carregar instrucoes desnecessarias.
- Usar plugins somente quando houver ganho concreto para a sprint atual.
- Nao reler arquivos inteiros sem necessidade.
- Nao implementar fora do escopo da sprint solicitada.
- Preservar a identidade visual atual da aplicacao.
- Nao adicionar os campos Perfumista nem Pais da marca em nenhuma camada.
- Diferenciar sempre valor zero de campo nao informado.
- Manter compatibilidade com registros antigos.
- Validar cada sprint antes de avancar.
- Ao modificar codigo, atualizar o Graphify com `graphify update .`.

## Criterios globais de aceite

- Radar removido da pagina de detalhes.
- Desempenho representado por barras horizontais legiveis.
- Desempenho e Quando usar separados.
- Tela de edicao mais compacta.
- Conteudos relacionados proximos.
- Imagem disponivel no topo da edicao.
- Acoes de salvar e cancelar acessiveis durante rolagem.
- Novos campos implementados em banco, tipos, validacao, leitura, escrita, formulario e detalhes.
- Perfumista e Pais da marca ausentes de todas as camadas.
- Percentuais aceitam vazio e valores entre 0 e 100.
- Zero e `Nao informado` tratados como estados distintos.
- Tipografia consistente.
- Principais acordes legiveis e coerentes com os demais titulos.
- Textos dentro das barras com contraste adequado.
- Desktop, tablet e mobile funcionais.
- Sem scroll horizontal.
- Registros antigos continuam funcionando.
- Lint, typecheck, testes e build passam.
- Nenhuma regressao visual grave introduzida.
