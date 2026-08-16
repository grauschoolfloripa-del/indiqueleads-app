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

/**
 * Aceite dos termos do anunciante. Era um early-return dentro do painel.
 * JSX movido sem alteração.
 */
export default function OnboardingGate({ ctx }: { ctx: AdvertiserCtx }) {
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
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans">
      <div className="text-center mb-6">
        <div className="bg-blue-100 text-blue-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-slate-900">Portal do Anunciante</h2>
        <p className="text-sm text-slate-500 mt-1">
          Cadastre seus bens imobiliários ou automotivos e utilize nossa rede de divulgadores
          autônomos por performance.
        </p>
      </div>

      <form onSubmit={handleRegisterAdvertiser} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Razão Social / Nome Fantasia
          </label>
          <input
            type="text"
            required
            value={onboardForm.name}
            onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
            placeholder="ex: Imobiliária Prime SP"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tipo de Conta
            </label>
            <select
              value={onboardForm.type}
              onChange={(e) =>
                setOnboardForm({ ...onboardForm, type: e.target.value as "PF" | "PJ" })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PJ">Pessoa Jurídica (Empresa)</option>
              <option value="PF">Pessoa Física (Particular)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              CNPJ / CPF
            </label>
            <input
              type="text"
              required
              value={onboardForm.cnpjOrCpf}
              onChange={(e) => setOnboardForm({ ...onboardForm, cnpjOrCpf: e.target.value })}
              placeholder="00.000.000/0001-00"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Telefone Comercial
            </label>
            <input
              type="text"
              required
              value={onboardForm.phone}
              onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
              placeholder="(11) 3322-1100"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              E-mail Corporativo
            </label>
            <input
              type="email"
              required
              value={onboardForm.email}
              onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
              placeholder="anuncios@empresa.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cidade da Sede / Loja
            </label>
            <input
              type="text"
              required
              value={onboardForm.city}
              onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
              placeholder="ex: Rio de Janeiro"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Estado (UF)
            </label>
            <select
              value={onboardForm.state}
              onChange={(e) => setOnboardForm({ ...onboardForm, state: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Escolha seu Plano Mensal de Acesso
          </label>
          <div className="grid grid-cols-3 gap-2 text-center mt-1">
            {(["starter", "premium", "pro"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setOnboardForm({ ...onboardForm, plan: p })}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between transition-all ${
                  onboardForm.plan === p
                    ? "bg-blue-50 border-blue-500 text-blue-900 shadow"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block">{p}</span>
                <span className="text-xs font-mono font-extrabold mt-1">
                  {p === "starter" ? "R$ 99" : p === "premium" ? "R$ 199" : "R$ 299"}/m
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Advertiser Contract Accept */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contrato de Credenciamento & Adesão do Anunciante
            </label>
            {scrolledTerms && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                ✓ Lido
              </span>
            )}
          </div>

          <div
            onScroll={handleScrollTerms}
            className="h-28 overflow-y-scroll bg-slate-900 text-slate-300 p-3 rounded-xl border border-slate-800 text-[10px] font-mono leading-relaxed select-none"
          >
            <p className="font-bold text-white mb-2 uppercase text-center border-b border-slate-800 pb-1">
              CONTRATO DE ADESÃO DO ANUNCIANTE
            </p>
            <p className="mb-2">
              Ao registrar sua conta corporativa, o Anunciante se compromete a reportar com
              fidelidade o encerramento de qualquer negociação iniciada por indicação recebida na
              plataforma IndiqueLeads.
            </p>
            <p className="mb-2">
              <strong>DA COMISSÃO DEVIDA:</strong> O Anunciante se obriga a efetuar o repasse
              financeiro do comissionamento pactuado por lead/venda em até 7 (sete) dias após o
              recebimento dos valores contratuais do cliente indicado.
            </p>
            <p className="mb-2">
              <strong>DA PENALIDADE DE EXCLUSÃO:</strong> Lojas ou imobiliárias que negarem o
              crédito de atribuição de venda de indicadores ou que sonegarem comprovantes de
              fechamento serão banidas permanentemente, sem reembolso das mensalidades pagas.
            </p>
            <p className="text-blue-300 font-bold text-center mt-2">
              === ROLAR ATÉ O FIM PARA ATIVAR O ACEITE ===
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!scrolledTerms}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
            scrolledTerms
              ? "bg-blue-700 text-white hover:bg-blue-500 active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Credenciar Empresa & Aceitar Contrato
        </button>
      </form>
    </div>
  );
}
