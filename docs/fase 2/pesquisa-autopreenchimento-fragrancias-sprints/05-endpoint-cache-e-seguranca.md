# Sprint 5 - Endpoint, cache e seguranca operacional

Objetivo: expor o pipeline por um endpoint interno autenticado, limitado, observavel e resiliente.

## Escopo

- Criar Route Handler equivalente a `POST /api/fragrances/auto-fill`, ajustado ao padrao confirmado.
- Exigir usuario autenticado, nome nao vazio e marca opcional.
- Validar/sanitizar entrada, comprimentos e `ignoreCache`.
- Orquestrar pesquisa, IA e consolidacao somente no servidor.
- Implementar cache versionado com chave normalizada, TTL configuravel, somente para respostas validas e sem guardar erros.
- Permitir `ignoreCache` sem alterar a semantica do resultado.
- Implementar rate limiting por identidade adequada, timeout/cancelamento e limites de custo/conteudo.
- Retornar estados controlados: sucesso, parcial, nao encontrado, entrada invalida, limite excedido, timeout e falha interna.
- Registrar telemetria minima sem segredos ou conteudo sensivel.
- Adicionar variaveis server-only ao schema de ambiente e exemplo documentado.

## Contrato da resposta

- Consulta normalizada, dados, metadados por campo, confianca geral, fontes e avisos.
- Nunca `bottleFormat` nem imagem.
- URLs validadas e apenas metadados necessarios para a previa.
- Erros nao vazam chave, prompt, stack ou conteudo externo.

## Testes obrigatorios

- Autenticacao e validacao de entrada.
- Cache hit/miss, expiracao, versao e `ignoreCache`.
- Erros nao armazenados.
- Rate limiting.
- Timeout e cancelamento.
- Falha parcial versus falha total.
- Saida invalida da IA convertida em erro controlado.
- Ausencia dos campos proibidos.
- Logs sem segredos.

## Fora do escopo

- Botao, modal/previa e aplicacao ao formulario.

## Validacao

- Testes focados do Route Handler e componentes de infraestrutura.
- Typecheck.
- Verificacao manual local com providers simulados; provider real somente se configurado e aprovado.
- `graphify update .`.
