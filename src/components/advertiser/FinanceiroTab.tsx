import React, { useState, FormEvent, UIEvent } from "react";
import { useTabParam } from "@/hooks/useTabParam";
import {
  Building2,
  PlusCircle,
  LayoutDashboard,
  Landmark,
  Users,
  Upload,
  Check,
  AlertCircle,
  MapPin,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  ExternalLink,
  RefreshCw,
  FileText,
  Calendar,
  Sparkles,
  Percent,
  FileSpreadsheet,
  Send,
  TrendingUp,
  Clock,
  Ban,
  Smartphone,
  Share2,
  MessageSquare,
  Database,
  Layers,
  Settings2,
  Activity,
  Trash2,
  Pencil,
  HelpCircle,
  FileUp,
  ArrowRightLeft,
  Link,
  Code,
} from "lucide-react";
import {
  Product,
  Advertiser,
  Lead,
  Category,
  Indicator,
  ProductStatus,
  FinancingSimulation,
  FinancingStatus,
  BankSimulationResponse,
  ApprovedContract,
  ChatMessage,
  Commission,
} from "../../types";
import { VERTICALS, VERTICALS_ORDER, getVertical } from "@/lib/verticals";
import SponsorSlot from "../SponsorSlot";
import DynamicAttributesFields from "@/components/product/DynamicAttributesFields";

import type { AdvertiserCtx } from "./useAdvertiserState";

