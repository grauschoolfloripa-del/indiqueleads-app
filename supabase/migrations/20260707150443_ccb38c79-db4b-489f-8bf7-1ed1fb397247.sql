ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financing_simulations;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.financing_simulations REPLICA IDENTITY FULL;