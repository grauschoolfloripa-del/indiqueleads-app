import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  GraduationCap,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Award,
} from "lucide-react";
import type { Category, Course, IndicatorApplication } from "@/types";
import { VERTICALS, VERTICALS_ORDER } from "@/lib/verticals";
import {
  useMyApplication,
  useSubmitApplication,
  useCourses,
  useCourseContent,
  useMyProgress,
  useCompleteLesson,
  useMyCertifications,
  useQuizAttemptsLeft,
  useSubmitQuiz,
} from "@/hooks/queries";

/**
 * Credenciamento do indicador: cadastro avaliado → módulo de Fundamentos →
 * um módulo por nicho. Cada certificação de nicho libera aquela vitrine.
 *
 * Esta tela é o portão: enquanto o cadastro não é aprovado, nada de curso;
 * enquanto Fundamentos não é concluído, nenhum nicho abre. As mesmas regras
 * existem no servidor (submit_quiz) — aqui elas são só a experiência.
 */

interface AcademyProps {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  onAddNotification: (msg: string, type: "success" | "info") => void;
}

export default function Academy({
  userId,
  userName,
  userEmail,
  userPhone,
  onAddNotification,
}: AcademyProps) {
  const navigate = useNavigate();
  const applicationQuery = useMyApplication(true);
  const application = applicationQuery.data ?? null;
  const approved = application?.status === "aprovado";

  const coursesQuery = useCourses(approved);
  const certificationsQuery = useMyCertifications(approved);
  const progressQuery = useMyProgress(approved);

  const [openCourseId, setOpenCourseId] = useState<string | null>(null);

  if (applicationQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">Carregando…</div>
    );
  }

  if (!application || application.status === "rejeitado") {
    return (
      <ApplicationForm
        userId={userId}
        defaults={{ name: userName, email: userEmail, phone: userPhone }}
        previous={application}
        onDone={() => onAddNotification("Cadastro enviado para análise!", "success")}
      />
    );
  }

  if (application.status !== "aprovado") {
    return <PendingReview application={application} />;
  }

  const courses = coursesQuery.data ?? [];
  const certifications = certificationsQuery.data ?? [];
  const certifiedCourseIds = new Set(certifications.map((c) => c.courseId));
  const hasGeneral = certifications.some((c) => c.category === null);

  if (openCourseId) {
    const course = courses.find((c) => c.id === openCourseId);
    if (course) {
      return (
        <CoursePlayer
          jaCertificado={certifiedCourseIds.has(course.id)}
          course={course}
          completedLessons={new Set(progressQuery.data ?? [])}
          onBack={() => setOpenCourseId(null)}
          onAddNotification={onAddNotification}
        />
      );
    }
  }

  const general = courses.filter((c) => c.category === null);
  const niches = courses.filter((c) => c.category !== null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Só aparece para quem já tem um nicho liberado — antes disso não existe
          painel para onde voltar, e o link seria um beco. */}
      {certifications.some((c) => c.category) && (
        <button
          onClick={() =>
            void navigate({
              to: "/",
              search: (prev: Record<string, unknown>) => {
                const { aba, ...resto } = prev;
                void aba;
                return resto;
              },
            })
          }
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao painel
        </button>
      )}

      <header className="rounded-3xl bg-gradient-to-br from-sea-700 via-ink-900 to-ink-950 p-6 text-white relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(72,168,72,0.28) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Academy IndiqueLeads</h1>
            <p className="mt-0.5 text-xs text-white/70">
              {certifications.length === 0
                ? "Comece pelos Fundamentos para liberar seu primeiro nicho."
                : `${certifications.length} módulo(s) concluído(s) • ${
                    certifications.filter((c) => c.category).length
                  } nicho(s) liberado(s)`}
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500">
          Passo 1 — Obrigatório
        </h2>
        {general.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            done={certifiedCourseIds.has(c.id)}
            locked={false}
            onOpen={() => setOpenCourseId(c.id)}
          />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-500">
          Passo 2 — Escolha seus nichos
        </h2>
        {!hasGeneral && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Conclua os Fundamentos para desbloquear os módulos de nicho.
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {niches.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              done={certifiedCourseIds.has(c.id)}
              locked={!hasGeneral}
              onOpen={() => setOpenCourseId(c.id)}
            />
          ))}
        </div>
        {niches.length === 0 && (
          <p className="text-xs text-slate-400">Novos nichos serão liberados em breve.</p>
        )}
      </section>
    </div>
  );
}

