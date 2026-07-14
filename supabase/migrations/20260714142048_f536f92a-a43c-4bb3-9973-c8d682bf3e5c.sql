DROP POLICY IF EXISTS chat_public_insert_for_client_messages ON public.chat_messages;
DROP POLICY IF EXISTS chat_public_insert_for_new_lead ON public.chat_messages;

CREATE POLICY chat_public_insert_for_client_messages
ON public.chat_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  sender_id IS NULL
  AND sender_role IN ('client', 'system')
  AND length(btrim(text)) >= 1
  AND length(btrim(text)) <= 4000
  AND EXISTS (
    SELECT 1
    FROM public.leads l
    WHERE l.id = chat_messages.lead_id
  )
);