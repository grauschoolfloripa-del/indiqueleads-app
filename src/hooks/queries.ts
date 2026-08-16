/**
 * Camada React Query — única forma pela qual os componentes leem/escrevem
 * dados de domínio. Encapsula `lib/repositories.ts`; nenhum componente deve
 * chamar o repositório diretamente.
 */
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  advertisersRepo,
  indicatorsRepo,
  productsRepo,
  leadsRepo,
  chatRepo,
  simulationsRepo,
  platformConfigRepo,
  commissionsRepo,
  type SendChatMessageInput,
  type CreateLeadInput,
} from "@/lib/repositories";
import type {
  Advertiser,
  Indicator,
  Product,
  ProductStatus,
  Lead,
  LeadStatus,
  FinancingSimulation,
  FinancingStatus,
  BankSimulationResponse,
  ApprovedContract,
  PlatformConfig,
} from "@/types";

export const queryKeys = {
  advertiser: (userId: string | undefined) => ["advertiser", userId] as const,
  indicator: (userId: string | undefined) => ["indicator", userId] as const,
  activeProducts: () => ["products", "active"] as const,
  advertiserProducts: (advertiserId: string | undefined) =>
    ["products", "advertiser", advertiserId] as const,
  allProducts: () => ["products", "all"] as const,
  advertiserLeads: (advertiserId: string | undefined) =>
    ["leads", "advertiser", advertiserId] as const,
  indicatorLeads: (indicatorId: string | undefined) => ["leads", "indicator", indicatorId] as const,
  allLeads: () => ["leads", "all"] as const,
  chatByLeads: (leadIds: string[]) => ["chat", ...leadIds.slice().sort()] as const,
  advertiserSimulations: (advertiserId: string | undefined) =>
    ["simulations", "advertiser", advertiserId] as const,
  indicatorSimulations: (indicatorId: string | undefined) =>
    ["simulations", "indicator", indicatorId] as const,
  platformConfig: () => ["platform-config"] as const,
  allAdvertisers: () => ["advertisers", "all"] as const,
  allIndicators: () => ["indicators", "all"] as const,
  advertiserRelatedIndicators: (advertiserId: string | undefined) =>
    ["indicators", "related-advertiser", advertiserId] as const,
  indicatorCommissions: (indicatorId: string | undefined) =>
    ["commissions", "indicator", indicatorId] as const,
};

// ---------------- Profiles ----------------

/** Garante e busca a linha de anunciante do usuário logado. */
export function useAdvertiserProfile(userId: string | undefined, seed: Partial<Advertiser>) {
  return useQuery({
    queryKey: queryKeys.advertiser(userId),
    queryFn: () => advertisersRepo.ensureForUser(userId as string, seed),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

/** Garante e busca a linha de indicador do usuário logado. */
export function useIndicatorProfile(userId: string | undefined, seed: Partial<Indicator>) {
  return useQuery({
    queryKey: queryKeys.indicator(userId),
    queryFn: () => indicatorsRepo.ensureForUser(userId as string, seed),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useUpdateAdvertiser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (advertiser: Advertiser) => advertisersRepo.update(advertiser.id, advertiser),
    onSuccess: (_data, advertiser) => {
      qc.setQueryData(queryKeys.advertiser(advertiser.id), advertiser);
    },
  });
}

export function useUpdateIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (indicator: Indicator) => indicatorsRepo.update(indicator.id, indicator),
    onSuccess: (_data, indicator) => {
      qc.setQueryData(queryKeys.indicator(indicator.id), indicator);
    },
  });
}

/** Todos os anunciantes (leitura pública, sempre disponível). */
export function useAllAdvertisers() {
  return useQuery({ queryKey: queryKeys.allAdvertisers(), queryFn: advertisersRepo.listAll });
}

/** Todos os indicadores — só retorna dados completos para admin (RLS). */
export function useAllIndicators(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.allIndicators(),
    queryFn: indicatorsRepo.listAll,
    enabled,
  });
}

/** Indicadores associados aos leads/simulações do anunciante logado (nome + telefone). */
export function useAdvertiserRelatedIndicators(advertiserId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.advertiserRelatedIndicators(advertiserId),
    queryFn: () => indicatorsRepo.listRelatedToAdvertiser(advertiserId as string),
    enabled: !!advertiserId,
  });
}

/** Realtime: saldo/score/clicks do indicador logado, refletidos por triggers do banco. */
export function useIndicatorRealtimeSync(indicatorId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!indicatorId) return;
    return indicatorsRepo.subscribe((partial) => {
      if (partial.id !== indicatorId) return;
      qc.setQueryData<Indicator | null | undefined>(queryKeys.indicator(indicatorId), (prev) =>
        prev ? { ...prev, ...partial } : prev,
      );
    });
  }, [indicatorId, qc]);
}

/** Histórico do ledger de comissões (evento por lead: 'lead' e/ou 'venda'). */
export function useIndicatorCommissions(indicatorId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.indicatorCommissions(indicatorId),
    queryFn: () => commissionsRepo.listForIndicator(indicatorId as string),
    enabled: !!indicatorId,
  });
}

// ---------------- Products ----------------

export function useActiveProducts() {
  return useQuery({ queryKey: queryKeys.activeProducts(), queryFn: productsRepo.listActive });
}

