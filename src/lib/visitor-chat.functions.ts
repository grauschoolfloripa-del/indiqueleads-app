import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Category, ChatMessage, Lead } from "@/types";

const VisitorChatLookupSchema = z.object({
  lookup: z.string().min(3).max(120),
  productId: z.string().uuid().optional().nullable(),
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

    const leads: Lead[] = (leadRows ?? []).map((row: any) => ({
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