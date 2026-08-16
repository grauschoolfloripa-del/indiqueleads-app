-- Trava de certificação na atribuição do lead.
--
-- Correção de rumo em relação ao que eu havia planejado: a ideia original era
-- esconder os produtos não certificados via RLS. Isso está errado para este
-- produto — os anúncios são PÚBLICOS por natureza (o visitante abre a página
-- do produto sem login; é assim que a indicação funciona). Bloquear a leitura
-- quebraria a vitrine pública.
--
-- O que realmente precisa de trava não é ver o anúncio, é GANHAR COMISSÃO nele.
-- Então a regra passa a ser: um lead só é atribuído a um indicador se ele for
-- certificado na categoria daquele produto. Sem atribuição, não há comissão —
-- que é exatamente o efeito desejado.
--
-- No front a vitrine continua filtrada por certificação, mas isso é UX: a
-- garantia de verdade é esta função, que roda no servidor.

CREATE OR REPLACE FUNCTION public.can_indicate_product(_user UUID, _product_id UUID)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cat public.product_category;
BEGIN
  IF _user IS NULL THEN RETURN false; END IF;

  SELECT category INTO _cat FROM public.products WHERE id = _product_id;
  IF _cat IS NULL THEN RETURN false; END IF;

  -- Precisa do módulo geral E do módulo daquele nicho.
  RETURN public.has_general_certification(_user)
     AND public.is_certified_for(_user, _cat);
END; $$;

REVOKE EXECUTE ON FUNCTION public.can_indicate_product(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_indicate_product(UUID, UUID) TO authenticated, service_role;

/**
 * Usada pela Edge Function `create-lead` (service role) para decidir se o
 * indicador recebido no `?ref=` pode mesmo ser creditado por aquele produto.
 * Recebe o id do INDICADOR (não o user_id) porque é o que o link carrega.
 */
CREATE OR REPLACE FUNCTION public.indicator_can_earn_on_product(
  _indicator_id UUID,
  _product_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user UUID;
BEGIN
  SELECT user_id INTO _user FROM public.indicators WHERE id = _indicator_id;
  IF _user IS NULL THEN RETURN false; END IF;
  RETURN public.can_indicate_product(_user, _product_id);
END; $$;

REVOKE EXECUTE ON FUNCTION public.indicator_can_earn_on_product(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.indicator_can_earn_on_product(UUID, UUID) TO authenticated, service_role;

-- Conveniência para o front: as categorias que o usuário logado já liberou.
CREATE OR REPLACE FUNCTION public.my_certified_categories()
RETURNS SETOF public.product_category
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.category
    FROM public.indicator_certifications c
   WHERE c.user_id = auth.uid()
     AND c.category IS NOT NULL;
$$;
REVOKE EXECUTE ON FUNCTION public.my_certified_categories() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_certified_categories() TO authenticated;
