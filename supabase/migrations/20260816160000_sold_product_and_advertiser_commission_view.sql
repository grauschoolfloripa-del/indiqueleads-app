-- Duas lacunas no painel do anunciante, encontradas testando a venda da BMW:
--
-- 1. Venda fechada por financiamento não marcava o produto como vendido. O
--    fluxo de lead já fazia isso (`onUpdateProductStatus(..., 'vendido')` ao
--    fechar a venda), mas a Mesa de Financiamentos não — o anúncio continuava
--    "ativo" e podia seguir recebendo indicações de um bem que já foi vendido.
--
-- 2. O anunciante não conseguia ver quanto deve de comissão. A RLS do ledger
--    só permitia leitura ao próprio indicador e ao admin — mas quem PAGA é o
--    anunciante, então ele precisa enxergar o que é devido nos negócios dele.

-- =========================================================
-- 1. Simulação concluída → produto vendido
-- =========================================================
-- Estende a função que já cria a comissão, para também baixar o produto.
CREATE OR REPLACE FUNCTION public.financing_sync_indicator_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _amount NUMERIC(12,2);
BEGIN
  IF NEW.status IS DISTINCT FROM 'concluido' OR OLD.status IS NOT DISTINCT FROM 'concluido' THEN
    RETURN NEW;
  END IF;

  -- O bem saiu do estoque: sai também da vitrine de indicações. Não usamos
  -- DELETE — o anúncio vira histórico, e a remoção definitiva é uma decisão
  -- do anunciante (o painel mostra "vendido / aguardando remoção").
  UPDATE public.products
     SET status = 'vendido'
   WHERE id = NEW.product_id
     AND status <> 'vendido';

  IF NEW.indicator_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(
           NULLIF(p.commission_presencial_value, 0),
           NULLIF(p.commission_digital_value, 0),
           0
         )
    INTO _amount
    FROM public.products p
   WHERE p.id = NEW.product_id;

  IF COALESCE(_amount, 0) <= 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.commissions (simulation_id, indicator_id, kind, amount, status)
  VALUES (NEW.id, NEW.indicator_id, 'venda', _amount, 'available')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Backfill: produtos de simulações já concluídas (a BMW do teste).
UPDATE public.products p
   SET status = 'vendido'
  FROM public.financing_simulations s
 WHERE s.product_id = p.id
   AND s.status = 'concluido'
   AND p.status <> 'vendido';

-- =========================================================
-- 2. O anunciante passa a enxergar as comissões que ele deve
-- =========================================================
-- Leitura apenas — o ledger continua sendo escrito só por trigger/service
-- role. O anunciante vê a comissão quando ela nasce de um lead dele ou de
-- uma simulação dele; nunca comissões de outros anunciantes.
DROP POLICY IF EXISTS "commissions_select_advertiser" ON public.commissions;
CREATE POLICY "commissions_select_advertiser" ON public.commissions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
      FROM public.leads l
      JOIN public.advertisers a ON a.id = l.advertiser_id
     WHERE l.id = commissions.lead_id
       AND a.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
      FROM public.financing_simulations s
      JOIN public.advertisers a ON a.id = s.advertiser_id
     WHERE s.id = commissions.simulation_id
       AND a.user_id = auth.uid()
  )
);

-- =========================================================
-- 3. O anunciante pode editar e remover os próprios anúncios
-- =========================================================
-- O painel ganhou botões de editar/remover anúncio; sem DELETE concedido, a
-- remoção falharia silenciosamente na RLS.
DROP POLICY IF EXISTS "products_delete_own" ON public.products;
CREATE POLICY "products_delete_own" ON public.products
FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
