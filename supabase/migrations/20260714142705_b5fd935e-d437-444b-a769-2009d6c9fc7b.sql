CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;
REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated, service_role;

DO $$
DECLARE
  pol record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        qual ILIKE '%has_role(%'
        OR with_check ILIKE '%has_role(%'
      )
  LOOP
    new_qual := CASE WHEN pol.qual IS NULL THEN NULL ELSE replace(pol.qual, 'has_role(', 'app_private.has_role(') END;
    new_check := CASE WHEN pol.with_check IS NULL THEN NULL ELSE replace(pol.with_check, 'has_role(', 'app_private.has_role(') END;

    stmt := format('ALTER POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    IF new_qual IS NOT NULL THEN
      stmt := stmt || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK (%s)', new_check);
    END IF;
    EXECUTE stmt;
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;