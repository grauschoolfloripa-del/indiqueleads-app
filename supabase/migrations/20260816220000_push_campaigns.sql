-- Central de mensagens do admin.
--
-- Até aqui o push só nascia de evento do sistema (comissão paga, cadastro
-- aprovado). Esta migration abre o canal para o admin falar com a base:
-- oportunidade nova, aviso de manutenção, chamada para concluir a Academy.
--
-- Decisões que sustentam o desenho:
--
--  * Campanha é registro, não disparo solto. Fica gravada com quem enviou,
--    para quem, quando e qual foi o resultado. Mensagem enviada para milhares
--    de pessoas sem rastro é problema esperando acontecer.
--
--  * Cada destinatário também ganha linha em `notifications`. Push é efêmero:
--    se a pessoa limpar a barra de avisos, a mensagem tem que continuar no
--    app.
--
--  * O disparo é UMA chamada para a Edge Function, não uma por pessoa. Por
--    isso `notifications.campaign_id`: o trigger existente pula essas linhas,
--    senão uma campanha de 500 pessoas viraria 500 requisições HTTP.

-- =========================================================
-- 1. Campanhas
-- =========================================================
CREATE TYPE public.push_audience AS ENUM (
  'todos',
  'indicadores',
  'anunciantes',
  'especificos'
);

CREATE TABLE IF NOT EXISTS public.push_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 80),
  body TEXT NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 300),

  -- Imagem grande no corpo do aviso (Android mostra; iOS ignora).
  image_url TEXT,
  -- Para onde vai o toque. Caminho interno, sempre começando com "/".
  target_url TEXT NOT NULL DEFAULT '/?fonte=app',
  -- Rótulo do botão de ação. Nulo = sem botão.
  action_label TEXT CHECK (action_label IS NULL OR length(btrim(action_label)) <= 24),

  audience public.push_audience NOT NULL,
  -- Só para 'especificos'.
  audience_user_ids UUID[] NOT NULL DEFAULT '{}',
  -- Filtro extra para 'indicadores': só quem é certificado nestes nichos.
  audience_categories public.product_category[] NOT NULL DEFAULT '{}',

  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Resultado, preenchido pela Edge Function.
  recipients INTEGER NOT NULL DEFAULT 0,
  devices_sent INTEGER,
  devices_failed INTEGER,
  dispatched_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_campaigns_recentes
  ON public.push_campaigns(created_at DESC);

ALTER TABLE public.push_campaigns ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_campaigns FROM PUBLIC, anon;
GRANT SELECT ON public.push_campaigns TO authenticated;
GRANT ALL ON public.push_campaigns TO service_role;

DROP POLICY IF EXISTS "campanhas_select_admin" ON public.push_campaigns;
CREATE POLICY "campanhas_select_admin" ON public.push_campaigns
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Sem policy de INSERT/UPDATE de propósito: criar campanha só pela RPC abaixo,
-- que valida o papel e monta os destinatários no servidor.

-- =========================================================
-- 2. Ligação com as notificações in-app
-- =========================================================
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.push_campaigns(id) ON DELETE SET NULL;

-- O trigger de push individual precisa ignorar linhas de campanha: elas são
-- entregues de uma vez só, pela própria campanha.
CREATE OR REPLACE FUNCTION public.dispatch_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  cfg app_private.push_config%ROWTYPE;
BEGIN
  IF NEW.campaign_id IS NOT NULL THEN
    RETURN NEW;  -- entregue em lote pela campanha
  END IF;

  SELECT * INTO cfg FROM app_private.push_config LIMIT 1;
  IF NOT FOUND OR cfg.anon_key IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := cfg.function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || cfg.anon_key,
      'x-push-secret', cfg.shared_secret
    ),
    body := jsonb_build_object('notification_id', NEW.id)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'dispatch_push_notification falhou: %', SQLERRM;
  RETURN NEW;
END; $$;

-- =========================================================
-- 3. Quem recebe
-- =========================================================
/**
 * Resolve o público de uma campanha em user_ids.
 *
 * Usada duas vezes: pela tela, antes de enviar, para mostrar o alcance real;
 * e pela RPC de criação, para gravar as notificações. Ter uma só definição
 * evita o pior tipo de surpresa — a prévia dizer 40 e o disparo pegar 400.
 */
