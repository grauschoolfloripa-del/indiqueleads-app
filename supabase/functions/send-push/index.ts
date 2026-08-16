// Edge Function: send-push
//
// Entrega no aparelho a notificação que acabou de nascer na tabela
// `notifications`. É chamada pelo trigger `trg_dispatch_push`, não pelo
// navegador — por isso não usa o JWT do usuário e sim um segredo compartilhado
// no cabeçalho `x-push-secret`.
//
// Regra que atravessa o arquivo: push é um extra. Um aparelho que falha não
// pode derrubar os outros, e nenhuma falha aqui pode voltar como erro para o
// trigger — a comissão e a notificação in-app já estão gravadas e valem por si.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const PUSH_SECRET = Deno.env.get("PUSH_SHARED_SECRET") ?? "";
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contato@midiaeco.com";

interface Target {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  url: string;
}

/** Comparação em tempo constante: evita vazar o segredo por medida de tempo. */
function secretMatches(received: string): boolean {
  if (!PUSH_SECRET || received.length !== PUSH_SECRET.length) return false;
  let diff = 0;
  for (let i = 0; i < received.length; i++) {
    diff |= received.charCodeAt(i) ^ PUSH_SECRET.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  if (!secretMatches(req.headers.get("x-push-secret") ?? "")) {
    return new Response("forbidden", { status: 403 });
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.error("[send-push] chaves VAPID ausentes nos secrets");
    return new Response(JSON.stringify({ sent: 0, reason: "vapid ausente" }), { status: 200 });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  let notificationId: string | undefined;
  try {
    ({ notification_id: notificationId } = await req.json());
  } catch {
    return new Response("corpo inválido", { status: 400 });
  }
  if (!notificationId) return new Response("notification_id ausente", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase.rpc("push_targets_for_notification", {
    _notification_id: notificationId,
  });

  if (error) {
    console.error("[send-push] falha ao buscar destinos", error);
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const targets = (data ?? []) as Target[];
  if (targets.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  // Endpoints mortos (aparelho formatado, app desinstalado) devolvem 404/410.
  // Guardamos para limpar depois — senão a tabela só cresce e cada envio fica
  // mais lento.
  const dead: string[] = [];
  let sent = 0;

  await Promise.all(
    targets.map(async (t) => {
      const payload = JSON.stringify({
        title: t.title,
        body: t.body,
        url: t.url,
        tag: `il-${notificationId}`,
      });

      try {
        await webpush.sendNotification(
          { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
          payload,
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          dead.push(t.endpoint);
        } else {
          console.error("[send-push] envio falhou", status, (err as Error).message);
        }
      }
    }),
  );

  if (dead.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", dead);
  }

  return new Response(JSON.stringify({ sent, removed: dead.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
