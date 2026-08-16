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

/** Aba `produtos` do painel do anunciante. JSX movido sem alteração. */
export default function ProdutosTab({ ctx }: { ctx: AdvertiserCtx }) {
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
    <div className="space-y-6 animate-fade-in">
      {/* Sub Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start">
          <button
            type="button"
            onClick={() => setProductSubTab("lista")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              productSubTab === "lista"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📦</span> Meus Bens ({myProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setProductSubTab("carga")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              productSubTab === "carga"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚡</span> Carga em Lote (Excel/CSV)
          </button>
          <button
            type="button"
            onClick={() => setProductSubTab("integracoes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              productSubTab === "integracoes"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🔌</span> Integrações & APIs
          </button>
        </div>

        {productSubTab === "lista" && (
          <button
            type="button"
            onClick={() => setIsAddingProduct(true)}
            className="bg-blue-700 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 self-end sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Cadastrar Bem Manualmente
          </button>
        )}
      </div>

      {/* SUB-TAB: LISTA DE PRODUTOS */}
      {productSubTab === "lista" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              💡 <strong>IndiqueLeads Dica:</strong> Bens com fotos de alta qualidade e descrições
              detalhadas recebem até 4x mais indicações da nossa rede. Defina comissões atraentes
              para incentivar os melhores indicadores.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[9px] tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">Anúncio</th>
                    <th className="py-3.5 px-4">Localização</th>
                    <th className="py-3.5 px-4">Preço do Bem</th>
                    <th className="py-3.5 px-4">Comissão Digital</th>
                    <th className="py-3.5 px-4">Comissão Presencial</th>
                    <th className="py-3.5 px-4">Comissão ao Indicador</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                  {myProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <img
                          src={p.coverImage}
                          alt=""
                          className="w-12 h-10 object-cover rounded-xl border border-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">
                            {p.category}
                          </span>
                          <span className="block font-bold text-slate-900 leading-snug mt-1">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600">
                        {p.location.city} - {p.location.state}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        R$ {p.price.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-blue-700">
                        R$ {p.commissionDigitalValue?.toLocaleString("pt-BR")} (
                        {p.commissionDigitalPct}%)
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-emerald-600">
                        {p.allowPresencialTier ? (
                          <>
                            R$ {p.commissionPresencialValue?.toLocaleString("pt-BR")} (
                            {p.commissionPresencialPct}%)
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Desativada</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {(() => {
                          const c = commissionByProduct.get(p.id);
                          if (!c || c.total <= 0) {
                            return <span className="text-slate-300 text-[11px]">—</span>;
                          }
                          return (
                            <div className="leading-tight">
                              <span className="block font-mono font-bold text-slate-900">
                                R$ {c.total.toLocaleString("pt-BR")}
                              </span>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wide ${
                                  c.devido > 0 ? "text-amber-600" : "text-emerald-600"
                                }`}
                              >
                                {c.devido > 0
                                  ? `R$ ${c.devido.toLocaleString("pt-BR")} a pagar`
                                  : "quitada"}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                            p.status === "ativo"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : p.status === "reservado"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : p.status === "vendido"
                                  ? "bg-brand-500/10 text-brand-600 border border-brand-500/20"
                                  : "bg-slate-50 text-slate-600 border border-slate-100"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.status === "vendido" && (
                          <span className="mt-1 block text-[9px] font-semibold text-slate-400">
                            aguardando remoção
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={p.status}
                            onChange={(e) =>
                              onUpdateProductStatus(p.id, e.target.value as ProductStatus)
                            }
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="ativo">Ativar</option>
                            <option value="reservado">Reservar</option>
                            <option value="pausado">Pausar</option>
                            <option value="vendido">Vendido</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => startEditingProduct(p)}
                            title="Editar anúncio"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            title="Remover anúncio"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {myProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-12 text-slate-400 italic font-medium bg-slate-50/20"
                      >
                        <div className="space-y-2">
                          <span className="text-3xl block">📦</span>
                          <p className="text-xs">
                            Nenhum bem cadastrado no seu catálogo de indicações.
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Cadastre um bem manualmente ou utilize a Carga em Lote para começar!
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CARGA EM LOTE */}
      {productSubTab === "carga" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm">
                  Carga em Lote de Anúncios
                </h4>
                <p className="text-xs text-slate-500">
                  Importe dezenas de anúncios de uma só vez utilizando arquivos CSV/Excel ou colando
                  diretamente as células de sua planilha.
                </p>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center justify-between max-w-lg mx-auto bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-center text-[10px] font-bold text-slate-400">
              <div
                className={`flex-1 py-1.5 rounded-lg ${bulkStep === "upload" ? "bg-blue-700 text-white" : ""}`}
              >
                1. Arquivo ou Ctrl+V
              </div>
              <div className="px-2 text-slate-300">➔</div>
              <div
                className={`flex-1 py-1.5 rounded-lg ${bulkStep === "mapping" ? "bg-blue-700 text-white" : ""}`}
              >
                2. Mapeamento
              </div>
              <div className="px-2 text-slate-300">➔</div>
              <div
                className={`flex-1 py-1.5 rounded-lg ${bulkStep === "validation" ? "bg-blue-700 text-white" : ""}`}
              >
                3. Validação e Carga
              </div>
            </div>

            {/* STEP 1: UPLOAD / PASTING */}
            {bulkStep === "upload" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      1. Selecione a Vertical de Destino
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(["imovel", "carro", "moto", "barco", "jetski"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setBulkCategory(cat)}
                          className={`py-2 px-1 rounded-xl border text-[10px] font-bold text-center flex flex-col items-center gap-1 transition-all uppercase ${
                            bulkCategory === cat
                              ? "bg-blue-700 border-blue-700 text-white shadow-md"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-lg">
                            {cat === "imovel" && "🏠"}
                            {cat === "carro" && "🚗"}
                            {cat === "moto" && "🏍️"}
                            {cat === "barco" && "🛥️"}
                            {cat === "jetski" && "🎿"}
                          </span>
                          <span className="text-[8px] truncate block w-full text-center">
                            {cat}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-700 uppercase">
                      2. Baixar Modelo de Carga (CSV)
                    </span>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📥</span>
                        <div className="text-left">
                          <span className="block text-xs font-bold text-slate-800">
                            Modelo {bulkCategory.toUpperCase()}
                          </span>
                          <span className="block text-[9px] text-slate-500">
                            Colunas padrão para importação
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const csvHeaders = "Título,Preço,Descrição,Cidade,Estado,ImagemCapa\n";
                          const csvRows =
                            bulkCategory === "imovel"
                              ? "Apartamento Duplex Jardins,2450000,Excelente imóvel de luxo com vista 360,São Paulo,SP,https://...\n"
                              : "Porsche Carrera GTS 2022,890000,Unico dono IPVA pago,Campinas,SP,https://...\n";
                          const blob = new Blob([csvHeaders + csvRows], {
                            type: "text/csv;charset=utf-8;",
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.setAttribute("href", url);
                          link.setAttribute("download", `modelo_importacao_${bulkCategory}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          onAddNotification(
                            "Modelo de planilha CSV baixado com sucesso!",
                            "success",
                          );
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <FileSpreadsheet className="w-3 h-3" /> Baixar CSV
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Drag and Drop */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Opção A: Carregar Arquivo de Dispositivo
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-slate-100/40 rounded-2xl p-6 text-center transition-all relative">
                      <input
                        type="file"
                        accept=".csv, .txt, .tsv"
                        onChange={handleBulkFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-2 pointer-events-none">
                        <span className="text-3xl block">📄</span>
                        <span className="block text-xs font-bold text-slate-700">
                          Arraste seu arquivo CSV ou clique para selecionar
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Suporta delimitadores como vírgula (,), ponto e vírgula (;) ou Tabulações
                        </span>
                        {bulkSelectedFileName && (
                          <span className="inline-block mt-2 bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            Selecionado: {bulkSelectedFileName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Copy-Paste area */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Opção B: Copiar e Colar de sua Planilha (Excel / Sheets)
                    </label>
                    <div className="space-y-1">
                      <textarea
                        rows={4}
                        value={bulkRawText}
                        onChange={(e) => setBulkRawText(e.target.value)}
                        placeholder="Cole as colunas de sua planilha aqui. Exemplo:&#10;Título	Preço	Descrição	Cidade	Estado&#10;Apartamento de Luxo	1200000	Maravilhoso loft decorado	São Paulo	SP"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">
                          Cole a linha de cabeçalhos e as linhas de dados juntas.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const sample =
                              "Título\tPreço\tDescrição\tCidade\tEstado\tImagemCapa\n" +
                              `Lançamento Premium ${bulkCategory === "imovel" ? "Itaim Bibi" : "Esportivo"}\t${bulkCategory === "imovel" ? "1450000" : "390000"}\tExcelente oportunidade de investimento comercial com alta rentabilidade garantida.\tSão Paulo\tSP\thttps://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80\n` +
                              `Opção Premium ${bulkCategory === "imovel" ? "Brooklin" : "Hatch"}\t${bulkCategory === "imovel" ? "920000" : "150000"}\tBelo design, moderno, reformado, próximo do metrô e comércios locais.\tSão Paulo\tSP\thttps://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80`;
                            setBulkRawText(sample);
                            onAddNotification(
                              "Modelo colado na área de texto! Clique em Processar.",
                              "info",
                            );
                          }}
                          className="text-[10px] text-blue-700 font-bold hover:underline"
                        >
                          Preencher Exemplo Rápido
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => parseBulkText(bulkRawText)}
                    disabled={!bulkRawText.trim()}
                    className={`font-bold text-xs py-2.5 px-5 rounded-xl shadow transition-all flex items-center gap-1 ${
                      bulkRawText.trim()
                        ? "bg-blue-700 hover:bg-blue-500 text-white cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Processar e Mapear Colunas <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: COLUMN MAPPING */}
            {bulkStep === "mapping" && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                  <span className="text-xl">🗺️</span>
                  <div className="text-xs text-amber-800 leading-relaxed">
                    <strong>Mapeamento Inteligente:</strong> Identificamos os cabeçalhos de sua
                    tabela. Associe cada campo do IndiqueLeads com a respectiva coluna encontrada no
                    seu arquivo ou texto colado.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  {Object.keys(bulkMapping).map((field) => (
                    <div
                      key={field}
                      className="space-y-1 bg-white p-3 rounded-xl border border-slate-200"
                    >
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                          {field === "title" && "Título do Bem 🔴"}
                          {field === "price" && "Preço de Venda (R$) 🔴"}
                          {field === "description" && "Descrição Comercial"}
                          {field === "city" && "Cidade"}
                          {field === "state" && "Estado / UF"}
                          {field === "coverImage" && "URL da Foto de Capa"}
                        </label>
                        {(field === "title" || field === "price") && (
                          <span className="text-[9px] text-red-500 font-bold">Obrigatório</span>
                        )}
                      </div>
                      <select
                        value={bulkMapping[field]}
                        onChange={(e) =>
                          setBulkMapping({ ...bulkMapping, [field]: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                      >
                        <option value="">-- Ignorar ou Não Mapeado --</option>
                        {bulkHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBulkStep("upload")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl transition-all"
                  >
                    Voltar para Upload
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyMapping}
                    className="bg-blue-700 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    Validar Dados <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: VALIDATION AND BULK IMPORT */}
            {bulkStep === "validation" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Preview de Dados Mapeados e Validação ({bulkParsedRows.length} itens)
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    Total detectado: {bulkParsedRows.length} linhas
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
                  {/* overflow-x-auto junto: no celular esta prévia tem mais
                          colunas que a largura da tela. */}
                  <div className="max-h-[300px] overflow-x-auto overflow-y-auto">
                    <table className="w-full min-w-[420px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                          <th className="py-2.5 px-4">#</th>
                          <th className="py-2.5 px-4">Título do Bem</th>
                          <th className="py-2.5 px-4">Preço Mapeado</th>
                          <th className="py-2.5 px-4">Localização</th>
                          <th className="py-2.5 px-4">Foto / Imagem</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {bulkParsedRows.map((row, idx) => {
                          const title = row.data[bulkMapping.title] || "";
                          const priceRaw = row.data[bulkMapping.price] || "";
                          const city = bulkMapping.city
                            ? row.data[bulkMapping.city] || "São Paulo"
                            : "São Paulo";
                          const state = bulkMapping.state
                            ? row.data[bulkMapping.state] || "SP"
                            : "SP";
                          const coverImage = bulkMapping.coverImage
                            ? row.data[bulkMapping.coverImage] || ""
                            : "";

                          const cleanPrice =
                            parseFloat(priceRaw.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
                          const isValid = title && cleanPrice > 0;

                          return (
                            <tr
                              key={row.id}
                              className={
                                isValid ? "hover:bg-slate-50/50" : "bg-red-50/30 hover:bg-red-50/50"
                              }
                            >
                              <td className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-800 block truncate max-w-[200px]">
                                  {title || <span className="text-red-500 italic">Vazio!</span>}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold">
                                {cleanPrice > 0 ? (
                                  `R$ ${cleanPrice.toLocaleString("pt-BR")}`
                                ) : (
                                  <span className="text-red-500">
                                    Inválido ({priceRaw || "Nulo"})
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-500">
                                {city} - {state}
                              </td>
                              <td className="py-3 px-4">
                                {coverImage ? (
                                  <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[150px]">
                                    <span className="text-emerald-600">✓</span>
                                    <span className="text-[10px] truncate">{coverImage}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">
                                    Imagem Fallback
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {isValid ? (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                                    Válido
                                  </span>
                                ) : (
                                  <span className="bg-red-50 text-red-700 border border-red-100 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                                    Rejeitar
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBulkStep("mapping")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl transition-all"
                  >
                    Ajustar Mapeamento
                  </button>
                  <button
                    type="button"
                    onClick={handleImportBulkProducts}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    Confirmar Importação de (
                    {
                      bulkParsedRows.filter(
                        (r) =>
                          r.data[bulkMapping.title] &&
                          (parseFloat(
                            r.data[bulkMapping.price].replace(/[^\d.,]/g, "").replace(",", "."),
                          ) || 0) > 0,
                      ).length
                    }
                    ) Itens <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: INTEGRACOES (CRMs & ERPs HUB) */}
      {productSubTab === "integracoes" && (
        <div className="space-y-6">
          {!activeIntegrationDetail ? (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                <h4 className="font-display font-bold text-slate-900 text-sm">
                  Central de Integrações e APIs
                </h4>
                <p className="text-xs text-slate-500">
                  Conecte o IndiqueLeads diretamente com os sistemas que você já utiliza no seu
                  negócio. Sincronize seu catálogo automaticamente e elimine o trabalho manual de
                  cadastro.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Imóveis: Vista CRM */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">Vista</span>
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Imobiliário
                      </span>
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">
                        Vista CRM
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        Sincronize sua carteira de imóveis do Vista CRM diretamente para o
                        IndiqueLeads, atualizando preços e fotos diariamente.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${integrations.vistaCrm.active ? "bg-emerald-500" : "bg-slate-300"}`}
                      ></span>
                      {integrations.vistaCrm.active ? "Ativo" : "Não configurado"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIntegrationDetail("vistaCrm")}
                      className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                {/* Imóveis: Kenlo / inGaia */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">Kenlo</span>
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Imobiliário
                      </span>
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">
                        Kenlo (inGaia)
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        Conexão direta com a plataforma imobiliária líder de mercado. Sincronização
                        automatizada por meio de chaves API integradoras.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${integrations.kenlo.active ? "bg-emerald-500" : "bg-slate-300"}`}
                      ></span>
                      {integrations.kenlo.active ? "Ativo" : "Não configurado"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIntegrationDetail("kenlo")}
                      className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                {/* Veículos: Webmotors */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">🚗</span>
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Automotivo
                      </span>
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">
                        Integradores de Veículos
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        Carregue seu estoque de carros, motos e náutica informando um Feed XML
                        padrão Webmotors, iCarros, ou AutoGestor.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${integrations.webmotors.active ? "bg-emerald-500" : "bg-slate-300"}`}
                      ></span>
                      {integrations.webmotors.active ? "Ativo" : "Não configurado"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIntegrationDetail("webmotors")}
                      className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                {/* Bling ERP */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">Bling!</span>
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Varejo & Serviços
                      </span>
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">
                        Bling! ERP
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        Integração por API v3 do ERP de e-commerce mais utilizado no Brasil.
                        Publique seu catálogo de produtos em lote.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${integrations.bling.active ? "bg-emerald-500" : "bg-slate-300"}`}
                      ></span>
                      {integrations.bling.active ? "Ativo" : "Não configurado"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIntegrationDetail("bling")}
                      className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                {/* Shopify */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">Shopify</span>
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        E-Commerce
                      </span>
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">
                        Shopify / WooCommerce
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                        Conecte sua loja virtual diretamente. Importe bens de alto valor, acessórios
                        e náutica usando tokens de aplicativos personalizados.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${integrations.shopify.active ? "bg-emerald-500" : "bg-slate-300"}`}
                      ></span>
                      {integrations.shopify.active ? "Ativo" : "Não configurado"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIntegrationDetail("shopify")}
                      className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Configurar
                    </button>
                  </div>
                </div>

                {/* API Personalizada */}
                <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col justify-between hover:bg-slate-950 transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">💻</span>
                      <span className="bg-blue-700/30 border border-blue-500/30 text-blue-300 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Para Desenvolvedores
                      </span>
                    </div>
                    <div>
                      <h5 className="font-display font-bold text-white text-xs group-hover:text-blue-500 transition-colors">
                        API Direta de Integração
                      </h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                        Desenvolveu seu próprio sistema? Integre seu backend via requisições HTTP
                        REST (POST JSON) usando tokens de autenticação.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      API Disponível
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIntegrationDetail("api_doc")}
                      className="bg-blue-700 hover:bg-blue-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Ver Token e Código
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DETAILED INTEGRATION CONFIGURATION PANEL */
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-150 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveIntegrationDetail(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  ⬅ Voltar para Hub
                </button>
                <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
                  {activeIntegrationDetail === "api_doc"
                    ? "API de Desenvolvedor"
                    : `Integração: ${activeIntegrationDetail.toUpperCase()}`}
                </span>
              </div>

              {/* Vista CRM UI */}
              {activeIntegrationDetail === "vistaCrm" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏢</span>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">
                          Vista CRM Conector
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                          Vertical: Imóveis / Lotes / Galpões
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      O Vista CRM possui uma API de integração robusta. Insira seu token de API e
                      subdomínio de cliente abaixo para realizar a autenticação e sincronizar
                      imóveis em tempo real.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-[10px] text-slate-500 space-y-1">
                      <p className="font-bold">Como obter essas chaves:</p>
                      <p>1. Acesse seu Vista CRM</p>
                      <p>2. Vá em Configurações &gt; Integrações &gt; Chaves de API</p>
                      <p>3. Gere um token com permissão de leitura de imóveis</p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        Subdomínio do Vista CRM (URL)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: imobiliariamar.vistacrm.com.br"
                        value={integrations.vistaCrm.url}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            vistaCrm: { ...integrations.vistaCrm, url: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        API Key / Token Vista
                      </label>
                      <input
                        type="password"
                        placeholder="Insira o Token do Vista"
                        value={integrations.vistaCrm.token}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            vistaCrm: { ...integrations.vistaCrm, token: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="vista-auto-sync"
                        checked={integrations.vistaCrm.autoSync}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            vistaCrm: { ...integrations.vistaCrm, autoSync: e.target.checked },
                          })
                        }
                        className="rounded text-blue-700 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="vista-auto-sync"
                        className="text-xs text-slate-600 select-none font-medium"
                      >
                        Sincronizar estoque automaticamente todos os dias às 03:00
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onAddNotification(
                            "Conexão com Vista CRM estabelecida e autenticada! (Ping de API OK)",
                            "success",
                          )
                        }
                        disabled={!integrations.vistaCrm.url || !integrations.vistaCrm.token}
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                          integrations.vistaCrm.url && integrations.vistaCrm.token
                            ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        🧪 Testar Conexão
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSync("vistaCrm")}
                        disabled={
                          !integrations.vistaCrm.url || !integrations.vistaCrm.token || isSyncing
                        }
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                          integrations.vistaCrm.url && integrations.vistaCrm.token && !isSyncing
                            ? "bg-blue-700 text-white hover:bg-blue-500 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "🔄 Sincronizar Agora"
                        )}
                      </button>
                    </div>
                    {integrations.vistaCrm.lastSync && (
                      <div className="text-[10px] text-slate-400 italic text-center mt-1">
                        Última sincronização realizada em: {integrations.vistaCrm.lastSync}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kenlo CRM UI */}
              {activeIntegrationDetail === "kenlo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏬</span>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">
                          Kenlo (inGaia) Conector
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                          Vertical: Imóveis / Lançamentos residenciais
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A Kenlo (antiga inGaia Imob) disponibiliza um sistema de integradores
                      imobiliários via credenciais OAuth e chave da agência. Preencha seus tokens de
                      produção de agência para integrar seu portfólio.
                    </p>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase">
                          Client ID
                        </label>
                        <input
                          type="text"
                          placeholder="ex: cli_9381283"
                          value={integrations.kenlo.clientId}
                          onChange={(e) =>
                            setIntegrations({
                              ...integrations,
                              kenlo: { ...integrations.kenlo, clientId: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase">
                          Agência ID
                        </label>
                        <input
                          type="text"
                          placeholder="ex: ag_4812"
                          value={integrations.kenlo.agencyId}
                          onChange={(e) =>
                            setIntegrations({
                              ...integrations,
                              kenlo: { ...integrations.kenlo, agencyId: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        Client Secret (Token)
                      </label>
                      <input
                        type="password"
                        placeholder="Insira o segredo do cliente"
                        value={integrations.kenlo.clientSecret}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            kenlo: { ...integrations.kenlo, clientSecret: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onAddNotification(
                            "Kenlo API autenticada com sucesso! Credenciais salvas.",
                            "success",
                          )
                        }
                        disabled={!integrations.kenlo.clientId || !integrations.kenlo.clientSecret}
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                          integrations.kenlo.clientId && integrations.kenlo.clientSecret
                            ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        🧪 Testar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSync("kenlo")}
                        disabled={
                          !integrations.kenlo.clientId ||
                          !integrations.kenlo.clientSecret ||
                          isSyncing
                        }
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                          integrations.kenlo.clientId &&
                          integrations.kenlo.clientSecret &&
                          !isSyncing
                            ? "bg-blue-700 text-white hover:bg-blue-500 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "🔄 Sincronizar"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Webmotors XML Feed */}
              {activeIntegrationDetail === "webmotors" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚗</span>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">
                          XML Feed Integrador (Webmotors / iCarros)
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                          Vertical: Veículos / Motos / Náutica
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Importação contínua de estoque por meio de URLs de Feed XML estruturados.
                      Nosso sistema lê o padrão oficial Webmotors 2.0 de metadados de veículos (Ano,
                      KM, Cor, Opcionais, etc.) and o traduz em anúncios mapeados para indicação.
                    </p>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        URL do XML Feed de Estoque
                      </label>
                      <input
                        type="text"
                        placeholder="ex: https://meusite.com.br/estoque/webmotors_feed.xml"
                        value={integrations.webmotors.feedUrl}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            webmotors: { ...integrations.webmotors, feedUrl: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onAddNotification(
                            "URL de Feed XML validada com sucesso! 2 veículos identificados.",
                            "success",
                          )
                        }
                        disabled={!integrations.webmotors.feedUrl}
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                          integrations.webmotors.feedUrl
                            ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        🔍 Validar URL do Feed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSync("webmotors")}
                        disabled={!integrations.webmotors.feedUrl || isSyncing}
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                          integrations.webmotors.feedUrl && !isSyncing
                            ? "bg-blue-700 text-white hover:bg-blue-500 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "🔄 Ler e Sincronizar"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bling ERP API UI */}
              {activeIntegrationDetail === "bling" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📦</span>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">
                          Bling! ERP API v3
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                          Vertical: Geral / Serviços / Cotas de Alto Valor
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Conecte o ERP Bling! utilizando as credenciais de API v3 baseadas em OAuth2 ou
                      Chave de Acesso de Aplicativo. Publique produtos do seu almoxarifado direto
                      para indicações, ideal para revendas de veículos ou empresas de serviços
                      especiais.
                    </p>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        Chave API v3 Bling!
                      </label>
                      <input
                        type="password"
                        placeholder="Insira o Token API v3 do Bling"
                        value={integrations.bling.apikey}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            bling: { ...integrations.bling, apikey: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onAddNotification(
                            "API Token Bling! validado com o servidor do ERP.",
                            "success",
                          )
                        }
                        disabled={!integrations.bling.apikey}
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                          integrations.bling.apikey
                            ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        🧪 Testar Conexão
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSync("bling")}
                        disabled={!integrations.bling.apikey || isSyncing}
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                          integrations.bling.apikey && !isSyncing
                            ? "bg-blue-700 text-white hover:bg-blue-500 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "🔄 Puxar Estoque"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shopify UI */}
              {activeIntegrationDetail === "shopify" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🛍️</span>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm">
                          Shopify / WooCommerce Sync
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                          Vertical: Bens E-Commerce / Náutica e Luxo
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sincronize lojas virtuais do Shopify ou WooCommerce por meio de APIs REST.
                      Informe as credenciais do Custom App geradas no seu Admin do Shopify para
                      sincronização instantânea.
                    </p>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        Domínio da Loja (.myshopify.com)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: loja-veiculos.myshopify.com"
                        value={integrations.shopify.shopUrl}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            shopify: { ...integrations.shopify, shopUrl: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        Access Token (Admin API)
                      </label>
                      <input
                        type="password"
                        placeholder="shpat_..."
                        value={integrations.shopify.accessToken}
                        onChange={(e) =>
                          setIntegrations({
                            ...integrations,
                            shopify: { ...integrations.shopify, accessToken: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onAddNotification(
                            "Tokens de Custom App Shopify aceitos com sucesso!",
                            "success",
                          )
                        }
                        disabled={
                          !integrations.shopify.shopUrl || !integrations.shopify.accessToken
                        }
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                          integrations.shopify.shopUrl && integrations.shopify.accessToken
                            ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        🧪 Testar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerSync("shopify")}
                        disabled={
                          !integrations.shopify.shopUrl ||
                          !integrations.shopify.accessToken ||
                          isSyncing
                        }
                        className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                          integrations.shopify.shopUrl &&
                          integrations.shopify.accessToken &&
                          !isSyncing
                            ? "bg-blue-700 text-white hover:bg-blue-500 cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "🔄 Puxar Produtos"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dev API Docs UI */}
              {activeIntegrationDetail === "api_doc" && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💻</span>
                    <div>
                      <h4 className="font-display font-bold text-slate-900 text-sm">
                        Integração Direta por API REST
                      </h4>
                      <p className="text-xs text-slate-500">
                        Ideal para sistemas legados ou desenvolvimento sob medida. Seu desenvolvedor
                        pode cadastrar produtos na plataforma em tempo real.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">
                        Seu Token Privado de API (Bearer Token)
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={apiToken}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(apiToken);
                            onAddNotification(
                              "Token copiado para a área de transferência!",
                              "success",
                            );
                          }}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-2 rounded-xl"
                        >
                          Copiar Token
                        </button>
                      </div>
                      <span className="block text-[9px] text-red-500 font-bold">
                        Atenção: Não compartilhe esse token publicamente. Ele dá acesso de escrita
                        ao seu catálogo.
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">
                        Instrução cURL de Exemplo (Adicionar Produto)
                      </span>
                      <div className="bg-slate-900 text-blue-200 font-mono text-[10px] p-4 rounded-xl overflow-x-auto relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const code = `curl -X POST https://api.indicaaqui.com.br/v1/products \\\n  -H "Authorization: Bearer ${apiToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "category": "imovel",\n    "title": "Apartamento Luxo Jardins",\n    "price": 2500000,\n    "description": "...",\n    "location": { "city": "São Paulo", "state": "SP" }\n  }'`;
                            navigator.clipboard.writeText(code);
                            onAddNotification("cURL de exemplo copiado!", "success");
                          }}
                          className="absolute top-2 right-2 bg-slate-800 text-slate-300 font-sans hover:text-white font-bold text-[8px] px-2 py-1 rounded"
                        >
                          Copiar Código
                        </button>
                        <pre className="whitespace-pre">{`curl -X POST https://api.indicaaqui.com.br/v1/products \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "imovel",
    "title": "Apartamento Luxo Jardins",
    "price": 2500000,
    "description": "Excelente imóvel reformado com comissão premium.",
    "location": {
      "city": "São Paulo",
      "state": "SP"
    }
  }'`}</pre>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                      <p className="font-bold text-slate-800">Parâmetros de Retorno Esperados:</p>
                      <p>
                        • <span className="font-mono font-bold text-blue-700">201 Created</span>:
                        Produto criado com sucesso.
                      </p>
                      <p>
                        • <span className="font-mono font-bold text-red-600">401 Unauthorized</span>
                        : Token ausente ou inválido.
                      </p>
                      <p>
                        •{" "}
                        <span className="font-mono font-bold text-red-600">
                          422 Unprocessable Entity
                        </span>
                        : Falha de validação dos atributos requeridos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
