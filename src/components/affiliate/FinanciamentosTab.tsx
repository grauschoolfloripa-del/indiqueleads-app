import { useState, FormEvent, UIEvent } from "react";
import { useTabParam } from "@/hooks/useTabParam";
import {
  Share2,
  MapPin,
  Wallet,
  Award,
  ArrowUpRight,
  DollarSign,
  Filter,
  Info,
  CheckCircle,
  FileText,
  Smartphone,
  RefreshCw,
  Navigation,
  Camera,
  Check,
  Copy,
  AlertTriangle,
  Landmark,
  Plus,
  Clock,
  User,
  Calendar,
  TrendingUp,
  Send,
  Percent,
  Eye,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import {
  Product,
  Indicator,
  Lead,
  Category,
  FinancingSimulation,
  BankSimulationResponse,
  ApprovedContract,
  Advertiser,
  ChatMessage,
  Commission,
} from "../../types";
import { VERTICALS, VERTICALS_ORDER, verticalBadge } from "../../lib/verticals";
import SponsorSlot from "../SponsorSlot";
import type { AffiliateCtx } from "./useAffiliateState";

/** Aba `financiamentos` do painel do indicador. JSX movido sem alteração. */
export default function FinanciamentosTab({ ctx }: { ctx: AffiliateCtx }) {
  const {
    activeChatLeadId,
    activeLeads,
    activeTab,
    advertisers,
    chatMessages,
    cityFilter,
    commissions,
    creciWarningAccepted,
    downloadAllImages,
    downloadingKit,
    filterByMyRegion,
    filteredProducts,
    handleRegisterOnboard,
    handleRequestWithdraw,
    handleScrollTerms,
    handleShareLink,
    handleSimFormSubmit,
    indicator,
    isEditingLocation,
    isWithdrawing,
    leads,
    minCommission,
    onAddNotification,
    onAddSimulation,
    onRequestCheckIn,
    onSendChatMessage,
    onUpdateIndicator,
    onUpdateLeadStatus,
    onViewProduct,
    onboardForm,
    onlyPresencial,
    products,
    scheduledVisits,
    scrolledTerms,
    selectedCategory,
    selectedPlacement,
    selectedSocialPlatform,
    setActiveChatLeadId,
    setActiveTab,
    setCityFilter,
    setCreciWarningAccepted,
    setDownloadingKit,
    setFilterByMyRegion,
    setIsEditingLocation,
    setIsWithdrawing,
    setMinCommission,
    setOnboardForm,
    setOnlyPresencial,
    setScrolledTerms,
    setSelectedCategory,
    setSelectedPlacement,
    setSelectedSocialPlatform,
    setShareCopied,
    setSharingMethod,
    setSharingProduct,
    setShowSimulateModal,
    setSimFormClientBirthDate,
    setSimFormClientCpf,
    setSimFormClientIncome,
    setSimFormClientName,
    setSimFormClientPhone,
    setSimFormDesiredInstallments,
    setSimFormDownPayment,
    setSimFormProductId,
    setTempCity,
    setTempState,
    setWhatsAppNotificationData,
    setWithdrawAmount,
    setWithdrawSuccess,
    shareCopied,
    sharingMethod,
    sharingProduct,
    showSimulateModal,
    simFormClientBirthDate,
    simFormClientCpf,
    simFormClientIncome,
    simFormClientName,
    simFormClientPhone,
    simFormDesiredInstallments,
    simFormDownPayment,
    simFormProductId,
    simulateSocialShare,
    simulations,
    tempCity,
    tempState,
    whatsAppNotificationData,
    withdrawAmount,
    withdrawSuccess,
  } = ctx;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header introduction banner */}
      <div className="bg-gradient-to-r from-blue-500 to-amber-600 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-white" />
            <h3 className="font-display font-bold text-lg md:text-xl">
              Intermediação de Crédito Veicular
            </h3>
          </div>
          <p className="text-xs text-blue-50 leading-relaxed">
            Intermedeie o financiamento do comprador diretamente com a concessionária ou bancos
            parceiros. Cadastre os dados de crédito do comprador para que a loja faça a simulação
            automática multi-bancos. Quando aprovado, você visualiza as parcelas e termos para
            fechar o negócio com total transparência!
          </p>
        </div>
        <button
          onClick={() => {
            const vehicleProducts = products.filter((p) =>
              ["carro", "moto", "barco", "jetski"].includes(p.category),
            );
            if (vehicleProducts.length > 0) {
              setSimFormProductId(vehicleProducts[0].id);
            } else if (products.length > 0) {
              setSimFormProductId(products[0].id);
            }
            setShowSimulateModal(true);
          }}
          className="bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs py-3 px-5 rounded-2xl transition-all shadow-md flex items-center gap-2 self-start md:self-center shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-blue-700" />
          Nova Simulação de Crédito
        </button>
      </div>

      {/* List of active simulations */}
      <div className="space-y-6">
        <h3 className="font-display font-bold text-slate-950 text-base flex items-center gap-2">
          <RefreshCw className="w-4.5 h-4.5 text-slate-400 animate-spin-slow" />
          Simulações e Status de Crédito (
          {simulations?.filter((s) => s.indicatorId === indicator.id).length || 0})
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {(simulations || [])
            .filter((s) => s.indicatorId === indicator.id)
            .map((sim) => {
              const product = products.find((p) => p.id === sim.productId);
              return (
                <div
                  key={sim.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Header bar of simulation item */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
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
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {sim.productTitle}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Preço do Veículo:{" "}
                          <strong className="font-semibold text-slate-700">
                            R$ {sim.productPrice.toLocaleString("pt-BR")}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div>
                      {sim.status === "pendente" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Aguardando Loja
                        </span>
                      )}
                      {sim.status === "analise_bancos" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Em Análise nos Bancos
                        </span>
                      )}
                      {sim.status === "aprovado" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          <CheckCircle className="w-3 h-3" />
                          Simulação Aprovada!
                        </span>
                      )}
                      {sim.status === "rejeitado" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/50">
                          <AlertTriangle className="w-3 h-3" />
                          Crédito Recusado
                        </span>
                      )}
                      {sim.status === "concluido" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950 text-slate-100 border border-slate-900">
                          <CheckCircle className="w-3 h-3" />
                          Contrato Assinado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Simulation Body Details */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Buyer profile summary */}
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-xs">
                      <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Perfil do Comprador
                      </h5>
                      <div className="grid grid-cols-2 gap-3 leading-relaxed">
                        <div>
                          <span className="text-slate-400 block font-medium">Nome:</span>
                          <span className="font-semibold text-slate-950 line-clamp-1">
                            {sim.clientName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">CPF do Cliente:</span>
                          <span className="font-semibold text-slate-950 font-mono">
                            {sim.clientCpf.replace(
                              /(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/,
                              "$1.***.***-$4",
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">WhatsApp:</span>
                          <span className="font-semibold text-slate-950">{sim.clientPhone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Data Nasc:</span>
                          <span className="font-semibold text-slate-950 font-mono">
                            {sim.clientBirthDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Renda Mensal:</span>
                          <span className="font-semibold text-emerald-700 font-mono">
                            R$ {sim.clientIncome.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">
                            Entrada Proposta:
                          </span>
                          <span className="font-semibold text-slate-900 font-mono">
                            R$ {sim.downPayment.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-400 block">Prazo Desejado:</span>
                        <span className="font-semibold text-slate-900">
                          {sim.desiredInstallments} meses
                        </span>
                      </div>
                    </div>

                    {/* Right 2 columns: Simulation Response or Awaiting state */}
                    <div className="lg:col-span-2 flex flex-col justify-between h-full space-y-4">
                      {sim.status === "pendente" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-amber-50/20 border border-dashed border-amber-200 rounded-2xl">
                          <Clock className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                          <h5 className="font-bold text-sm text-amber-900">
                            Enviado para a Mesa de Crédito
                          </h5>
                          <p className="text-xs text-slate-500 max-w-sm mt-1">
                            A loja parceira já recebeu este pedido e está enviando os dados do
                            comprador para as mesas de análise dos bancos. Fique atento para
                            atualizações!
                          </p>
                        </div>
                      )}

                      {sim.status === "rejeitado" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-50/20 border border-dashed border-red-200 rounded-2xl">
                          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                          <h5 className="font-bold text-sm text-red-900">
                            Análise de Crédito Recusada
                          </h5>
                          <p className="text-xs text-slate-500 max-w-sm mt-1">
                            Infelizmente, as instituições financeiras consultadas recusaram a
                            liberação de crédito para este perfil de renda/score. Tente re-ajustar o
                            valor da entrada.
                          </p>
                        </div>
                      )}

                      {/* If banks under review or approved: show multi-bank response options */}
                      {(sim.status === "analise_bancos" ||
                        sim.status === "aprovado" ||
                        sim.status === "concluido") && (
                        <div className="space-y-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                            Cotações de Bancos Credenciados (Simulação Direct-to-Store)
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {sim.bankResponses && sim.bankResponses.length > 0 ? (
                              sim.bankResponses.map((bank, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between ${
                                    bank.approvedStatus === "aprovado"
                                      ? "bg-emerald-50/40 border-emerald-200/60 shadow-xs"
                                      : bank.approvedStatus === "revisar_entrada"
                                        ? "bg-amber-50/40 border-amber-200/60"
                                        : "bg-slate-50 border-slate-150 text-slate-400"
                                  }`}
                                >
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-slate-900">
                                        {bank.bankName}
                                      </span>
                                      {bank.approvedStatus === "aprovado" && (
                                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono">
                                          OK
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-mono text-[10px] text-slate-500 mt-1">
                                      Financia:{" "}
                                      <strong className="font-bold text-slate-700">
                                        R$ {bank.approvedAmount.toLocaleString("pt-BR")}
                                      </strong>
                                    </p>
                                    <p className="font-mono text-[10px] text-slate-500">
                                      Taxa:{" "}
                                      <strong className="font-bold text-blue-700">
                                        {bank.interestRate}% a.m.
                                      </strong>
                                    </p>
                                  </div>

                                  <div className="pt-2 border-t border-slate-100/60 mt-2">
                                    <span className="text-[10px] text-slate-400 block">
                                      Parcelas:
                                    </span>
                                    <span className="text-sm font-bold font-mono text-slate-900">
                                      {bank.installmentsCount}x R${" "}
                                      {bank.installmentValue.toLocaleString("pt-BR")}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 py-4 text-center text-xs text-slate-400">
                                Aguardando preenchimento das cotações pela loja...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Final Approved Contract section */}
                      {sim.approvedContract && (
                        <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
                          <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1 font-mono">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Contrato de
                              Crédito Ativo
                            </span>
                            <span className="font-bold text-xs text-slate-300 font-mono">
                              {sim.approvedContract.bankName}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                                Valor Financiado
                              </span>
                              <span className="font-bold text-white font-mono text-sm">
                                R$ {sim.approvedContract.approvedAmount.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                                Entrada Requerida
                              </span>
                              <span className="font-bold text-white font-mono text-sm">
                                R${" "}
                                {sim.approvedContract.downPaymentRequired.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                                Parcelas Aprovadas
                              </span>
                              <span className="font-bold text-emerald-400 font-mono text-sm">
                                {sim.approvedContract.installmentsCount}x R${" "}
                                {sim.approvedContract.installmentValue.toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                                Taxa de Juros
                              </span>
                              <span className="font-bold text-blue-400 font-mono text-sm">
                                {sim.approvedContract.interestRate}% a.m.
                              </span>
                            </div>
                          </div>

                          {sim.approvedContract.additionalNotes && (
                            <p className="text-[10px] text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                              💡{" "}
                              <strong className="font-semibold text-slate-100">
                                Notas da Loja:
                              </strong>{" "}
                              {sim.approvedContract.additionalNotes}
                            </p>
                          )}

                          <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
                            <span>
                              Sua comissão está garantida na assinatura eletrônica deste contrato.
                            </span>
                            <span className="text-emerald-400 font-bold font-mono">
                              CRÉDITO SEGURO
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {(simulations || []).filter((s) => s.indicatorId === indicator.id).length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <div className="bg-slate-50 text-slate-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Landmark className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Nenhuma simulação enviada</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Você ainda não cadastrou nenhuma simulação de financiamento para intermediar com
                compradores. Selecione um veículo de interesse e clique em "Nova Simulação de
                Crédito".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
