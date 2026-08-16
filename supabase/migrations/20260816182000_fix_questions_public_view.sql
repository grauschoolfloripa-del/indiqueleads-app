-- Correção: a view de questões estava criada com `security_invoker = true`,
-- então ela era avaliada com as permissões de quem chama — e como
-- `course_questions` tem RLS sem nenhuma policy de SELECT (proposital: o
-- gabarito não pode vazar), a view devolvia vazio para todo mundo.
--
-- Recriada como view SECURITY DEFINER (o padrão do Postgres): roda com as
-- permissões do dono e contorna a RLS da tabela base. Isso é seguro aqui
-- justamente porque a projeção não inclui `correct_index` — o gabarito
-- continua inacessível pela API.
DROP VIEW IF EXISTS public.course_questions_public;

CREATE VIEW public.course_questions_public AS
  SELECT id, course_id, position, question, options
    FROM public.course_questions;

ALTER VIEW public.course_questions_public SET (security_invoker = false);
GRANT SELECT ON public.course_questions_public TO authenticated;
