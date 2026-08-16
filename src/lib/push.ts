/**
 * Inscrição do aparelho para receber aviso com o app fechado.
 *
 * O caminho completo é: navegador pede permissão → gera uma inscrição no
 * serviço de push do fabricante → guardamos endpoint e chaves no Supabase →
 * quando nasce uma linha em `notifications`, o trigger chama a Edge Function
 * `send-push`, que entrega no aparelho.
 *
 * Requisito do iPhone: só funciona com o app instalado na tela inicial
 * (iOS 16.4+). No navegador comum o iOS simplesmente não oferece push.
 */

import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function pushPermission(): PushPermission {
  if (!pushSupported()) return "unsupported";
  return Notification.permission as PushPermission;
}

/** A chave VAPID viaja em base64url; a API do navegador exige bytes crus. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function keyToBase64(key: ArrayBuffer | null): string {
  if (!key) return "";
  return btoa(String.fromCharCode(...new Uint8Array(key)));
}

/**
 * Pede permissão e registra o aparelho. Retorna true se a partir de agora este
 * aparelho recebe avisos.
 */
export async function enablePush(userId: string): Promise<boolean> {
  if (!pushSupported()) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  return subscribeAndSave(userId);
}

/**
 * Garante que um aparelho com permissão já concedida tenha inscrição gravada.
 *
 * Existe porque conceder a permissão e gravar no banco são dois passos, e o
 * segundo pode falhar (rede caiu, sessão expirou). Quando isso acontecia, a
 * permissão ficava "granted", o convite não reaparecia — ele só é oferecido
 * quando a permissão está "default" — e o aparelho ficava mudo para sempre,
 * sem nada na tela indicando o problema.
 *
 * Roda a cada abertura do app: é idempotente e barata, e também conserta
 * inscrição que o navegador tenha rotacionado por conta própria.
 */
export async function ensurePushSynced(userId: string): Promise<boolean> {
  if (!pushSupported()) return false;
  if (Notification.permission !== "granted") return false;
  return subscribeAndSave(userId);
}

/**
 * `serviceWorker.ready` nunca rejeita: se o registro falhar, a promessa fica
 * pendente para sempre. Sem um limite, `enablePush` trava e o botão gira até
 * a pessoa desistir — sem erro, sem log, sem nada.
 */
async function registrationOrTimeout(segundos = 10): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("service worker não ficou pronto a tempo")),
        segundos * 1000,
      ),
    ),
  ]);
}

async function subscribeAndSave(userId: string): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY) {
    console.error("[push] VITE_VAPID_PUBLIC_KEY não configurada");
    return false;
  }

  const registration = await registrationOrTimeout();

  // Reaproveita a inscrição existente; criar outra para o mesmo aparelho só
  // geraria envio duplicado.
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: keyToBase64(subscription.getKey("p256dh")),
      auth: keyToBase64(subscription.getKey("auth")),
      user_agent: navigator.userAgent.slice(0, 300),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    console.error("[push] falha ao salvar inscrição", error);
    return false;
  }

  return true;
}

/** Desliga os avisos neste aparelho — sem mexer nos outros da mesma conta. */
export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
  await subscription.unsubscribe();
}

/** True se este aparelho já está inscrito. */
export async function isPushEnabled(): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  try {
    const registration = await registrationOrTimeout();
    return (await registration.pushManager.getSubscription()) !== null;
  } catch {
    return false;
  }
}

export type PushDiag = {
  suportado: boolean;
  permissao: PushPermission;
  serviceWorkerPronto: boolean;
  inscritoNoAparelho: boolean;
  registradoNoServidor: boolean;
  erro?: string;
};

/**
 * Estado real dos avisos neste aparelho, passo a passo.
 *
 * Ligar push tem quatro etapas que falham de formas diferentes e todas
 * silenciosas. Sem isto, "não chega notificação" é indistinguível de
 * "permissão negada", "service worker morto" ou "gravação recusada" — e não há
 * como descobrir sem o aparelho na mão.
 */
export async function pushDiagnostics(userId: string): Promise<PushDiag> {
  const diag: PushDiag = {
    suportado: pushSupported(),
    permissao: pushPermission(),
    serviceWorkerPronto: false,
    inscritoNoAparelho: false,
    registradoNoServidor: false,
  };
  if (!diag.suportado) return diag;

  try {
    const registration = await registrationOrTimeout(8);
    diag.serviceWorkerPronto = true;

    const sub = await registration.pushManager.getSubscription();
    diag.inscritoNoAparelho = sub !== null;

    if (sub) {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("endpoint", sub.endpoint)
        .maybeSingle();
      if (error) diag.erro = error.message;
      diag.registradoNoServidor = !!data;
    }
  } catch (e) {
    diag.erro = e instanceof Error ? e.message : String(e);
  }

  return diag;
}
