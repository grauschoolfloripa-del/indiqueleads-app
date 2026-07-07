
-- First registered user becomes the sole admin. Subsequent users get their chosen role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _has_admin boolean;
  _requested public.app_role;
  _assigned public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO _has_admin;
  _requested := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'visitor');

  IF NOT _has_admin THEN
    _assigned := 'admin';
  ELSE
    -- Never let a self-signup escalate to admin.
    IF _requested = 'admin' THEN
      _assigned := 'visitor';
    ELSE
      _assigned := _requested;
    END IF;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _assigned)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Admin-only RPC to grant/revoke roles for other users from the admin panel.
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_target_user uuid, _role public.app_role, _grant boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target_user, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Prevent removing the last admin.
    IF _role = 'admin' THEN
      IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') <= 1
         AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _target_user AND role = 'admin') THEN
        RAISE EXCEPTION 'cannot remove the last remaining admin';
      END IF;
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _target_user AND role = _role;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) TO authenticated;
