-- Correção: o trigger que impede o candidato de se autoaprovar também estava
-- bloqueando a service_role. Em contexto de backend `auth.uid()` é NULL, então
-- `has_role(NULL, 'admin')` dá false e a exceção era levantada — nenhuma rotina
-- administrativa (script, Edge Function, suporte) conseguiria avaliar uma
-- candidatura.
--
-- Liberar quando `auth.uid() IS NULL` é seguro aqui: a tabela só concede
-- UPDATE ao papel `authenticated` (anon não tem grant nenhum), então a única
-- forma de chegar neste trigger sem usuário logado é via service_role, que por
-- definição já é confiável e ignora RLS.
CREATE OR REPLACE FUNCTION public.guard_application_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Backend confiável (service_role): sem usuário na sessão.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.review_notes IS DISTINCT FROM OLD.review_notes
     OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by THEN
    RAISE EXCEPTION 'Somente um administrador pode avaliar a candidatura';
  END IF;

  RETURN NEW;
END; $$;
