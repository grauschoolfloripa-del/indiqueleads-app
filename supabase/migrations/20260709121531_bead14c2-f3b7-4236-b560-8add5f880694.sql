
-- 1. Confirmar e-mail do admin se já existir
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'contato@midiaeco.com';

-- 2. Garantir role admin para contato@midiaeco.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'contato@midiaeco.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Garantir perfil
INSERT INTO public.profiles (id, full_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'Administrador')
FROM auth.users
WHERE email = 'contato@midiaeco.com'
ON CONFLICT (id) DO NOTHING;

-- 4. Substituir handle_new_user: apenas contato@midiaeco.com pode ser admin via signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _requested public.app_role;
  _assigned public.app_role;
  _is_admin_email boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  _is_admin_email := (lower(NEW.email) = 'contato@midiaeco.com');
  _requested := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'visitor');

  IF _is_admin_email THEN
    _assigned := 'admin';
  ELSIF _requested = 'admin' THEN
    -- Nunca permitir escalonamento via signup público
    _assigned := 'visitor';
  ELSE
    _assigned := _requested;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _assigned)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 5. Garantir trigger existente (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