function CourseCard({
  course,
  done,
  locked,
  onOpen,
}: {
  course: Course;
  done: boolean;
  locked: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      disabled={locked}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        locked
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
          : done
            ? "cursor-pointer border-emerald-200 bg-emerald-50 hover:border-emerald-300"
            : "cursor-pointer border-slate-200 bg-white hover:border-brand-400 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{course.emoji ?? "📘"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-slate-900">{course.title}</h3>
            {done && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
            {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
          </div>
          {course.subtitle && (
            <p className="mt-0.5 text-[11px] font-semibold text-brand-600">{course.subtitle}</p>
          )}
          {course.description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{course.description}</p>
          )}
          <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {done ? "Concluído" : locked ? "Bloqueado" : "Começar →"}
          </span>
        </div>
      </div>
    </button>
  );
}

function PendingReview({ application }: { application: IndicatorApplication }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-amber-700">
        <Clock className="h-8 w-8" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-black text-slate-900">Cadastro em análise</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Recebemos seus dados, {application.fullName.split(" ")[0]}. Nossa equipe avalia cada
        candidatura manualmente — são produtos de alto valor, e a curadoria da rede é o que sustenta
        a confiança dos anunciantes.
      </p>
      <p className="mt-3 text-xs text-slate-400">
        Enviado em {new Date(application.createdAt).toLocaleDateString("pt-BR")}. Você será avisado
        assim que houver uma resposta.
      </p>
    </div>
  );
}

