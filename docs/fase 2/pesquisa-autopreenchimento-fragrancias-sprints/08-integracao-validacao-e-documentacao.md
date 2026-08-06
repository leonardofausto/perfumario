# Sprint 8 - Integracao, validacao final e documentacao

Objetivo: provar o fluxo completo, fechar lacunas sem ampliar escopo e documentar somente capacidades verificadas.

## Escopo

- Executar a matriz completa dos 40 cenarios do prompt e registrar onde cada um esta coberto.
- Adicionar testes de integracao/E2E ausentes para cadastro, edicao, falhas e seguranca.
- Verificar regressao das actions, schema, imagem, formulario, colecao e detalhes.
- Auditar contratos proibidos em todas as camadas:
  - nenhum `bottleFormat` na consulta/resposta/previa/aplicacao;
  - nenhum default automatico de Frasco no novo cadastro;
  - formato existente preservado na edicao;
  - nenhuma imagem pesquisada ou alterada;
  - nenhuma marca em `inspiredBy`;
  - nenhum autosave.
- Fazer verificacao real controlada dos providers configurados, sem transformar uma amostra em garantia geral.
- Revisar acessibilidade, responsividade, estados de erro, cancelamento e mensagens em portugues.
- Atualizar documentacao operacional e de arquitetura.

## Documentacao final obrigatoria

- Arquivos criados e alterados.
- Arquitetura e fluxo.
- Providers/fontes realmente verificados e data da verificacao.
- Providers dependentes de API/chave e limitacoes.
- Variaveis de ambiente, sem valores.
- Como executar e testar localmente.
- Como adicionar provider sem acoplar UI, IA e coleta.
- Cache, TTL, rate limit, timeout e limites de custo/conteudo.
- Limitacoes conhecidas e riscos de termos/disponibilidade.
- Resultados reais de cada comando de validacao.

## Validacao obrigatoria

- Testes focados das areas alteradas.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`
- Testes E2E aplicaveis ao fluxo.
- `graphify update .`
- `git status --short` para confirmar o escopo dos arquivos.

Falhas devem ser corrigidas dentro do escopo ou declaradas com comando, erro e impacto. Nao afirmar que a funcionalidade, provider ou build funciona sem evidencia executada.

## Criterios finais de aceite

- Busca disponivel em novo e edicao com previa antes da aplicacao.
- Multiplas fontes consolidadas com proveniencia, confianca, conflitos e inferencias visiveis.
- Resultado parcial e falhas controladas.
- Valores normalizados nos contratos reais do projeto.
- Piramide usa exatamente ` - ` e acordes usam `Nome: valor`.
- Todos os scores sao inteiros entre 0 e 100.
- Formato na estante e imagem permanecem exclusivamente manuais.
- Original nao possui referencia; Inspiracao/Dupe possuem apenas nome sem marca.
- Fakhar Black, quando confirmado como Inspiracao, usa `Y Eau de Parfum`.
- Edicao preserva dados e aplica somente selecoes.
- Usuario pode editar tudo e salvar somente pela acao normal.
- Seguranca, lint, typecheck, testes e build possuem resultados reais.
