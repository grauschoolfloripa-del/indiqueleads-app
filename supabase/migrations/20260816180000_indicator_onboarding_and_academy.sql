-- Credenciamento do indicador: cadastro avaliado + trilha de cursos por nicho.
--
-- Regra de negócio: são bens de alto valor, então indicar deixa de ser aberto.
-- O indicador passa por (1) cadastro completo avaliado por um admin e, depois
-- de aprovado, (2) um módulo geral de conduta e (3) um módulo por nicho. Só as
-- categorias certificadas ficam visíveis para ele indicar.
--
-- Decisão importante: o gabarito do quiz NUNCA vai para o cliente. As questões
-- são lidas por uma view sem a resposta certa, e a correção acontece numa
-- função no servidor. Se o gabarito trafegasse, bastaria abrir o DevTools para
-- se certificar em tudo.

-- =========================================================
-- 1. Cadastro completo (candidatura)
-- =========================================================
CREATE TYPE public.application_status AS ENUM ('rascunho', 'em_analise', 'aprovado', 'rejeitado');

CREATE TABLE public.indicator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificação
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Endereço (checagem de região de atuação)
  address_street TEXT,
  address_number TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,

  -- Perfil profissional — o que sustenta a avaliação
  occupation TEXT,
  experience TEXT,
  motivation TEXT,
  social_links TEXT,
  referral_source TEXT,
  interest_categories public.product_category[] NOT NULL DEFAULT '{}',

  -- Documentos (URLs no storage privado)
  document_url TEXT,
  selfie_url TEXT,

  accepted_terms BOOLEAN NOT NULL DEFAULT false,

  status public.application_status NOT NULL DEFAULT 'em_analise',
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_applications_status ON public.indicator_applications(status, created_at DESC);
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.indicator_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.indicator_applications TO authenticated;
GRANT ALL ON public.indicator_applications TO service_role;
ALTER TABLE public.indicator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select_own_or_admin" ON public.indicator_applications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "applications_insert_own" ON public.indicator_applications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- O candidato corrige o próprio cadastro só enquanto não foi aprovado; o
-- veredito (status/review_*) é do admin, garantido pelo trigger abaixo.
CREATE POLICY "applications_update_own_pending" ON public.indicator_applications
  FOR UPDATE TO authenticated
  USING (
    (user_id = auth.uid() AND status IN ('rascunho', 'em_analise', 'rejeitado'))
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    (user_id = auth.uid() AND status IN ('rascunho', 'em_analise', 'rejeitado'))
    OR public.has_role(auth.uid(), 'admin')
  );

-- Impede o candidato de se autoaprovar editando o próprio status.
CREATE OR REPLACE FUNCTION public.guard_application_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
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
CREATE TRIGGER trg_guard_application_review
  BEFORE UPDATE ON public.indicator_applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_application_review();

-- =========================================================
-- 2. Academy: cursos, aulas e questões
-- =========================================================
-- category NULL = módulo geral, obrigatório e pré-requisito de todos os nichos.
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category public.product_category,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  emoji TEXT,
  position INT NOT NULL DEFAULT 0,
  pass_score INT NOT NULL DEFAULT 70 CHECK (pass_score BETWEEN 0 AND 100),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position INT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  duration_min INT NOT NULL DEFAULT 5,
  UNIQUE (course_id, position)
);

CREATE TABLE public.course_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position INT NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INT NOT NULL,
  explanation TEXT,
  UNIQUE (course_id, position)
);

GRANT SELECT ON public.courses TO authenticated;
GRANT SELECT ON public.course_lessons TO authenticated;
GRANT ALL ON public.courses, public.course_lessons, public.course_questions TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_read_published" ON public.courses
  FOR SELECT TO authenticated USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "lessons_read" ON public.course_lessons
  FOR SELECT TO authenticated USING (true);

-- Nenhuma policy de SELECT em course_questions: nem o dono da conta lê o
-- gabarito. O acesso é só pela view e pela função de correção abaixo.

-- Questões sem resposta certa — é isso que a tela consome.
CREATE VIEW public.course_questions_public
WITH (security_invoker = true) AS
  SELECT id, course_id, position, question, options
    FROM public.course_questions;
GRANT SELECT ON public.course_questions_public TO authenticated;

-- =========================================================
-- 3. Progresso, tentativas e certificação
-- =========================================================
CREATE TABLE public.lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_own" ON public.lesson_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "progress_insert_own" ON public.lesson_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_attempts_user_course ON public.quiz_attempts(user_id, course_id, created_at DESC);
GRANT SELECT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts_own" ON public.quiz_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Uma linha por curso concluído. category NULL = módulo geral.
CREATE TABLE public.indicator_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  category public.product_category,
  score INT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX idx_certifications_user ON public.indicator_certifications(user_id);
