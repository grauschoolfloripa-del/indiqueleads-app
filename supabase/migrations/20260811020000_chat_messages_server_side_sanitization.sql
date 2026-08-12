-- A sanitização de contato (telefone/e-mail/links) do chat rodava só no
-- cliente (src/lib/chatSecurity.ts), então era só uma checagem de UX: qualquer
-- chamada direta à API do Supabase contornava o filtro por completo. A partir
-- de agora, todo envio de mensagem passa pela Edge Function `send-chat-message`,
-- que sanitiza o texto no servidor antes de gravar (usando a service role).
--
-- Para que essa seja de fato a única porta de entrada, revogamos o INSERT
-- direto na tabela para os papéis que o front-end usa.
REVOKE INSERT ON public.chat_messages FROM anon, authenticated;