/** Aba `financeiro` do painel do anunciante. JSX movido sem alteração. */
export default function FinanceiroTab({ ctx }: { ctx: AdvertiserCtx }) {
  const {
    apiToken,
    activeIntegrationDetail,
    activeTab,
    advertiser,
    advertiserChatText,
    approvedContractForm,
    bulkCategory,
    bulkHeaders,
    bulkMapping,
    bulkParsedRows,
    bulkRawText,
    bulkSelectedFileName,
    bulkStep,
    chatMessages,
    closingSaleLead,
    commissionByProduct,
    commissions,
    deletingProduct,
    editBankResponses,
    editingProductId,
    editingSimId,
    funnelStages,
    handleAddProductSubmit,
    handleApplyMapping,
    handleBulkFileChange,
    handleCategoryChange,
    handleCloseSaleSubmit,
    handleImportBulkProducts,
    handleInitiateBankAnalysis,
    handleOpenEditModal,
    handleRegisterAdvertiser,
    handleSaveSimUpdates,
    handleScrollTerms,
    handleTriggerSync,
    handleUpdateSimStatusOnly,
    indicators,
    integrations,
    invoiceUploaded,
    isAddingProduct,
    isEditingLocation,
    isSyncing,
    leads,
    myLeads,
    myProducts,
    newProductCategory,
    onAddNotification,
    onAddProduct,
    onAttachLeadContract,
    onDeleteProduct,
    onPayCommission,
    onSendChatMessage,
    onUpdateAdvertiser,
    onUpdateLeadStatus,
    onUpdateProduct,
    onUpdateProductStatus,
    onUpdateSimulationStatus,
    onboardForm,
    parseBulkText,
    payReference,
    payingCommission,
    pendingArrivals,
    pixCopied,
    presetImages,
    productForm,
    productSubTab,
    products,
    saleNotes,
    schedulingLead,
    scrolledTerms,
    setActiveIntegrationDetail,
    setActiveTab,
    setAdvertiserChatText,
    setApprovedContractForm,
    setBulkCategory,
    setBulkHeaders,
    setBulkMapping,
    setBulkParsedRows,
    setBulkRawText,
    setBulkSelectedFileName,
    setBulkStep,
    setClosingSaleLead,
    setDeletingProduct,
    setEditBankResponses,
    setEditingProductId,
    setEditingSimId,
    setIntegrations,
    setInvoiceUploaded,
    setIsAddingProduct,
    setIsEditingLocation,
    setIsSyncing,
    setNewProductCategory,
    setOnboardForm,
    setPayReference,
    setPayingCommission,
    setPixCopied,
    setProductForm,
    setProductSubTab,
    setSaleNotes,
    setSchedulingLead,
    setScrolledTerms,
    setShowSimEditModal,
    setTempCity,
    setTempState,
    setUploadedImages,
    setViewingLead,
    setVisitDateInput,
    setVisitNotesInput,
    setVisitTimeInput,
    setWhatsAppNotificationData,
    showSimEditModal,
    simulations,
    startEditingProduct,
    tempCity,
    tempState,
    triggerIndicatorNotification,
    uploadedImages,
    viewingLead,
    visitDateInput,
    visitNotesInput,
    visitTimeInput,
    whatsAppNotificationData,
  } = ctx;

  return (
    <div className="space-y-6">
      {/* Resumo do que é devido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(() => {
          const aPagar = commissions
            .filter((c) => c.status === "available")
            .reduce((a, c) => a + c.amount, 0);
          const aguardando = commissions
            .filter((c) => c.status === "pending")
            .reduce((a, c) => a + c.amount, 0);
          const pago = commissions
            .filter((c) => c.status === "paid")
            .reduce((a, c) => a + c.amount, 0);
          const cards = [
            {
              label: "Liberado para pagamento",
              value: aPagar,
              hint: "venda/visita já confirmada por você",
              tone: "bg-amber-50 border-amber-200 text-amber-800",
            },
            {
              label: "Aguardando confirmação",
              value: aguardando,
              hint: "só vira devido quando você confirmar",
              tone: "bg-slate-50 border-slate-200 text-slate-700",
            },
            {
              label: "Já pago",
              value: pago,
              hint: "histórico auditável de repasses",
              tone: "bg-emerald-50 border-emerald-200 text-emerald-800",
            },
          ];
          return cards.map((c) => (
            <div key={c.label} className={`rounded-2xl border p-4 ${c.tone}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">{c.label}</span>
              <span className="block font-mono font-black text-2xl mt-1">
                R$ {c.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[10px] opacity-70 mt-0.5">{c.hint}</span>
            </div>
          ));
        })()}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">
            Repasses aos Indicadores
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cada linha é um evento de comissão do ledger — indicação, venda ou financiamento. O PIX
            é feito por você, fora da plataforma; aqui você registra a quitação e o indicador é
            avisado na hora.
          </p>
        </div>

        <div className="space-y-3">
          {commissions.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-10">
              Nenhuma comissão gerada ainda. Elas aparecem quando você confirma uma visita (comissão
              de indicação), fecha uma venda ou conclui um financiamento.
            </p>
          )}

          {commissions.map((c) => {
            const lead = c.leadId ? leads.find((l) => l.id === c.leadId) : undefined;
            const sim = c.simulationId
              ? (simulations ?? []).find((s) => s.id === c.simulationId)
              : undefined;
            const indicator = indicators.find((i) => i.id === c.indicatorId);
            const produto = lead?.productTitle ?? sim?.productTitle ?? "Anúncio";
            const cliente = lead?.clientName ?? sim?.clientName ?? "—";
            const origem = sim
              ? "Financiamento"
              : c.kind === "lead"
                ? "Indicação (visita confirmada)"
                : "Venda";

            const tone =
              c.status === "paid"
                ? { bg: "bg-emerald-50 border-emerald-100", icon: "✓", label: "Pago" }
                : c.status === "available"
                  ? { bg: "bg-amber-50 border-amber-200", icon: "R$", label: "A pagar" }
                  : { bg: "bg-slate-50 border-slate-100", icon: "🕒", label: "Pendente" };

            return (
              <div
                key={c.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-2xl p-4 ${tone.bg}`}
              >
                <div className="flex gap-3 min-w-0">
                  <div className="bg-white/70 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-700 shrink-0 text-xs">
                    {tone.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-950 truncate">{produto}</h4>
                    <p className="text-xs text-slate-600 truncate">
                      {origem} • Cliente: {cliente}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Indicador: <strong>{indicator?.name ?? "—"}</strong>
                      {indicator?.pixKey && (
                        <>
                          {" "}
                          • PIX ({indicator.pixType}):{" "}
                          <span className="font-mono">{indicator.pixKey}</span>
                        </>
                      )}
                    </p>
                    {c.status === "paid" && c.paidAt && (
                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        Pago em {new Date(c.paidAt).toLocaleDateString("pt-BR")}
                        {c.paymentReference ? ` • ref: ${c.paymentReference}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <span className="text-base font-bold text-slate-900 block">
                    R$ {c.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    {tone.label}
                  </span>
                  {c.status === "available" && (
                    <button
                      onClick={() => setPayingCommission(c)}
                      className="mt-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Pagar via PIX
                    </button>
                  )}
                  {c.status === "pending" && (
                    <span className="mt-1 block text-[9px] text-slate-400 max-w-[10rem]">
                      confirme a visita/venda para liberar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
