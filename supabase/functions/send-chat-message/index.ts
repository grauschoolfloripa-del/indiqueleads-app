// Edge Function: send-chat-message
//
// Ponto único de escrita em `chat_messages`. A sanitização de contato
// (telefone/e-mail/links/palavras-chave) roda AQUI, no servidor — o cliente
// só faz uma checagem de UX (feedback instantâneo antes de enviar), que não
// tem valor de segurança porque roda em código que o próprio usuário controla.
//
// O INSERT direto na tabela `chat_messages` é revogado para `anon`/`authenticated`
// (ver migration correspondente); esta função usa a service role para gravar
// depois de sanitizar, então é o único caminho possível de escrita.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";
import { sanitizeChatMessage, getSecurityWarningMessage } from "../_shared/chatSecurity.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

interface SendChatMessageBody {
  leadId: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "advertiser" | "system";
  text: string;
  isSystem?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: SendChatMessageBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { leadId, senderId, senderName, senderRole, text, isSystem } = body;

  if (!isUuid(leadId) || !senderName || !senderRole || typeof text !== "string" || !text.trim()) {
    return new Response(JSON.stringify({ error: "Missing or invalid fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!["client", "advertiser", "system"].includes(senderRole)) {
    return new Response(JSON.stringify({ error: "Invalid senderRole" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Confere que o lead existe de fato — evita anexar mensagens a ids inventados.
  const { data: leadRow, error: leadErr } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .maybeSingle();
  if (leadErr) {
    console.error("[send-chat-message] lead lookup failed", leadErr);
    return new Response(JSON.stringify({ error: "Lead lookup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!leadRow) {
    return new Response(JSON.stringify({ error: "Lead not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const system = !!isSystem || senderRole === "system";
  const { cleanText, hasLeakage, blockedInfoType } = system
    ? { cleanText: text, hasLeakage: false, blockedInfoType: [] as const }
    : sanitizeChatMessage(text);

  const { data: inserted, error: insertErr } = await supabase
    .from("chat_messages")
    .insert({
      lead_id: leadId,
      sender_id: isUuid(senderId) ? senderId : null,
      sender_name: senderName,
      sender_role: senderRole,
      text: cleanText,
      original_text: hasLeakage ? text : null,
      is_system: system,
      is_blocked_by_security: hasLeakage,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("[send-chat-message] insert failed", insertErr);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let warning = null;
  if (hasLeakage) {
    const { data: warningRow, error: warningErr } = await supabase
      .from("chat_messages")
      .insert({
        lead_id: leadId,
        sender_id: null,
        sender_name: "Sistema (Segurança)",
        sender_role: "system",
        text: getSecurityWarningMessage(blockedInfoType),
        is_system: true,
        is_blocked_by_security: true,
      })
      .select()
      .single();
    if (warningErr) console.error("[send-chat-message] warning insert failed", warningErr);
    else warning = warningRow;
  }

  return new Response(JSON.stringify({ message: inserted, warning, hasLeakage, blockedInfoType }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
