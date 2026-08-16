/**
 * Repositórios Supabase — única camada de acesso a dados da aplicação.
 * Todo componente lê/escreve pelos hooks de `src/hooks/queries.ts`, que chamam
 * estas funções. Nenhuma tela deve importar `supabase` diretamente para CRUD
 * de domínio (chat/produtos/leads/indicadores/anunciantes/simulações/config).
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  Product,
  ProductStatus,
  Lead,
  LeadStatus,
  Advertiser,
  Indicator,
  Commission,
  ChatMessage,
  FinancingSimulation,
  FinancingStatus,
  BankSimulationResponse,
  ApprovedContract,
  PlatformConfig,
} from "@/types";
import {
  isUuid,
  productFromDb,
  productToDb,
  leadFromDb,
  leadPatchToDb,
  chatFromDb,
  advertiserFromDb,
  advertiserToDb,
  indicatorFromDb,
  indicatorToDb,
  simulationFromDb,
  simulationToDb,
  bankResponsesToDb,
  approvedContractToDb,
  platformConfigFromDb,
  platformConfigToDb,
  commissionFromDb,
} from "@/lib/mappers";

export { isUuid };

const PRODUCT_SELECT = "*, product_images(url, position), advertisers(name)";
const LEAD_SELECT = "*, products(title, category), indicators(name)";
const SIMULATION_SELECT =
  "*, products(title, price, cover_image), indicators(name), financing_bank_responses(*)";

// ---------------- Advertiser / Indicator profiles ----------------

export const advertisersRepo = {
  /** Garante uma linha em `advertisers` para o usuário logado (id == user_id). */
  async ensureForUser(userId: string, base: Partial<Advertiser>): Promise<Advertiser | null> {
    const { data: existing, error: lookupError } = await supabase
      .from("advertisers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (lookupError)
      console.error("[repositories] advertisersRepo.ensureForUser lookup", lookupError);
    if (existing) return advertiserFromDb(existing);

    const { data, error } = await supabase
      .from("advertisers")
      .upsert(
        {
          id: userId,
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
        },
        { onConflict: "id" },
      )
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("[repositories] advertisersRepo.ensureForUser upsert", error);
      return null;
    }
    return data ? advertiserFromDb(data) : null;
  },
  async update(id: string, patch: Advertiser): Promise<void> {
    const { error } = await supabase.from("advertisers").update(advertiserToDb(patch)).eq("id", id);
    if (error) {
      console.error("[repositories] advertisersRepo.update", error);
      throw error;
    }
  },
  async listAll(): Promise<Advertiser[]> {
    const { data, error } = await supabase.from("advertisers").select("*");
    if (error) {
      console.error("[repositories] advertisersRepo.listAll", error);
      return [];
    }
    return (data ?? []).map(advertiserFromDb);
  },
};