GRANT SELECT ON public.indicator_certifications TO authenticated;
GRANT ALL ON public.indicator_certifications TO service_role;
ALTER TABLE public.indicator_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certifications_own_or_admin" ON public.indicator_certifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 4. Funções de negócio
-- =========================================================

/** true quando o usuário concluiu o módulo geral (pré-requisito dos nichos). */
CREATE OR REPLACE FUNCTION public.has_general_certification(_user UUID)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.indicator_certifications c
      JOIN public.courses co ON co.id = c.course_id
     WHERE c.user_id = _user AND co.category IS NULL
  );
$$;

/** true quando o usuário é certificado naquela categoria. */
CREATE OR REPLACE FUNCTION public.is_certified_for(_user UUID, _category public.product_category)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.indicator_certifications c
     WHERE c.user_id = _user AND c.category = _category
  );
$$;

/** Marca aula como concluída (idempotente). */
CREATE OR REPLACE FUNCTION public.complete_lesson(_lesson_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.lesson_progress (user_id, lesson_id)
  VALUES (auth.uid(), _lesson_id)
  ON CONFLICT DO NOTHING;
END; $$;
REVOKE EXECUTE ON FUNCTION public.complete_lesson(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_lesson(UUID) TO authenticated;

/**
 * Corrige o quiz no servidor e, se passar, certifica.
 * `_answers` é um array de jsonb {question_id, choice}.
 * Exigências: candidatura aprovada, todas as aulas vistas e, para nicho,
 * módulo geral já concluído.
 */
CREATE OR REPLACE FUNCTION public.submit_quiz(_course_id UUID, _answers JSONB)
RETURNS TABLE (score INT, passed BOOLEAN, correct INT, total INT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _course public.courses%ROWTYPE;
  _total INT;
  _correct INT;
  _score INT;
  _passed BOOLEAN;
  _pending_lessons INT;
BEGIN
  SELECT * INTO _course FROM public.courses WHERE id = _course_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Curso não encontrado'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.indicator_applications a
     WHERE a.user_id = auth.uid() AND a.status = 'aprovado'
  ) THEN
    RAISE EXCEPTION 'Seu cadastro precisa ser aprovado antes de fazer os cursos';
  END IF;

  IF _course.category IS NOT NULL AND NOT public.has_general_certification(auth.uid()) THEN
    RAISE EXCEPTION 'Conclua o módulo de Fundamentos antes de um módulo de nicho';
  END IF;

  SELECT count(*) INTO _pending_lessons
    FROM public.course_lessons l
   WHERE l.course_id = _course_id
     AND NOT EXISTS (
       SELECT 1 FROM public.lesson_progress p
        WHERE p.lesson_id = l.id AND p.user_id = auth.uid()
     );
  IF _pending_lessons > 0 THEN
    RAISE EXCEPTION 'Conclua todas as aulas antes de responder a avaliação (faltam %)', _pending_lessons;
  END IF;

  SELECT count(*) INTO _total FROM public.course_questions WHERE course_id = _course_id;
  IF _total = 0 THEN RAISE EXCEPTION 'Este curso ainda não tem avaliação'; END IF;

  SELECT count(*) INTO _correct
    FROM public.course_questions q
    JOIN LATERAL (
      SELECT (a->>'choice')::INT AS choice
        FROM jsonb_array_elements(_answers) a
       WHERE (a->>'question_id')::UUID = q.id
       LIMIT 1
    ) ans ON true
   WHERE q.course_id = _course_id
     AND ans.choice = q.correct_index;

  _score := ROUND((_correct::NUMERIC / _total) * 100);
  _passed := _score >= _course.pass_score;

  INSERT INTO public.quiz_attempts (user_id, course_id, score, passed)
  VALUES (auth.uid(), _course_id, _score, _passed);

  IF _passed THEN
    INSERT INTO public.indicator_certifications (user_id, course_id, category, score)
    VALUES (auth.uid(), _course_id, _course.category, _score)
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;

  RETURN QUERY SELECT _score, _passed, _correct, _total;
END; $$;
REVOKE EXECUTE ON FUNCTION public.submit_quiz(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz(UUID, JSONB) TO authenticated;

/** Admin aprova ou rejeita a candidatura. */
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
     SET status = CASE WHEN _approve THEN 'aprovado' ELSE 'rejeitado' END,
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
