-- O link de indicação (`?ref=`) hoje é lido do localStorage no navegador e
-- mandado como `indicator_id` direto no INSERT de `leads` — e a policy atual
-- (`leads_public_insert ... WITH CHECK (true)`) deixa QUALQUER caller (mesmo
-- anônimo) inserir um lead com o `commission_value`/`commission_type`/
-- `commission_paid` que quiser. Como a comissão agora também é paga por lead
-- (não só por venda), isso deixou de ser só "estética" e virou dado
-- financeiro que precisa ser calculado e validado no servidor.
--
-- A partir daqui, a criação de lead só acontece pela Edge Function
-- `create-lead` (service role): ela busca o produto no banco, calcula a
-- comissão a partir dele (nunca aceita um valor vindo do cliente) e valida
-- que o `indicator_id` recebido corresponde a um indicador real antes de
-- gravar. O INSERT direto na tabela é revogado.
REVOKE INSERT ON public.leads FROM anon, authenticated;

-- Gap encontrado durante essa revisão: o fluxo "Cheguei na Loja" (o indicador
-- sinaliza chegada à loja, sem confirmar a própria visita — quem confirma é
-- o anunciante) precisa que o indicador consiga marcar `check_in_requested`
-- no próprio lead, mas a policy de UPDATE em `leads` (`leads_related_update`
-- / `can_advertiser_update_lead`) só permite o ANUNCIANTE atualizar. Isso é
-- proposital (não queremos o indicador conseguindo mudar status/comissão
-- sozinho — foi exatamente o problema do check-in por GPS que acabamos de
-- remover), mas hoje bloqueia até essa única ação legítima do indicador.
--
-- Função estreita, SECURITY DEFINER: só liga `check_in_requested = true`,
-- só quando quem chama é o indicador dono do lead, só enquanto o status
-- ainda é 'visita_agendada' (não deixa reabrir/alterar leads já avançados).
CREATE OR REPLACE FUNCTION public.indicator_request_check_in(_lead_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leads l
     SET check_in_requested = true
    FROM public.indicators i
   WHERE l.id = _lead_id
     AND l.indicator_id = i.id
     AND i.user_id = auth.uid()
     AND l.status = 'visita_agendada';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead não encontrado, não pertence a este indicador, ou não está em visita_agendada';
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.indicator_request_check_in(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.indicator_request_check_in(uuid) TO authenticated;
