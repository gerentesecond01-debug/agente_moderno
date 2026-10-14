# Nexus — Conversas dinâmicas por IM

A IA cria todas as mensagens em tempo real e decide quando se despedir. Não há roteiro de conversa ou lista de respostas normais pré-gravadas. A API deve aceitar POST JSON `{ "message": "...", "userName": "Visitor", "userId": "anonymous" }` e responder `{ "reply": "..." }`.

## Variáveis do Render (Agent)
- `SL_AI_URL`: endpoint da IA, padrão `https://bots2-twze.onrender.com/ask`
- `SL_AI_ENABLED`: `true` por padrão. Com `false`, envia uma despedida de indisponibilidade.
- `SL_AI_API_KEY`: opcional, Bearer token
- `SL_AI_MAX_REPLIES`: máximo de respostas por conversa, padrão 8
- `SL_AI_SILENCE_MINUTES`: pausa individual após despedida, padrão 60; 0 = até reiniciar o Agent
- `SL_AI_DELAY_MIN_MS`: atraso mínimo antes da resposta, padrão 2200

A IA recebe apenas contexto curto do visitante e o texto da mensagem, não o UUID/nome reais. O histórico fica na memória do processo e é perdido no reinício. A IA indica encerramento acrescentando `[[END_CHAT]]` à despedida; o Agent remove esse marcador antes de enviar. Se a API falhar, o Agent envia uma única despedida de indisponibilidade e pausa a conversa. O serviço externo da IA não foi fornecido nem testado.

O Agent não afirma ser humano e responde honestamente quando questionado sobre automação, sem revelar detalhes técnicos. O texto sobre conferência só pode ser usado como assunto contextual, não como fato inventado.

Não inclui indicador visual de digitação; só atraso. O filtro de vazamento é básico, não garantia. Não foram realizados testes no Second Life/Render.


## Correção de comportamento
- Mencionar a palavra "bot" não encerra a conversa.
- Encerramento apenas quando o contexto justificar ou o limite for atingido.
- Menos cumprimentos genéricos e sem repetir nomes.
- Perguntas diretas sobre automação recebem respostas breves e verdadeiras.
- O serviço externo pode não seguir perfeitamente as instruções; testar em IM real.
