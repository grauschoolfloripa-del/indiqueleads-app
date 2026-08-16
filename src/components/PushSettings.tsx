import { useCallback, useEffect, useState } from "react";
import { BellRing, Check, Loader2, RefreshCw, X } from "lucide-react";

import { enablePush, pushDiagnostics, type PushDiag } from "@/lib/push";

/**
 * Estado dos avisos no aparelho, dentro da carteira.
 *
 * Fica aqui porque o aviso que importa é o da comissão. Serve para dois
 * públicos: o indicador, que precisa poder ligar e conferir se está ligado; e
 * o suporte, que sem isto não tem como distinguir "não chegou notificação" de
 * permissão negada, service worker morto ou gravação recusada — cada uma some
 * de um jeito diferente e nenhuma aparece na tela.
 */
export default function PushSettings({
  userId,
  onAddNotification,
}: {
  userId: string;
  onAddNotification: (msg: string, type: "success" | "info") => void;
}) {
  const [diag, setDiag] = useState<PushDiag | null>(null);
  const [working, setWorking] = useState(false);

  const carregar = useCallback(async () => {
    setDiag(await pushDiagnostics(userId));
  }, [userId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (!diag) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 text-xs text-slate-400 shadow-sm">
        Verificando avisos…
      </div>
    );
  }

  const ligado = diag.registradoNoServidor && diag.permissao === "granted";

  const handleLigar = async () => {
    setWorking(true);
    try {
      const ok = await enablePush(userId);
      onAddNotification(
        ok
          ? "Avisos ligados neste aparelho."
          : "Não foi possível ligar. Veja o diagnóstico abaixo.",
        ok ? "success" : "info",
      );
      await carregar();
    } catch (e) {
      onAddNotification(e instanceof Error ? e.message : "Falha ao ligar os avisos.", "info");
      await carregar();
    } finally {
      setWorking(false);
    }
  };

  const Linha = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
        }`}
      >
        {ok ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
      </span>
      <span className={ok ? "text-slate-700" : "text-slate-500"}>{label}</span>
    </li>
  );

  return (
    <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
          <BellRing className="h-5 w-5 text-blue-700" />
          Avisos neste aparelho
        </h3>
        <button
          onClick={() => void carregar()}
          aria-label="Verificar de novo"
          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {ligado ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800">
          ✓ Ligados. Avisamos assim que sua comissão for liberada, mesmo com o app fechado.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-slate-600">
          Sem isso você só descobre que recebeu ao abrir o app por conta própria.
        </p>
      )}

      <ul className="space-y-1.5">
        <Linha ok={diag.suportado} label="Aparelho compatível" />
        <Linha ok={diag.permissao === "granted"} label="Permissão concedida" />
        <Linha ok={diag.serviceWorkerPronto} label="Aplicativo instalado e ativo" />
        <Linha ok={diag.inscritoNoAparelho} label="Inscrição criada no aparelho" />
        <Linha ok={diag.registradoNoServidor} label="Aparelho registrado no servidor" />
      </ul>

      {diag.permissao === "denied" && (
        <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
          Os avisos estão bloqueados. Abra as configurações do aparelho, procure o app IndiqueLeads
          e permita notificações — o navegador não deixa perguntar de novo por aqui.
        </p>
      )}

      {diag.erro && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-red-800">
          {diag.erro}
        </p>
      )}

      {!ligado && diag.permissao !== "denied" && (
        <button
          onClick={handleLigar}
          disabled={working}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sea-700 py-3 text-sm font-bold text-white transition-colors hover:bg-sea-600 disabled:opacity-60"
        >
          {working ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BellRing className="h-4 w-4" />
          )}
          {working ? "Ligando…" : "Ligar avisos"}
        </button>
      )}
    </div>
  );
}
