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

/** Aba `afiliados` do painel do anunciante. JSX movido sem alteração. */
export default function AfiliadosTab({ ctx }: { ctx: AdvertiserCtx }) {
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
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
      <h3 className="font-display font-bold text-slate-800 text-base">
        Rede de Indicadores Ativos
      </h3>
      <p className="text-xs text-slate-500">
        Métricas de performance dos promotores que estão divulgando sua loja.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indicators
          .filter((i) => i.name)
          .map((ind) => (
            <div
              key={ind.id}
              className="border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all space-y-3 bg-slate-50/50"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 font-bold rounded-lg flex items-center justify-center text-xs">
                    {ind.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{ind.name}</h4>
                    <span className="text-[9px] text-slate-400 block font-mono">{ind.email}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                    ind.league === "ouro"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {ind.league}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono border-t border-slate-100 pt-2">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                    Cliques Gerados
                  </span>
                  <span className="font-bold text-slate-800 text-xs">{ind.clicks}</span>
                </div>
                <div className="border-l border-slate-200">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                    Reputação Score
                  </span>
                  <span className="font-bold text-emerald-600 text-xs">{ind.score}/100</span>
                </div>
              </div>

              <div className="pt-2 flex gap-1">
                <button
                  onClick={() => {
                    onAddNotification(`Bônus especial enviado para ${ind.name}!`, "success");
                  }}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-slate-100"
                >
                  Enviar Bônus
                </button>
                <button
                  onClick={() => {
                    onAddNotification(
                      `Indicador ${ind.name} foi notificado para revisão de dados.`,
                      "info",
                    );
                  }}
                  className="flex-1 bg-white border border-slate-200 text-red-600 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-red-50"
                >
                  Auditar Indicador
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
