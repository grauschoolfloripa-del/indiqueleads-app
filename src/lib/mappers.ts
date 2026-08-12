/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mapeamento linha do banco (snake_case, com joins) ↔ tipos de domínio (camelCase).
 *
 * As linhas vindas do PostgREST com joins aninhados (`products(title)`,
 * `financing_bank_responses(*)`) não têm tipo estático útil, por isso `any` aqui.
 * A fronteira tipada é a saída: sempre um tipo de `@/types`.
 */
import type {
  Product,
  Lead,
  ChatMessage,
  Advertiser,
  Indicator,
  Commission,
  FinancingSimulation,
  FinancingStatus,
  BankSimulationResponse,
  ApprovedContract,
  PlatformConfig,
} from "@/types";
import { MIN_COMMISSION_VALUE } from "@/lib/platformDefaults";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string | undefined | null): v is string => !!v && UUID_RE.test(v);

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
    commissionLeadValue: Number(row.commission_lead_value ?? 0),
    allowPresencialTier: row.allow_presencial_tier ?? false,
    allowNegotiateTier: row.allow_negotiate_tier ?? false,
    attributes: row.attributes ?? {},
  };
}

export function productToDb(p: Product) {
  return {
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
    commission_lead_value: p.commissionLeadValue ?? 0,
    allow_presencial_tier: p.allowPresencialTier,
    allow_negotiate_tier: p.allowNegotiateTier,
    attributes: (p.attributes ?? {}) as never,
  };
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

export function leadToDb(l: Lead) {
  return {
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
  };
}

/** Converte um patch parcial de domínio para colunas — só o que veio definido. */
export function leadPatchToDb(patch: Partial<Lead>): Tables["leads"]["Update"] {
  const dbPatch: Tables["leads"]["Update"] = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.visitDate !== undefined) dbPatch.visit_date = patch.visitDate;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.checkInRequested !== undefined) dbPatch.check_in_requested = patch.checkInRequested;
  if (patch.contractUrl !== undefined) dbPatch.contract_url = patch.contractUrl;
  if (patch.commissionPaid !== undefined) dbPatch.commission_paid = patch.commissionPaid;
  return dbPatch;
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

export function chatToDb(m: ChatMessage) {
  return {
    lead_id: m.leadId,
    sender_id: isUuid(m.senderId) ? m.senderId : null,
    sender_name: m.senderName,
    sender_role: m.senderRole,
    text: m.text,
    original_text: m.originalText ?? null,
    is_system: m.isSystem ?? false,
    is_blocked_by_security: m.isBlockedBySecurity ?? false,
    ...(isUuid(m.id) ? { id: m.id } : {}),
  };
}

// ---------------- Advertisers / Indicators ----------------

export function advertiserFromDb(row: any): Advertiser {
  return {
    id: row.id,
    name: row.name,
    cnpjOrCpf: row.cnpj_or_cpf ?? "",
    type: row.type ?? "PJ",
    phone: row.phone ?? "",
    email: row.email ?? "",
    plan: row.plan ?? "gratuito",
    categoriesSelected: (row.categories ?? []) as Advertiser["categoriesSelected"],
    hasAcceptedTerms: !!row.has_accepted_terms,
    termsAcceptedAt: row.terms_accepted_at ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
  };
}

export function advertiserToDb(a: Advertiser) {
  return {
    name: a.name,
    cnpj_or_cpf: a.cnpjOrCpf,
    type: a.type,
    phone: a.phone,
    email: a.email,
    plan: a.plan,
    categories: a.categoriesSelected as never,
    city: a.city ?? null,
    state: a.state ?? null,
  };
}

export function indicatorFromDb(row: any): Indicator {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    pixKey: row.pix_key ?? "",
    pixType: row.pix_type ?? "email",
    league: row.league ?? "bronze",
    score: Number(row.score ?? 0),
    clicks: Number(row.clicks ?? 0),
    hasAcceptedTerms: !!row.has_accepted_terms,
    termsAcceptedAt: row.terms_accepted_at ?? undefined,
    balanceAvailable: Number(row.balance_available ?? 0),
    balancePending: Number(row.balance_pending ?? 0),
    city: row.city ?? undefined,
    state: row.state ?? undefined,
  };
}

export function indicatorToDb(i: Indicator) {
  return {
    name: i.name,
    cpf: i.cpf,
    phone: i.phone,
    email: i.email,
    pix_key: i.pixKey,
    pix_type: i.pixType,
    city: i.city ?? null,
    state: i.state ?? null,
  };
}