CREATE OR REPLACE FUNCTION public.push_audience_users(
  _audience public.push_audience,
  _user_ids UUID[] DEFAULT '{}',
  _categories public.product_category[] DEFAULT '{}'
)
RETURNS TABLE (user_id UUID)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  RETURN QUERY
  SELECT DISTINCT r.user_id
    FROM public.user_roles r
   WHERE CASE _audience
           WHEN 'todos'        THEN true
           WHEN 'indicadores'  THEN r.role = 'indicator'
           WHEN 'anunciantes'  THEN r.role = 'advertiser'
           WHEN 'especificos'  THEN r.user_id = ANY(_user_ids)
         END
     -- Filtro por nicho: só faz sentido para indicador, e só quando pedido.
     AND (
       cardinality(_categories) = 0
       OR EXISTS (
         SELECT 1 FROM public.indicator_certifications c
          WHERE c.user_id = r.user_id
            AND c.category = ANY(_categories)
       )
     );
END; $$;

REVOKE EXECUTE ON FUNCTION public.push_audience_users(public.push_audience, UUID[], public.product_category[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.push_audience_users(public.push_audience, UUID[], public.product_category[]) TO authenticated;

/** Quantas pessoas e quantos aparelhos a campanha alcançaria. */
CREATE OR REPLACE FUNCTION public.push_audience_reach(
  _audience public.push_audience,
  _user_ids UUID[] DEFAULT '{}',
  _categories public.product_category[] DEFAULT '{}'
)
RETURNS TABLE (pessoas INTEGER, aparelhos INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH alvo AS (
    SELECT user_id FROM public.push_audience_users(_audience, _user_ids, _categories)
  )
  SELECT (SELECT count(*)::int FROM alvo),
         (SELECT count(*)::int FROM public.push_subscriptions s
           WHERE s.user_id IN (SELECT user_id FROM alvo));
$$;

REVOKE EXECUTE ON FUNCTION public.push_audience_reach(public.push_audience, UUID[], public.product_category[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.push_audience_reach(public.push_audience, UUID[], public.product_category[]) TO authenticated;

-- =========================================================
-- 4. Criar e disparar
-- =========================================================
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
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  -- Destino precisa ser interno: link externo em push é vetor de phishing, e
  -- aqui quem clica confia na marca.
  IF _target_url IS NULL OR left(_target_url, 1) <> '/' THEN
    RAISE EXCEPTION 'O destino deve ser um caminho interno começando com /';
  END IF;

  IF _audience = 'especificos' AND cardinality(_user_ids) = 0 THEN
    RAISE EXCEPTION 'Selecione ao menos um destinatário';
  END IF;

  INSERT INTO public.push_campaigns (
    title, body, image_url, target_url, action_label,
    audience, audience_user_ids, audience_categories, created_by
  ) VALUES (
    btrim(_title), btrim(_body), nullif(btrim(coalesce(_image_url,'')),''),
    _target_url, nullif(btrim(coalesce(_action_label,'')),''),
    _audience, coalesce(_user_ids,'{}'), coalesce(_categories,'{}'), auth.uid()
  ) RETURNING * INTO campanha;

  -- Cada pessoa recebe também a notificação in-app. campaign_id preenchido faz
  -- o trigger individual ignorar — a entrega é em lote, logo abaixo.
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

-- =========================================================
-- 5. Leitura pela Edge Function
-- =========================================================
CREATE OR REPLACE FUNCTION public.push_targets_for_campaign(_campaign_id UUID)
RETURNS TABLE (
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT,
  title TEXT,
  body TEXT,
  url TEXT,
  image TEXT,
  action_label TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.endpoint, s.p256dh, s.auth,
         c.title, c.body, c.target_url, c.image_url, c.action_label
    FROM public.push_campaigns c
    JOIN public.notifications n ON n.campaign_id = c.id
    JOIN public.push_subscriptions s ON s.user_id = n.user_id
   WHERE c.id = _campaign_id;
$$;

REVOKE EXECUTE ON FUNCTION public.push_targets_for_campaign(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.push_targets_for_campaign(UUID) TO service_role;

/** Resultado do disparo, gravado pela Edge Function. */
CREATE OR REPLACE FUNCTION public.push_campaign_report(
  _campaign_id UUID, _sent INTEGER, _failed INTEGER
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.push_campaigns
     SET devices_sent = _sent, devices_failed = _failed, dispatched_at = now()
   WHERE id = _campaign_id;
$$;

REVOKE EXECUTE ON FUNCTION public.push_campaign_report(UUID, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.push_campaign_report(UUID, INTEGER, INTEGER) TO service_role;
