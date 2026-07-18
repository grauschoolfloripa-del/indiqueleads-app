-- Fix: policy previously referenced leads via EXISTS, which fails RLS for anon
-- (anon has no SELECT policy on leads) and silently rejected client chat inserts.
DROP POLICY IF EXISTS chat_public_insert_for_client_messages ON public.chat_messages;

CREATE POLICY chat_public_insert_for_client_messages
ON public.chat_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  sender_id IS NULL
  AND sender_role = ANY (ARRAY['client'::chat_sender_role, 'system'::chat_sender_role])
  AND length(btrim(text)) BETWEEN 1 AND 4000
);