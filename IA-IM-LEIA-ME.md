# Nexus — IA para IM do Second Life

Integração com API `/ask` no formato do script SPIKE AI ULTRA v6.6.
O Agent responde mensagens privadas, com memória curta por visitante, respostas curtas em inglês e atraso antes de enviar.

## Configuração no Render
- `SL_AI_URL`: URL HTTPS da API, padrão `https://bots2-twze.onrender.com/ask`
- `SL_AI_ENABLED`: `true` (padrão) ou `false` para respostas de reserva.
- `SL_AI_API_KEY`: opcional, enviado como Bearer token.

A API precisa responder JSON como `{"reply":"Hello!"}`.
O serviço de IA não foi fornecido e pode estar indisponível; neste caso o Agent usa respostas de reserva.
O indicador visual de digitação não está implementado.
O contexto da conversa fica apenas na memória do processo e se perde no reinício.
O bot não se apresenta espontaneamente como humano e esclarece a automação quando perguntado.
Não envia comandos administrativos à IA; administradores continuam no fluxo de controle existente.
Não foram feitos testes ao vivo no Second Life ou no Render.
