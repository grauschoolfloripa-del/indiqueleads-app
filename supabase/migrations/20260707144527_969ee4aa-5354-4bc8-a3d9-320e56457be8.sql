
-- Restrict internal SECURITY DEFINER functions from direct API execution.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- authenticated needs EXECUTE for RLS policy evaluation (policies call has_role).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Tighten public INSERT policies to require minimal valid contact data.
DROP POLICY IF EXISTS "leads_public_insert" ON public.leads;
CREATE POLICY "leads_public_insert" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(client_name,'')) > 1
    AND length(coalesce(client_phone,'')) >= 8
    AND client_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "fin_insert_public" ON public.financing_simulations;
CREATE POLICY "fin_insert_public" ON public.financing_simulations FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(client_name,'')) > 1
    AND length(coalesce(client_cpf,'')) >= 11
    AND client_income >= 0
    AND down_payment >= 0
    AND desired_installments > 0
  );
