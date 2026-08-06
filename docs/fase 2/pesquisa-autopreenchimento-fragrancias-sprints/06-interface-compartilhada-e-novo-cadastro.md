# Sprint 6 - Interface compartilhada e novo cadastro

Objetivo: adicionar busca e previa compactas ao formulario compartilhado, concluindo primeiro o fluxo de novo cadastro.

## Escopo

- Usar a direcao visual e os componentes atuais do Perfumario.
- Criar componente/hook compartilhado para consulta, estados, previa e aplicacao.
- Posicionar `Buscar dados` proximo de Marca e Nome.
- Exigir nome; marca continua opcional.
- Exibir estados: inicial, pesquisando, consultando fontes, consolidando, sucesso, parcial, nao encontrado e erro.
- Mostrar fragrancia/marca identificadas, confianca, quantidade de fontes, encontrados, inferidos, divergentes, ausentes, fontes e avisos.
- Oferecer `Aplicar ao cadastro` e `Cancelar`.
- No novo cadastro, aplicar somente campos presentes depois do clique explicito.
- Manter campos ausentes vazios e permitir edicao manual depois de aplicar.
- Garantir que `bottleFormat` continue vazio ate escolha manual.
- Nunca tocar no input/preview de imagem.
- Aplicar relacao e referencia de modo atomico:
  - Original limpa e desabilita referencia;
  - Inspiracao/Dupe habilitam e aplicam somente o nome.
- A aplicacao atualiza estado do formulario, nao chama create/update e nao navega.

## Testes obrigatorios

- Busca apenas pelo nome e por marca + nome.
- Todos os estados visuais e cancelamento.
- Aplicacao explicita no novo cadastro.
- Formato permanece vazio antes e depois da aplicacao.
- Imagem permanece intacta.
- Original limpa/desabilita referencia.
- Inspiracao/Dupe aplicam referencia sem marca.
- Fakhar Black exibe `Y Eau de Parfum`.
- Campos ausentes permanecem vazios.
- Edicao manual funciona depois de aplicar.
- Nenhum salvamento automatico.
- Foco, teclado, labels, feedback de carregamento e mobile sem overflow.

## Fora do escopo

- Comparacao e selecao campo a campo na edicao.

## Validacao

- Testes focados do formulario e novos componentes.
- Lint dos arquivos tocados, typecheck e verificacao visual em desktop/mobile.
- `graphify update .`.
