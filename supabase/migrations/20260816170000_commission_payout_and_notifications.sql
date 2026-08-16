-- Fechamento do ciclo de comissionamento: o anunciante paga o indicador.
--
-- Até aqui o ledger sabia registrar que uma comissão nasceu ('pending') e que
-- foi liberada ('available'), mas nada no produto levava ao estado final
-- ('paid'). Não existia tela nem caminho para o anunciante quitar — a aba
-- "Financeiro" mostrava um resumo derivado de status de lead, sem tocar no
-- ledger.
--
-- Modelo adotado: o PIX acontece fora da plataforma (entre anunciante e
-- indicador) e aqui é REGISTRADO. É o mesmo princípio de confiança do resto
-- do sistema: quem confirma o dinheiro é quem paga, e o registro é auditável.

-- =========================================================
-- 1. Rastro do pagamento no ledger
-- =========================================================
ALTER TABLE public.commissions
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

COMMENT ON COLUMN public.commissions.payment_reference IS
  'Identificador do PIX/comprovante informado pelo anunciante ao quitar.';

-- =========================================================
-- 2. Notificações persistentes por usuário
-- =========================================================
-- Antes, a única forma de avisar o indicador era um link de WhatsApp que o
-- anunciante mandava na mão — nada ficava registrado e nada aparecia no app.
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  amount NUMERIC(12,2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, read_at, created_at DESC);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Cada um só enxerga as próprias. Nenhum INSERT é concedido ao cliente: quem
-- cria notificação é a função SECURITY DEFINER abaixo, senão qualquer um
-- poderia forjar um "você recebeu R$ X".
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- O usuário só pode marcar como lida — nunca alterar valor/título.
DROP POLICY IF EXISTS "notifications_update_own_read" ON public.notifications;
CREATE POLICY "notifications_update_own_read" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================================================
-- 3. RPC: anunciante quita uma comissão
-- =========================================================
CREATE OR REPLACE FUNCTION public.advertiser_pay_commission(
  _commission_id UUID,
  _reference TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _c public.commissions%ROWTYPE;
  _is_owner BOOLEAN;
  _indicator_user UUID;
  _indicator_name TEXT;
  _origem TEXT;
BEGIN
  SELECT * INTO _c FROM public.commissions WHERE id = _commission_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comissão não encontrada';
  END IF;

  -- Só o anunciante do negócio (ou admin) quita. Sem isso, qualquer usuário
  -- autenticado poderia marcar comissões alheias como pagas.
  SELECT EXISTS (
    SELECT 1 FROM public.leads l
      JOIN public.advertisers a ON a.id = l.advertiser_id
     WHERE l.id = _c.lead_id AND a.user_id = auth.uid()
    UNION ALL
    SELECT 1 FROM public.financing_simulations s
      JOIN public.advertisers a ON a.id = s.advertiser_id
     WHERE s.id = _c.simulation_id AND a.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin') INTO _is_owner;

  IF NOT _is_owner THEN
    RAISE EXCEPTION 'Somente o anunciante do negócio pode quitar esta comissão';
  END IF;

  -- 'pending' ainda não venceu (visita/venda não confirmada) e 'paid' já foi.
  IF _c.status <> 'available' THEN
    RAISE EXCEPTION 'Só é possível pagar comissões liberadas (status atual: %)', _c.status;
  END IF;

  UPDATE public.commissions
     SET status = 'paid',
         paid_at = now(),
         payment_reference = NULLIF(btrim(COALESCE(_reference, '')), '')
   WHERE id = _commission_id;
  -- O trigger trg_commissions_sync_balance cuida de baixar o
  -- balance_available do indicador.

  SELECT i.user_id, i.name INTO _indicator_user, _indicator_name
    FROM public.indicators i WHERE i.id = _c.indicator_id;

  _origem := CASE WHEN _c.simulation_id IS NOT NULL THEN 'financiamento'
                  WHEN _c.kind = 'lead' THEN 'lead qualificado'
                  ELSE 'venda' END;

  IF _indicator_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, kind, title, body, amount, metadata)
    VALUES (
      _indicator_user,
      'commission_paid',
      'Comissão paga! 🎉',
      format('Sua comissão de %s foi paga via PIX. O valor já saiu do seu saldo disponível — confira na sua conta.', _origem),
      _c.amount,
      jsonb_build_object(
        'commission_id', _c.id,
        'kind', _c.kind,
        'origem', _origem,
        'reference', NULLIF(btrim(COALESCE(_reference, '')), '')
      )
    );
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.advertiser_pay_commission(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.advertiser_pay_commission(UUID, TEXT) TO authenticated;

-- =========================================================
-- 4. O anunciante precisa ver a chave PIX de quem ele vai pagar
-- =========================================================
-- `indicators_select_own_admin_related` já libera a linha do indicador
-- relacionado ao anunciante (via app_private.can_read_indicator, que casa
-- pela existência de lead entre os dois). Mas um indicador que só fez
-- simulação de financiamento — sem lead — ficava invisível, e era justamente
-- o caso da venda da BMW. Aqui a relação passa a considerar simulações também.
CREATE OR REPLACE FUNCTION app_private.can_read_indicator(_indicator_id uuid, _viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_private
AS $$
  SELECT COALESCE(_viewer_id IS NOT NULL, false)
    AND (
      EXISTS (
        SELECT 1
        FROM public.leads l
        JOIN public.advertisers a ON a.id = l.advertiser_id
        WHERE l.indicator_id = _indicator_id
          AND a.user_id = _viewer_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.financing_simulations s
        JOIN public.advertisers a ON a.id = s.advertiser_id
        WHERE s.indicator_id = _indicator_id
          AND a.user_id = _viewer_id
      )
    );
$$;
