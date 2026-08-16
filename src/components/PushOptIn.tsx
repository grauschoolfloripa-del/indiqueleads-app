import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";

import { enablePush, ensurePushSynced, pushPermission, pushSupported } from "@/lib/push";

const DISMISSED_KEY = "il_push_dispensado";
const DISMISS_DIAS = 7;

/**
 * "Agora não" adia, não cancela para sempre.
 *
 * Guardamos a data em vez de um sinalizador: quem recusou uma vez muda de
 * ideia quando a primeira comissão entra, e sem isso não haveria como voltar
 * a oferecer — o convite só aparece com a permissão em "default", estado que
 * não se repete.
 */
function dispensadoRecentemente(): boolean {
  const marca = localStorage.getItem(DISMISSED_KEY);
  if (!marca) return false;
  const quando = Date.parse(marca);
  if (Number.isNaN(quando)) return false; // formato antigo ("1"): volta a oferecer
  return Date.now() - quando < DISMISS_DIAS * 24 * 60 * 60 * 1000;
}

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
  const [blocked, setBlocked] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let alive = true;

    void (async () => {
      if (!pushSupported()) return;
      const permissao = pushPermission();

      // Permissão já concedida: nada a perguntar, mas é aqui que consertamos o
      // aparelho que concedeu e não chegou a ser gravado no banco.
      if (permissao === "granted") {
        const ok = await ensurePushSynced(userId);
        if (!ok) console.error("[push] permissão concedida mas a inscrição não foi salva");
        return;
      }

      if (dispensadoRecentemente()) return;

      // Permissão negada: o navegador não deixa perguntar de novo. A única
      // saída é as configurações do aparelho, então explicamos o caminho.
      if (permissao === "denied") {
        if (alive) setBlocked(true);
        return;
      }

      if (alive) setShow(true);
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    setShow(false);
    setBlocked(false);
  };

  if (blocked) {
    return (
      <div className="mx-auto mb-4 max-w-7xl px-4">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white">
            <BellRing className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">Avisos bloqueados neste aparelho</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              Você não vai saber quando sua comissão for liberada. Para religar, abra as
              configurações do aparelho, procure o app IndiqueLeads e permita notificações.
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dispensar"
            className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-amber-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!show) return null;

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
