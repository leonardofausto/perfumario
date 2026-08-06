# Sprint 09 — Integração com o Recomendador

## Objetivo

Usar o histórico real do Diário de uso como sinal secundário e explicável no Top 3.

## Dependências

Executar após as Sprints 03 e 06 e após a conclusão da sequência atual do Recomendador.

## Princípio

O histórico não substitui os critérios olfativos e contextuais.

Ele atua como:

- desempate;
- ajuste secundário;
- evidência de sucesso real;
- fonte de explicação.

## Escopo

- Definir sinais históricos.
- Definir pesos máximos.
- Implementar normalização.
- Integrar com motor de pontuação.
- Criar explicações.
- Criar testes.
- Garantir comportamento para usuário sem histórico.

## Sinais permitidos

- frequência de uso;
- elogios;
- taxa de usos com elogios;
- satisfação;
- sucesso por ocasião;
- sucesso por clima;
- desempenho percebido;
- recência.

## Sinais proibidos

- nível do frasco;
- intenção de compra;
- preço;
- tamanho da coleção;
- marca isoladamente;
- total de campos preenchidos;
- dados de outros usuários.

## Regras

- Histórico deve ter peso limitado.
- Fragrância sem histórico não deve ser eliminada.
- Mais registros não significam automaticamente maior qualidade.
- Usar métricas normalizadas.
- Exigir amostra mínima para taxas.
- Evitar favorecer um único uso com elogio.
- Zero elogios é dado real.
- Dados ausentes devem ser ignorados.
- Pesos devem ser redistribuídos somente entre sinais válidos.
- A pontuação final deve continuar explicável.

## Estratégia sugerida

### Pontuação principal

Mantém critérios já aprovados no Recomendador.

### Ajuste histórico

Aplicar pequeno ajuste limitado.

Exemplo conceitual:

- principal: até 90%;
- histórico: até 10%.

O valor exato deve ser definido após testes.

## Critérios de desempate

Ordem sugerida:

1. compatibilidade principal;
2. sucesso na ocasião ativa;
3. satisfação média;
4. elogios normalizados;
5. tempo desde o último uso;
6. critério estável final.

## Explicações

Exemplos válidos:

- Costuma funcionar bem em encontros.
- Tem boa média de satisfação no seu histórico.
- Já recebeu elogios em contextos semelhantes.
- Você não usa esta fragrância há algum tempo.

Não usar frases sem dados.

## Usuário sem histórico

O ranking deve funcionar exatamente como antes.

## Nível do frasco

Pode aparecer como aviso:

- No final;
- Acabou.

Não alterar pontuação.

Uma fragrância marcada como `Acabou` pode permanecer no ranking somente se a regra de disponibilidade do projeto permitir. Essa decisão deve ser documentada.

## Fora de escopo

- machine learning;
- recomendação probabilística;
- comparação social;
- treino externo;
- ajuste automático de pesos sem validação;
- proteção de estoque.

## Testes

- sem histórico;
- um uso;
- vários usos;
- zero elogios;
- amostra mínima;
- dados incompletos;
- empate;
- ocasião ativa;
- clima ativo;
- explicações;
- nível sem impacto;
- isolamento por usuário.

## Critérios de aceite

- Ranking continua funcional sem histórico.
- Histórico tem impacto limitado.
- Nenhuma fragrância é favorecida apenas por volume.
- Explicações refletem os cálculos.
- Sinais proibidos não entram na pontuação.
- Testes de regressão passam.
- Performance permanece aceitável.

## Validações

- testes unitários do motor;
- testes de integração;
- e2e do Top 3;
- lint;
- typecheck;
- build;
- `graphify update .`.