function ApplicationForm({
  userId,
  defaults,
  previous,
  onDone,
}: {
  userId: string;
  defaults: { name: string; email: string; phone: string };
  previous: IndicatorApplication | null;
  onDone: () => void;
}) {
  const submit = useSubmitApplication();
  const [form, setForm] = useState({
    fullName: previous?.fullName ?? defaults.name,
    cpf: previous?.cpf ?? "",
    birthDate: previous?.birthDate ?? "",
    phone: previous?.phone ?? defaults.phone,
    email: previous?.email ?? defaults.email,
    addressCity: previous?.addressCity ?? "",
    addressState: previous?.addressState ?? "SP",
    occupation: previous?.occupation ?? "",
    experience: previous?.experience ?? "",
    motivation: previous?.motivation ?? "",
    socialLinks: previous?.socialLinks ?? "",
    referralSource: previous?.referralSource ?? "",
  });
  const [interests, setInterests] = useState<Category[]>(previous?.interestCategories ?? []);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accepted) return setError("É preciso aceitar o contrato de parceria.");
    if (interests.length === 0) return setError("Selecione ao menos um nicho de interesse.");
    if (form.cpf.replace(/\D/g, "").length !== 11) return setError("CPF inválido.");

    submit.mutate(
      {
        userId,
        input: {
          ...form,
          birthDate: form.birthDate || null,
          interestCategories: interests,
          acceptedTerms: true,
        },
      },
      {
        onSuccess: onDone,
        onError: (err) =>
          setError(err instanceof Error ? err.message : "Não foi possível enviar o cadastro."),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {previous?.status === "rejeitado" && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <XCircle className="h-4 w-4" /> Cadastro não aprovado
          </div>
          {previous.reviewNotes && (
            <p className="mt-1 text-xs leading-relaxed text-red-700">{previous.reviewNotes}</p>
          )}
          <p className="mt-2 text-xs text-red-600">
            Você pode revisar os dados abaixo e enviar novamente.
          </p>
        </div>
      )}

      <div className="mb-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500 text-white">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-black text-slate-900">
          Credenciamento de Indicador
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Trabalhamos com bens de alto valor. Cada candidatura é avaliada por uma pessoa antes de
          liberar o acesso à vitrine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Identificação">
          <Field
            label="Nome completo"
            value={form.fullName}
            onChange={(v) => set("fullName", v)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="CPF"
              value={form.cpf}
              onChange={(v) => set("cpf", v)}
              required
              placeholder="000.000.000-00"
            />
            <Field
              label="Nascimento"
              type="date"
              value={form.birthDate}
              onChange={(v) => set("birthDate", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp" value={form.phone} onChange={(v) => set("phone", v)} required />
            <Field
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(v) => set("email", v)}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field
                label="Cidade"
                value={form.addressCity}
                onChange={(v) => set("addressCity", v)}
                required
              />
            </div>
            <Field
              label="UF"
              value={form.addressState}
              onChange={(v) => set("addressState", v)}
              required
            />
          </div>
        </Section>

        <Section title="Perfil">
          <Field
            label="Ocupação atual"
            value={form.occupation}
            onChange={(v) => set("occupation", v)}
            placeholder="ex: corretor, autônomo, vendedor"
          />
          <Area
            label="Experiência com vendas ou indicações"
            value={form.experience}
            onChange={(v) => set("experience", v)}
            placeholder="Conte brevemente. Não ter experiência não elimina ninguém."
          />
          <Area
            label="Por que quer indicar na IndiqueLeads?"
            value={form.motivation}
            onChange={(v) => set("motivation", v)}
          />
          <Field
            label="Redes sociais (opcional)"
            value={form.socialLinks}
            onChange={(v) => set("socialLinks", v)}
            placeholder="@seuinstagram, linkedin..."
          />
          <Field
            label="Como conheceu a plataforma?"
            value={form.referralSource}
            onChange={(v) => set("referralSource", v)}
          />
        </Section>

        <Section title="Nichos de interesse">
          <p className="-mt-1 text-xs text-slate-500">
            Você fará um módulo por nicho. Escolher agora não obriga a nada — só indica sua
            preferência.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VERTICALS_ORDER.map((cat) => {
              const v = VERTICALS[cat];
              const on = interests.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setInterests((prev) => (on ? prev.filter((c) => c !== cat) : [...prev, cat]))
                  }
                  className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition-all cursor-pointer ${
                    on
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {v.emoji} {v.shortLabel}
                </button>
              );
            })}
          </div>
        </Section>

        <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 accent-brand-500"
          />
          <span className="text-xs leading-relaxed text-slate-600">
            Declaro que as informações são verdadeiras e aceito o{" "}
            <strong className="text-slate-900">Contrato de Parceria Autônoma</strong> (Art. 442-B da
            CLT), sem vínculo empregatício, e as regras de conduta da plataforma.
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submit.isPending}
          className="w-full rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-400 disabled:opacity-60 cursor-pointer"
        >
          {submit.isPending ? "Enviando…" : "Enviar cadastro para análise"}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-display text-sm font-bold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <textarea
        value={value}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </label>
  );
}

