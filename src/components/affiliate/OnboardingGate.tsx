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

/**
 * Aceite dos termos — primeira tela do indicador, antes de ver qualquer
 * produto. Era um early-return dentro do painel. JSX movido sem alteração.
 */
export default function OnboardingGate({ ctx }: { ctx: AffiliateCtx }) {
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
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans">
      <div className="text-center mb-6">
        <div className="bg-blue-100 text-blue-800 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-slate-900">Seja um Indicador</h2>
        <p className="text-sm text-slate-500 mt-1">
          Indique imóveis, carros, motos, barcos e jetskis e receba comissões sobre resultados.
        </p>
      </div>

      <form onSubmit={handleRegisterOnboard} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            required
            value={onboardForm.name}
            onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
            placeholder="ex: Gabriel Martins"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              CPF
            </label>
            <input
              type="text"
              required
              value={onboardForm.cpf}
              onChange={(e) => setOnboardForm({ ...onboardForm, cpf: e.target.value })}
              placeholder="000.000.000-00"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              required
              value={onboardForm.phone}
              onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            E-mail
          </label>
          <input
            type="email"
            required
            value={onboardForm.email}
            onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
            placeholder="gabriel@exemplo.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cidade de Atuação
            </label>
            <input
              type="text"
              required
              value={onboardForm.city}
              onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
              placeholder="ex: São Paulo"
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

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <span className="block text-xs font-bold text-slate-800 mb-2">
            Configurar Chave PIX (Para Recebimento)
          </span>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {(["cpf", "email", "phone", "random"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOnboardForm({ ...onboardForm, pixType: type })}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                  onboardForm.pixType === type
                    ? "bg-blue-700 border-blue-700 text-white shadow shadow-blue-100"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {type === "random" ? "Aleatória" : type}
              </button>
            ))}
          </div>
          <input
            type="text"
            required
            value={onboardForm.pixKey}
            onChange={(e) => setOnboardForm({ ...onboardForm, pixKey: e.target.value })}
            placeholder="Chave para transferências"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Autonomy Terms - Scrollwrap implementation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contrato de Parceria Comercial Autônoma
            </label>
            {scrolledTerms && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                ✓ Lido
              </span>
            )}
          </div>

          <div
            onScroll={handleScrollTerms}
            className="h-32 overflow-y-scroll bg-slate-900 text-slate-300 p-3 rounded-xl border border-slate-800 text-[10px] font-mono leading-relaxed select-none"
          >
            <p className="font-bold text-white mb-2 uppercase text-center border-b border-slate-800 pb-1">
              CONTRATO DE PARCERIA COMERCIAL AUTÔNOMA
            </p>
            <p className="mb-2">
              <strong className="text-blue-400">CLÁUSULA 1ª - DA AUTONOMIA REAL:</strong> O parceiro
              comercial (Indicador) atuará de forma totalmente independente e sem subordinação. O
              parceiro é livre para fixar seus próprios dias, horários e locais de atividade, não
              estando sujeito a carga horária de trabalho mínima ou obrigatoriedade de presença.
            </p>
            <p className="mb-2">
              <strong className="text-blue-400">CLÁUSULA 2ª - DA MULTIPLICIDADE:</strong> É
              garantido ao Indicador o direito de exercer atividades correlatas para outros
              anunciantes, imobiliárias, concessionárias ou plataformas concorrentes de forma
              simultânea.
            </p>
            <p className="mb-2">
              <strong className="text-blue-400">CLÁUSULA 3ª - DA EXCLUSÃO DE VÍNCULO:</strong> Este
              contrato não cria sob qualquer hipótese qualquer tipo de vínculo de emprego, relação
              de subordinação ou representação estatutária, conforme o Art. 442-B da CLT.
            </p>
            <p className="mb-2">
              <strong className="text-blue-400">
                CLÁUSULA 4ª - DA ATUAÇÃO DE IMÓVEIS (LEI 6.530/78):
              </strong>{" "}
              Fica estabelecido que na vertical de imóveis, a função do Indicador é exclusivamente
              de geração de leads/indicação qualificada. Qualquer ato restrito de corretagem
              imobiliária ou intermediação imobiliária comercial depende de registro ativo no
              Conselho Regional de Corretores de Imóveis (CRECI).
            </p>
            <p className="text-blue-300 font-bold text-center mt-2">
              === ROLAR ATÉ O FIM PARA ATIVAR O ACEITE ===
            </p>
          </div>
          {!scrolledTerms && (
            <p className="text-[10px] text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Por favor, role os termos do contrato até o final para liberar o botão.
            </p>
          )}
        </div>

        {/* Legal CRECI warning for real estate indications */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start gap-3">
          <input
            type="checkbox"
            required
            id="creci_checkbox"
            checked={creciWarningAccepted}
            onChange={(e) => setCreciWarningAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-700 border-slate-300 rounded focus:ring-blue-500 focus:outline-none"
          />
          <label htmlFor="creci_checkbox" className="text-[11px] text-slate-600 leading-tight">
            Entendo que a indicação de <strong>Imóveis</strong> se limita à indicação de leads
            interessados, e não substitui a intermediação profissional garantida por Corretores
            credenciados (CRECI).
          </label>
        </div>

        <button
          type="submit"
          disabled={!scrolledTerms || !creciWarningAccepted}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
            scrolledTerms && creciWarningAccepted
              ? "bg-blue-700 text-white hover:bg-blue-500 active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Aceitar Contrato e Ativar Conta
        </button>
      </form>
    </div>
  );
}
