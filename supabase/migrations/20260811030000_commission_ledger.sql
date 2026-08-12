-- Novo modelo de comissionamento:
--  (a) presencial: o upload de contrato/NF deixa de ser trava de pagamento —
--      vira prova opcional. A comissão de venda é paga quando o anunciante
--      marca a venda como fechada.
--  (b) o indicador passa a ganhar também uma comissão por LEAD, disparada
--      quando a visita é confirmada pelo anunciante (não quando é agendada,
--      para não pagar por lead fantasma). Se o mesmo lead comprar depois, a
--      comissão de venda soma por cima.
--
-- Como agora existem dois eventos de pagamento por lead (lead + venda), as
-- colunas de comissão que viviam na linha do `lead` (commission_value,
-- commission_paid) não bastam mais — não há onde registrar "comissão de lead
-- paga, comissão de venda ainda pendente". Esta migration introduz uma tabela
-- ledger `commissions` (um evento por linha) que substitui essa
-- responsabilidade, e reescreve o trigger de sincronização de saldo para
-- escrever nela em vez de somar direto em `indicators`.
--
-- As colunas `leads.commission_value`/`commission_type`/`commission_paid` são
-- mantidas por compatibilidade (ainda representam a comissão de VENDA
-- daquele lead, calculada na criação a partir do produto) — mas deixam de ser
-- a fonte de saldo: quem manda agora é o ledger.

-- =========================================================
-- commissions (ledger)
-- =========================================================
CREATE TYPE public.commission_kind AS ENUM ('lead', 'venda');
CREATE TYPE public.commission_status AS ENUM ('pending', 'available', 'paid');

CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  kind public.commission_kind NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status public.commission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- No máximo um evento de cada tipo por lead (idempotência do trigger).
  UNIQUE (lead_id, kind)
);
CREATE INDEX idx_commissions_indicator ON public.commissions(indicator_id);
CREATE INDEX idx_commissions_lead ON public.commissions(lead_id);
CREATE INDEX idx_commissions_indicator_kind_created ON public.commissions(indicator_id, kind, created_at);

CREATE TRIGGER trg_commissions_updated BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Leitura: o próprio indicador vê seu ledger; admin vê tudo. Nenhuma escrita
-- direta é concedida a anon/authenticated — só os triggers (SECURITY DEFINER)
-- e a service role escrevem aqui. Isso é o que torna o ledger confiável como
-- registro financeiro: o cliente não pode inserir uma linha "paga" sozinho.
GRANT SELECT ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commissions_select_own_or_admin" ON public.commissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.indicators i WHERE i.id = indicator_id AND i.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- =========================================================
-- products.commission_lead_value — quanto o anunciante paga por lead
-- qualificado (visita confirmada), definido por produto.
-- =========================================================
ALTER TABLE public.products
  ADD COLUMN commission_lead_value NUMERIC(12,2) NOT NULL DEFAULT 0;

-- =========================================================
-- platform_config — teto mensal de comissão por lead por indicador (freio de
-- emergência contra abuso). NULL = sem teto.
-- =========================================================
ALTER TABLE public.platform_config
  ADD COLUMN max_lead_commission_per_indicator_month NUMERIC(12,2);

-- =========================================================
-- Trigger: commissions → indicators.balance_pending / balance_available
--
-- Mantém as colunas de saldo agregado em `indicators` (usadas pela carteira
-- no front) como espelho do ledger, reagindo a mudanças de status de cada
-- linha de `commissions`. Assim a tela de saldo não precisa mudar.
-- =========================================================
CREATE OR REPLACE FUNCTION public.commissions_sync_indicator_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'pending' THEN
      UPDATE public.indicators SET balance_pending = balance_pending + NEW.amount WHERE id = NEW.indicator_id;
    ELSIF NEW.status = 'available' THEN
      UPDATE public.indicators SET balance_available = balance_available + NEW.amount WHERE id = NEW.indicator_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'pending' AND NEW.status = 'available' THEN
      UPDATE public.indicators
         SET balance_pending = GREATEST(0, balance_pending - OLD.amount),
             balance_available = balance_available + NEW.amount
       WHERE id = NEW.indicator_id;
    ELSIF OLD.status = 'pending' AND NEW.status = 'paid' THEN
      UPDATE public.indicators
         SET balance_pending = GREATEST(0, balance_pending - OLD.amount)
       WHERE id = NEW.indicator_id;
    ELSIF OLD.status = 'available' AND NEW.status = 'paid' THEN
      UPDATE public.indicators
         SET balance_available = GREATEST(0, balance_available - OLD.amount)
       WHERE id = NEW.indicator_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.commissions_sync_indicator_balance() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_commissions_sync_balance
AFTER INSERT OR UPDATE OF status ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.commissions_sync_indicator_balance();