/** Player de aulas + avaliação. */
function CoursePlayer({
  course,
  completedLessons,
  jaCertificado,
  onBack,
  onAddNotification,
}: {
  course: Course;
  completedLessons: Set<string>;
  /** Curso já concluído: refazer é revisão, não consome nem esbarra no limite. */
  jaCertificado: boolean;
  onBack: () => void;
  onAddNotification: (msg: string, type: "success" | "info") => void;
}) {
  const { lessons, questions } = useCourseContent(course.id);
  const completeLesson = useCompleteLesson();
  const submitQuiz = useSubmitQuiz();
  const tentativasQuery = useQuizAttemptsLeft(course.id, !jaCertificado);
  const tentativasRestantes = tentativasQuery.data;

  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"lessons" | "quiz" | "result">("lessons");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  /**
   * Marca a aula como concluída avisando se não der.
   *
   * A tela avança de propósito mesmo em caso de falha — travar a leitura por
   * causa de uma gravação seria pior. Mas o silêncio era pior ainda: a pessoa
   * estudava o módulo inteiro, o progresso não gravava, e ela só descobria ao
   * ver tudo em branco no dia seguinte.
   */
  const concluirAula = (lessonId: string) => {
    completeLesson.mutate(lessonId, {
      onError: () =>
        onAddNotification(
          "Não conseguimos salvar a conclusão desta aula. Confira sua conexão e abra a aula de novo.",
          "info",
        ),
    });
  };

  const list = lessons.data ?? [];
  const qs = questions.data ?? [];
  const lesson = list[index];
  const allDone = list.length > 0 && list.every((l) => completedLessons.has(l.id));

  if (lessons.isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">Carregando aulas…</div>;
  }

  if (mode === "result" && result) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${
            result.passed ? "bg-brand-500 text-white" : "bg-amber-100 text-amber-700"
          }`}
        >
          {result.passed ? <Award className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </motion.div>
        <h2 className="mt-5 font-display text-2xl font-black text-slate-900">
          {result.passed ? "Aprovado!" : "Quase lá"}
        </h2>
        <p className="mt-1 font-mono text-3xl font-black text-slate-900">{result.score}%</p>
        <p className="mt-2 text-sm text-slate-600">
          {result.passed
            ? course.category
              ? "Nicho liberado! Os anúncios dessa categoria já aparecem na sua vitrine."
              : "Fundamentos concluído. Agora escolha seu primeiro nicho."
            : `Você precisa de ${course.passScore}% para ser aprovado. Revise as aulas e tente de novo.`}
        </p>
        <button
          onClick={onBack}
          className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white cursor-pointer hover:bg-slate-800"
        >
          Voltar para a Academy
        </button>
      </div>
    );
  }

  if (mode === "quiz") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => setMode("lessons")}
          className="mb-4 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar às aulas
        </button>
        <h2 className="font-display text-xl font-black text-slate-900">Avaliação</h2>
        <p className="mt-1 text-xs text-slate-500">
          {qs.length} questões • {course.passScore}% para aprovar
        </p>

        {/* O aviso vem ANTES das questões de propósito: descobrir que acabaram
            as tentativas depois de responder tudo seria cruel. */}
        {!jaCertificado && tentativasRestantes !== undefined && (
          <p
            className={`mt-3 rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
              tentativasRestantes === 0
                ? "bg-amber-50 text-amber-900"
                : tentativasRestantes === 1
                  ? "bg-amber-50 text-amber-900"
                  : "bg-slate-50 text-slate-600"
            }`}
          >
            {tentativasRestantes === 0 ? (
              <>
                Você usou as 3 tentativas de hoje. Reveja as aulas — a avaliação reabre amanhã. Não
                é castigo: o certificado é o que libera você a indicar bens de alto valor, então ele
                precisa significar alguma coisa.
              </>
            ) : (
              <>
                <strong>
                  {tentativasRestantes}{" "}
                  {tentativasRestantes === 1 ? "tentativa restante" : "tentativas restantes"} hoje.
                </strong>{" "}
                São 3 por dia. Se acabarem, a avaliação reabre no dia seguinte.
              </>
            )}
          </p>
        )}

        <div className="mt-6 space-y-5">
          {qs.map((q, qi) => (
            <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-900">
                {qi + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-xs transition-colors ${
                      answers[q.id] === oi
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === oi}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className="mt-0.5 accent-brand-500"
                    />
                    <span className="text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={
            Object.keys(answers).length < qs.length ||
            submitQuiz.isPending ||
            (!jaCertificado && tentativasRestantes === 0)
          }
          onClick={() =>
            submitQuiz.mutate(
              {
                courseId: course.id,
                answers: Object.entries(answers).map(([question_id, choice]) => ({
                  question_id,
                  choice,
                })),
              },
              {
                onSuccess: (r) => {
                  setResult({ score: r.score, passed: r.passed });
                  setMode("result");
                  void tentativasQuery.refetch();
                },
                onError: (err) =>
                  onAddNotification(
                    err instanceof Error ? err.message : "Erro ao enviar a avaliação.",
                    "info",
                  ),
              },
            )
          }
          className="mt-6 w-full rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-400 disabled:opacity-50 cursor-pointer"
        >
          {!jaCertificado && tentativasRestantes === 0
            ? "Tentativas esgotadas por hoje"
            : Object.keys(answers).length < qs.length
              ? `Responda todas (${Object.keys(answers).length}/${qs.length})`
              : submitQuiz.isPending
                ? "Corrigindo…"
                : "Enviar avaliação"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Academy
      </button>

      <div className="mb-4 flex items-center gap-2">
        {list.map((l, i) => (
          <div
            key={l.id}
            className={`h-1.5 flex-1 rounded-full ${
              completedLessons.has(l.id)
                ? "bg-brand-500"
                : i === index
                  ? "bg-slate-400"
                  : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {lesson && (
        <article className="rounded-3xl border border-slate-200 bg-white p-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
            Aula {lesson.position} de {list.length} • {lesson.durationMin} min
          </span>
          <h2 className="mt-1 font-display text-2xl font-black text-slate-900">{lesson.title}</h2>
          {lesson.summary && <p className="mt-1 text-sm text-slate-500">{lesson.summary}</p>}
          <div className="prose-sm mt-5 space-y-3 text-sm leading-relaxed text-slate-700">
            {renderMarkdown(lesson.content)}
          </div>
        </article>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-40 cursor-pointer hover:bg-slate-50"
        >
          Anterior
        </button>

        {index < list.length - 1 ? (
          <button
            onClick={() => {
              if (lesson) concluirAula(lesson.id);
              setIndex((i) => i + 1);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white cursor-pointer hover:bg-slate-800"
          >
            Concluir e avançar <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (lesson) concluirAula(lesson.id);
              setMode("quiz");
            }}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white cursor-pointer hover:bg-brand-400"
          >
            Ir para a avaliação <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {allDone && mode === "lessons" && (
        <p className="mt-3 text-center text-[11px] text-slate-400">
          Todas as aulas concluídas — você pode refazer a avaliação quando quiser.
        </p>
      )}
    </div>
  );
}

/**
 * Render mínimo de markdown (títulos, negrito, listas, citação e tabela
 * simples). Suficiente para o conteúdo das aulas e evita trazer uma
 * dependência de markdown só para isso.
 */
function renderMarkdown(md: string) {
  return md.split("\n").map((line, i) => {
    const key = `l-${i}`;
    if (!line.trim()) return <div key={key} className="h-1" />;
    if (line.startsWith("## "))
      return (
        <h3 key={key} className="pt-3 font-display text-base font-bold text-slate-900">
          {line.slice(3)}
        </h3>
      );
    if (line.startsWith("> "))
      return (
        <blockquote
          key={key}
          className="border-l-4 border-brand-500 bg-brand-500/5 py-2 pl-3 font-semibold text-slate-800"
        >
          {bold(line.slice(2))}
        </blockquote>
      );
    if (line.startsWith("- "))
      return (
        <div key={key} className="flex gap-2 pl-1">
          <span className="text-brand-500">•</span>
          <span>{bold(line.slice(2))}</span>
        </div>
      );
    if (/^\|/.test(line))
      return (
        <div key={key} className="font-mono text-[11px] text-slate-500">
          {line.replace(/\|/g, "  ")}
        </div>
      );
    return <p key={key}>{bold(line)}</p>;
  });
}

function bold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-slate-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
