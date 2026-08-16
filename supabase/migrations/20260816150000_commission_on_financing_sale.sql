-- Comissão de venda pela Mesa de Financiamentos.
--
-- Buraco encontrado em teste real: o indicador levou uma simulação de crédito
-- até o fim (aprovada, contrato assinado, status 'concluido') e não recebeu
-- nada. Motivo: TODO o comissionamento era disparado por um único trigger na
-- tabela `leads`. A mesa de financiamentos é um fluxo paralelo — grava em
-- `financing_simulations`, tem status próprios e nunca criava lead nem tocava
-- no ledger. Ou seja, venda fechada por financiamento não gerava comissão
-- nenhuma.
--
-- Regra definida com o dono do produto:
--  - o indicador faz a simulação direto com o anunciante; se o cliente aprova
--    e o contrato é assinado, ele recebe a MESMA comissão de venda que o
--    anunciante cadastrou no produto;
--  - quem confirma que a venda aconteceu é o ANUNCIANTE. Isso já era garantido
--    pela RLS (`fin_update_admin`): o indicador só tem SELECT em
--    financing_simulations, então não consegue liberar o próprio dinheiro.
--    Mantido de propósito — é o mesmo princípio do fluxo "Cheguei na Loja".

-- =========================================================
-- 1. O ledger passa a aceitar comissão originada de simulação
-- =========================================================
-- `lead_id` deixa de ser obrigatório: agora uma linha de comissão nasce de um
-- lead OU de uma simulação de financiamento.
ALTER TABLE public.commissions ALTER COLUMN lead_id DROP NOT NULL;

ALTER TABLE public.commissions
  ADD COLUMN simulation_id UUID REFERENCES public.financing_simulations(id) ON DELETE CASCADE;

-- Exatamente uma origem por linha — sem isso seria possível gravar uma
-- comissão órfã (nenhuma origem) ou ambígua (as duas).
ALTER TABLE public.commissions
  ADD CONSTRAINT commissions_one_source_chk
  CHECK (num_nonnulls(lead_id, simulation_id) = 1);

-- A UNIQUE (lead_id, kind) original garantia idempotência do trigger. Como
-- lead_id agora pode ser NULL (e em SQL NULLs não colidem numa UNIQUE), ela é
-- trocada por dois índices parciais, um para cada origem.
ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_lead_id_kind_key;
CREATE UNIQUE INDEX IF NOT EXISTS commissions_lead_kind_uidx
  ON public.commissions (lead_id, kind) WHERE lead_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS commissions_simulation_kind_uidx
  ON public.commissions (simulation_id, kind) WHERE simulation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_simulation ON public.commissions(simulation_id);

-- =========================================================
-- 2. Trigger: simulação concluída → comissão de venda
-- =========================================================
CREATE OR REPLACE FUNCTION public.financing_sync_indicator_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _amount NUMERIC(12,2);
BEGIN
  -- Só interessa a transição para 'concluido' (contrato assinado / venda
  -- fechada). Entrar de novo no mesmo estado não repaga nada, e o índice
  -- único por (simulation_id, kind) é a trava final de idempotência.
  IF NEW.status IS DISTINCT FROM 'concluido' OR OLD.status IS NOT DISTINCT FROM 'concluido' THEN
    RETURN NEW;
  END IF;

  -- Sem indicador não há a quem pagar (simulação criada direto pelo cliente).
  IF NEW.indicator_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Valor = comissão de venda cadastrada no produto pelo anunciante.
  -- Preferimos a presencial: nesse fluxo o indicador acompanha o negócio de
  -- ponta a ponta com o anunciante, que é exatamente o que a trilha
  -- presencial remunera. Cai na digital quando o produto não define a
  -- presencial.
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

  -- 'available': o anunciante já confirmou o fechamento, então o dinheiro
  -- nasce liberado para saque (mesma lógica da comissão de venda do lead
  -- depois que o anunciante marca a venda como fechada).
  INSERT INTO public.commissions (simulation_id, indicator_id, kind, amount, status)
  VALUES (NEW.id, NEW.indicator_id, 'venda', _amount, 'available')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.financing_sync_indicator_commission() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_financing_sync_commission ON public.financing_simulations;
CREATE TRIGGER trg_financing_sync_commission
AFTER UPDATE OF status ON public.financing_simulations
FOR EACH ROW EXECUTE FUNCTION public.financing_sync_indicator_commission();

-- =========================================================
-- 3. Backfill: simulações já concluídas antes desta migration
-- =========================================================
-- A simulação de teste (BMW 320i) fechou antes do trigger existir; o registro
-- está íntegro, então a comissão devida é gerada aqui em vez de se perder.
INSERT INTO public.commissions (simulation_id, indicator_id, kind, amount, status)
SELECT s.id,
       s.indicator_id,
       'venda',
       COALESCE(NULLIF(p.commission_presencial_value, 0), NULLIF(p.commission_digital_value, 0), 0),
       'available'
  FROM public.financing_simulations s
  JOIN public.products p ON p.id = s.product_id
 WHERE s.status = 'concluido'
   AND s.indicator_id IS NOT NULL
   AND COALESCE(NULLIF(p.commission_presencial_value, 0), NULLIF(p.commission_digital_value, 0), 0) > 0
ON CONFLICT DO NOTHING;
