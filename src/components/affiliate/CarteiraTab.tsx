import { useState, FormEvent, UIEvent } from "react";
import PushSettings from "@/components/PushSettings";
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

/** Aba `carteira` do painel do indicador. JSX movido sem alteração. */
export default function CarteiraTab({ ctx }: { ctx: AffiliateCtx }) {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 lg:col-span-1">
        <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-700" />
          Solicitar Transferência (Saque)
        </h3>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Disponível para Resgate
          </span>
          <span className="text-3xl font-bold text-emerald-600">
            R$ {indicator.balanceAvailable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Chave cadastrada: {indicator.pixKey}
          </span>
        </div>

        <form onSubmit={handleRequestWithdraw} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Valor de Saque (R$)
            </label>
            <input
              type="number"
              required
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="ex: 1500"
              max={indicator.balanceAvailable}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isWithdrawing || indicator.balanceAvailable <= 0}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow ${
              isWithdrawing || indicator.balanceAvailable <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isWithdrawing ? "Transferindo..." : "Solicitar Saque PIX Imediato"}
          </button>
        </form>

        {withdrawSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs text-emerald-800 animate-bounce">
            ✓ Saque enviado! Verifique seu banco cadastrado na chave PIX.
          </div>
        )}

        {/* indicators.id é o próprio id do usuário — mesma convenção que o
            resto do app usa para buscar comissões e perfil. */}
        <PushSettings userId={indicator.id} onAddNotification={onAddNotification} />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
        <h3 className="font-display font-bold text-slate-900 text-base">
          Histórico de Movimentação Financeira
        </h3>
        <p className="text-xs text-slate-500">
          Transações de comissões, faturamentos, adiantamentos e pagamentos recebidos.
        </p>

        <div className="space-y-3">
          {commissions.map((c) => {
            const lead = c.leadId ? leads.find((l) => l.id === c.leadId) : undefined;
            const sim = c.simulationId
              ? (simulations ?? []).find((s) => s.id === c.simulationId)
              : undefined;
            const produto = lead?.productTitle ?? sim?.productTitle ?? "Anúncio";
            const cliente = lead?.clientName ?? sim?.clientName;
            const origem = sim
              ? "Venda por financiamento"
              : c.kind === "lead"
                ? "Indicação qualificada"
                : "Venda";

            const ui =
              c.status === "paid"
                ? {
                    chip: "PIX",
                    chipCls: "bg-emerald-100 text-emerald-800",
                    valueCls: "text-emerald-600",
                    title: "Comissão recebida",
                    sub: c.paidAt
                      ? `Pago em ${new Date(c.paidAt).toLocaleDateString("pt-BR")}`
                      : "Pago",
                  }
                : c.status === "available"
                  ? {
                      chip: "OK",
                      chipCls: "bg-blue-100 text-blue-800",
                      valueCls: "text-blue-700",
                      title: "Liberada para repasse",
                      sub: "Aguardando o anunciante efetuar o PIX",
                    }
                  : {
                      chip: "PND",
                      chipCls: "bg-amber-100 text-amber-800",
                      valueCls: "text-amber-500",
                      title: "Comissão pendente",
                      sub: "Libera quando o anunciante confirmar",
                    };

            return (
              <div
                key={c.id}
                className="flex justify-between items-center border border-slate-100 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-all gap-3"
              >
                <div className="flex gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-[10px] shrink-0 ${ui.chipCls}`}
                  >
                    {ui.chip}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{ui.title}</h4>
                    <p className="text-xs text-slate-500 truncate">
                      {origem} • {produto}
                      {cliente ? ` • ${cliente}` : ""}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ui.sub}</p>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm shrink-0 ${ui.valueCls}`}>
                  + R$ {c.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}

          {commissions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xs">Nenhuma comissão registrada ainda.</p>
              <p className="text-[10px] mt-1">
                Elas aparecem quando o anunciante confirma uma visita, fecha a venda ou conclui um
                financiamento que você indicou.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
