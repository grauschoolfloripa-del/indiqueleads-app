
-- Trigger: recalcula saldos do indicador quando o lead evolui pela pipeline.
-- - visita_confirmada (transição): soma commission_value em balance_pending.
-- - commission_paid vira true OU status vira venda_concluida: transfere de pending para available.
CREATE OR REPLACE FUNCTION public.leads_sync_indicator_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moved_to_confirmed boolean := false;
  moved_to_paid boolean := false;
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

  IF moved_to_confirmed AND NOT moved_to_paid THEN
    UPDATE public.indicators
       SET balance_pending = balance_pending + NEW.commission_value
     WHERE id = NEW.indicator_id;
  END IF;

  IF moved_to_paid THEN
    UPDATE public.indicators
       SET balance_available = balance_available + NEW.commission_value,
           balance_pending = GREATEST(0, balance_pending - NEW.commission_value)
     WHERE id = NEW.indicator_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_sync_balance ON public.leads;
CREATE TRIGGER trg_leads_sync_balance
AFTER INSERT OR UPDATE OF status, commission_paid ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.leads_sync_indicator_balance();
