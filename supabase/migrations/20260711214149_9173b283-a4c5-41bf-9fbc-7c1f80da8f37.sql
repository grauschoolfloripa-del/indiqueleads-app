DROP POLICY IF EXISTS indicators_select_own ON public.indicators;

CREATE POLICY indicators_select_related
ON public.indicators
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.leads l
    JOIN public.advertisers a ON a.id = l.advertiser_id
    WHERE l.indicator_id = indicators.id
      AND a.user_id = auth.uid()
  )
);