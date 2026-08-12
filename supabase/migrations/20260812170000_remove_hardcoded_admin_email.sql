-- Bug encontrado em teste real: handle_new_user() força qualquer signup com
-- email = 'contato@midiaeco.com' a virar admin, ignorando o role escolhido
-- no formulário. Isso hardcoda o email de um desenvolvedor específico como
-- "admin eterno" — frágil e surpreendente: se o dono do negócio real usar
-- esse mesmo email (que é justamente o caso aqui), toda tentativa de criar
-- uma conta de anunciante/indicador nesse email vira admin silenciosamente,
-- sem nenhum aviso.
--
-- Correção: self-signup nunca concede admin, ponto — respeitando o role
-- escolhido (indicator/advertiser/visitor). Promoção a admin passa a ser
-- exclusivamente via admin_set_user_role() (RPC já existente, só um admin
-- pode chamá-la). Como contato@midiaeco.com já é admin (seedado em migration
-- anterior), não há problema de "ninguém consegue virar admin" — o bootstrap
-- já aconteceu.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _requested public.app_role;
  _assigned public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  _requested := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'visitor');

  -- Nunca permitir escalonamento a admin via signup público, hardcoded email
  -- ou não.
  _assigned := CASE WHEN _requested = 'admin' THEN 'visitor' ELSE _requested END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _assigned)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;