-- =========================================================
-- Trigger: leads → commissions (substitui leads_sync_indicator_balance)
--
-- Dois eventos independentes por lead:
--  - 'venda': igual a antes — cria 'pending' quando a visita é confirmada,
--    libera para 'available' quando a venda fecha (commission_paid ou status
--    venda_concluida). Valor = leads.commission_value (calculado na criação
--    do lead a partir do produto).
--  - 'lead': novo — criada como 'available' diretamente (sem fase pendente:
--    o próprio evento gatilho, visita confirmada pelo anunciante, já é a
--    barreira antifraude) quando a visita é confirmada pela primeira vez.
--    Mitigações contra lead fantasma:
--      * dedup: só o primeiro lead do mesmo telefone/e-mail para o mesmo
--        anunciante em 90 dias gera comissão de lead;
--      * teto mensal configurável por indicador (platform_config).
-- =========================================================
CREATE OR REPLACE FUNCTION public.leads_sync_indicator_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moved_to_confirmed boolean := false;
  moved_to_paid boolean := false;
  lead_commission_amount NUMERIC(12,2);
  already_commissioned boolean;
  monthly_cap NUMERIC(12,2);
  month_total NUMERIC(12,2);
  headroom NUMERIC(12,2);
BEGIN
  IF NEW.indicator_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    moved_to_confirmed := (NEW.status = 'visita_confirmada');
    moved_to_paid := (NEW.commission_paid = true OR NEW.status = 'venda_concluida');
  ELSE
    moved_to_confirmed := (NEW.status = 'visita_confirmada' AND COALESCE(OLD.status, '') <> 'visita_confirmada');
    moved_to_paid := ((NEW.commission_paid = true AND COALESCE(OLD.commission_paid, false) = false)
                       OR (NEW.status = 'venda_concluida' AND COALESCE(OLD.status, '') <> 'venda_concluida'));
  END IF;

  IF moved_to_confirmed THEN
    -- Evento 'venda': entra pendente (idempotente — UNIQUE(lead_id, kind) já
    -- garante que isso só acontece uma vez por lead).
    INSERT INTO public.commissions (lead_id, indicator_id, kind, amount, status)
    VALUES (NEW.id, NEW.indicator_id, 'venda', NEW.commission_value, 'pending')
    ON CONFLICT (lead_id, kind) DO NOTHING;

    -- Evento 'lead': só se ainda não existe comissão de lead para este lead,
    -- e passa pelas duas mitigações de fraude.
    SELECT commission_lead_value INTO lead_commission_amount
      FROM public.products WHERE id = NEW.product_id;

    IF lead_commission_amount IS NOT NULL AND lead_commission_amount > 0 THEN
      SELECT EXISTS (
        SELECT 1 FROM public.commissions c
        JOIN public.leads l2 ON l2.id = c.lead_id
        WHERE c.kind = 'lead'
          AND l2.advertiser_id = NEW.advertiser_id
          AND l2.id <> NEW.id
          AND (l2.client_phone = NEW.client_phone OR l2.client_email = NEW.client_email)
          AND l2.created_at >= now() - interval '90 days'
      ) INTO already_commissioned;

      IF NOT already_commissioned THEN
        SELECT max_lead_commission_per_indicator_month INTO monthly_cap
          FROM public.platform_config WHERE id = 1;

        IF monthly_cap IS NOT NULL THEN
          SELECT COALESCE(SUM(amount), 0) INTO month_total
            FROM public.commissions
           WHERE indicator_id = NEW.indicator_id
             AND kind = 'lead'
             AND created_at >= date_trunc('month', now());
          headroom := GREATEST(monthly_cap - month_total, 0);
          lead_commission_amount := LEAST(lead_commission_amount, headroom);
        END IF;

        IF lead_commission_amount > 0 THEN
          INSERT INTO public.commissions (lead_id, indicator_id, kind, amount, status)
          VALUES (NEW.id, NEW.indicator_id, 'lead', lead_commission_amount, 'available')
          ON CONFLICT (lead_id, kind) DO NOTHING;
        END IF;
      END IF;
    END IF;
  END IF;

  IF moved_to_paid THEN
    -- Libera a comissão de venda. Se por algum motivo ainda não existe linha
    -- 'venda' (ex.: venda marcada sem ter passado por visita_confirmada),
    -- cria direto como 'available'.
    UPDATE public.commissions
       SET status = 'available'
     WHERE lead_id = NEW.id AND kind = 'venda' AND status = 'pending';

    INSERT INTO public.commissions (lead_id, indicator_id, kind, amount, status)
    VALUES (NEW.id, NEW.indicator_id, 'venda', NEW.commission_value, 'available')
    ON CONFLICT (lead_id, kind) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.leads_sync_indicator_balance() FROM PUBLIC, anon, authenticated;

-- O trigger antigo (trg_leads_sync_balance) já existe apontando para esta
-- mesma função — CREATE OR REPLACE acima já é suficiente, não precisa recriar.
