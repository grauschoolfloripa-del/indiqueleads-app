-- Correção: o trigger de push batia na porta e levava 401 antes de chegar na
-- função.
--
--   {"code":"UNAUTHORIZED_NO_AUTH_HEADER","message":"Missing authorization header"}
--
-- Edge Function publicada sem `--no-verify-jwt` fica atrás do gateway do
-- Supabase, que exige um `Authorization` válido. O trigger mandava só o
-- `x-push-secret`, então o pedido morria no gateway — a função nunca era
-- executada e nenhum push saía. Silenciosamente, ainda por cima, porque o
-- trigger engole erro de propósito.
--
-- A chave `anon` serve como Authorization aqui. Ela NÃO é segredo: já vai
-- dentro do bundle do navegador em toda visita. Quem autentica de verdade
-- continua sendo o `shared_secret`, conferido dentro da função — sem ele,
-- qualquer um com a chave pública poderia disparar notificação.
ALTER TABLE app_private.push_config
  ADD COLUMN IF NOT EXISTS anon_key TEXT;

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
  IF NOT FOUND OR cfg.anon_key IS NULL THEN
    RETURN NEW;  -- push não configurado; a notificação in-app já está salva
  END IF;

  PERFORM net.http_post(
    url := cfg.function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- exigido pelo gateway das Edge Functions
      'Authorization', 'Bearer ' || cfg.anon_key,
      -- é este que autoriza de fato, conferido dentro da função
      'x-push-secret', cfg.shared_secret
    ),
    body := jsonb_build_object('notification_id', NEW.id)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Push é extra: não pode derrubar o registro da comissão.
  RAISE WARNING 'dispatch_push_notification falhou: %', SQLERRM;
  RETURN NEW;
END; $$;
