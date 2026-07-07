import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, type AppRole } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — IndicaAqui" },
      { name: "description", content: "Acesse sua conta IndicaAqui — indicadores, anunciantes e administradores." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("indicator");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: "/" });
    }
  }, [loading, session, navigate]);

  const handleGoogle = async () => {
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error.message || "Falha ao iniciar login com Google.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no login com Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        setInfo("Conta criada. Verifique seu e-mail para confirmar (se solicitado).");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 text-white">
          <span className="bg-orange-600 text-white rounded-lg p-2 shadow-lg">
            <Sparkles className="w-5 h-5" />
          </span>
          <span className="font-bold text-2xl tracking-tight">IndicaAqui</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                mode === "signin" ? "bg-white text-slate-900 shadow" : "text-slate-500"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                mode === "signup" ? "bg-white text-slate-900 shadow" : "text-slate-500"
              }`}
            >
              Criar conta
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.8 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.8 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.2l-6.1-5.2C29.1 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.1 5.2C41 34.2 44 29.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">ou com email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Nome completo</span>
                  <div className="mt-1 relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Seu nome"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Eu sou</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AppRole)}
                    className="mt-1 w-full py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="indicator">Indicador (quero indicar e ganhar comissão)</option>
                    <option value="advertiser">Anunciante (quero divulgar meus produtos)</option>
                    <option value="visitor">Visitante (só quero explorar)</option>
                  </select>
                </label>
              </>
            )}
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Email</span>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="voce@exemplo.com"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Senha</span>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>}
            {info && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-2">{info}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
