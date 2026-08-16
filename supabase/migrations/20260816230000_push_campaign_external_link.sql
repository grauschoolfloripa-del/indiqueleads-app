-- Destino livre nas campanhas de push.
--
-- Antes só aceitávamos caminho interno. A restrição existia por um motivo real
-- — push com link para fora é vetor de phishing, e quem toca está confiando na
-- marca —, mas ela impedia usos legítimos: mandar para uma página de campanha,
-- um anúncio hospedado fora, um material do anunciante.
--
-- A regra passa a ser: caminho interno começando com "/" OU endereço https
-- completo. `http://` continua barrado: mandar gente para página sem
-- criptografia a partir de uma notificação da plataforma é ruim de qualquer
-- ângulo, e não há caso de uso que justifique.
--
-- A tela avisa em destaque quando o destino é externo, para o admin não mandar
-- para fora sem perceber.
CREATE OR REPLACE FUNCTION public.admin_send_push_campaign(
  _title TEXT,
  _body TEXT,
  _audience public.push_audience,
  _user_ids UUID[] DEFAULT '{}',
  _categories public.product_category[] DEFAULT '{}',
  _image_url TEXT DEFAULT NULL,
  _target_url TEXT DEFAULT '/?fonte=app',
  _action_label TEXT DEFAULT NULL
)
RETURNS public.push_campaigns
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  campanha public.push_campaigns;
  cfg app_private.push_config%ROWTYPE;
  total INTEGER;
  destino TEXT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  destino := btrim(coalesce(_target_url, ''));

  IF destino = '' THEN
    RAISE EXCEPTION 'Informe o destino da mensagem';
  END IF;

  IF left(destino, 1) <> '/' AND destino !~* '^https://' THEN
    RAISE EXCEPTION
      'O destino deve ser um caminho interno (começando com /) ou um endereço https://';
  END IF;

  IF _audience = 'especificos' AND cardinality(_user_ids) = 0 THEN
    RAISE EXCEPTION 'Selecione ao menos um destinatário';
  END IF;

  INSERT INTO public.push_campaigns (
    title, body, image_url, target_url, action_label,
    audience, audience_user_ids, audience_categories, created_by
  ) VALUES (
    btrim(_title), btrim(_body), nullif(btrim(coalesce(_image_url,'')),''),
    destino, nullif(btrim(coalesce(_action_label,'')),''),
    _audience, coalesce(_user_ids,'{}'), coalesce(_categories,'{}'), auth.uid()
  ) RETURNING * INTO campanha;

  INSERT INTO public.notifications (user_id, kind, title, body, metadata, campaign_id)
  SELECT t.user_id,
         'campanha',
         campanha.title,
         campanha.body,
         jsonb_build_object('url', campanha.target_url, 'image', campanha.image_url),
         campanha.id
    FROM public.push_audience_users(_audience, _user_ids, _categories) t;

  GET DIAGNOSTICS total = ROW_COUNT;

  UPDATE public.push_campaigns SET recipients = total WHERE id = campanha.id
  RETURNING * INTO campanha;

  SELECT * INTO cfg FROM app_private.push_config LIMIT 1;
  IF FOUND AND cfg.anon_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := cfg.function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || cfg.anon_key,
        'x-push-secret', cfg.shared_secret
      ),
      body := jsonb_build_object('campaign_id', campanha.id)
    );
  END IF;

  RETURN campanha;
END; $$;

REVOKE EXECUTE ON FUNCTION public.admin_send_push_campaign(TEXT, TEXT, public.push_audience, UUID[], public.product_category[], TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_send_push_campaign(TEXT, TEXT, public.push_audience, UUID[], public.product_category[], TEXT, TEXT, TEXT) TO authenticated;