export const indicatorsRepo = {
  /** Garante uma linha em `indicators` para o usuário logado (id == user_id). */
  async ensureForUser(userId: string, base: Partial<Indicator>): Promise<Indicator | null> {
    const { data: existing, error: lookupError } = await supabase
      .from("indicators")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (lookupError)
      console.error("[repositories] indicatorsRepo.ensureForUser lookup", lookupError);
    if (existing) return indicatorFromDb(existing);

    const { data, error } = await supabase
      .from("indicators")
      .upsert(
        {
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
        },
        { onConflict: "id" },
      )
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("[repositories] indicatorsRepo.ensureForUser upsert", error);
      return null;
    }
    return data ? indicatorFromDb(data) : null;
  },
  async update(id: string, patch: Indicator): Promise<void> {
    const { error } = await supabase.from("indicators").update(indicatorToDb(patch)).eq("id", id);
    if (error) {
      console.error("[repositories] indicatorsRepo.update", error);
      throw error;
    }
  },
  async incrementClicks(indicatorId: string): Promise<void> {
    const { data: cur, error: readErr } = await supabase
      .from("indicators")
      .select("clicks")
      .eq("id", indicatorId)
      .maybeSingle();
    if (readErr || !cur) return;
    const { error } = await supabase
      .from("indicators")
      .update({ clicks: cur.clicks + 1 })
      .eq("id", indicatorId);
    if (error) console.error("[repositories] indicatorsRepo.incrementClicks", error);
  },
  async listAll(): Promise<Indicator[]> {
    const { data, error } = await supabase.from("indicators").select("*");
    if (error) {
      console.error("[repositories] indicatorsRepo.listAll", error);
      return [];
    }
    return (data ?? []).map(indicatorFromDb);
  },
  /**
   * Indicadores associados aos leads/simulações de um anunciante (nome + telefone,
   * usado para montar o link de WhatsApp no painel do anunciante). RLS libera essa
   * leitura via `app_private.can_read_indicator`, restrita à relação lead↔anunciante.
   */
  async listRelatedToAdvertiser(advertiserId: string): Promise<Indicator[]> {
    const [{ data: leadRows, error: leadErr }, { data: simRows, error: simErr }] =
      await Promise.all([
        supabase.from("leads").select("indicators(*)").eq("advertiser_id", advertiserId),
        supabase
          .from("financing_simulations")
          .select("indicators(*)")
          .eq("advertiser_id", advertiserId),
      ]);
    if (leadErr)
      console.error("[repositories] indicatorsRepo.listRelatedToAdvertiser leads", leadErr);
    if (simErr) console.error("[repositories] indicatorsRepo.listRelatedToAdvertiser sims", simErr);
    const byId = new Map<string, Indicator>();
    for (const row of [...(leadRows ?? []), ...(simRows ?? [])]) {
      const ind = (row as { indicators: unknown }).indicators;
      if (ind) {
        const mapped = indicatorFromDb(ind);
        byId.set(mapped.id, mapped);
      }
    }
    return Array.from(byId.values());
  },
  /** Realtime: reflete saldos/score/clicks alterados via trigger no banco. */
  subscribe(onChange: (partial: Partial<Indicator> & { id: string }) => void) {
    const channel = supabase
      .channel(`indicators-sync-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "indicators" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          onChange({
            id: row.id as string,
            balanceAvailable: Number(row.balance_available ?? 0),
            balancePending: Number(row.balance_pending ?? 0),
            score: Number(row.score ?? 0),
            clicks: Number(row.clicks ?? 0),
            league: row.league as Indicator["league"],
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

// ---------------- Products ----------------

export const productsRepo = {
  async listActive(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "ativo")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] productsRepo.listActive", error);
      return [];
    }
    return (data ?? []).map(productFromDb);
  },
  async listByAdvertiser(advertiserId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("advertiser_id", advertiserId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] productsRepo.listByAdvertiser", error);
      return [];
    }
    return (data ?? []).map(productFromDb);
  },
  async getById(id: string): Promise<Product | null> {
    if (!isUuid(id)) return null;
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("[repositories] productsRepo.getById", error);
      return null;
    }
    return data ? productFromDb(data) : null;
  },
  async create(p: Product): Promise<void> {
    if (!isUuid(p.id) || !isUuid(p.advertiserId)) {
      throw new Error("productsRepo.create requires UUID id/advertiserId");
    }
    const { error } = await supabase.from("products").insert(productToDb(p));
    if (error) {
      console.error("[repositories] productsRepo.create", error);
      throw error;
    }
    if (p.gallery?.length) {
      const rows = p.gallery.map((url, position) => ({ product_id: p.id, url, position }));
      const { error: imgErr } = await supabase.from("product_images").insert(rows);
      if (imgErr) console.error("[repositories] productsRepo.create product_images", imgErr);
    }
  },
  async updateStatus(id: string, status: ProductStatus): Promise<void> {
    if (!isUuid(id)) return;
    const { error } = await supabase.from("products").update({ status }).eq("id", id);
    if (error) {
      console.error("[repositories] productsRepo.updateStatus", error);
      throw error;
    }
  },
  /**
   * Edição completa do anúncio pelo anunciante. As imagens vivem numa tabela
   * separada (`product_images`), então a galeria é regravada por inteiro —
   * mais simples e previsível do que tentar casar item a item.
   */
  async update(p: Product): Promise<void> {
    if (!isUuid(p.id)) throw new Error("productsRepo.update requires a UUID id");
    const { error } = await supabase.from("products").update(productToDb(p)).eq("id", p.id);
    if (error) {
      console.error("[repositories] productsRepo.update", error);
      throw error;
    }
    const { error: delErr } = await supabase.from("product_images").delete().eq("product_id", p.id);
    if (delErr) console.error("[repositories] productsRepo.update clear images", delErr);
    if (p.gallery?.length) {
      const rows = p.gallery.map((url, position) => ({ product_id: p.id, url, position }));
      const { error: imgErr } = await supabase.from("product_images").insert(rows);
      if (imgErr) console.error("[repositories] productsRepo.update product_images", imgErr);
    }
  },
  async remove(id: string): Promise<void> {
    if (!isUuid(id)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("[repositories] productsRepo.remove", error);
      throw error;
    }
  },
  /** Catálogo completo (todos os status) — só retorna dados via RLS de admin. */
  async listAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] productsRepo.listAll", error);
      return [];
    }
    return (data ?? []).map(productFromDb);
  },
};

// ---------------- Leads ----------------

export interface CreateLeadInput {
  productId: string;
  indicatorId?: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes?: string;
  referralChannel?: string;
}

export const leadsRepo = {
  async listForAdvertiser(advertiserId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select(LEAD_SELECT)
      .eq("advertiser_id", advertiserId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] leadsRepo.listForAdvertiser", error);
      return [];
    }
    return (data ?? []).map(leadFromDb);
  },
  async listForIndicator(indicatorId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select(LEAD_SELECT)
      .eq("indicator_id", indicatorId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] leadsRepo.listForIndicator", error);
      return [];
    }
    return (data ?? []).map(leadFromDb);
  },
  /**
   * Cria um lead via Edge Function `create-lead`, que calcula a comissão a
   * partir do produto no servidor e valida o `indicatorId` recebido — o
   * INSERT direto na tabela foi revogado (ver migration
   * 20260811031000_leads_server_side_creation.sql). Retorna o lead como
   * gravado no banco (id e commissionValue são definidos pelo servidor).
   */
  async create(input: CreateLeadInput): Promise<Lead> {
    const { data, error } = await supabase.functions.invoke("create-lead", { body: input });
    if (error) {
      console.error("[repositories] leadsRepo.create", error);
      throw error;
    }
    return leadFromDb(data.lead);
  },
  /**
   * Ação estreita, via RPC (`indicator_request_check_in`): o indicador só
   * consegue sinalizar chegada (`check_in_requested = true`) no próprio lead
   * — não pode mudar status/comissão. Quem confirma a visita continua sendo
   * só o anunciante, via `updateStatus`.
   */
  async requestCheckIn(leadId: string): Promise<void> {
    const { error } = await supabase.rpc("indicator_request_check_in", { _lead_id: leadId });
    if (error) {
      console.error("[repositories] leadsRepo.requestCheckIn", error);
      throw error;
    }
  },
  async update(id: string, patch: Partial<Lead>): Promise<void> {
    if (!isUuid(id)) return;
    const { error } = await supabase.from("leads").update(leadPatchToDb(patch)).eq("id", id);
    if (error) {
      console.error("[repositories] leadsRepo.update", error);
      throw error;
    }
  },
  async updateStatus(
    id: string,
    status: LeadStatus,
    changedBy: string,
    notes?: string,
  ): Promise<void> {
    if (!isUuid(id)) return;
    const { data: existing } = await supabase
      .from("leads")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      console.error("[repositories] leadsRepo.updateStatus", error);
      throw error;
    }
    if (existing && isUuid(changedBy)) {
      const { error: histErr } = await supabase.from("lead_status_history").insert({
        lead_id: id,
        from_status: existing.status,
        to_status: status,
        changed_by: changedBy,
        notes: notes ?? null,
      });
      if (histErr) console.error("[repositories] leadsRepo.updateStatus history", histErr);
    }
  },
  /** Todos os leads da plataforma — só retorna dados via RLS de admin. */
  async listAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select(LEAD_SELECT)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] leadsRepo.listAll", error);
      return [];
    }
    return (data ?? []).map(leadFromDb);
  },
  /** Realtime: leads (INSERT + UPDATE). */
  subscribe(onChange: (l: Lead) => void) {
    const channel = supabase
      .channel(`leads-sync-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        const row = (payload.new ?? payload.old) as Record<string, unknown>;
        if (row && "id" in row) onChange(leadFromDb(row));
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

// ---------------- Chat ----------------

export interface SendChatMessageInput {
  leadId: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "advertiser" | "system";
  text: string;
  isSystem?: boolean;
}

export interface SendChatMessageResult {
  message: ChatMessage;
  warning: ChatMessage | null;
  hasLeakage: boolean;
}

export const chatRepo = {
  async listByLeadIds(leadIds: string[]): Promise<ChatMessage[]> {
    const ids = leadIds.filter(isUuid);
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .in("lead_id", ids)
      .order("created_at");
    if (error) {
      console.error("[repositories] chatRepo.listByLeadIds", error);
      return [];
    }
    return (data ?? []).map(chatFromDb);
  },
  /**
   * Envia uma mensagem via Edge Function `send-chat-message`, que sanitiza o
   * texto no servidor (telefone/e-mail/links) antes de gravar. O INSERT direto
   * na tabela é revogado para anon/authenticated — este é o único caminho.
   */
  async send(input: SendChatMessageInput): Promise<SendChatMessageResult> {
    if (!isUuid(input.leadId)) {
      throw new Error("chatRepo.send requires a UUID leadId");
    }
    const { data, error } = await supabase.functions.invoke("send-chat-message", {
      body: input,
    });
    if (error) {
      console.error("[repositories] chatRepo.send", error);
      throw error;
    }
    return {
      message: chatFromDb(data.message),
      warning: data.warning ? chatFromDb(data.warning) : null,
      hasLeakage: !!data.hasLeakage,
    };
  },
  /** Realtime: todas as novas mensagens (filtragem por lead fica no callback). */
  subscribeAll(onNew: (m: ChatMessage) => void) {
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
  },
};

// ---------------- Financing simulations ----------------

export const simulationsRepo = {
  async listForAdvertiser(advertiserId: string): Promise<FinancingSimulation[]> {
    const { data, error } = await supabase
      .from("financing_simulations")
      .select(SIMULATION_SELECT)
      .eq("advertiser_id", advertiserId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] simulationsRepo.listForAdvertiser", error);
      return [];
    }
    return (data ?? []).map(simulationFromDb);
  },
  async listForIndicator(indicatorId: string): Promise<FinancingSimulation[]> {
    const { data, error } = await supabase
      .from("financing_simulations")
      .select(SIMULATION_SELECT)
      .eq("indicator_id", indicatorId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] simulationsRepo.listForIndicator", error);
      return [];
    }
    return (data ?? []).map(simulationFromDb);
  },
  /** Retorna o id gerado pelo banco, ou null se produto/anunciante não forem reais. */
  async create(s: FinancingSimulation): Promise<string | null> {
    if (!isUuid(s.productId) || !isUuid(s.advertiserId)) return null;
    const { data, error } = await supabase
      .from("financing_simulations")
      .insert(simulationToDb(s))
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("[repositories] simulationsRepo.create", error);
      return null;
    }
    return data?.id ?? null;
  },
  async updateStatus(
    id: string,
    status: FinancingStatus,
    bankResponses?: BankSimulationResponse[],
    approvedContract?: ApprovedContract,
  ): Promise<void> {
    if (!isUuid(id)) return;
    const patch = { status, ...(approvedContract ? approvedContractToDb(approvedContract) : {}) };
    const { error } = await supabase.from("financing_simulations").update(patch).eq("id", id);
    if (error) {
      console.error("[repositories] simulationsRepo.updateStatus", error);
      throw error;
    }
    if (bankResponses && bankResponses.length) {
      await supabase.from("financing_bank_responses").delete().eq("simulation_id", id);
      const { error: brErr } = await supabase
        .from("financing_bank_responses")
        .insert(bankResponsesToDb(id, bankResponses));
      if (brErr) console.error("[repositories] simulationsRepo.updateStatus bank_responses", brErr);
    }
  },
};

