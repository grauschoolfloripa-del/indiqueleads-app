-- Correção: aprovar/recusar candidatura falhava sempre, no banco.
--
--   column "status" is of type application_status but expression is of type text
--
-- `CASE WHEN _approve THEN 'aprovado' ELSE 'rejeitado' END` tem os dois ramos
-- como literais sem tipo; o Postgres resolve o CASE inteiro como `text`. E a
-- conversão text → enum NÃO é automática em atribuição (só o caminho inverso,
-- para tipos string, é). Como `_approve` é variável, nada é dobrado em tempo de
-- planejamento e o erro aparece na execução — nunca no `db push`.
--
-- No front a mutation não tratava erro, então a exceção morria em silêncio: o
-- botão "Aprovar" parecia inerte. O tratamento de erro foi adicionado junto
-- desta migration, para que uma próxima falha de banco apareça na tela.
CREATE OR REPLACE FUNCTION public.admin_review_application(
  _application_id UUID, _approve BOOLEAN, _notes TEXT DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _app public.indicator_applications%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  SELECT * INTO _app FROM public.indicator_applications WHERE id = _application_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Candidatura não encontrada'; END IF;

  UPDATE public.indicator_applications
     SET status = (CASE WHEN _approve THEN 'aprovado' ELSE 'rejeitado' END)
                  ::public.application_status,
         review_notes = _notes,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   WHERE id = _application_id;

  INSERT INTO public.notifications (user_id, kind, title, body, metadata)
  VALUES (
    _app.user_id,
    CASE WHEN _approve THEN 'application_approved' ELSE 'application_rejected' END,
    CASE WHEN _approve THEN 'Cadastro aprovado! 🎓' ELSE 'Cadastro não aprovado' END,
    CASE WHEN _approve
      THEN 'Bem-vindo à rede IndiqueLeads. O próximo passo é concluir o módulo de Fundamentos para liberar seu primeiro nicho.'
      ELSE COALESCE(_notes, 'Sua candidatura não foi aprovada nesta etapa. Você pode revisar seus dados e enviar novamente.')
    END,
    jsonb_build_object('application_id', _app.id)
  );
END; $$;

REVOKE EXECUTE ON FUNCTION public.admin_review_application(UUID, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_application(UUID, BOOLEAN, TEXT) TO authenticated;
