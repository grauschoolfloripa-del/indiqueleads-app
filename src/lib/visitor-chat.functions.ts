import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Category, ChatMessage, Lead } from "@/types";

const VisitorChatLookupSchema = z.object({
  lookup: z.string().min(3).max(120),
  productId: z.string().uuid().optional().nullable(),
});

const VisitorChatMessageSchema = z.object({
  id: z.string().uuid(),
  senderName: z.string().min(1).max(120),
  senderRole: z.enum(["client", "system"]),
  text: z.string().min(1).max(4000),
  originalText: z.string().max(4000).optional().nullable(),
  isSystem: z.boolean().optional().nullable(),
  isBlockedBySecurity: z.boolean().optional().nullable(),
  createdAt: z.string(),
});

const VisitorChatSendSchema = VisitorChatLookupSchema.extend({
  leadId: z.string().uuid(),
  messages: z.array(VisitorChatMessageSchema).min(1).max(2),
});

export const getVisitorLeadChats = createServerFn({ method: "POST" })
  .inputValidator((raw) => VisitorChatLookupSchema.parse(raw))
  .handler(async ({ data }) => {
    const lookupRaw = data.lookup.trim();
    const lookup = lookupRaw.toLowerCase();
    const digits = lookupRaw.replace(/\D/g, "");
    const isEmailLookup = lookup.includes("@");

    if (!isEmailLookup && digits.length < 8) {
      return { leads: [] as Lead[], messages: [] as ChatMessage[] };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let leadsQuery = supabaseAdmin
      .from("leads")
      .select("*, products(title, category, advertisers(name)), indicators(name)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data.productId) {
      leadsQuery = leadsQuery.eq("product_id", data.productId);
    }

    if (isEmailLookup) {
      leadsQuery = leadsQuery.ilike("client_email", lookup);
    } else {
      const phoneCandidates = Array.from(new Set([lookupRaw, digits].filter(Boolean)));
      leadsQuery = leadsQuery.in("client_phone", phoneCandidates);
    }

    const { data: leadRows, error: leadsError } = await leadsQuery;
    if (leadsError) throw new Error(leadsError.message);

    const matchedRows = isEmailLookup
      ? (leadRows ?? [])
      : (leadRows ?? []).filter(
          (row: any) => String(row.client_phone ?? "").replace(/\D/g, "") === digits,
        );

    const leads: Lead[] = matchedRows.map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      productTitle: row.products?.title ?? "",
      productCategory: (row.products?.category ?? "imovel") as Category,
      indicatorId: row.indicator_id ?? "",
      indicatorName: row.indicators?.name ?? "Indicador parceiro",
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
    }));

    if (!leads.length) {
      return { leads, messages: [] as ChatMessage[] };
    }

    const { data: messageRows, error: messagesError } = await supabaseAdmin
      .from("chat_messages")
      .select("*")
      .in(
        "lead_id",
        leads.map((lead) => lead.id),
      )
      .order("created_at", { ascending: true });

    if (messagesError) throw new Error(messagesError.message);

    const messages: ChatMessage[] = (messageRows ?? []).map((row: any) => ({
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
    }));

    return { leads, messages };
  });

export const sendVisitorChatMessage = createServerFn({ method: "POST" })
  .inputValidator((raw) => VisitorChatSendSchema.parse(raw))
  .handler(async ({ data }) => {
    const lookupRaw = data.lookup.trim();
    const lookup = lookupRaw.toLowerCase();
    const digits = lookupRaw.replace(/\D/g, "");
    const isEmailLookup = lookup.includes("@");

    if (!isEmailLookup && digits.length < 8) {
      throw new Error("Informe o mesmo e-mail ou telefone usado no cadastro do atendimento.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let leadQuery = supabaseAdmin
      .from("leads")
      .select("id, product_id, client_email, client_phone")
      .eq("id", data.leadId)
      .maybeSingle();

    const { data: lead, error: leadError } = await leadQuery;
    if (leadError) throw new Error(leadError.message);
    if (!lead) throw new Error("Atendimento não encontrado.");

    if (data.productId && lead.product_id !== data.productId) {
      throw new Error("Este atendimento não pertence a este anúncio.");
    }

    const leadEmail = String(lead.client_email ?? "").toLowerCase().trim();
    const leadPhoneDigits = String(lead.client_phone ?? "").replace(/\D/g, "");
    const emailMatches = isEmailLookup && leadEmail === lookup;
    const phoneMatches = !isEmailLookup && digits.length >= 8 && leadPhoneDigits === digits;

    if (!emailMatches && !phoneMatches) {
      throw new Error("Os dados informados não conferem com este atendimento.");
    }

    const rows = data.messages.map((message) => ({
      id: message.id,
      lead_id: data.leadId,
      sender_id: null,
      sender_name: message.senderName,
      sender_role: message.senderRole,
      text: message.text,
      original_text: message.originalText ?? null,
      is_system: message.isSystem ?? message.senderRole === "system",
      is_blocked_by_security: message.isBlockedBySecurity ?? false,
      created_at: message.createdAt,
    }));

    const { data: insertedRows, error: insertError } = await supabaseAdmin
      .from("chat_messages")
      .insert(rows)
      .select("*")
      .order("created_at", { ascending: true });

    if (insertError) throw new Error(insertError.message);

    const messages: ChatMessage[] = (insertedRows ?? []).map((row: any) => ({
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
    }));

    return { messages };
  });