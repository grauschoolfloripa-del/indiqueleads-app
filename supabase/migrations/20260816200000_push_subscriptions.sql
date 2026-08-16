-- Push real: avisar o indicador com o app fechado.
--
-- Até aqui as notificações existiam só dentro do app (tabela `notifications`).
-- Quem não estivesse com a tela aberta não ficava sabendo que a comissão caiu —
-- que é justamente o aviso que importa.

CREATE EXTENSION IF NOT EXISTS pg_net;

-- =========================================================
-- 1. Aparelhos inscritos
-- =========================================================
-- Uma linha por navegador/aparelho. A mesma pessoa pode ter vários (celular,
-- tablet), e todos devem receber.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- O endpoint é o identificador do aparelho para o serviço de push. Único:
  -- reinscrever o mesmo aparelho atualiza em vez de duplicar.
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

DROP POLICY IF EXISTS "push_select_own" ON public.push_subscriptions;
CREATE POLICY "push_select_own" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_insert_own" ON public.push_subscriptions;
CREATE POLICY "push_insert_own" ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_update_own" ON public.push_subscriptions;
CREATE POLICY "push_update_own" ON public.push_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_delete_own" ON public.push_subscriptions;
CREATE POLICY "push_delete_own" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =========================================================
-- 2. Endereço e segredo da Edge Function
-- =========================================================
-- Fica em app_private (sem grant para anon/authenticated) porque o segredo
-- compartilhado é o que impede alguém de chamar a função de fora.
CREATE SCHEMA IF NOT EXISTS app_private;

CREATE TABLE IF NOT EXISTS app_private.push_config (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  function_url TEXT NOT NULL,
  shared_secret TEXT NOT NULL
);

REVOKE ALL ON app_private.push_config FROM PUBLIC, anon, authenticated;

-- =========================================================
-- 3. Disparo automático ao nascer uma notificação
-- =========================================================
CREATE OR REPLACE FUNCTION public.dispatch_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  cfg app_private.push_config%ROWTYPE;
BEGIN
  SELECT * INTO cfg FROM app_private.push_config LIMIT 1;
  IF NOT FOUND THEN
    RETURN NEW;  -- push ainda não configurado; a notificação in-app já está salva
  END IF;

  PERFORM net.http_post(
    url := cfg.function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', cfg.shared_secret
    ),
    body := jsonb_build_object('notification_id', NEW.id)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Regra inegociável: push é um extra. Se o envio falhar, a notificação
  -- precisa continuar gravada e o pagamento da comissão precisa continuar
  -- valendo. Engolir o erro aqui é intencional.
  RAISE WARNING 'dispatch_push_notification falhou: %', SQLERRM;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_dispatch_push ON public.notifications;
CREATE TRIGGER trg_dispatch_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_push_notification();

-- =========================================================
-- 4. Leitura da inscrição pela Edge Function
-- =========================================================
-- A função roda com service_role e precisa do payload já montado.
CREATE OR REPLACE FUNCTION public.push_targets_for_notification(_notification_id UUID)
RETURNS TABLE (
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT,
  title TEXT,
  body TEXT,
  url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.endpoint,
         s.p256dh,
         s.auth,
         n.title,
         n.body,
         CASE n.kind
           WHEN 'commission_paid'      THEN '/?aba=carteira&fonte=app'
           WHEN 'application_approved' THEN '/?fonte=app'
           ELSE '/?fonte=app'
         END AS url
    FROM public.notifications n
    JOIN public.push_subscriptions s ON s.user_id = n.user_id
   WHERE n.id = _notification_id;
$$;

REVOKE EXECUTE ON FUNCTION public.push_targets_for_notification(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.push_targets_for_notification(UUID) TO service_role;
