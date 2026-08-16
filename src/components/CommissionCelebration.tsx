import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PartyPopper, Wallet, X } from "lucide-react";
import type { AppNotification } from "@/types";

/**
 * Comemoração quando o anunciante quita uma comissão.
 *
 * O indicador só descobria que tinha recebido olhando o saldo — ou por uma
 * mensagem de WhatsApp que o anunciante mandava na mão. Aqui a notificação
 * (persistida em `notifications`) vira um momento: o dinheiro é a recompensa,
 * mas o reconhecimento é o que faz voltar a indicar.
 *
 * Confete é feito com divs animadas — nenhuma dependência nova para um efeito
 * que aparece poucas vezes. Respeita `prefers-reduced-motion`: sem confete,
 * só o card.
 */

const CONFETTI_COLORS = ["#48a848", "#63c463", "#0c486c", "#1c78b3", "#8dd98d"];

function Confetti() {
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  if (reduceMotion) return null;

  // Distribuição determinística: evita o visual "tudo no mesmo lugar" sem
  // precisar de aleatoriedade instável entre renders.
  const pieces = Array.from({ length: 42 }, (_, i) => ({
    id: i,
    left: (i * 37) % 100,
    delay: (i % 12) * 0.09,
    duration: 2.6 + ((i * 13) % 18) / 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + ((i * 7) % 7),
    rotate: (i * 53) % 360,
  }));

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[2px]"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
          }}
          initial={{ y: -40, opacity: 0, rotate: p.rotate }}
          animate={{ y: "105vh", opacity: [0, 1, 1, 0], rotate: p.rotate + 420 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export interface CommissionCelebrationProps {
  /** Notificações não lidas do tipo `commission_paid`. */
  notifications: AppNotification[];
  onDismiss: (ids: string[]) => void;
}

export default function CommissionCelebration({
  notifications,
  onDismiss,
}: CommissionCelebrationProps) {
  const pending = notifications.filter((n) => n.kind === "commission_paid" && !n.readAt);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pending.length > 0) setOpen(true);
  }, [pending.length]);

  if (pending.length === 0) return null;

  // Se chegou mais de um repasse, celebramos o total de uma vez só — evita
  // empilhar modais.
  const total = pending.reduce((acc, n) => acc + (n.amount ?? 0), 0);
  const ids = pending.map((n) => n.id);

  const close = () => {
    setOpen(false);
    onDismiss(ids);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <Confetti />
          <motion.div
            className="fixed inset-0 z-[61] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-7 text-center shadow-2xl"
              initial={{ scale: 0.86, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={close}
                aria-label="Fechar"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <motion.div
                className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/40"
                initial={{ rotate: -12, scale: 0.8 }}
                animate={{ rotate: [-12, 8, -4, 0], scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                <PartyPopper className="h-8 w-8" />
              </motion.div>

              <h2 className="mt-4 font-display text-2xl font-black text-slate-900">
                {pending.length > 1 ? "Comissões pagas!" : "Comissão paga!"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {pending.length > 1
                  ? `${pending.length} repasses caíram na sua conta`
                  : pending[0].body}
              </p>

              <motion.div
                className="mt-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 text-white shadow-lg shadow-brand-500/30"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">
                  Você recebeu
                </span>
                <div className="font-mono text-4xl font-black">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </motion.div>

              <div className="mt-4 space-y-1.5 text-left">
                {pending.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-[11px] font-semibold capitalize text-slate-600">
                      {String(n.metadata?.origem ?? "comissão")}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      R$ {(n.amount ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={close}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white transition-colors hover:bg-slate-800 cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                Ver minha carteira
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
