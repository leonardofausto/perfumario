# Importação inicial da coleção

Este manifesto preserva os 16 perfumes e as imagens que já existiam no projeto.

- O usuário de destino é resolvido em execução por `E2E_USER_EMAIL`; nenhum UUID é salvo.
- A importação usa `legacyKey` para ser repetível sem duplicar registros.
- As imagens locais são convertidas para WebP, limitadas a 1200 × 1200 e enviadas ao bucket privado.
- As imagens existentes não possuem sua URL de origem documentada. Por isso, `imageSourceUrl` permanece `null`; nenhuma licença ou autoria foi presumida.
- Descrições, pirâmides, famílias e percentuais não foram inventados. Os itens ainda não pesquisados são marcados como “Descrição editorial ainda não cadastrada” e “Não catalogada”.
- A pesquisa editorial deve priorizar páginas oficiais das marcas e registrar URLs antes de substituir esses valores.

## Execução

```powershell
node --env-file=.env.local scripts/import-legacy-perfumes.mjs --dry-run --target-email=voce@example.com
node --env-file=.env.local scripts/import-legacy-perfumes.mjs --target-email=voce@example.com
```

O primeiro comando não modifica dados. O segundo grava os registros e imagens, emitindo uma auditoria JSON no terminal.
