
-- Allow anonymous visitors (unauthenticated leads) to insert the initial
-- system + client chat messages when a matching lead exists. Reads remain
-- restricted (chat_read_related) so only the advertiser/indicator/admin see them.
CREATE POLICY chat_public_insert_for_new_lead
ON public.chat_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  sender_role IN ('client', 'system')
  AND EXISTS (SELECT 1 FROM public.leads l WHERE l.id = chat_messages.lead_id)
);

GRANT INSERT ON public.chat_messages TO anon;
