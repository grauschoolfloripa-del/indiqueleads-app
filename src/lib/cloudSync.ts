/**
 * Camada de sincronização com Supabase para produtos, leads e chats.
 *
 * Objetivo: manter as telas atuais (baseadas em arrays em memória +
 * localStorage) funcionando, mas espelhar toda escrita no banco e recarregar
 * do banco no login. Assim os dados persistem entre dispositivos.
 *
 * Regra importante: alinhamos `advertisers.id` e `indicators.id` ao
 * `auth.uid()` do usuário logado, de modo que os ids locais e os do banco
 * coincidam sem tabela de mapeamento.
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  Product,
  Lead,
  ChatMessage,
  ProductStatus,
  Advertiser,
  Indicator,
} from "@/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string | undefined | null): v is string =>
  !!v && UUID_RE.test(v);

// ---------------- Advertiser / Indicator upsert ----------------

/**
 * Garante que exista uma linha em `advertisers` para o usuário logado, com
 * `advertisers.id = auth.uid()` para alinhar com o estado local.
 * Retorna o id da linha (== userId) ou null em caso de falha.
 */
export async function ensureAdvertiserRow(
  userId: string,
  base: Partial<Advertiser>,
): Promise<string | null> {
  // Se já existe uma linha pelo user_id, apenas retorna o id atual.
  const { data: existing } = await supabase
    .from("advertisers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { error } = await supabase.from("advertisers").insert({
    id: userId, // alinha id local = user_id
    user_id: userId,
    name: base.name ?? "Anunciante",
    cnpj_or_cpf: base.cnpjOrCpf ?? "",
    type: (base.type ?? "PJ") as "PF" | "PJ",
    phone: base.phone ?? "",
    email: base.email ?? "",
    plan: (base.plan ?? "gratuito") as Advertiser["plan"],
    categories: (base.categoriesSelected ?? []) as never,
    city: base.city ?? null,
    state: base.state ?? null,
    has_accepted_terms: true,
    terms_accepted_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[cloudSync] ensureAdvertiserRow", error);
    return null;
  }
  return userId;
}

export async function ensureIndicatorRow(
  userId: string,
  base: Partial<Indicator>,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("indicators")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { error } = await supabase.from("indicators").insert({
    id: userId,
    user_id: userId,
    name: base.name ?? "Indicador",
    cpf: base.cpf ?? "",
    phone: base.phone ?? "",
    email: base.email ?? "",
    pix_key: base.pixKey ?? base.email ?? "",
    pix_type: (base.pixType ?? "email") as Indicator["pixType"],
    league: "bronze",
    score: 0,
    clicks: 0,
    balance_available: 0,
    balance_pending: 0,
    has_accepted_terms: true,
    terms_accepted_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[cloudSync] ensureIndicatorRow", error);
    return null;
  }
  return userId;
}

export function indicatorFromDb(row: any): Indicator {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    pixKey: row.pix_key ?? row.email ?? "",
    pixType: row.pix_type ?? "email",
    league: row.league ?? "bronze",
    score: row.score ?? 0,
    clicks: row.clicks ?? 0,
    balanceAvailable: Number(row.balance_available ?? 0),
    balancePending: Number(row.balance_pending ?? 0),
    hasAcceptedTerms: !!row.has_accepted_terms,
    termsAcceptedAt: row.terms_accepted_at ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
  };
}

export async function fetchIndicatorsByIds(ids: string[]): Promise<Indicator[]> {
  const uniqueIds = Array.from(new Set(ids.filter(isUuid)));
  if (!uniqueIds.length) return [];
  const { data, error } = await supabase
    .from("indicators")
    .select("*")
    .in("id", uniqueIds);
  if (error) {
    console.error("[cloudSync] fetchIndicatorsByIds", error);
    return [];
  }
  return (data ?? []).map(indicatorFromDb);
}

// ---------------- Products ----------------

