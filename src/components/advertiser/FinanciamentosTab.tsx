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

/** Aba `financiamentos` do painel do anunciante. JSX movido sem alteração. */
export default function FinanciamentosTab({ ctx }: { ctx: AdvertiserCtx }) {
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
    <div className="space-y-6 animate-fadeIn">
      {/* Intro header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-500" />
            <h3 className="font-display font-bold text-lg">Mesa de Análise de Crédito Veicular</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Gerencie as fichas cadastrais enviadas pelos seus Indicadores Parceiros. Consulte as
            mesas de crédito dos bancos integrados, simule as parcelas e retorne as opções
            aprovadas. O indicador poderá intermediar diretamente com o cliente para a assinatura
            digital do contrato!
          </p>
        </div>
        <span className="bg-blue-950/60 border border-blue-900 text-blue-400 text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
          Mesa Ativa • {simulations?.filter((s) => s.advertiserId === advertiser.id).length || 0}{" "}
          Fichas
        </span>
      </div>

      {/* Quick status counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">
            Aguardando Loja
          </span>
          <span className="block font-display font-bold text-lg text-amber-500 mt-1">
            {simulations?.filter((s) => s.advertiserId === advertiser.id && s.status === "pendente")
              .length || 0}
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Em Análise</span>
          <span className="block font-display font-bold text-lg text-indigo-500 mt-1">
            {simulations?.filter(
              (s) => s.advertiserId === advertiser.id && s.status === "analise_bancos",
            ).length || 0}
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Aprovadas</span>
          <span className="block font-display font-bold text-lg text-emerald-500 mt-1">
            {simulations?.filter((s) => s.advertiserId === advertiser.id && s.status === "aprovado")
              .length || 0}
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">
            Contratos Assinados
          </span>
          <span className="block font-display font-bold text-lg text-slate-900 mt-1">
            {simulations?.filter(
              (s) => s.advertiserId === advertiser.id && s.status === "concluido",
            ).length || 0}
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center col-span-2 md:col-span-1">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">
            Crédito Recusado
          </span>
          <span className="block font-display font-bold text-lg text-red-500 mt-1">
            {simulations?.filter(
              (s) => s.advertiserId === advertiser.id && s.status === "rejeitado",
            ).length || 0}
          </span>
        </div>
      </div>

      {/* Table list of simulations */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-display font-bold text-slate-900 text-sm">
            Fichas de Crédito Recebidas
          </h4>
          <p className="text-[11px] text-slate-500">
            Ordene por data para priorizar o atendimento rápido
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {simulations
            ?.filter((s) => s.advertiserId === advertiser.id)
            .map((sim) => (
              <div key={sim.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Vehicle & Indicator information */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-9 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={
                            sim.productImage ||
                            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=300&q=80"
                          }
                          alt={sim.productTitle}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 leading-tight">
                          {sim.productTitle}
                        </h5>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Valor: R$ {sim.productPrice.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/50 text-[10px] text-slate-600 space-y-0.5">
                      <p className="font-semibold text-slate-700">Enviado por:</p>
                      <p className="font-bold text-blue-800 line-clamp-1">{sim.indicatorName}</p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        ID: {sim.id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Cadastral Data */}
                  <div className="lg:col-span-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] leading-relaxed text-slate-700 grid grid-cols-2 gap-x-3 gap-y-1">
                    <div className="col-span-2 pb-1 border-b border-slate-200/50 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">
                        Cadastro do Comprador
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Nome:</span>
                      <span className="font-bold text-slate-900 line-clamp-1">
                        {sim.clientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">CPF do Cliente:</span>
                      <span className="font-bold text-slate-900 font-mono">{sim.clientCpf}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">WhatsApp:</span>
                      <span className="font-bold text-slate-900">{sim.clientPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Data Nasc:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {sim.clientBirthDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Renda Mensal:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        R$ {sim.clientIncome.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Entrada Proposta:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        R$ {sim.downPayment.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* Banking Response & Contract summaries */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Status atual:
                      </span>
                      {sim.status === "pendente" && (
                        <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Pendente
                        </span>
                      )}
                      {sim.status === "analise_bancos" && (
                        <span className="bg-indigo-100 text-indigo-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Em Análise
                        </span>
                      )}
                      {sim.status === "aprovado" && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Crédito Aprovado
                        </span>
                      )}
                      {sim.status === "rejeitado" && (
                        <span className="bg-red-100 text-red-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Recusado
                        </span>
                      )}
                      {sim.status === "concluido" && (
                        <span className="bg-slate-950 text-slate-100 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Assinado
                        </span>
                      )}
                    </div>

                    {/* Display final contract if approved */}
                    {sim.approvedContract ? (
                      <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-800 space-y-1 text-[10px] leading-relaxed">
                        <p className="font-bold text-[9px] text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />{" "}
                          {sim.approvedContract.bankName}
                        </p>
                        <p className="font-mono text-slate-300">
                          Termo:{" "}
                          <strong className="font-bold text-white">
                            {sim.approvedContract.installmentsCount}x R${" "}
                            {sim.approvedContract.installmentValue.toLocaleString("pt-BR")}
                          </strong>
                        </p>
                        <p className="font-mono text-slate-400">
                          Taxa:{" "}
                          <span className="font-bold text-blue-400">
                            {sim.approvedContract.interestRate}% a.m.
                          </span>{" "}
                          • Financiado: R${" "}
                          {sim.approvedContract.approvedAmount.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        {sim.status === "pendente" && "Aguardando simulação multi-banco."}
                        {sim.status === "analise_bancos" && "Simulação em andamento com bancos."}
                        {sim.status === "rejeitado" && "Nenhuma cotação aprovada para este perfil."}
                      </p>
                    )}
                  </div>

                  {/* Interactive back-office controls */}
                  <div className="lg:col-span-2 flex flex-col gap-2 self-center w-full">
                    {sim.status === "pendente" && (
                      <button
                        onClick={() => handleInitiateBankAnalysis(sim.id)}
                        className="w-full bg-blue-700 hover:bg-blue-500 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin-slow" />
                        Iniciar Simulação
                      </button>
                    )}

                    {sim.status === "analise_bancos" && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(sim)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Aprovar Crédito
                        </button>
                        <button
                          onClick={() => handleUpdateSimStatusOnly(sim.id, "rejeitado")}
                          className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-[10px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <Ban className="w-3 h-3" />
                          Recusar Crédito
                        </button>
                      </>
                    )}

                    {sim.status === "aprovado" && (
                      <button
                        onClick={() => handleUpdateSimStatusOnly(sim.id, "concluido")}
                        className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Registrar Assinatura
                      </button>
                    )}

                    {sim.status === "rejeitado" && (
                      <span className="text-center text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 p-2 rounded-xl">
                        Ficha Recusada
                      </span>
                    )}

                    {sim.status === "concluido" && (
                      <span className="text-center text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-xl flex items-center justify-center gap-1">
                        ✓ Venda Concluída
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {simulations?.filter((s) => s.advertiserId === advertiser.id).length === 0 && (
            <div className="text-center py-20 bg-white">
              <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h5 className="font-bold text-slate-800 text-sm">Nenhuma ficha de crédito enviada</h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Você ainda não recebeu propostas de financiamento dos indicadores cadastrados para
                os seus anúncios de veículos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
