import { Fragment, useState, FormEvent, UIEvent } from "react";
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

/** Aba `desempenho` do painel do indicador. JSX movido sem alteração. */
export default function DesempenhoTab({ ctx }: { ctx: AffiliateCtx }) {
  const {
    certifiedCategories,
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
    <div className="space-y-6">
      {/* Ganhos reais, lidos do ledger.
              O resto desta aba é gamificação; estes números são os de verdade —
              e incluem vendas fechadas por financiamento, que não passam pela
              tabela de leads e por isso não apareciam em lugar nenhum. */}
      {(() => {
        const recebido = commissions
          .filter((c) => c.status === "paid")
          .reduce((a, c) => a + c.amount, 0);
        const aReceber = commissions
          .filter((c) => c.status !== "paid")
          .reduce((a, c) => a + c.amount, 0);
        const vendasLead = activeLeads.filter((l) => l.status === "venda_concluida").length;
        const vendasFin = (simulations ?? []).filter(
          (sim) => sim.indicatorId === indicator.id && sim.status === "concluido",
        ).length;
        const cards = [
          {
            label: "Já recebido",
            value: `R$ ${recebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            hint: "comissões pagas via PIX",
            cls: "bg-emerald-50 border-emerald-200 text-emerald-900",
          },
          {
            label: "A receber",
            value: `R$ ${aReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            hint: "liberado ou aguardando confirmação",
            cls: "bg-amber-50 border-amber-200 text-amber-900",
          },
          {
            label: "Vendas fechadas",
            value: String(vendasLead + vendasFin),
            hint: `${vendasLead} por indicação • ${vendasFin} por financiamento`,
            cls: "bg-slate-900 border-slate-800 text-white",
          },
        ];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.label} className={`rounded-2xl border p-4 ${c.cls}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {c.label}
                </span>
                <span className="block font-mono font-black text-2xl mt-1">{c.value}</span>
                <span className="block text-[10px] opacity-70 mt-0.5">{c.hint}</span>
              </div>
            ))}
          </div>
        );
      })()}
      {/* Leagues / Gamification Status Card */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider block">
            Sistema de Ligas
          </span>
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-800 p-2 rounded-xl flex items-center justify-center w-12 h-12">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-900 text-base">Liga Ouro</h4>
              <p className="text-xs text-slate-500">
                Comissões 15% maiores ativas por reputação excelente.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l md:border-r border-slate-200 py-4 md:py-0 md:px-6 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Próximo Nível
          </span>
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Liga Suprema (Breve)</span>
            <span>85% Concluído</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-700 h-full w-[85%] rounded-full"></div>
          </div>
          <p className="text-[10px] text-slate-400">
            Indique mais 2 vendas qualificadas para desbloquear.
          </p>
        </div>

        <div className="space-y-1 flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Atividades Acumuladas
          </span>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-base font-bold font-mono text-slate-950">
                {indicator.clicks}
              </span>
              <span className="text-[9px] text-slate-500 block uppercase">Cliques</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-base font-bold font-mono text-slate-950">
                {activeLeads.length}
              </span>
              <span className="text-[9px] text-slate-500 block uppercase">Leads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Leads Funnel / History Table */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">
              Seus Leads e Indicações
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhe a atribuição de contatos, visitas e fechamentos em tempo real.
            </p>
          </div>
        </div>

        {activeLeads.length === 0 ? (
          <div className="text-center p-12 text-slate-400">
            <p className="text-sm">Nenhum lead gerado por você ainda.</p>
            <p className="text-xs mt-1">
              Compartilhe links da vitrine para ver os leads surgindo aqui!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[9px] tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Cliente / Contato</th>
                  <th className="py-3 px-4">Produto / Categoria</th>
                  <th className="py-3 px-4">Tipo Comissão</th>
                  <th className="py-3 px-4">Comissão Esperada</th>
                  <th className="py-3 px-4">Status Funil</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {activeLeads.map((lead) => {
                  const isChatOpen = activeChatLeadId === lead.id;
                  const leadMsgs = chatMessages.filter((m) => m.leadId === lead.id);

                  return (
                    // Cada lead vira DUAS linhas: a do lead e a do chat
                    // expandido. Como o map só pode devolver um nó, elas vêm
                    // num fragmento — e a chave precisa estar nele, não nas
                    // linhas de dentro. `<>` não aceita chave; por isso o
                    // fragmento nomeado.
                    <Fragment key={lead.id}>
                      <tr
                        className={`hover:bg-slate-50/50 transition-all ${isChatOpen ? "bg-blue-50/20" : ""}`}
                      >
                        <td className="py-4 px-4 font-medium text-slate-900">
                          <div>{lead.clientName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {lead.clientPhone} • {lead.clientEmail}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <span className="font-semibold line-clamp-1">{lead.productTitle}</span>
                          <span className="text-[10px] text-slate-400 capitalize bg-slate-100 rounded px-1.5 py-0.5 mt-1 inline-block">
                            {lead.productCategory}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold uppercase text-[10px]">
                          {lead.commissionType === "presencial" ? (
                            <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              Presencial
                            </span>
                          ) : (
                            <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                              Digital
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-900 font-bold">
                          R$ {lead.commissionValue.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              lead.status === "venda_concluida"
                                ? "bg-emerald-100 text-emerald-800"
                                : lead.status === "visita_confirmada"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : lead.status === "visita_agendada"
                                    ? "bg-amber-100 text-amber-800"
                                    : lead.status === "proposta"
                                      ? "bg-blue-100 text-blue-900"
                                      : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {lead.status === "lead_recebido" && "Lead Recebido"}
                            {lead.status === "contato_feito" && "Contato Feito"}
                            {lead.status === "visita_agendada" && "Visita Agendada"}
                            {lead.status === "visita_confirmada" && "Visita Confirmada"}
                            {lead.status === "proposta" && "Proposta"}
                            {lead.status === "venda_concluida" && "Venda Concluída"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {lead.status === "visita_agendada" &&
                              (lead.checkInRequested ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-amber-600 text-[9px] font-bold flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                                    <Clock className="w-3 h-3 animate-spin" /> Aguardando Loja...
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => onRequestCheckIn(lead.id)}
                                  className="bg-gradient-to-r from-blue-500 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-bold py-1 px-2.5 rounded-lg transition-all text-[9px] flex items-center gap-1 shadow-sm active:scale-95"
                                >
                                  <MapPin className="w-2.5 h-2.5" /> Cheguei na Loja
                                </button>
                              ))}

                            <button
                              onClick={() => setActiveChatLeadId(isChatOpen ? null : lead.id)}
                              className={`font-bold py-1 px-2 rounded-lg transition-all text-[9px] flex items-center gap-1.5 border shadow-sm ${
                                isChatOpen
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <MessageSquare className="w-3 h-3 text-blue-500" />
                              {isChatOpen ? "Fechar Atendimento" : "Acompanhar Chat"}
                              {leadMsgs.length > 0 && (
                                <span className="bg-blue-100 text-blue-900 text-[8px] font-bold rounded-full px-1.5 py-0.2">
                                  {leadMsgs.length}
                                </span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isChatOpen && (
                        <tr className="bg-slate-50/50">
                          <td
                            colSpan={6}
                            className="p-4 bg-slate-50/60 border-t border-b border-slate-100"
                          >
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
                              {/* Chat Panel Header */}
                              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                                  <div className="text-left">
                                    <h4 className="font-bold text-xs text-slate-100">
                                      Console de Monitoramento • {lead.clientName}
                                    </h4>
                                    <p className="text-[9px] text-slate-400">
                                      Atendimento garantido com indicação de {indicator.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-slate-800 border border-slate-700 text-blue-400 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase font-bold">
                                  Modo Observador Ativo
                                </div>
                              </div>

                              {/* Info banner */}
                              <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-start gap-2 text-[10px] text-blue-950 text-left">
                                <Info className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
                                <span>
                                  Você está visualizando a conversa entre o lojista e o comprador em
                                  tempo real. Se o lojista concluir a venda, a sua comissão de{" "}
                                  <strong>R$ {lead.commissionValue.toLocaleString("pt-BR")}</strong>{" "}
                                  será liberada de imediato.
                                </span>
                              </div>

                              {/* Messages list */}
                              <div className="p-4 space-y-3 max-h-[250px] overflow-y-auto bg-slate-50/40 text-left flex flex-col">
                                {leadMsgs.length === 0 ? (
                                  <p className="text-center text-xs text-slate-400 py-6">
                                    Ainda não há mensagens registradas neste atendimento.
                                  </p>
                                ) : (
                                  leadMsgs.map((msg) => {
                                    if (msg.senderRole === "system") {
                                      return (
                                        <div
                                          key={msg.id}
                                          className="mx-auto max-w-[85%] text-center my-1"
                                        >
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

                                    const isClient = msg.senderRole === "client";
                                    return (
                                      <div
                                        key={msg.id}
                                        className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                                      >
                                        <div
                                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                                            isClient
                                              ? "bg-slate-100 border border-slate-200 text-slate-800 rounded-br-none"
                                              : "bg-blue-50 border border-blue-100 text-blue-950 rounded-bl-none"
                                          }`}
                                        >
                                          <div className="flex items-center justify-between gap-4 mb-1">
                                            <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">
                                              {isClient
                                                ? `Comprador (${lead.clientName})`
                                                : `Anunciante / Loja`}
                                            </span>
                                            <span className="text-[8px] text-slate-400">
                                              {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                          </div>

                                          {msg.originalText && msg.originalText !== msg.text ? (
                                            <div className="space-y-1">
                                              <p className="line-through text-slate-400 text-[10px] italic">
                                                {msg.originalText}
                                              </p>
                                              <div className="bg-red-50 text-red-800 text-[10px] p-1.5 rounded-lg border border-red-100 font-medium">
                                                🚫 Interceptado por vazamento de contato: {msg.text}
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="leading-relaxed font-sans">{msg.text}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