export function productFromDb(row: any): Product {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((i: any) => i.url as string);
  return {
    id: row.id,
    category: row.category,
    advertiserId: row.advertiser_id,
    advertiserName: row.advertisers?.name ?? "",
    title: row.title,
    description: row.description ?? "",
    price: Number(row.price ?? 0),
    currency: row.currency ?? "BRL",
    status: row.status,
    location: {
      lat: row.lat ?? -23.5505,
      lng: row.lng ?? -46.6333,
      city: row.city ?? "",
      state: row.state ?? "",
    },
    coverImage: row.cover_image ?? images[0] ?? "",
    gallery: images.length ? images : row.cover_image ? [row.cover_image] : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    commissionDigitalPct: row.commission_digital_pct ?? undefined,
    commissionDigitalValue: row.commission_digital_value ?? undefined,
    commissionPresencialPct: row.commission_presencial_pct ?? undefined,
    commissionPresencialValue: row.commission_presencial_value ?? undefined,
    allowPresencialTier: row.allow_presencial_tier ?? false,
    allowNegotiateTier: row.allow_negotiate_tier ?? false,
    attributes: row.attributes ?? {},
  };
}

export async function pushProduct(p: Product): Promise<void> {
  if (!isUuid(p.id) || !isUuid(p.advertiserId)) return; // ignora mocks
  const { error } = await supabase.from("products").insert({
    id: p.id,
    advertiser_id: p.advertiserId,
    category: p.category,
    title: p.title,
    description: p.description,
    price: p.price,
    currency: p.currency,
    status: p.status,
    city: p.location.city,
    state: p.location.state,
    lat: p.location.lat,
    lng: p.location.lng,
    cover_image: p.coverImage,
    commission_digital_pct: p.commissionDigitalPct ?? null,
    commission_digital_value: p.commissionDigitalValue ?? null,
    commission_presencial_pct: p.commissionPresencialPct ?? null,
    commission_presencial_value: p.commissionPresencialValue ?? null,
    allow_presencial_tier: p.allowPresencialTier,
    allow_negotiate_tier: p.allowNegotiateTier,
    attributes: (p.attributes ?? {}) as never,
  });
  if (error) {
    console.error("[cloudSync] pushProduct", error);
    throw error;
  }
  if (p.gallery?.length) {
    const rows = p.gallery.map((url, position) => ({
      product_id: p.id,
      url,
      position,
    }));
    const { error: imgErr } = await supabase.from("product_images").insert(rows);
    if (imgErr) console.error("[cloudSync] product_images insert", imgErr);
  }
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  if (!isUuid(id)) return;
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id);
  if (error) console.error("[cloudSync] updateProductStatus", error);
}

export async function fetchProductsForAdvertiser(
  advertiserId: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, position), advertisers(name)")
    .eq("advertiser_id", advertiserId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[cloudSync] fetchProductsForAdvertiser", error);
    return [];
  }
  return (data ?? []).map(productFromDb);
}

export async function fetchAllActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, position), advertisers(name)")
    .eq("status", "ativo")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[cloudSync] fetchAllActiveProducts", error);
    return [];
  }
  return (data ?? []).map(productFromDb);
}

/** Busca um produto específico por id (para links compartilhados). */
export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, position), advertisers(name)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[cloudSync] fetchProductById", error);
    return null;
  }
  return data ? productFromDb(data) : null;
}


// ---------------- Leads ----------------

export function leadFromDb(row: any): Lead {
  return {
    id: row.id,
    productId: row.product_id,
    productTitle: row.products?.title ?? "",
    productCategory: row.products?.category ?? "imovel",
    indicatorId: row.indicator_id,
    indicatorName: row.indicators?.name ?? "",
    advertiserId: row.advertiser_id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    commissionPaid: !!row.commission_paid,
    commissionValue: Number(row.commission_value ?? 0),
    commissionType: row.commission_type,
    notes: row.notes ?? undefined,
    contractUrl: row.contract_url ?? undefined,
    visitDate: row.visit_date ?? undefined,
    referralChannel: row.referral_channel ?? undefined,
    checkInRequested: row.check_in_requested ?? undefined,
  };
}

