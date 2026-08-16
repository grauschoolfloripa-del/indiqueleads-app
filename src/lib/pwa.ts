/**
 * Suporte a PWA: registro do service worker, detecção de "estou rodando como
 * app instalado" e captura do convite de instalação do Android.
 *
 * Tudo aqui precisa sobreviver ao SSR — o TanStack Start renderiza no servidor,
 * onde `window` e `navigator` não existem.
 */

const STANDALONE_QUERY = "(display-mode: standalone)";
const MINIMAL_UI_QUERY = "(display-mode: minimal-ui)";

export type Platform = "ios" | "android" | "desktop";

/** True quando a página está aberta pelo ícone da tela inicial, não pelo navegador. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  // Só em desenvolvimento: permite testar as telas do app instalado sem
  // instalar nada. `import.meta.env.DEV` é constante no build de produção,
  // então este bloco é removido pelo bundler — não existe como brecha no ar.
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("simular-app")) {
    return true;
  }

  // iOS não implementa display-mode até hoje; usa esta propriedade não-padrão.
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  if (iosStandalone === true) return true;
  return (
    window.matchMedia?.(STANDALONE_QUERY).matches === true ||
    window.matchMedia?.(MINIMAL_UI_QUERY).matches === true
  );
}

export function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  // iPad moderno se apresenta como Mac; o toque é o que o denuncia.
  const isIpad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPod|iPad/.test(ua) || isIpad) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/** Safari é o único navegador do iOS que consegue instalar na tela inicial. */
export function isIosSafari(): boolean {
  if (getPlatform() !== "ios") return false;
  const ua = navigator.userAgent;
  return !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

/* -------------------------------------------------- convite de instalação -- */

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

/**
 * O Android dispara `beforeinstallprompt` uma única vez, cedo — normalmente
 * antes de qualquer componente montar. Por isso guardamos o evento assim que
 * o módulo carrega, e a tela pergunta depois se ele existe.
 */
export function watchInstallPrompt(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // evita o banner automático; queremos nosso próprio botão
    deferredPrompt = e as InstallPromptEvent;
    listeners.forEach((fn) => fn(true));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn(false));
  });
}

export function onInstallAvailabilityChange(fn: (available: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null;
}

/** Abre o diálogo nativo de instalação. Retorna true se a pessoa aceitou. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  const evt = deferredPrompt;
  deferredPrompt = null;
  listeners.forEach((fn) => fn(false));
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  return outcome === "accepted";
}

/* ----------------------------------------------------- service worker ------ */

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Em desenvolvimento o service worker atrapalha o hot reload do Vite: ele
  // serve bundle antigo e o app "não atualiza" sem motivo aparente.
  if (!import.meta.env.PROD) return;

  const registrar = () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[pwa] falha ao registrar o service worker", err);
    });
  };

  // `load` já pode ter disparado quando o React hidrata — e no app instalado,
  // com todos os assets vindo do disco, é o caso comum. Nesse cenário o
  // addEventListener nunca é chamado: o service worker jamais é registrado, o
  // push nunca funciona, e nada na tela indica o problema. Foi exatamente isso
  // que segurou as notificações.
  if (document.readyState === "complete") {
    registrar();
  } else {
    window.addEventListener("load", registrar, { once: true });
  }
}
