import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";

import { enablePush, isPushEnabled, pushPermission, pushSupported } from "@/lib/push";

const DISMISSED_KEY = "il_push_dispensado";

/**
 * Convite para ligar os avisos no aparelho.
 *
 * Aparece só depois que a pessoa já está usando o app instalado — pedir
 * permissão de notificação na primeira tela é o jeito mais rápido de receber
 * um "bloquear", e bloqueio de notificação é difícil de reverter.
 *
 * Some sozinho quando já está ligado, quando o navegador não suporta, ou
 * quando a pessoa dispensou.
 */
export default function PushOptIn({
  userId,
  onAddNotification,
}: {
  userId: string;
  onAddNotification: (msg: string, type: "success" | "info") => void;
}) {
  const [show, setShow] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let alive = true;

    void (async () => {
      if (!pushSupported()) return;
      if (pushPermission() !== "default") return;
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
      if (await isPushEnabled()) return;
      if (alive) setShow(true);
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  };

  const handleEnable = async () => {
    setWorking(true);
    try {
      const ok = await enablePush(userId);
      if (ok) {
        onAddNotification("Pronto! Avisamos assim que sua comissão for liberada.", "success");
        setShow(false);
      } else {
        onAddNotification(
          "Não foi possível ligar os avisos. Verifique as permissões do aparelho.",
          "info",
        );
      }
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="mx-auto mb-4 max-w-7xl px-4">
      <div className="flex items-start gap-3 rounded-2xl border border-sea-700/20 bg-sea-700/5 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sea-700 text-white">
          <BellRing className="h-4.5 w-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            Quer saber na hora que o dinheiro cair?
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Ligue os avisos e receba no celular quando o anunciante confirmar seu repasse — mesmo
            com o app fechado.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleEnable}
              disabled={working}
              className="cursor-pointer rounded-xl bg-sea-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-sea-600 disabled:opacity-60"
            >
              {working ? "Ligando…" : "Ligar avisos"}
            </button>
            <button
              onClick={dismiss}
              className="cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
            >
              Agora não
            </button>
          </div>
        </div>

        <button
          onClick={dismiss}
          aria-label="Dispensar"
          className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
