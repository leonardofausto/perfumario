# Sprint 3 - Pesquisa web e providers

Objetivo: obter evidencias permitidas de multiplas fontes por interfaces substituiveis, com falha parcial e proveniencia.

## Escopo

- Implementar a interface de pesquisa escolhida na Sprint 1.
- Separar orquestracao, busca, classificacao de fonte, coleta permitida e extracao de texto seguro.
- Representar cada evidencia com URL canonica, titulo, trecho/conteudo permitido, tipo de fonte e instante da coleta.
- Priorizar fontes oficiais e especializadas sem codificar alegacoes de disponibilidade nao verificadas.
- Aplicar limites de resultados, tamanho, redirecionamentos, tipo de conteudo e tempo.
- Validar URLs e bloquear esquemas/hosts/endereco de rede inadequados antes e depois de redirecionamentos.
- Remover scripts, estilos e HTML desnecessario; conteudo externo permanece texto nao confiavel.
- Tolerar indisponibilidade de uma fonte e devolver resultado parcial com aviso.
- Documentar adaptadores que dependem de API/chave e fontes que so podem aparecer via pesquisa publica permitida.

## Contrato de seguranca

- Nenhuma chave no cliente.
- Nenhum bypass de CAPTCHA, login, `robots.txt`, termos ou bloqueios.
- Nenhuma instrucao encontrada em pagina externa entra como comando do sistema.
- O coletor nao acessa rede privada, metadata cloud ou URLs arbitrarias sem validacao.
- Logs nao armazenam segredos nem conteudo excessivo.

## Testes obrigatorios

- Consulta somente por nome e por marca + nome.
- Ordenacao/prioridade de fontes.
- Falha e timeout de um provider sem derrubar resultados validos.
- Resposta parcial e nenhuma fragrancia encontrada.
- Limites de resultados/conteudo.
- Redirecionamento e protecao contra SSRF.
- Remocao de conteudo ativo e preservacao de proveniencia.

## Fora do escopo

- Chamada de IA, consolidacao semantica, endpoint publico ao frontend e UI.

## Validacao

- Testes focados com rede simulada e fixtures sanitizadas.
- Uma verificacao real controlada somente se houver credencial/configuracao aprovada; registrar fonte, data, resultado e limitacao.
- Typecheck e `graphify update .`.