export async function pushLead(l: Lead): Promise<void> {
  if (!isUuid(l.id) || !isUuid(l.productId) || !isUuid(l.advertiserId)) return;
  const { error } = await supabase.from("leads").insert({
    id: l.id,
    product_id: l.productId,
    indicator_id: isUuid(l.indicatorId) ? l.indicatorId : null,
    advertiser_id: l.advertiserId,
    client_name: l.clientName,
    client_phone: l.clientPhone,
    client_email: l.clientEmail,
    status: l.status,
    commission_paid: l.commissionPaid,
    commission_value: l.commissionValue,
    commission_type: l.commissionType,
    notes: l.notes ?? null,
    contract_url: l.contractUrl ?? null,
    visit_date: l.visitDate ?? null,
    referral_channel: l.referralChannel ?? null,
    check_in_requested: l.checkInRequested ?? false,
  });
  if (error) {
    console.error("[cloudSync] pushLead", error);
    throw error;
  }
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<void> {
  if (!isUuid(id)) return;
  const dbPatch: {
    status?: Lead["status"];
    visit_date?: string | null;
    notes?: string | null;
    check_in_requested?: boolean;
    contract_url?: string | null;
    commission_paid?: boolean;
  } = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.visitDate !== undefined) dbPatch.visit_date = patch.visitDate;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.checkInRequested !== undefined) dbPatch.check_in_requested = patch.checkInRequested;
  if (patch.contractUrl !== undefined) dbPatch.contract_url = patch.contractUrl;
  if (patch.commissionPaid !== undefined) dbPatch.commission_paid = patch.commissionPaid;
  const { error } = await supabase.from("leads").update(dbPatch).eq("id", id);
  if (error) console.error("[cloudSync] updateLead", error);
}

export async function fetchLeadsForAdvertiser(advertiserId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*, products(title, category), indicators(name)")
    .eq("advertiser_id", advertiserId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[cloudSync] fetchLeadsForAdvertiser", error);
    return [];
  }
  return (data ?? []).map(leadFromDb);
}

export async function fetchLeadsForIndicator(indicatorId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*, products(title, category), indicators(name)")
    .eq("indicator_id", indicatorId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[cloudSync] fetchLeadsForIndicator", error);
    return [];
  }
  return (data ?? []).map(leadFromDb);
}

// ---------------- Chat ----------------

export function chatFromDb(row: any): ChatMessage {
  return {
    id: row.id,
    leadId: row.lead_id,
    senderId: row.sender_id ?? row.sender_role ?? "system",
    senderName: row.sender_name,
    senderRole: row.sender_role,
    text: row.text,
    originalText: row.original_text ?? undefined,
    isSystem: row.is_system ?? undefined,
    isBlockedBySecurity: row.is_blocked_by_security ?? undefined,
    createdAt: row.created_at,
  };
}

export async function pushChatMessage(m: ChatMessage): Promise<void> {
  if (!isUuid(m.leadId)) return; // não persiste chat de leads mock
  const senderId = isUuid(m.senderId) ? m.senderId : null;
  const payload = {
    lead_id: m.leadId,
    sender_id: senderId,
    sender_name: m.senderName,
    sender_role: m.senderRole,
    text: m.text,
    original_text: m.originalText ?? null,
    is_system: m.isSystem ?? false,
    is_blocked_by_security: m.isBlockedBySecurity ?? false,
    ...(isUuid(m.id) ? { id: m.id } : {}),
  };
  const { error } = await supabase.from("chat_messages").insert(payload);
  if (error) {
    console.error("[cloudSync] pushChatMessage", error);
    throw error;
  }
}

export async function fetchChatsForLeads(leadIds: string[]): Promise<ChatMessage[]> {
  const ids = leadIds.filter(isUuid);
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .in("lead_id", ids)
    .order("created_at");
  if (error) {
    console.error("[cloudSync] fetchChatsForLeads", error);
    return [];
  }
  return (data ?? []).map(chatFromDb);
}

/** Realtime: novos chats — filtro por ids no callback (cheap). */
export function subscribeChatMessagesAll(onNew: (m: ChatMessage) => void) {
  const channel = supabase
    .channel(`chat-sync-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages" },
      (payload) => onNew(chatFromDb(payload.new)),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/** Realtime: leads (INSERT + UPDATE). */
export function subscribeLeads(onChange: (l: Lead) => void) {
  const channel = supabase
    .channel(`leads-sync-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "leads" },
      (payload) => {
        const row = (payload.new ?? payload.old) as Record<string, unknown>;
        if (row && "id" in row) onChange(leadFromDb(row));
      },
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
