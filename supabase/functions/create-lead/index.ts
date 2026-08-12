// Edge Function: create-lead
//
// Ponto único de criação de `leads`. O INSERT direto na tabela foi revogado
// (ver migration 20260811031000) porque o `indicator_id` — e, agora que
// existe comissão por lead, a comissão inteira — não pode depender de um
// valor que o navegador escolhe (o `?ref=` hoje vem do localStorage no
// cliente). Esta função:
//   1. busca o produto no banco e calcula a comissão a partir dele — nunca
//      aceita um valor de comissão vindo do corpo da requisição;
//   2. valida que o `indicatorId` recebido corresponde a um indicador real
//      antes de gravar (senão grava sem indicador — sem indicador não há
//      comissão possível);
//   3. grava usando a service role.
//
// Limitação conhecida (fora do escopo desta mudança): isso garante que o
// indicator_id gravado é sempre um indicador que existe de verdade, mas não
// prova criptograficamente que ESTE visitante realmente veio do link DESSE
// indicador — isso exigiria um esquema de link assinado, que é um projeto à
// parte.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

interface CreateLeadBody {
  productId: string;
  indicatorId?: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes?: string;
  referralChannel?: string;
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

  let body: CreateLeadBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { productId, indicatorId, clientName, clientPhone, clientEmail, notes, referralChannel } =
    body;

  if (!isUuid(productId) || !clientName?.trim() || !clientPhone?.trim() || !clientEmail?.trim()) {
    return new Response(JSON.stringify({ error: "Missing or invalid fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: product, error: productErr } = await supabase
    .from("products")
    .select("id, advertiser_id, status, commission_digital_value")
    .eq("id", productId)
    .maybeSingle();
  if (productErr) {
    console.error("[create-lead] product lookup failed", productErr);
    return new Response(JSON.stringify({ error: "Product lookup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!product || product.status !== "ativo") {
    return new Response(JSON.stringify({ error: "Product not found or inactive" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let validIndicatorId: string | null = null;
  if (isUuid(indicatorId)) {
    const { data: indicator } = await supabase
      .from("indicators")
      .select("id")
      .eq("id", indicatorId)
      .maybeSingle();
    if (indicator) validIndicatorId = indicator.id;
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("leads")
    .insert({
      product_id: productId,
      indicator_id: validIndicatorId,
      advertiser_id: product.advertiser_id,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      status: "lead_recebido",
      commission_paid: false,
      commission_value: Number(product.commission_digital_value ?? 0),
      commission_type: "digital",
      notes: notes ?? null,
      referral_channel: referralChannel ?? null,
    })
    .select("*, products(title, category), indicators(name)")
    .single();

  if (insertErr) {
    console.error("[create-lead] insert failed", insertErr);
    return new Response(JSON.stringify({ error: "Failed to create lead" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ lead: inserted }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