export function useAdvertiserProducts(advertiserId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.advertiserProducts(advertiserId),
    queryFn: () => productsRepo.listByAdvertiser(advertiserId as string),
    enabled: !!advertiserId,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Product) => productsRepo.create(p),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: queryKeys.advertiserProducts(p.advertiserId) });
      void qc.invalidateQueries({ queryKey: queryKeys.activeProducts() });
    },
  });
}

/** Catálogo completo — só retorna dados para admin (RLS). */
export function useAllProducts(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.allProducts(), queryFn: productsRepo.listAll, enabled });
}

export function useUpdateProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      productsRepo.updateStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/** Edição completa do anúncio (título, preço, comissões, fotos, atributos). */
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Product) => productsRepo.update(p),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsRepo.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/** Comissões devidas pelo anunciante logado (recorte garantido pela RLS). */
export function useAdvertiserCommissions(advertiserId: string | undefined) {
  return useQuery({
    queryKey: ["commissions", "advertiser", advertiserId] as const,
    queryFn: () => commissionsRepo.listForAdvertiser(),
    enabled: !!advertiserId,
  });
}

// ---------------- Leads ----------------

export function useAdvertiserLeads(advertiserId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.advertiserLeads(advertiserId),
    queryFn: () => leadsRepo.listForAdvertiser(advertiserId as string),
    enabled: !!advertiserId,
  });
}

export function useIndicatorLeads(indicatorId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.indicatorLeads(indicatorId),
    queryFn: () => leadsRepo.listForIndicator(indicatorId as string),
    enabled: !!indicatorId,
  });
}

/** Todos os leads da plataforma — só retorna dados para admin (RLS). */
export function useAllLeads(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.allLeads(), queryFn: leadsRepo.listAll, enabled });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => leadsRepo.create(input),
    onSuccess: (lead) => {
      void qc.invalidateQueries({ queryKey: queryKeys.advertiserLeads(lead.advertiserId) });
      if (lead.indicatorId)
        void qc.invalidateQueries({ queryKey: queryKeys.indicatorLeads(lead.indicatorId) });
    },
  });
}

/** "Cheguei na Loja" — o indicador sinaliza chegada; só o anunciante confirma a visita depois. */
export function useRequestCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => leadsRepo.requestCheckIn(leadId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Lead> }) =>
      leadsRepo.update(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leads"] });
      void qc.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useUpdateLeadStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      changedBy,
      notes,
    }: {
      id: string;
      status: LeadStatus;
      changedBy: string;
      notes?: string;
    }) => leadsRepo.updateStatus(id, status, changedBy, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

/** Realtime: leads (INSERT/UPDATE) invalidam as listas relevantes. */
export function useLeadsRealtimeSync(
  role: "indicador" | "anunciante" | "admin" | "visitante" | null,
) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!role || role === "visitante") return;
    return leadsRepo.subscribe(() => {
      void qc.invalidateQueries({ queryKey: ["leads"] });
    });
  }, [role, qc]);
}

// ---------------- Chat ----------------

export function useChatMessages(leadIds: string[]) {
  return useQuery({
    queryKey: queryKeys.chatByLeads(leadIds),
    queryFn: () => chatRepo.listByLeadIds(leadIds),
    enabled: leadIds.length > 0,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SendChatMessageInput) => chatRepo.send(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

/** Realtime: novas mensagens de chat invalidam as queries carregadas. */
export function useChatRealtimeSync(enabled: boolean) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    return chatRepo.subscribeAll(() => {
      void qc.invalidateQueries({ queryKey: ["chat"] });
    });
  }, [enabled, qc]);
}

// ---------------- Financing simulations ----------------

export function useAdvertiserSimulations(advertiserId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.advertiserSimulations(advertiserId),
    queryFn: () => simulationsRepo.listForAdvertiser(advertiserId as string),
    enabled: !!advertiserId,
  });
}

export function useIndicatorSimulations(indicatorId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.indicatorSimulations(indicatorId),
    queryFn: () => simulationsRepo.listForIndicator(indicatorId as string),
    enabled: !!indicatorId,
  });
}

export function useCreateSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: FinancingSimulation) => simulationsRepo.create(s),
    onSuccess: (_data, s) => {
      void qc.invalidateQueries({ queryKey: queryKeys.advertiserSimulations(s.advertiserId) });
      if (s.indicatorId)
        void qc.invalidateQueries({ queryKey: queryKeys.indicatorSimulations(s.indicatorId) });
    },
  });
}

export function useUpdateSimulationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      bankResponses,
      approvedContract,
    }: {
      id: string;
      status: FinancingStatus;
      bankResponses?: BankSimulationResponse[];
      approvedContract?: ApprovedContract;
    }) => simulationsRepo.updateStatus(id, status, bankResponses, approvedContract),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["simulations"] });
    },
  });
}

// ---------------- Platform config ----------------

export function usePlatformConfig() {
  return useQuery({ queryKey: queryKeys.platformConfig(), queryFn: platformConfigRepo.get });
}

export function useUpdatePlatformConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cfg: PlatformConfig) => platformConfigRepo.update(cfg),
    onSuccess: (_data, cfg) => {
      qc.setQueryData(queryKeys.platformConfig(), cfg);
    },
  });
}
