-- Limite de tentativas na avaliação.
--
-- Sem limite, a avaliação não avalia nada: são 4 alternativas por questão e o
-- resultado não mostra quais erraram, mas nada impedia refazer indefinidamente
-- até a combinação passar. Quem chutasse o bastante saía certificado igual a
-- quem estudou — e certificação é o que libera indicar bem de alto valor.
--
-- Regra: 3 tentativas por dia, por curso. Quem reprova três vezes espera o dia
-- seguinte. É o suficiente para acomodar erro bobo e nervosismo, e insuficiente
-- para varrer o gabarito.
--
-- Quem já passou não gasta tentativa: refazer um curso concluído é revisão, e
-- travar revisão não protege nada.

CREATE OR REPLACE FUNCTION public.quiz_attempts_left(_course_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    0,
    3 - (
      SELECT count(*)::int
        FROM public.quiz_attempts a
       WHERE a.user_id = auth.uid()
         AND a.course_id = _course_id
         AND a.passed = false
         AND a.created_at > now() - interval '24 hours'
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.quiz_attempts_left(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quiz_attempts_left(UUID) TO authenticated;

/**
 * Quando a próxima tentativa fica disponível. NULL = já pode tentar.
 * A espera conta a partir da tentativa mais antiga da janela, não da última —
 * senão errar de novo empurraria o prazo para sempre.
 */
CREATE OR REPLACE FUNCTION public.quiz_next_attempt_at(_course_id UUID)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.quiz_attempts_left(_course_id) > 0 THEN NULL
    ELSE (
      SELECT min(a.created_at) + interval '24 hours'
        FROM public.quiz_attempts a
       WHERE a.user_id = auth.uid()
         AND a.course_id = _course_id
         AND a.passed = false
         AND a.created_at > now() - interval '24 hours'
    )
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.quiz_next_attempt_at(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quiz_next_attempt_at(UUID) TO authenticated;

-- A trava real fica aqui dentro: a tela pode esconder o botão, mas quem chama
-- a RPC direto continua barrado.
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
  _ja_certificado BOOLEAN;
  _restantes INT;
  _libera_em TIMESTAMPTZ;
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

  -- Revisão de curso já concluído não consome tentativa nem é bloqueada.
  SELECT EXISTS (
    SELECT 1 FROM public.indicator_certifications c
     WHERE c.user_id = auth.uid() AND c.course_id = _course_id
  ) INTO _ja_certificado;

  IF NOT _ja_certificado THEN
    _restantes := public.quiz_attempts_left(_course_id);
    IF _restantes <= 0 THEN
      _libera_em := public.quiz_next_attempt_at(_course_id);
      RAISE EXCEPTION
        'Você usou as 3 tentativas de hoje. Reveja as aulas e tente de novo a partir de %',
        to_char(_libera_em AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI');
    END IF;
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
    ) resp ON true
   WHERE q.course_id = _course_id
     AND resp.choice = q.correct_index;

  _score := ROUND((_correct::numeric / _total) * 100);
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
