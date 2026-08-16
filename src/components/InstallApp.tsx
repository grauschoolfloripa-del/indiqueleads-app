import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  BellRing,
  Check,
  Copy,
  Download,
  MoreVertical,
  Plus,
  Share,
  Smartphone,
  Wallet,
  WifiOff,
} from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";
import { useInstallAvailable, usePlatform } from "@/hooks/usePwa";
import { promptInstall } from "@/lib/pwa";

/**
 * Tela que o indicador aprovado vê enquanto ainda estiver no navegador.
 *
 * A partir da aprovação a plataforma é app-exclusiva: os módulos da Academy e
 * a vitrine só abrem pelo ícone instalado. Esta tela existe para tornar esse
 * passo curto e óbvio — instruções diferentes por aparelho, porque instalar no
 * iPhone e no Android não se parecem em nada.
 *
 * A distribuição é pelo próprio site: a Apple não permite baixar app do site do
 * desenvolvedor, e no Android o APK direto passou a exigir verificação. O app
 * instalável do próprio site resolve os dois casos sem loja nenhuma.
 */

interface InstallAppProps {
  /** Primeiro nome, para a tela não soar genérica logo após a aprovação. */
  firstName?: string;
  onAddNotification?: (msg: string, type: "success" | "info") => void;
}

const BENEFITS = [
  {
    icon: BellRing,
    title: "Aviso quando o dinheiro cair",
    body: "O anunciante confirma o repasse e seu celular avisa na hora, mesmo com o app fechado.",
  },
  {
    icon: WifiOff,
    title: "Aulas sem depender do sinal",
    body: "Os módulos que você já abriu continuam disponíveis mesmo sem internet.",
  },
  {
    icon: Wallet,
    title: "Carteira a um toque",
    body: "Saldo, comissões e link de indicação direto do ícone, sem abrir navegador.",
  },
];

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sea-700 font-mono text-[11px] font-bold text-white">
        {n}
      </span>
      <span className="text-sm leading-relaxed text-slate-700">{children}</span>
    </li>
  );
}

/** Ícone desenhado no meio da frase, para a instrução casar com o que a pessoa vê. */
function Inline({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      className="mx-0.5 inline-flex translate-y-0.5 items-center rounded-md border border-slate-300 bg-white px-1 py-0.5 text-slate-700"
      aria-label={label}
      role="img"
    >
      {children}
    </span>
  );
}

export default function InstallApp({ firstName, onAddNotification }: InstallAppProps) {
  const { platform, iosSafari } = usePlatform();
  const canInstall = useInstallAvailable();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) {
      onAddNotification?.("Instalação cancelada. Você pode tentar de novo quando quiser.", "info");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onAddNotification?.(`Copie o endereço: ${siteUrl}`, "info");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-8">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center">
          <BrandLogo className="h-10 w-auto" />
        </div>

        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-600">
            <Check className="h-3.5 w-3.5" /> Cadastro aprovado
          </span>
          <h1 className="mt-4 font-display text-2xl font-black leading-tight text-slate-900">
            {firstName ? `${firstName}, falta um passo` : "Falta um passo"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Daqui em diante a IndiqueLeads funciona pelo aplicativo. Instale agora e continue seus
            módulos por lá.
          </p>
        </div>

        {/* ---- por que vale a pena ---- */}
        <ul className="mt-8 space-y-3">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sea-700/10 text-sea-700">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">{body}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* ---- como instalar, por aparelho ---- */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-base font-black text-slate-900">
            <Smartphone className="h-4.5 w-4.5 text-sea-700" />
            Como instalar
          </h2>

          {/* Android e desktop com convite nativo disponível */}
          {canInstall && (
            <div className="mt-4">
              <button
                onClick={handleInstall}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-600"
              >
                <Download className="h-4 w-4" />
                Instalar aplicativo
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Leva alguns segundos e ocupa quase nada de espaço.
              </p>
            </div>
          )}

          {/* iPhone: só o Safari instala, e o caminho é manual */}
          {platform === "ios" && iosSafari && (
            <ol className="mt-4 space-y-3">
              <Step n={1}>
                Toque em
                <Inline label="botão Compartilhar">
                  <Share className="h-3.5 w-3.5" />
                </Inline>
                na barra do Safari.
              </Step>
              <Step n={2}>
                Role a lista e escolha
                <Inline label="Adicionar à Tela de Início">
                  <Plus className="h-3.5 w-3.5" />
                </Inline>
                <strong>Adicionar à Tela de Início</strong>.
              </Step>
              <Step n={3}>
                Confirme em <strong>Adicionar</strong>. O ícone da IndiqueLeads aparece junto dos
                seus outros apps.
              </Step>
            </ol>
          )}

          {/* iPhone em Chrome/Firefox: não dá, precisa trocar de navegador */}
          {platform === "ios" && !iosSafari && (
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-slate-700">
                No iPhone, só o <strong>Safari</strong> consegue instalar o app. Copie o endereço
                abaixo e abra no Safari para continuar.
              </p>
              <button
                onClick={copyLink}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-sea-700 py-3 text-sm font-bold text-sea-700 transition-colors hover:bg-sea-700/5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Endereço copiado" : "Copiar endereço do site"}
              </button>
            </div>
          )}

          {/* Android sem o convite nativo (já dispensado antes, ou navegador diferente) */}
          {platform === "android" && !canInstall && (
            <ol className="mt-4 space-y-3">
              <Step n={1}>
                Toque no menu
                <Inline label="menu do navegador">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Inline>
                no canto do navegador.
              </Step>
              <Step n={2}>
                Escolha <strong>Instalar aplicativo</strong> ou{" "}
                <strong>Adicionar à tela inicial</strong>.
              </Step>
              <Step n={3}>Confirme. O ícone aparece junto dos seus outros apps.</Step>
            </ol>
          )}

          {/* Computador: instalar aqui funciona, mas o app foi feito para o bolso */}
          {platform === "desktop" && !canInstall && (
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-slate-700">
                O aplicativo foi feito para o celular — é lá que você indica, acompanha e recebe.
                Abra este endereço no seu telefone:
              </p>
              <p className="mt-3 break-all rounded-xl bg-slate-50 px-3 py-2.5 text-center font-mono text-xs text-slate-700">
                {siteUrl}
              </p>
              <button
                onClick={copyLink}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-sea-700 py-3 text-sm font-bold text-sea-700 transition-colors hover:bg-sea-700/5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Endereço copiado" : "Copiar endereço"}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          Não procure na Play Store nem na App Store. A instalação é aqui mesmo, direto do site
          oficial da IndiqueLeads.
        </p>
      </motion.div>
    </div>
  );
}
