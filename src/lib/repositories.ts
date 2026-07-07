/**
 * Repositórios Supabase — camada de acesso a dados para migração progressiva.
 * Fase 1: schema + auth prontos. Fases 2-4 migram cada tela do localStorage
 * para estes repositórios. Mantém uma interface estável para os componentes.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

// ---------------- Products ----------------
export const productsRepo = {
  async listActive() {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(url, position), advertisers(name)")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async listByAdvertiser(advertiserId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(url, position)")
      .eq("advertiser_id", advertiserId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(url, position), advertisers(name)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async create(input: Tables["products"]["Insert"]) {
    const { data, error } = await supabase.from("products").insert(input).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, patch: Tables["products"]["Update"]) {
    const { data, error } = await supabase.from("products").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};

// ---------------- Leads ----------------
export const leadsRepo = {
  async listForAdvertiser(advertiserId: string) {
    const { data, error } = await supabase
      .from("leads")
      .select("*, products(title, category), indicators(name)")
      .eq("advertiser_id", advertiserId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async listForIndicator(indicatorId: string) {
    const { data, error } = await supabase
      .from("leads")
      .select("*, products(title, category), advertisers(name)")
      .eq("indicator_id", indicatorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async create(input: Tables["leads"]["Insert"]) {
    const { data, error } = await supabase.from("leads").insert(input).select().single();
    if (error) throw error;
    return data;
  },
  async updateStatus(id: string, status: Tables["leads"]["Update"]["status"], userId: string, notes?: string) {
    const { data: existing } = await supabase.from("leads").select("status").eq("id", id).single();
    const { data, error } = await supabase.from("leads").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    if (existing && status) {
      await supabase.from("lead_status_history").insert({
        lead_id: id,
        from_status: existing.status,
        to_status: status,
        changed_by: userId,
        notes,
      });
    }
    return data;
  },
};

// ---------------- Advertiser / Indicator profiles ----------------
export const advertisersRepo = {
  async getByUser(userId: string) {
    const { data, error } = await supabase.from("advertisers").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsert(input: Tables["advertisers"]["Insert"]) {
    const { data, error } = await supabase.from("advertisers").upsert(input, { onConflict: "user_id" }).select().single();
    if (error) throw error;
    return data;
  },
};

export const indicatorsRepo = {
  async getByUser(userId: string) {
    const { data, error } = await supabase.from("indicators").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsert(input: Tables["indicators"]["Insert"]) {
    const { data, error } = await supabase.from("indicators").upsert(input, { onConflict: "user_id" }).select().single();
    if (error) throw error;
    return data;
  },
  async incrementClicks(indicatorId: string) {
    const { data: cur } = await supabase.from("indicators").select("clicks").eq("id", indicatorId).single();
    if (!cur) return;
    await supabase.from("indicators").update({ clicks: cur.clicks + 1 }).eq("id", indicatorId);
  },
};

// ---------------- Chat ----------------
export const chatRepo = {
  async listByLead(leadId: string) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at");
    if (error) throw error;
    return data;
  },
  async send(input: Tables["chat_messages"]["Insert"]) {
    const { data, error } = await supabase.from("chat_messages").insert(input).select().single();
    if (error) throw error;
    return data;
  },
  subscribe(leadId: string, onMessage: (msg: Tables["chat_messages"]["Row"]) => void) {
    const channel = supabase
      .channel(`chat:${leadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `lead_id=eq.${leadId}` },
        (payload) => onMessage(payload.new as Tables["chat_messages"]["Row"]),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

// ---------------- Storage ----------------
export const storageRepo = {
  async uploadProductImage(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  },
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  },
  async uploadContract(userId: string, file: File): Promise<string> {
    const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("contracts").upload(path, file);
    if (error) throw error;
    return path; // private bucket: use createSignedUrl on read
  },
  async signedContractUrl(path: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage.from("contracts").createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },
};

// ---------------- Platform config ----------------
export const platformConfigRepo = {
  async get() {
    const { data, error } = await supabase.from("platform_config").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
  async update(patch: Tables["platform_config"]["Update"]) {
    const { data, error } = await supabase.from("platform_config").update(patch).eq("id", 1).select().single();
    if (error) throw error;
    return data;
  },
};

// ---------------- Payouts ----------------
export const payoutsRepo = {
  async listByIndicator(indicatorId: string) {
    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("indicator_id", indicatorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async request(input: Tables["payouts"]["Insert"]) {
    const { data, error } = await supabase.from("payouts").insert(input).select().single();
    if (error) throw error;
    return data;
  },
};
