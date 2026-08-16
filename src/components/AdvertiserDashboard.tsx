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
} from "../types";
import { VERTICALS, VERTICALS_ORDER, getVertical } from "@/lib/verticals";
import SponsorSlot from "./SponsorSlot";
import DynamicAttributesFields from "@/components/product/DynamicAttributesFields";

import { useAdvertiserState, type AdvertiserDashboardProps } from "./advertiser/useAdvertiserState";
import OnboardingGate from "./advertiser/OnboardingGate";
import FunilTab from "./advertiser/FunilTab";
import ProdutosTab from "./advertiser/ProdutosTab";
import FinanceiroTab from "./advertiser/FinanceiroTab";
import AfiliadosTab from "./advertiser/AfiliadosTab";
import FinanciamentosTab from "./advertiser/FinanciamentosTab";

/**
 * Painel do anunciante.
 *
 * Era um arquivo de 5.322 linhas. Agora guarda a moldura, os modais e a
 * composição; cada aba mora em ./advertiser. O estado vem de
 * useAdvertiserState e viaja como `ctx`.
 */
export default function AdvertiserDashboard(props: AdvertiserDashboardProps) {
  const ctx = useAdvertiserState(props);
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

  if (!advertiser.hasAcceptedTerms) {
    return <OnboardingGate ctx={ctx} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-sea-700 via-ink-900 to-ink-950 rounded-3xl p-6 text-white mb-8 shadow-xl border border-white/10 relative overflow-hidden">
        {/* brilho da marca no canto */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(72,168,72,0.28) 0%, transparent 70%)",
          }}
        />
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-500 rounded-xl flex items-center justify-center font-bold text-xl uppercase shadow-lg shadow-brand-500/30 border border-brand-400">
              {advertiser.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">{advertiser.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/40 border border-blue-900 text-blue-300 uppercase tracking-wider">
                  Plano {advertiser.plan}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono flex items-center gap-2 flex-wrap">
                <span>
                  {advertiser.email} • WhatsApp: {advertiser.phone}
                </span>
                {advertiser.city && !isEditingLocation && (
                  <span className="bg-blue-950/80 text-blue-200 px-2 py-0.5 rounded-md border border-blue-900/40 font-semibold flex items-center gap-1">
                    📍 {advertiser.city} ({advertiser.state})
                    <button
                      onClick={() => {
                        setTempCity(advertiser.city || "");
                        setTempState(advertiser.state || "SP");
                        setIsEditingLocation(true);
                      }}
                      className="text-[10px] text-blue-400 hover:text-white font-bold ml-1 hover:underline"
                    >
                      Alterar
                    </button>
                  </span>
                )}
                {!advertiser.city && !isEditingLocation && (
                  <button
                    onClick={() => {
                      setTempCity("");
                      setTempState("SP");
                      setIsEditingLocation(true);
                    }}
                    className="bg-blue-500/20 text-blue-300 hover:text-white px-2 py-0.5 rounded-md border border-blue-500/30 font-semibold text-[11px] hover:underline"
                  >
                    + Adicionar Localização
                  </button>
                )}
              </p>

              {isEditingLocation && (
                <div className="mt-2 flex items-center gap-2 bg-slate-900/95 p-2 rounded-xl border border-blue-950/40 max-w-sm">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={tempCity}
                    onChange={(e) => setTempCity(e.target.value)}
                    className="bg-slate-950 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
                  />
                  <select
                    value={tempState}
                    onChange={(e) => setTempState(e.target.value)}
                    className="bg-slate-950 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-16"
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
                  <button
                    onClick={() => {
                      if (!tempCity.trim()) return;
                      onUpdateAdvertiser({
                        ...advertiser,
                        city: tempCity,
                        state: tempState,
                      });
                      setIsEditingLocation(false);
                      onAddNotification("Localização atualizada!", "success");
                    }}
                    className="bg-blue-700 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md transition-all"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsEditingLocation(false)}
                    className="text-slate-400 hover:text-white text-[10px] font-bold px-1.5"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-blue-700 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Anunciar Novo Bem
            </button>
          </div>
        </div>
      </div>

      {/* Sponsor slot — top of advertiser dashboard */}
      <div className="mb-6">
        <SponsorSlot variant="card" label="Patrocinadores" />
      </div>

      {/* Navigation tabs inside dashboard */}

      <div className="flex overflow-x-auto scrollbar-none border-b border-slate-200 mb-6 font-display font-medium text-sm [-webkit-overflow-scrolling:touch]">
        <button
          onClick={() => setActiveTab("funnel")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "funnel"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Funil de Atendimento e Vendas ({myLeads.length})
        </button>
        <button
          onClick={() => setActiveTab("produtos")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "produtos"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Seus Anúncios ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("financeiro")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "financeiro"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Financeiro / Repasses
        </button>
        <button
          onClick={() => setActiveTab("afiliados")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "afiliados"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Nossos Indicadores
        </button>
        <button
          onClick={() => setActiveTab("financiamentos")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "financiamentos"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Mesa de Financiamentos (
          {simulations?.filter((s) => s.advertiserId === advertiser.id).length || 0})
        </button>
      </div>

      {/* VIEW: FUNNEL KANBAN */}
      {activeTab === "funnel" && <FunilTab ctx={ctx} />}

      {activeTab === "produtos" && <ProdutosTab ctx={ctx} />}

      {activeTab === "financeiro" && <FinanceiroTab ctx={ctx} />}

      {activeTab === "afiliados" && <AfiliadosTab ctx={ctx} />}

      {/* REPASSE: PAGAR COMISSÃO DO INDICADOR */}
      {payingCommission &&
        (() => {
          const c = payingCommission;
          const indicator = indicators.find((i) => i.id === c.indicatorId);
          const sim = c.simulationId
            ? (simulations ?? []).find((s) => s.id === c.simulationId)
            : undefined;
          const lead = c.leadId ? leads.find((l) => l.id === c.leadId) : undefined;
          const origem = sim
            ? "Financiamento"
            : c.kind === "lead"
              ? "Indicação (visita confirmada)"
              : "Venda";

          return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 font-sans shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="text-center">
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Repasse ao indicador
                  </span>
                  <h3 className="font-display font-black text-slate-900 text-2xl mt-3">
                    R$ {c.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {origem} • {lead?.productTitle ?? sim?.productTitle ?? "Anúncio"}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Pagar para
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-1">
                    {indicator?.name ?? "Indicador"}
                  </p>
                  {indicator?.pixKey ? (
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-800 break-all">
                        {indicator.pixKey}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(indicator.pixKey);
                          setPixCopied(true);
                          setTimeout(() => setPixCopied(false), 2000);
                        }}
                        className="shrink-0 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
                      >
                        {pixCopied ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2">
                      Este indicador ainda não cadastrou uma chave PIX. Combine o pagamento com ele
                      antes de registrar a quitação.
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    Chave {indicator?.pixType ?? "—"}. Faça o PIX no seu banco e registre abaixo — a
                    plataforma não movimenta dinheiro, ela mantém o registro auditável.
                  </p>
                </div>

                <label className="block mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Comprovante / ID da transação (opcional)
                  </span>
                  <input
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="ex: E1234567890..."
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Fica guardado como prova em caso de contestação.
                  </span>
                </label>

                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setPayingCommission(null);
                      setPayReference("");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPayCommission(c.id, payReference.trim() || undefined);
                      setPayingCommission(null);
                      setPayReference("");
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Confirmar que paguei
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* CONFIRMAÇÃO: REMOVER ANÚNCIO
          Remoção é irreversível e o histórico de leads/comissões daquele bem
          fica órfão, então nunca removemos com um clique só. */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 font-sans shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 grid place-items-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-slate-900 text-lg">Remover anúncio?</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  <strong className="text-slate-900">{deletingProduct.title}</strong> sai do
                  catálogo e deixa de receber indicações. Esta ação não pode ser desfeita.
                </p>
                {(commissionByProduct.get(deletingProduct.id)?.devido ?? 0) > 0 && (
                  <p className="mt-3 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 leading-relaxed">
                    Atenção: ainda há{" "}
                    <strong>
                      R${" "}
                      {commissionByProduct.get(deletingProduct.id)!.devido.toLocaleString("pt-BR")}
                    </strong>{" "}
                    de comissão a pagar neste anúncio. Remover o anúncio não cancela essa obrigação
                    com o indicador.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(deletingProduct.id);
                  setDeletingProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Remover definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL: ADD PRODUCT */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProductId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {editingProductId ? "Editar Anúncio" : "Novo Anúncio de Catálogo"}
              </span>
              <h2 className="font-display font-bold text-slate-900 text-xl mt-2">
                {editingProductId
                  ? "Atualize os dados do anúncio"
                  : "Escolha a Vertical e Cadastre o Bem"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                O formulário de atributos de dados se adaptará automaticamente.
              </p>
            </div>

            {/* Vertical picker — todas as verticais suportadas */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 mb-6">
              {VERTICALS_ORDER.map((cat) => {
                const v = VERTICALS[cat];
                const active = newProductCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    title={v.label}
                    className={`py-3 px-1 rounded-2xl border text-xs font-bold text-center flex flex-col items-center gap-1.5 transition-all uppercase tracking-wide ${
                      active
                        ? "bg-blue-700 border-blue-700 text-white shadow-lg shadow-blue-100"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xl">{v.emoji}</span>
                    <span className="text-[9px] block leading-tight">{v.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Título do Anúncio
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="ex: Porsche Carrera GTS 2022 ou Mansão Alphaville"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Descrição Comercial
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    placeholder="Destaque os principais diferenciais, opcionais, revisões and condições comerciais."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="ex: 159000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.city}
                      onChange={(e) => setProductForm({ ...productForm, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={productForm.state}
                      onChange={(e) =>
                        setProductForm({ ...productForm, state: e.target.value.toUpperCase() })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC ATTRIBUTES FIELDS — renderizados a partir de src/lib/verticals.ts */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-xs font-bold text-slate-800 uppercase mb-3">
                  Atributos Específicos (
                  {getVertical(newProductCategory)?.shortLabel ?? newProductCategory})
                </span>
                <DynamicAttributesFields
                  category={newProductCategory}
                  values={productForm.attributes ?? {}}
                  onChange={(next) => setProductForm({ ...productForm, attributes: next })}
                  mode="product"
                />
              </div>

              {/* Commission Config Block */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Configuração de Comissionamento
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Insira a porcentagem de repasse sobre o valor de venda.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-600 font-semibold mb-1 uppercase">
                    Digital (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={productForm.commissionDigitalPct}
                    onChange={(e) =>
                      setProductForm({ ...productForm, commissionDigitalPct: e.target.value })
                    }
                    placeholder="1"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-600 font-semibold mb-1 uppercase flex items-center justify-between">
                    <span>Presencial (%)</span>
                    <input
                      type="checkbox"
                      checked={productForm.allowPresencialTier}
                      onChange={(e) =>
                        setProductForm({ ...productForm, allowPresencialTier: e.target.checked })
                      }
                      className="w-3.5 h-3.5 text-blue-700 focus:ring-blue-500 animate-pulse"
                    />
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!productForm.allowPresencialTier}
                    value={productForm.commissionPresencialPct}
                    onChange={(e) =>
                      setProductForm({ ...productForm, commissionPresencialPct: e.target.value })
                    }
                    placeholder="3"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-600 font-semibold mb-1 uppercase">
                    Comissão por Lead Qualificado (R$)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={productForm.commissionLeadValue}
                    onChange={(e) =>
                      setProductForm({ ...productForm, commissionLeadValue: e.target.value })
                    }
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pago ao indicador quando a visita é confirmada por você, mesmo antes de fechar a
                    venda. Some com a comissão de venda se o cliente comprar. Deixe 0 para não pagar
                    por lead.
                  </p>
                </div>
              </div>

              {/* Image selector (Preset OR Direct Upload) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="block text-xs font-semibold text-slate-700 uppercase">
                    Imagens do Anúncio
                  </span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold uppercase">
                    <span className="px-3 py-1 rounded-md bg-white text-slate-800 shadow">
                      {uploadedImages.length > 0
                        ? "Upload do Dispositivo Ativo"
                        : "Preset ou Upload"}
                    </span>
                  </div>
                </div>

                {/* Direct device upload button */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-100/50 transition-all relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="product-file-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      const readers: Promise<string>[] = (Array.from(files) as File[]).map(
                        (file: File) => {
                          return new Promise((resolve) => {
                            const r = new FileReader();
                            r.onloadend = () => resolve(r.result as string);
                            r.readAsDataURL(file);
                          });
                        },
                      );

                      Promise.all(readers).then((results) => {
                        setUploadedImages((prev) => [...prev, ...results]);
                        onAddNotification(
                          `${results.length} imagem(ns) carregada(s) do seu dispositivo!`,
                          "success",
                        );
                      });
                    }}
                  />
                  <div className="space-y-1 pointer-events-none">
                    <div className="text-2xl">📤</div>
                    <span className="block text-xs font-bold text-slate-700">
                      Clique ou arraste para carregar fotos do dispositivo
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Você pode carregar várias imagens (galeria completa)
                    </span>
                  </div>
                </div>

                {/* Show uploaded previews */}
                {uploadedImages.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Galeria Carregada ({uploadedImages.length} fotos)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImages([]);
                          onAddNotification("Galeria de uploads limpa.", "info");
                        }}
                        className="text-[9px] text-red-600 font-bold hover:underline"
                      >
                        Limpar tudo
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden aspect-video border border-slate-200"
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white text-[8px] px-1 rounded font-bold font-mono">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">
                      Ou selecione uma foto de capa rápida das predefinidas:
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      {presetImages[newProductCategory].map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setProductForm({ ...productForm, coverImage: img })}
                          className={`relative rounded-xl overflow-hidden cursor-pointer border-2 aspect-video transition-all ${
                            productForm.coverImage === img
                              ? "border-blue-700 scale-[1.03] shadow-md"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {productForm.coverImage === img && (
                            <div className="absolute top-1.5 right-1.5 bg-blue-700 text-white p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 shadow-blue-100"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                {editingProductId ? "Salvar alterações" : "Publicar Anúncio no Catálogo Geral"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLOSING SALE AUDIT (NF AND CONTRACT RELEASE) */}
      {closingSaleLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => setClosingSaleLead(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="bg-emerald-100 text-emerald-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Faturamento & Quitação de Venda
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Garante a auditoria correta do faturamento da venda.
              </p>
            </div>

            <form onSubmit={handleCloseSaleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-2.5">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">
                    Cliente
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {closingSaleLead.clientName}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">
                    Indicado por
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {closingSaleLead.indicatorName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-150 pt-2.5">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">
                      Comissão Devida
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      R$ {closingSaleLead.commissionValue.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">
                      Atribuição
                    </span>
                    <span className="text-xs font-bold uppercase text-blue-800">
                      {closingSaleLead.commissionType}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Notas Internas de Fechamento
                </label>
                <textarea
                  rows={2}
                  required
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="ex: Venda de R$ 940.000,00 fechada com pagamento à vista via TED. Nota fiscal emitida."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              {/* Upload contract simulation — opcional: não bloqueia o pagamento, fica só
                  como prova em caso de disputa sobre o valor negociado. */}
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-5 text-center transition-colors cursor-pointer bg-slate-50/50">
                <input
                  type="file"
                  id="invoice_file_upload"
                  accept="image/*,.pdf"
                  onChange={() => {
                    setInvoiceUploaded(true);
                    onAddNotification(
                      "Nota Fiscal/Contrato anexado ao relatório de fechamento!",
                      "info",
                    );
                  }}
                  className="hidden"
                />
                <label htmlFor="invoice_file_upload" className="cursor-pointer space-y-1 block">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="block text-xs font-bold text-blue-700">
                    Anexar NF-e ou Contrato de Compra e Venda (opcional)
                  </span>
                  <span className="block text-[9px] text-slate-400">
                    Não é obrigatório para pagar a comissão — serve como prova em caso de
                    contestação do valor negociado.
                  </span>
                </label>
              </div>

              {invoiceUploaded && (
                <p className="text-xs text-emerald-600 font-bold text-center flex items-center justify-center gap-1">
                  ✓ Comprovante anexado!
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-xs transition-all shadow bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirmar Faturamento e Pagar Comissão
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: MESA DE FINANCIAMENTOS (ADVERTISER CAR CREDIT DESK) */}
      {activeTab === "financiamentos" && <FinanciamentosTab ctx={ctx} />}

      {/* MODAL: ADVERTISER CREDIT BANK COMPARISON & CONTRACT APPROVAL */}
      {showSimEditModal && editingSimId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative font-sans shadow-2xl max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowSimEditModal(false);
                setEditingSimId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-6 border-b border-slate-100 pb-4">
              <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Mesa de Crédito • Loja
              </span>
              <h2 className="font-display font-bold text-slate-900 text-xl mt-2">
                Simular e Aprovar Financiamento
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure os bancos credenciados e registre os termos do contrato aprovado de
                financiamento.
              </p>
            </div>

            <form onSubmit={handleSaveSimUpdates} className="space-y-4">
              {/* Step 1: Manage simulated bank responses (shown to indicators) */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  1. Cotações de Bancos Integrados (Editável)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {editBankResponses.map((bank, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 line-clamp-1">
                          {bank.bankName}
                        </span>
                        <span className="bg-green-150 text-blue-900 text-[8px] font-bold px-1 py-0.5 rounded">
                          Banco
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div>
                          <label className="text-[9px] text-slate-400 block font-semibold">
                            Valor Financiado
                          </label>
                          <input
                            type="number"
                            required
                            value={bank.approvedAmount}
                            onChange={(e) => {
                              const copy = [...editBankResponses];
                              copy[index].approvedAmount = parseFloat(e.target.value) || 0;
                              setEditBankResponses(copy);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block font-semibold">
                            Parcela (R$)
                          </label>
                          <input
                            type="number"
                            required
                            value={bank.installmentValue}
                            onChange={(e) => {
                              const copy = [...editBankResponses];
                              copy[index].installmentValue = parseFloat(e.target.value) || 0;
                              setEditBankResponses(copy);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block font-semibold">
                            Taxa de Juros (% a.m.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={bank.interestRate}
                            onChange={(e) => {
                              const copy = [...editBankResponses];
                              copy[index].interestRate = parseFloat(e.target.value) || 0;
                              setEditBankResponses(copy);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Set the officially Approved Contract term */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  2. Condições Gerais do Contrato Aprovado (Oficial)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Instituição de Crédito Escolhida
                    </label>
                    <select
                      value={approvedContractForm.bankName}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          bankName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Banco Itaú Veículos">Banco Itaú Veículos</option>
                      <option value="Banco Bradesco Financiamentos">
                        Banco Bradesco Financiamentos
                      </option>
                      <option value="BV Financeira">BV Financeira</option>
                      <option value="Banco Santander Auto">Banco Santander Auto</option>
                      <option value="Safra Financeira">Safra Financeira</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor de Financiamento Aprovado (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={approvedContractForm.approvedAmount}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          approvedAmount: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor de Entrada Requerida (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={approvedContractForm.downPaymentRequired}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          downPaymentRequired: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Taxa de Juros Cadastrada (% a.m.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={approvedContractForm.interestRate}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          interestRate: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Quantidade de Parcelas
                    </label>
                    <select
                      value={approvedContractForm.installmentsCount}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          installmentsCount: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    >
                      <option value={12}>12x parcelas</option>
                      <option value={24}>24x parcelas</option>
                      <option value={36}>36x parcelas</option>
                      <option value={48}>48x parcelas</option>
                      <option value={60}>60x parcelas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor Unitário da Parcela (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={approvedContractForm.installmentValue}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          installmentValue: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Instruções para o Indicador / Comprador
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={approvedContractForm.additionalNotes}
                    onChange={(e) =>
                      setApprovedContractForm({
                        ...approvedContractForm,
                        additionalNotes: e.target.value,
                      })
                    }
                    placeholder="ex: Crédito liberado! Favor pedir para o comprador carregar a cópia legível da CNH e comprovante de residência diretamente no portal de assinatura eletrônica."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSimEditModal(false);
                    setEditingSimId(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Salvar e Aprovar Crédito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WHATSAPP NOTIFICATION FOR INDICATOR */}
      {whatsAppNotificationData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => setWhatsAppNotificationData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="bg-emerald-100 text-emerald-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Share2 className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Notificar Indicador via WhatsApp
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Uma mensagem informando sobre a conclusão da análise de financiamento e o link do
                painel do indicador foi gerada com sucesso!
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-mono text-slate-700 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {whatsAppNotificationData.text}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setWhatsAppNotificationData(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-colors"
              >
                Depois
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleanedPhone = whatsAppNotificationData.indicatorPhone.replace(/\D/g, "");
                  const phoneWithCountry =
                    cleanedPhone.length === 10 || cleanedPhone.length === 11
                      ? "55" + cleanedPhone
                      : cleanedPhone;
                  const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsAppNotificationData.text)}`;
                  window.open(url, "_blank");
                  setWhatsAppNotificationData(null);
                  onAddNotification("Notificação direcionada ao WhatsApp com sucesso!", "success");
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" /> Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALHES COMPLETOS DO LEAD E INDICADOR */}
      {viewingLead &&
        (() => {
          const associatedInd = indicators.find((ind) => ind.id === viewingLead.indicatorId);
          const relativeProduct = products.find((prod) => prod.id === viewingLead.productId);

          // Define human-readable referral channel details
          let channelDesc = "Acesso vindo de tráfego direto ou link compartilhado.";
          if (viewingLead.referralChannel?.toLowerCase().includes("instagram")) {
            channelDesc =
              "Este lead foi gerado após clicar em um link compartilhado no perfil (Bio) ou Stories do Instagram do indicador.";
          } else if (viewingLead.referralChannel?.toLowerCase().includes("whatsapp")) {
            channelDesc =
              "Este lead foi gerado através de um link de indicação enviado diretamente pelo WhatsApp pelo indicador.";
          } else if (viewingLead.referralChannel?.toLowerCase().includes("facebook")) {
            channelDesc =
              "Este lead veio de uma postagem ou indicação em grupos do Facebook do indicador.";
          } else if (viewingLead.referralChannel?.toLowerCase().includes("linkedin")) {
            channelDesc = "Este lead veio de uma publicação profissional no LinkedIn do indicador.";
          }

          return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative font-sans shadow-2xl my-8">
                <button
                  onClick={() => setViewingLead(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-900 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase font-mono">
                    Dossiê de Lead {viewingLead.id}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase font-mono">
                    {viewingLead.status.replace("_", " ")}
                  </span>
                </div>

                <h2 className="font-display font-bold text-slate-900 text-xl mb-1">
                  Atendimento & Rastreamento de Lead
                </h2>
                <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-4">
                  Consulte todas as informações do lead de venda e do indicador autônomo responsável
                  pelo direcionamento.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* COLUMN 1: CLIENT DETAILS & INTERESTS */}
                  <div className="space-y-4">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/40">
                      <h3 className="text-xs font-bold uppercase text-blue-900 mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Dados Completos do Lead
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                            Nome do Comprador
                          </span>
                          <p className="text-slate-900 font-bold text-sm">
                            {viewingLead.clientName}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                            Telefone de Contato
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-slate-900 font-mono font-semibold">
                              {viewingLead.clientPhone}
                            </span>
                            <a
                              href={`https://api.whatsapp.com/send?phone=55${viewingLead.clientPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Smartphone className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        </div>
                        {viewingLead.clientEmail && (
                          <div>
                            <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                              E-mail
                            </span>
                            <p className="text-slate-900 font-mono font-medium">
                              {viewingLead.clientEmail}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                            Data de Entrada
                          </span>
                          <p className="text-slate-700 font-mono">
                            {new Date(viewingLead.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
                      <h3 className="text-xs font-bold uppercase text-slate-800 mb-3 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        Produto de Interesse
                      </h3>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-950 text-sm">
                          {viewingLead.productTitle}
                        </p>
                        <p className="text-[10px] text-slate-500 capitalize">
                          Categoria: {viewingLead.productCategory}
                        </p>
                        {relativeProduct && (
                          <p className="text-[11px] font-bold text-blue-700 mt-1">
                            Valor do Produto: R$ {relativeProduct.price.toLocaleString("pt-BR")}
                          </p>
                        )}
                        <p className="text-[11px] font-bold text-emerald-600">
                          Comissão do Indicador: R${" "}
                          {viewingLead.commissionValue.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: REFERRAL SOURCE & INDICATOR DOSSIER */}
                  <div className="space-y-4">
                    {/* Indicator info card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
                      <h3 className="text-xs font-bold uppercase text-slate-800 mb-3 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Dossiê do Indicador
                      </h3>

                      {associatedInd ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                              Indicador Responsável
                            </span>
                            <p className="text-slate-900 font-bold text-sm">{associatedInd.name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <span className="text-slate-400 block uppercase text-[8px] font-bold">
                                Liga Atual
                              </span>
                              <p className="text-slate-800 font-bold capitalize text-[11px] flex items-center gap-1">
                                👑 {associatedInd.league}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[8px] font-bold">
                                Pontuação
                              </span>
                              <p className="text-slate-800 font-bold text-[11px] font-mono">
                                ⭐ {associatedInd.score} pts
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-slate-200/60 pt-2 mt-2 space-y-1">
                            <p className="text-[10px] text-slate-600 truncate">
                              <strong>E-mail:</strong> {associatedInd.email}
                            </p>
                            <p className="text-[10px] text-slate-600 flex items-center gap-1">
                              <strong>Celular:</strong> {associatedInd.phone}
                              <a
                                href={`https://api.whatsapp.com/send?phone=55${associatedInd.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline font-bold"
                              >
                                [WhatsApp]
                              </a>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{viewingLead.indicatorName}</p>
                          <p className="text-[10px] text-slate-400">
                            Indicador importado por link direto de simulação.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Channel tracking information */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
                      <h3 className="text-xs font-bold uppercase text-slate-800 mb-2 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        Canal de Origem / Rastreamento
                      </h3>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                            {viewingLead.referralChannel || "Link Direto / WhatsApp"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{channelDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHEDULING & OBSERVATIONS SECTION */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl">
                    <h3 className="text-xs font-bold uppercase text-amber-900 mb-3 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      Agendamento da Visita Física & Observações
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Dia da Visita
                        </label>
                        <input
                          type="date"
                          defaultValue={
                            viewingLead.visitDate ? viewingLead.visitDate.substring(0, 10) : ""
                          }
                          id="details_visit_date"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Horário da Visita
                        </label>
                        <input
                          type="time"
                          defaultValue={
                            viewingLead.visitDate ? viewingLead.visitDate.substring(11, 16) : ""
                          }
                          id="details_visit_time"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-xs">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Observações do Atendimento / Histórico de Contato
                      </label>
                      <textarea
                        rows={2}
                        defaultValue={viewingLead.notes || ""}
                        id="details_visit_notes"
                        placeholder="Adicione observações sobre o contato feito, preferências de horários, ou detalhes sobre o andamento do lead..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const dateVal = (
                            document.getElementById("details_visit_date") as HTMLInputElement
                          )?.value;
                          const timeVal = (
                            document.getElementById("details_visit_time") as HTMLInputElement
                          )?.value;
                          const notesVal = (
                            document.getElementById("details_visit_notes") as HTMLTextAreaElement
                          )?.value;

                          let combinedDate = undefined;
                          if (dateVal && timeVal) {
                            combinedDate = `${dateVal}T${timeVal}:00`;
                          } else if (dateVal) {
                            combinedDate = `${dateVal}T12:00:00`;
                          }

                          // Update lead notes and scheduling
                          onUpdateLeadStatus(
                            viewingLead.id,
                            viewingLead.visitDate || combinedDate
                              ? "visita_agendada"
                              : viewingLead.status,
                            {
                              visitDate: combinedDate,
                              notes: notesVal,
                            },
                          );

                          onAddNotification(
                            "Dados de agendamento e observações salvos com sucesso!",
                            "success",
                          );
                          setViewingLead(null);
                        }}
                        className="bg-blue-700 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow shadow-blue-100 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Salvar Agendamento & Observações
                      </button>
                    </div>
                  </div>
                </div>

                {/* LIVE CHAT INTERFACE FOR ADVERTISER */}
                <div className="mt-6 border-t border-slate-100 pt-5 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                      Chat de Atendimento Exclusivo • Contato Seguro
                    </h3>
                    <div className="bg-slate-900 border border-slate-800 text-blue-400 rounded-full px-2.5 py-0.5 text-[8px] font-mono uppercase font-bold">
                      Monitoramento Antifraude Ativo
                    </div>
                  </div>

                  {/* Info banner about safety */}
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-[10px] text-blue-950 mb-3 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Privacidade & Garantia de Atribuição:</p>
                      <p className="mt-0.5">
                        Para sua segurança e do indicador{" "}
                        <strong>{viewingLead.indicatorName}</strong>, este canal de chat possui
                        filtros em tempo real contra compartilhamento direto de celular, e-mail e
                        links externos. O indicador está em modo observador acompanhando o progresso
                        para garantir a comissão.
                      </p>
                    </div>
                  </div>

                  {/* Chat window body */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col h-[280px]">
                    {/* Message log wrapper */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                      {(() => {
                        const leadMessages = chatMessages.filter(
                          (msg) => msg.leadId === viewingLead.id,
                        );
                        if (leadMessages.length === 0) {
                          return (
                            <p className="text-center text-xs text-slate-400 py-8">
                              Não há histórico de conversas para este lead.
                            </p>
                          );
                        }

                        return leadMessages.map((msg) => {
                          if (msg.senderRole === "system") {
                            return (
                              <div key={msg.id} className="mx-auto max-w-[85%] text-center my-1">
                                <div
                                  className={`p-2 rounded-xl text-[9px] leading-relaxed inline-block font-medium ${
                                    msg.isBlockedBySecurity
                                      ? "bg-red-50 border border-red-200 text-red-700 font-bold"
                                      : "bg-slate-200/60 text-slate-600"
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            );
                          }

                          const isMe = msg.senderRole === "advertiser";
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                                  isMe
                                    ? "bg-slate-900 text-white rounded-br-none"
                                    : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                                }`}
                              >
                                <span className="font-bold text-[9px] block opacity-85 mb-0.5">
                                  {isMe
                                    ? "Você (Anunciante)"
                                    : `Comprador (${viewingLead.clientName})`}
                                </span>

                                {msg.originalText && msg.originalText !== msg.text ? (
                                  <div className="space-y-1">
                                    <p className="line-through text-slate-400 text-[10px] italic">
                                      {msg.originalText}
                                    </p>
                                    <div className="bg-red-50 text-red-800 text-[10px] p-1 rounded border border-red-100 font-medium">
                                      🚫 Contato bloqueado: {msg.text}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="leading-relaxed font-sans">{msg.text}</p>
                                )}

                                <span className="block text-[8px] opacity-60 text-right mt-1">
                                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Chat input footer */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!advertiserChatText.trim()) return;
                        onSendChatMessage(
                          viewingLead.id,
                          advertiser.id,
                          advertiser.name,
                          "advertiser",
                          advertiserChatText.trim(),
                        );
                        setAdvertiserChatText("");
                      }}
                      className="p-2 bg-white border-t border-slate-200 flex gap-1.5"
                    >
                      <input
                        type="text"
                        value={advertiserChatText}
                        onChange={(e) => setAdvertiserChatText(e.target.value)}
                        placeholder="Responda ao cliente com segurança aqui..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-xl transition-all shadow active:scale-95 flex items-center justify-center"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100 text-xs font-semibold">
                  <button
                    onClick={() => setViewingLead(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors"
                  >
                    Fechar Janela
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* MODAL: REGISTRAR E AGENDAR VISITA DO LEAD */}
      {schedulingLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => setSchedulingLead(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="bg-amber-100 text-amber-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Agendamento de Visita Física
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Insira os dados acordados de data, horário e observações.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs mb-4 space-y-1">
              <p className="text-[9px] uppercase font-bold text-slate-400">Cliente Indicado</p>
              <p className="font-bold text-slate-800 text-sm">{schedulingLead.clientName}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {schedulingLead.clientPhone}
              </p>
              <p className="text-[10px] text-blue-700 font-bold block truncate uppercase mt-1">
                Interesse: {schedulingLead.productTitle}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!visitDateInput) {
                  onAddNotification("Por favor, informe o dia da visita!", "info");
                  return;
                }
                const finalTime = visitTimeInput || "12:00";
                const combinedISO = `${visitDateInput}T${finalTime}:00`;

                // Call status updater in App.tsx
                onUpdateLeadStatus(schedulingLead.id, "visita_agendada", {
                  visitDate: combinedISO,
                  notes: visitNotesInput,
                });

                onAddNotification("Visita agendada e registrada com sucesso!", "success");
                setSchedulingLead(null);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Dia da Visita *
                  </label>
                  <input
                    type="date"
                    required
                    value={visitDateInput}
                    onChange={(e) => setVisitDateInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Horário da Visita
                  </label>
                  <input
                    type="time"
                    value={visitTimeInput}
                    onChange={(e) => setVisitTimeInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Observações do Cliente / Notas de Visita
                </label>
                <textarea
                  rows={3}
                  value={visitNotesInput}
                  onChange={(e) => setVisitNotesInput(e.target.value)}
                  placeholder="ex: Cliente virá acompanhado do corretor de plantão. Precisa estacionar no local."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingLead(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Salvar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