// ---------------- Financing simulations ----------------

export function simulationFromDb(row: any): FinancingSimulation {
  return {
    id: row.id,
    productId: row.product_id,
    productTitle: row.products?.title ?? "",
    productPrice: Number(row.products?.price ?? 0),
    productImage: row.products?.cover_image ?? undefined,
    indicatorId: row.indicator_id ?? "",
    indicatorName: row.indicators?.name ?? "",
    advertiserId: row.advertiser_id,
    clientName: row.client_name,
    clientCpf: row.client_cpf,
    clientPhone: row.client_phone,
    clientBirthDate: row.client_birth_date,
    clientIncome: Number(row.client_income ?? 0),
    downPayment: Number(row.down_payment ?? 0),
    desiredInstallments: row.desired_installments,
    status: row.status as FinancingStatus,
    bankResponses: (row.financing_bank_responses ?? []).map((b: any) => ({
      bankName: b.bank_name,
      approvedAmount: Number(b.approved_amount ?? 0),
      interestRate: Number(b.interest_rate ?? 0),
      installmentValue: Number(b.installment_value ?? 0),
      installmentsCount: b.installments_count,
      approvedStatus: b.approved_status,
      notes: b.notes ?? undefined,
    })) as BankSimulationResponse[],
    approvedContract: row.approved_bank
      ? ({
          bankName: row.approved_bank,
          approvedAmount: Number(row.approved_amount ?? 0),
          installmentsCount: row.approved_installments ?? 0,
          installmentValue: Number(row.approved_installment_value ?? 0),
          downPaymentRequired: Number(row.approved_down_payment ?? 0),
          interestRate: Number(row.approved_interest_rate ?? 0),
          additionalNotes: row.approved_notes ?? undefined,
        } as ApprovedContract)
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function simulationToDb(s: FinancingSimulation) {
  return {
    product_id: s.productId,
    indicator_id: isUuid(s.indicatorId) ? s.indicatorId : null,
    advertiser_id: s.advertiserId,
    client_name: s.clientName,
    client_cpf: s.clientCpf,
    client_phone: s.clientPhone,
    client_birth_date: s.clientBirthDate,
    client_income: s.clientIncome,
    down_payment: s.downPayment,
    desired_installments: s.desiredInstallments,
    status: s.status,
  };
}

export function bankResponsesToDb(simulationId: string, responses: BankSimulationResponse[]) {
  return responses.map((b) => ({
    simulation_id: simulationId,
    bank_name: b.bankName,
    approved_amount: b.approvedAmount,
    interest_rate: b.interestRate,
    installment_value: b.installmentValue,
    installments_count: b.installmentsCount,
    approved_status: b.approvedStatus,
    notes: b.notes ?? null,
  }));
}

export function approvedContractToDb(
  c: ApprovedContract,
): Tables["financing_simulations"]["Update"] {
  return {
    approved_bank: c.bankName,
    approved_amount: c.approvedAmount,
    approved_installments: c.installmentsCount,
    approved_installment_value: c.installmentValue,
    approved_down_payment: c.downPaymentRequired,
    approved_interest_rate: c.interestRate,
    approved_notes: c.additionalNotes ?? null,
  };
}

// ---------------- Commissions (ledger) ----------------

export function commissionFromDb(row: any): Commission {
  return {
    id: row.id,
    leadId: row.lead_id,
    indicatorId: row.indicator_id,
    kind: row.kind,
    amount: Number(row.amount ?? 0),
    status: row.status,
    createdAt: row.created_at,
  };
}

// ---------------- Platform config ----------------

export function platformConfigFromDb(row: any): PlatformConfig {
  return {
    feePercent: Number(row.fee_percent ?? 0),
    feePerLead: Number(row.fee_per_lead ?? 0),
    maxLeadCommissionPerIndicatorMonth:
      row.max_lead_commission_per_indicator_month != null
        ? Number(row.max_lead_commission_per_indicator_month)
        : null,
    // Não vive no banco (ver platformDefaults.ts) — regra estática, mesma para todos.
    minCommissionValue: MIN_COMMISSION_VALUE,
  };
}

export function platformConfigToDb(cfg: PlatformConfig) {
  return {
    fee_percent: cfg.feePercent,
    fee_per_lead: cfg.feePerLead,
    max_lead_commission_per_indicator_month: cfg.maxLeadCommissionPerIndicatorMonth,
  };
}
