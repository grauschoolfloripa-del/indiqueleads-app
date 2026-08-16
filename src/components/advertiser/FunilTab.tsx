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

/** Aba `funnel` do painel do anunciante. JSX movido sem alteração. */
export default function FunilTab({ ctx }: { ctx: AdvertiserCtx }) {
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
      {pendingArrivals.length > 0 && (
        <div className="space-y-3">
          {pendingArrivals.map((lead) => (
            <div
              key={lead.id}
              className="bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 p-2 rounded-xl mt-0.5">
                  <MapPin className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">O Indicador Chegou na Loja!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    O indicador{" "}
                    <strong className="text-slate-900 font-bold">{lead.indicatorName}</strong>{" "}
                    informou que acabou de chegar para a visita do cliente{" "}
                    <strong className="text-slate-900 font-bold">{lead.clientName}</strong>{" "}
                    (interesse em{" "}
                    <span className="text-blue-800 font-semibold">{lead.productTitle}</span>).
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onUpdateLeadStatus(lead.id, "visita_confirmada", { checkInRequested: false });
                  onAddNotification(
                    `Presença do indicador ${lead.indicatorName} confirmada!`,
                    "success",
                  );
                }}
                className="bg-blue-700 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 self-end md:self-auto active:scale-95 whitespace-nowrap"
              >
                <Check className="w-4 h-4" /> Confirmar Presença do Indicador
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Simulador de Leads do Anunciante:</p>
          <p className="mt-0.5 leading-snug">
            Neste painel você atua como o Lojista/Imobiliária. Você pode mover os leads gerados
            pelos indicadores através das fases de atendimento. Quando marcar como{" "}
            <strong>"Vendido"</strong>, você simulará o envio do contrato de venda para o
            comissionamento cair na carteira do indicador correspondente.
          </p>
        </div>
      </div>

      {/* Kanban board structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
        {Object.entries(funnelStages).map(([stageId, stage]) => (
          <div
            key={stageId}
            className="bg-slate-50 border border-slate-150 rounded-2xl p-3 min-w-[190px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="font-display font-bold text-xs text-slate-800">{stage.label}</span>
              <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                {stage.list.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {stage.list.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setViewingLead(lead)}
                  className="bg-white rounded-xl p-3 border border-slate-200 hover:border-blue-400 cursor-pointer shadow-xs hover:shadow transition-all space-y-2 relative group text-left"
                  title="Clique para ver os detalhes completos do Lead e Indicador"
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[9px] text-blue-700 font-bold block truncate uppercase flex-1">
                      {lead.productTitle}
                    </span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir ↗
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs mt-0.5 flex items-center gap-1">
                      {lead.clientName}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {lead.clientPhone}
                    </p>
                  </div>

                  {/* Social/Referral Channel Badge */}
                  {lead.referralChannel && (
                    <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded w-max">
                      {lead.referralChannel.toLowerCase().includes("instagram")
                        ? "📸"
                        : lead.referralChannel.toLowerCase().includes("whatsapp")
                          ? "💬"
                          : lead.referralChannel.toLowerCase().includes("facebook")
                            ? "👥"
                            : lead.referralChannel.toLowerCase().includes("tiktok")
                              ? "🎵"
                              : "🔗"}{" "}
                      {lead.referralChannel}
                    </div>
                  )}

                  {/* Scheduled Visit Info */}
                  {lead.visitDate && (
                    <div className="bg-amber-50 text-amber-950 border border-amber-200/60 px-2 py-1 rounded-lg text-[9px] font-semibold flex flex-col gap-0.5 font-sans">
                      <span className="flex items-center gap-1 text-amber-800">
                        <Calendar className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <strong>Visita Agendada:</strong>
                      </span>
                      <span className="font-mono text-amber-900 pl-4">
                        {new Date(lead.visitDate).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-1.5 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                    <span className="truncate">Por: {lead.indicatorName.split(" ")[0]}</span>
                    <span className="font-bold text-blue-800">
                      R$ {lead.commissionValue.toLocaleString("pt-BR")}
                    </span>
                  </div>

                  {/* Funnel action controller */}
                  <div
                    className="pt-2 border-t border-slate-100 flex gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {stageId === "lead_recebido" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLeadStatus(lead.id, "contato_feito");
                        }}
                        className="w-full bg-blue-50 hover:bg-blue-700 text-blue-800 hover:text-white py-1 rounded text-[10px] font-semibold transition-all flex items-center justify-center gap-1 border border-blue-100/50"
                      >
                        <span>Fazer Contato</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {stageId === "contato_feito" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSchedulingLead(lead);
                          setVisitDateInput("");
                          setVisitTimeInput("");
                          setVisitNotesInput(lead.notes || "");
                        }}
                        className="w-full bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white py-1 rounded text-[10px] font-semibold transition-all flex items-center justify-center gap-1 border border-amber-200/50"
                      >
                        <span>Agendar Visita</span>
                        <Calendar className="w-3 h-3" />
                      </button>
                    )}
                    {stageId === "visita_agendada" && (
                      <div className="space-y-1.5 w-full">
                        {lead.checkInRequested ? (
                          <>
                            <div className="text-[8px] text-blue-900 font-bold bg-blue-50 p-1.5 rounded border border-blue-200 text-center flex flex-col gap-0.5 animate-pulse">
                              <span>📍 Presença Sinalizada!</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateLeadStatus(lead.id, "visita_confirmada", {
                                  checkInRequested: false,
                                });
                                onAddNotification(
                                  `Presença do indicador ${lead.indicatorName} confirmada!`,
                                  "success",
                                );
                              }}
                              className="w-full bg-blue-700 hover:bg-blue-500 text-white py-1.5 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                              title="Confirmar que o indicador está fisicamente presente na loja"
                            >
                              <span>Confirmar Presença</span>
                              <Check className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-[8px] text-amber-800 font-bold bg-amber-50/60 p-1.5 rounded border border-amber-100 text-center flex flex-col gap-0.5">
                              <span>🕒 Aguardando Chegada</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateLeadStatus(lead.id, "visita_confirmada");
                              }}
                              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 rounded text-[9px] font-bold transition-all flex items-center justify-center gap-1"
                              title="Confirmar visita manualmente (sem aguardar sinalização)"
                            >
                              <span>Confirmar Visita</span>
                              <Check className="w-2.5 h-2.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {stageId === "visita_confirmada" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLeadStatus(lead.id, "proposta");
                        }}
                        className="w-full bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white py-1 rounded text-[10px] font-semibold transition-all flex items-center justify-center gap-1 border border-cyan-100/50"
                      >
                        <span>Registrar Proposta</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {stageId === "proposta" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setClosingSaleLead(lead);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Faturar Venda!</span>
                      </button>
                    )}
                    {stageId === "venda_concluida" && (
                      <div className="text-[9px] text-emerald-800 font-bold bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 text-center w-full flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Comissão Paga
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {stage.list.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-8 italic">
                  Sem leads nesta fase
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
