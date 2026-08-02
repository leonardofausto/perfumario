# Providers e coleta de evidências

## Estado real

- `TavilySearchProvider` está implementado e testado somente com rede simulada.
- Nenhuma chamada real foi executada nesta sprint.
- A existência do adapter não confirma chave, conta, disponibilidade regional, qualidade, quota ou permissão de uso em produção.
- Nenhum fallback pago está configurado.

## Tavily

O adapter usa exclusivamente `https://api.tavily.com/search`, recebe a chave pelo construtor no backend e nunca a inclui em query string, retorno ou mensagem de erro.

Configuração futura esperada, sempre sem prefixo `NEXT_PUBLIC_`:

```env
TAVILY_API_KEY=
```

Limites codificados:

- profundidade `basic`;
- no máximo 10 resultados por chamada;
- resposta do provider limitada a 512 KB;
- `include_answer`, `include_images` e `include_raw_content` desabilitados;
- consulta formada somente por `name` ou `brand + name`.

## Fontes encontradas pela pesquisa pública

Os hosts oficiais, especializados e técnicos são configuração explícita de `SourceClassificationPolicy`. O código não mantém uma lista que alegue disponibilidade ou permissão permanente. Um host ausente da política é tratado como comunidade.

Antes de coletar uma página retornada pela pesquisa, a camada chamadora deve confirmar que o acesso pretendido respeita os termos, o `robots.txt` e outras restrições da fonte. `collectPermittedText` não burla CAPTCHA, autenticação ou bloqueios e não deve ser usado quando essa confirmação não existir.

O coletor:

- aceita apenas HTTP/HTTPS sem credenciais embutidas;
- rejeita localhost, endereços privados, link-local, metadata cloud e faixas especiais;
- resolve o host e revalida cada redirecionamento;
- usa redirects manuais e um número máximo de saltos;
- aceita somente `text/html` e `text/plain`;
- limita bytes durante a leitura e limita o texto final;
- remove scripts, estilos, formulários, frames, objetos, SVG e outros elementos ativos;
- devolve URL final canônica, título, texto e instante da coleta.

Conteúdo coletado continua sendo texto externo não confiável. Nenhuma instrução encontrada nele pode virar comando, prompt de sistema ou configuração.

## Limitação conhecida

A validação DNS antes do `fetch` reduz SSRF, mas existe uma janela entre resolução e conexão. Antes de produção, a implantação deve garantir resolução/conexão fixada ao endereço validado ou uma saída de rede com bloqueio de faixas privadas. Até essa proteção operacional existir, o coletor não deve ser descrito como defesa completa contra DNS rebinding.
