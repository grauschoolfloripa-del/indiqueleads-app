CREATE OR REPLACE FUNCTION app_private.can_read_indicator(_indicator_id uuid, _viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_private
AS $$
  SELECT COALESCE(_viewer_id IS NOT NULL, false)
    AND EXISTS (
      SELECT 1
      FROM public.leads l
      JOIN public.advertisers a ON a.id = l.advertiser_id
      WHERE l.indicator_id = _indicator_id
        AND a.user_id = _viewer_id
    );
$$;

CREATE OR REPLACE FUNCTION app_private.can_access_lead(_lead_id uuid, _viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_private
AS $$
  SELECT COALESCE(_viewer_id IS NOT NULL, false)
    AND EXISTS (
      SELECT 1
      FROM public.leads l
      LEFT JOIN public.advertisers a ON a.id = l.advertiser_id
      LEFT JOIN public.indicators i ON i.id = l.indicator_id
      WHERE l.id = _lead_id
        AND (
          a.user_id = _viewer_id
          OR i.user_id = _viewer_id
          OR app_private.has_role(_viewer_id, 'admin'::public.app_role)
        )
    );
$$;

CREATE OR REPLACE FUNCTION app_private.can_advertiser_update_lead(_lead_id uuid, _viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, app_private
AS $$
  SELECT COALESCE(_viewer_id IS NOT NULL, false)
    AND EXISTS (
      SELECT 1
      FROM public.leads l
      JOIN public.advertisers a ON a.id = l.advertiser_id
      WHERE l.id = _lead_id
        AND a.user_id = _viewer_id
    );
$$;

GRANT USAGE ON SCHEMA app_private TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.can_read_indicator(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.can_access_lead(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.can_advertiser_update_lead(uuid, uuid) TO authenticated, service_role;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.advertisers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.indicators TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.advertisers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT INSERT ON public.chat_messages TO anon;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.product_images TO service_role;
GRANT ALL ON public.advertisers TO service_role;
GRANT ALL ON public.indicators TO service_role;
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.chat_messages TO service_role;

DROP POLICY IF EXISTS indicators_select_related ON public.indicators;
DROP POLICY IF EXISTS indicators_read_related ON public.indicators;
DROP POLICY IF EXISTS indicators_select_own_admin_related ON public.indicators;
CREATE POLICY indicators_select_own_admin_related
ON public.indicators
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR app_private.has_role(auth.uid(), 'admin'::public.app_role)
  OR app_private.can_read_indicator(id, auth.uid())
);

DROP POLICY IF EXISTS leads_advertiser_read ON public.leads;
DROP POLICY IF EXISTS leads_indicator_read ON public.leads;
DROP POLICY IF EXISTS leads_related_read ON public.leads;
CREATE POLICY leads_related_read
ON public.leads
FOR SELECT
TO authenticated
USING (app_private.can_access_lead(id, auth.uid()));

DROP POLICY IF EXISTS leads_advertiser_update ON public.leads;
DROP POLICY IF EXISTS leads_related_update ON public.leads;
CREATE POLICY leads_related_update
ON public.leads
FOR UPDATE
TO authenticated
USING (
  app_private.can_advertiser_update_lead(id, auth.uid())
  OR app_private.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  app_private.can_advertiser_update_lead(id, auth.uid())
  OR app_private.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS chat_insert_related ON public.chat_messages;
DROP POLICY IF EXISTS chat_related_insert ON public.chat_messages;
CREATE POLICY chat_related_insert
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (app_private.can_access_lead(lead_id, auth.uid()));

DROP POLICY IF EXISTS chat_read_related ON public.chat_messages;
DROP POLICY IF EXISTS chat_related_read ON public.chat_messages;
CREATE POLICY chat_related_read
ON public.chat_messages
FOR SELECT
TO authenticated
USING (app_private.can_access_lead(lead_id, auth.uid()));