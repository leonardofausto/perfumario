# Resumo responsivo da Jornada

## Problema

Na tela de detalhes do perfume, o resumo "Sua jornada" mantém quatro indicadores
na mesma linha quando a coluna disponível é estreita. Isso acontece em desktops
menores e em janelas parcialmente reduzidas: os títulos dos indicadores ficam
sem espaço e invadem os cards vizinhos.

O breakpoint atual observa apenas a largura da janela. Ele não representa a
largura real do conteúdo depois que o shell, as margens e a coluna introdutória
ocupam parte da tela.

## Direção aprovada

A grade deve responder à largura disponível no próprio resumo:

- quatro indicadores por linha somente quando cada card tiver espaço legível;
- dois indicadores por linha em desktops estreitos e tablets;
- um indicador por linha em celulares pequenos;
- dois cards de preferência por linha quando houver espaço e um por linha no
  celular;
- títulos, ícones, valores e estrelas devem permanecer dentro dos respectivos
  cards, sem redução agressiva de fonte.

O conteúdo introdutório continua ao lado dos indicadores em desktops quando
houver espaço. O visual, a ordem semântica e os dados existentes permanecem
inalterados.

## Implementação

O contêiner do resumo será um contexto de container query. A grade interna usará
breakpoints definidos pela sua largura efetiva, eliminando a dependência
exclusiva da viewport. Os títulos dos cards ocuparão a largura disponível e
permitirão quebra de linha segura ao lado do ícone.

Nenhuma mudança de dados, componente React ou texto é necessária.

## Verificação

- teste visual em desktop amplo, desktop estreito e celular;
- confirmação de que nenhum título ultrapassa os limites do card;
- teste focado do componente de detalhes;
- lint e atualização do Graphify após a alteração.