// ---------------- Platform config ----------------

export const platformConfigRepo = {
  async get(): Promise<PlatformConfig | null> {
    const { data, error } = await supabase
      .from("platform_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      console.error("[repositories] platformConfigRepo.get", error);
      return null;
    }
    return data ? platformConfigFromDb(data) : null;
  },
  async update(cfg: PlatformConfig): Promise<void> {
    const { error } = await supabase
      .from("platform_config")
      .update(platformConfigToDb(cfg))
      .eq("id", 1);
    if (error) {
      console.error("[repositories] platformConfigRepo.update", error);
      throw error;
    }
  },
};

// ---------------- Storage ----------------

export const storageRepo = {
  async uploadProductImage(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });
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
    return path; // bucket privado: usar signedContractUrl na leitura
  },
  async signedContractUrl(path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from("contracts")
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },
};

// ---------------- Commissions (ledger) ----------------
// Somente leitura: as linhas só são criadas/atualizadas pelos triggers do
// banco (leads_sync_indicator_balance / commissions_sync_indicator_balance),
// nunca por escrita direta do cliente.

export const commissionsRepo = {
  async listForIndicator(indicatorId: string): Promise<Commission[]> {
    const { data, error } = await supabase
      .from("commissions")
      .select("*")
      .eq("indicator_id", indicatorId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] commissionsRepo.listForIndicator", error);
      return [];
    }
    return (data ?? []).map(commissionFromDb);
  },
  /**
   * Comissões que o anunciante deve — nascidas de leads ou de simulações
   * dele. A RLS (`commissions_select_advertiser`) é quem garante o recorte:
   * aqui pedimos tudo e o banco devolve só o que é dele.
   */
  async listForAdvertiser(): Promise<Commission[]> {
    const { data, error } = await supabase
      .from("commissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] commissionsRepo.listForAdvertiser", error);
      return [];
    }
    return (data ?? []).map(commissionFromDb);
  },
};

// ---------------- Payouts ----------------
// Ainda não consumido pela UI (saque de saldo é trabalho futuro) — mantido como
// scaffold tipado contra o schema real de `payouts`.

type Tables = import("@/integrations/supabase/types").Database["public"]["Tables"];

export const payoutsRepo = {
  async listByIndicator(indicatorId: string) {
    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("indicator_id", indicatorId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[repositories] payoutsRepo.listByIndicator", error);
      return [];
    }
    return data ?? [];
  },
  async request(input: Tables["payouts"]["Insert"]) {
    const { data, error } = await supabase.from("payouts").insert(input).select().single();
    if (error) {
      console.error("[repositories] payoutsRepo.request", error);
      throw error;
    }
    return data;
  },
};
