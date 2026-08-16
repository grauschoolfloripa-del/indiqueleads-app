import { useState, FormEvent, UIEvent } from "react";
import { useTabParam } from "@/hooks/useTabParam";
import { useNavigate } from "@tanstack/react-router";
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
} from "../types";
import { VERTICALS, VERTICALS_ORDER, verticalBadge } from "../lib/verticals";
import SponsorSlot from "./SponsorSlot";
import { useAffiliateState, type AffiliateDashboardProps } from "./affiliate/useAffiliateState";
import OnboardingGate from "./affiliate/OnboardingGate";
import VitrineTab from "./affiliate/VitrineTab";
import DesempenhoTab from "./affiliate/DesempenhoTab";
import CarteiraTab from "./affiliate/CarteiraTab";
import FinanciamentosTab from "./affiliate/FinanciamentosTab";

/**
 * Painel do indicador.
 *
 * Era um arquivo de 2.862 linhas com as quatro abas dentro. Agora guarda só
 * a moldura — cabeçalho, barra de abas e modais — e delega cada aba ao seu
 * arquivo em ./affiliate. O estado vive em useAffiliateState e viaja como
 * `ctx`, para não virar dezenas de props repetidas em cada aba.
 */
export default function AffiliateDashboard(props: AffiliateDashboardProps) {
  const ctx = useAffiliateState(props);
  const navigate = useNavigate();
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

  if (!indicator.hasAcceptedTerms) {
    return <OnboardingGate ctx={ctx} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-br from-sea-700 via-ink-900 to-ink-950 rounded-3xl p-6 text-white mb-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-[0.07] flex items-center mr-12 pointer-events-none">
          <Award className="w-64 h-64 text-white" />
        </div>
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
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center font-bold text-2xl uppercase shadow-lg shadow-brand-500/30 border-2 border-brand-400 text-white">
              {indicator.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl text-white">{indicator.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    indicator.league === "ouro"
                      ? "bg-amber-400 text-amber-950"
                      : indicator.league === "prata"
                        ? "bg-slate-300 text-slate-950"
                        : "bg-blue-400 text-blue-950"
                  }`}
                >
                  Liga {indicator.league}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5 font-mono flex items-center gap-2 flex-wrap">
                <span>
                  {indicator.email} • Reputação: {indicator.score}/100
                </span>
                {indicator.city && !isEditingLocation && (
                  <span className="bg-blue-950/80 text-blue-200 px-2 py-0.5 rounded-md border border-blue-900/40 font-semibold flex items-center gap-1">
                    📍 {indicator.city} ({indicator.state})
                    <button
                      onClick={() => {
                        setTempCity(indicator.city || "");
                        setTempState(indicator.state || "SP");
                        setIsEditingLocation(true);
                      }}
                      className="text-[10px] text-blue-400 hover:text-white font-bold ml-1 hover:underline"
                    >
                      Alterar
                    </button>
                  </span>
                )}
                {!indicator.city && !isEditingLocation && (
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
                      onUpdateIndicator({
                        ...indicator,
                        city: tempCity,
                        state: tempState,
                      });
                      setIsEditingLocation(false);
                      onAddNotification("Localização de atuação atualizada!", "success");
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
              <p className="text-[10px] text-slate-300 mt-1 font-mono">
                Chave PIX: {indicator.pixKey} ({indicator.pixType.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm self-start md:self-auto">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">
                Saldo Disponível
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                R${" "}
                {indicator.balanceAvailable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-l border-slate-800 h-10 pl-4">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">
                A Receber
              </span>
              <span className="text-sm font-mono font-semibold text-amber-400">
                R$ {indicator.balancePending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {/* Sem isto, tudo que o indicador já recebeu some da tela no
                instante em que o anunciante paga: os dois saldos voltam a zero
                e a pessoa não vê mais nenhum sinal do que ganhou. */}
            <div className="border-l border-slate-800 h-10 pl-4">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">
                Já Recebido
              </span>
              <span className="text-sm font-mono font-semibold text-sky-300">
                R${" "}
                {commissions
                  .filter((c) => c.status === "paid")
                  .reduce((acc, c) => acc + c.amount, 0)
                  .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor slot — top of affiliate dashboard */}
      <div className="mb-6">
        <SponsorSlot variant="card" label="Patrocinadores" />
      </div>

      {/* Dashboard Sub-navigation Tabs */}

      <div className="flex overflow-x-auto scrollbar-none border-b border-slate-200 mb-6 font-display font-medium text-sm [-webkit-overflow-scrolling:touch]">
        <button
          onClick={() => setActiveTab("vitrine")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "vitrine"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Vitrine de Produtos ({filteredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("desempenho")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "desempenho"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Minha Performance ({activeLeads.length} leads)
        </button>
        <button
          onClick={() => setActiveTab("carteira")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "carteira"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Carteira / PIX
        </button>
        <button
          onClick={() => setActiveTab("financiamentos")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "financiamentos"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Simular Financiamentos (
          {simulations?.filter((s) => s.indicatorId === indicator.id).length || 0})
        </button>

        {/* Porta de volta para a Academy. Sem ela, quem concluiu um nicho fica
            preso a ele: o painel substitui a Academy e não há como liberar o
            segundo. Fica na barra, à direita, porque é navegação — não ação.

            Navegação de cliente, não <a href>: link comum recarrega a página
            inteira, o que num app instalado dá tela branca e perde os demais
            parâmetros da URL. */}
        <button
          onClick={() =>
            void navigate({
              to: "/",
              search: (prev: Record<string, unknown>) => ({ ...prev, aba: "academy" }),
            })
          }
          className="ml-auto shrink-0 cursor-pointer whitespace-nowrap border-b-2 border-transparent px-4 pb-3 font-bold text-brand-600 transition-all hover:text-brand-500"
        >
          + Liberar outro nicho
        </button>
      </div>

      {/* Pending Check-in Alerts bar */}
      {scheduledVisits.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="bg-amber-100 text-amber-800 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Visitas Presenciais Pendentes ({scheduledVisits.length})
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Você tem visitas agendadas. Ao chegar à loja com o cliente, use o botão "Cheguei na
                Loja" na tabela de leads abaixo — o anunciante confirma sua presença de lá.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "vitrine" && <VitrineTab ctx={ctx} />}

      {activeTab === "desempenho" && <DesempenhoTab ctx={ctx} />}

      {activeTab === "carteira" && <CarteiraTab ctx={ctx} />}

      {activeTab === "financiamentos" && <FinanciamentosTab ctx={ctx} />}

      {/* MODAL: SUBMIT NEW VEHICLE FINANCING SIMULATION */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative font-sans shadow-2xl max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setShowSimulateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold text-sm"
            >
              ✕
            </button>

            <div className="text-center mb-6 border-b border-slate-100 pb-4">
              <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Intermediação Direta de Financiamento
              </span>
              <h2 className="font-display font-bold text-slate-900 text-xl mt-2">
                Simular Financiamento do Comprador
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Insira os dados cadastrais do comprador do veículo para aprovação de crédito na loja
                parceira.
              </p>
            </div>

            <form onSubmit={handleSimFormSubmit} className="space-y-4">
              {/* Step 1: Vehicle selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-blue-700" />
                  Veículo / Produto Escolhido
                </label>
                <select
                  required
                  value={simFormProductId}
                  onChange={(e) => setSimFormProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                >
                  <option value="" disabled>
                    Selecione o veículo...
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.category.toUpperCase()} • {p.title} (R$ {p.price.toLocaleString("pt-BR")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dados do Comprador (Ficha de Crédito)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nome Completo do Cliente
                    </label>
                    <input
                      type="text"
                      required
                      value={simFormClientName}
                      onChange={(e) => setSimFormClientName(e.target.value)}
                      placeholder="ex: Roberto Alencar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      CPF do Comprador
                    </label>
                    <input
                      type="text"
                      required
                      value={simFormClientCpf}
                      onChange={(e) => setSimFormClientCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      WhatsApp de Contato
                    </label>
                    <input
                      type="text"
                      required
                      value={simFormClientPhone}
                      onChange={(e) => setSimFormClientPhone(e.target.value)}
                      placeholder="(11) 98111-2233"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      required
                      value={simFormClientBirthDate}
                      onChange={(e) => setSimFormClientBirthDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Renda Mensal Comprovada (R$)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={simFormClientIncome}
                      onChange={(e) => setSimFormClientIncome(e.target.value)}
                      placeholder="ex: 12000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor de Entrada Ofertado (R$)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={simFormDownPayment}
                      onChange={(e) => setSimFormDownPayment(e.target.value)}
                      placeholder="ex: 45000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Prazo Desejado (Nº Parcelas)
                    </label>
                    <select
                      value={simFormDesiredInstallments}
                      onChange={(e) => setSimFormDesiredInstallments(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    >
                      <option value={12}>12x parcelas</option>
                      <option value={24}>24x parcelas</option>
                      <option value={36}>36x parcelas</option>
                      <option value={48}>48x parcelas</option>
                      <option value={60}>60x parcelas</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start gap-2.5 mt-2">
                <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-snug">
                  Ao enviar esta simulação de crédito, você autoriza a plataforma a enviar estes
                  dados cadastrais de crédito diretamente ao sistema da loja do veículo. A loja irá
                  realizar a consulta multi-bancos. Seus dados cadastrais estão protegidos pela
                  LGPD.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow shadow-blue-100 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Ficha à Loja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHARE OPTIONS AND KIT ASSET GENERATOR */}
      {sharingProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => {
                setSharingProduct(null);
                setSharingMethod("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-6 border-b border-slate-100 pb-4">
              <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Kit de Divulgação Inteligente
              </span>
              <h2 className="font-display font-bold text-slate-900 text-xl mt-2">
                Pronto para Compartilhar
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sempre divulgue usando seu link pessoal de atribuição.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Tracking link and Native Share buttons */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Seu Link de Atribuição Único
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}//?p=${sharingProduct.id}&ref=${indicator.id}`}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-600 focus:outline-none select-all"
                    />
                    <button
                      onClick={() => handleShareLink(sharingProduct)}
                      className="bg-blue-700 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all shadow shadow-blue-100"
                      title="Copiar Link"
                    >
                      {shareCopied ? (
                        <Check className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-snug">
                    ✓ Visitantes que clicarem neste link terão um cookie de atribuição de 60 dias
                    gravado em seus navegadores.
                  </p>
                </div>

                {/* SOCIAL PLATFORM SELECTOR */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    1. Escolha a Rede Social
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "instagram", label: "Instagram", icon: "📸" },
                      { id: "whatsapp", label: "WhatsApp", icon: "💬" },
                      { id: "facebook", label: "Facebook", icon: "👥" },
                      { id: "tiktok", label: "TikTok", icon: "🎵" },
                      { id: "linkedin", label: "LinkedIn", icon: "💼" },
                    ].map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => {
                          setSelectedSocialPlatform(platform.id as any);
                          // Default placements based on platform
                          if (platform.id === "instagram") setSelectedPlacement("stories");
                          else if (platform.id === "whatsapp") setSelectedPlacement("status");
                          else setSelectedPlacement("feed");
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          selectedSocialPlatform === platform.id
                            ? "border-slate-900 bg-slate-50 ring-2 ring-blue-500 ring-offset-1"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-base">{platform.icon}</span>
                        <span className="text-[9px] font-bold text-slate-700">
                          {platform.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PLACEMENT / FORMAT SELECTOR */}
                {selectedSocialPlatform && (
                  <div className="space-y-2 animate-fade-in">
                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      2. Formato do Anúncio
                    </span>
                    <div className="flex gap-2">
                      {selectedSocialPlatform === "instagram" && (
                        <>
                          {["stories", "feed", "reels"].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setSelectedPlacement(p)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                                selectedPlacement === p
                                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {p === "stories"
                                ? "Stories 📱"
                                : p === "feed"
                                  ? "Feed 🖼️"
                                  : "Reels 🎬"}
                            </button>
                          ))}
                        </>
                      )}

                      {selectedSocialPlatform === "whatsapp" && (
                        <>
                          {["status", "chat"].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setSelectedPlacement(p)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                                selectedPlacement === p
                                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {p === "status" ? "Status 📱" : "Conversa 💬"}
                            </button>
                          ))}
                        </>
                      )}

                      {(selectedSocialPlatform === "facebook" ||
                        selectedSocialPlatform === "linkedin" ||
                        selectedSocialPlatform === "tiktok") && (
                        <div className="w-full text-center py-1.5 px-3 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                          Formato Padrão: Feed / Publicação Linha do Tempo
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP ACTION CHECKLIST */}
                {selectedSocialPlatform &&
                  (() => {
                    const link = `${window.location.origin}/?p=${sharingProduct.id}&ref=${indicator.id}`;
                    let captionText = "";
                    let platformUrl = "";

                    if (selectedSocialPlatform === "whatsapp") {
                      if (selectedPlacement === "status") {
                        captionText = `🚗 Grande Oportunidade! ${sharingProduct.title} por apenas R$ ${sharingProduct.price.toLocaleString("pt-BR")}. Simule parcelas e veja fotos completas no link oficial:\n${link}`;
                      } else {
                        captionText = `Olá! Tudo bem? Veja esse excelente produto que acabei de anunciar: *${sharingProduct.title}* por apenas *R$ ${sharingProduct.price.toLocaleString("pt-BR")}*.\n\nVocê pode ver a ficha técnica completa, todas as fotos e simular seu financiamento na hora por esse link oficial:\n${link}`;
                      }
                      platformUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(captionText)}`;
                    } else if (selectedSocialPlatform === "instagram") {
                      if (selectedPlacement === "stories") {
                        captionText = `Oportunidade Única: ${sharingProduct.title}! R$ ${sharingProduct.price.toLocaleString("pt-BR")}. Toque no sticker de link para ver todas as fotos e simular o crédito!`;
                      } else {
                        captionText = `🚀 EXCELENTE OPORTUNIDADE DE NEGÓCIO! 🚀\n\nConfira este incrível ${sharingProduct.title} por apenas R$ ${sharingProduct.price.toLocaleString("pt-BR")}!\n\n📍 Cidade: ${sharingProduct.location.city} - ${sharingProduct.location.state}\n\nQuer ver mais imagens em alta definição e simular sua aprovação de financiamento 100% online na hora? Acesse o link de indicação oficial na minha bio:\n\n🔗 ${link}\n\nFale comigo para agendar uma visita ou tirar dúvidas!`;
                      }
                      platformUrl = "https://www.instagram.com/";
                    } else if (selectedSocialPlatform === "facebook") {
                      captionText = `📢 ATENÇÃO GRUPO! Veja essa excelente oportunidade de compra:\n\n👉 ${sharingProduct.title}\n💰 Valor: R$ ${sharingProduct.price.toLocaleString("pt-BR")}\n📍 Localização: ${sharingProduct.location.city} - ${sharingProduct.location.state}\n\nFicha técnica, todas as fotos e simulador de aprovação de financiamento na hora pelo link de indicação oficial:\n\n🔗 ${link}\n\nChame no inbox se tiver interesse!`;
                      platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
                    } else if (selectedSocialPlatform === "linkedin") {
                      captionText = `Gostaria de compartilhar uma excelente oportunidade de aquisição no setor: ${sharingProduct.title}.\n\nValor: R$ ${sharingProduct.price.toLocaleString("pt-BR")}.\n\nPara profissionais interessados, a ficha técnica detalhada, as fotos adicionais da galeria e as simulações de financiamento podem ser realizadas através do canal direto:\n\n${link}`;
                      platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
                    } else if (selectedSocialPlatform === "tiktok") {
                      captionText = `Mais detalhes sobre esse maravilhoso ${sharingProduct.title} por R$ ${sharingProduct.price.toLocaleString("pt-BR")} no link oficial da minha bio!`;
                      platformUrl = "https://www.tiktok.com/";
                    }

                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 text-xs text-slate-800 animate-slide-in">
                        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                            Passos de Publicação
                          </span>
                        </div>

                        {/* Step 1: Download Media */}
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            1
                          </div>
                          <div className="flex-1">
                            <span className="block font-bold text-slate-800">
                              Baixar Imagens do Produto
                            </span>
                            <p className="text-[10px] text-slate-500 mb-2">
                              Para criar um post visual marcante com a galeria de fotos.
                            </p>
                            <button
                              type="button"
                              onClick={() => downloadAllImages(sharingProduct.gallery)}
                              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Camera className="w-3 h-3 text-slate-500" /> Baixar todas as{" "}
                              {sharingProduct.gallery.length} fotos
                            </button>
                          </div>
                        </div>

                        {/* Step 2: Copy Commercial Copy */}
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            2
                          </div>
                          <div className="flex-1">
                            <span className="block font-bold text-slate-800">
                              Copiar Legenda Adaptada
                            </span>
                            <p className="text-[10px] text-slate-500">
                              Texto formatado profissionalmente para obter mais cliques.
                            </p>
                            <div className="mt-1.5 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-600 relative overflow-hidden max-h-24 overflow-y-auto">
                              {captionText}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(captionText);
                                onAddNotification(
                                  "Legenda comercial copiada com sucesso!",
                                  "success",
                                );
                              }}
                              className="mt-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Copy className="w-3 h-3 text-slate-500" /> Copiar Legenda
                            </button>
                          </div>
                        </div>

                        {/* Step 3: Open Social App */}
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            3
                          </div>
                          <div className="flex-1">
                            <span className="block font-bold text-slate-800">
                              Postar na Rede Social
                            </span>
                            <p className="text-[10px] text-slate-500 mb-2">
                              Clique para abrir o aplicativo e criar sua publicação.
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                const gallery = sharingProduct.gallery?.length
                                  ? sharingProduct.gallery
                                  : [sharingProduct.coverImage].filter(Boolean);
                                // Web Share Level 2: abre a sheet nativa do dispositivo
                                // já com legenda + link + imagens em carrossel (Instagram
                                // reconhece múltiplas imagens; WhatsApp anexa como mídia).
                                try {
                                  const files: File[] = [];
                                  for (let i = 0; i < gallery.length; i++) {
                                    try {
                                      const res = await fetch(gallery[i], { mode: "cors" });
                                      const blob = await res.blob();
                                      files.push(
                                        new File([blob], `foto-${i + 1}.jpg`, {
                                          type: blob.type || "image/jpeg",
                                        }),
                                      );
                                    } catch {
                                      /* ignora imagem que falhar (CORS) */
                                    }
                                  }
                                  const nav = navigator as Navigator & {
                                    canShare?: (d: ShareData) => boolean;
                                  };
                                  if (
                                    files.length > 0 &&
                                    typeof nav.share === "function" &&
                                    nav.canShare?.({ files })
                                  ) {
                                    await nav.share({
                                      title: sharingProduct.title,
                                      text: captionText,
                                      files,
                                    });
                                    onAddNotification(
                                      `Compartilhando ${files.length} imagem(ns) via ${selectedSocialPlatform}…`,
                                      "success",
                                    );
                                    return;
                                  }
                                } catch {
                                  /* usuário cancelou ou não suportado — cai no fallback */
                                }
                                // Fallback (desktop / navegadores sem Web Share Level 2)
                                try {
                                  await navigator.clipboard.writeText(captionText);
                                } catch {
                                  /* ignore */
                                }
                                window.open(platformUrl, "_blank", "noopener,noreferrer");
                                onAddNotification(
                                  `Legenda copiada. Abrindo ${selectedSocialPlatform.toUpperCase()} — cole o texto e anexe as imagens baixadas.`,
                                  "success",
                                );
                              }}
                              className="inline-flex bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg items-center gap-1 shadow-sm transition-all uppercase tracking-wide animate-bounce"
                            >
                              Abrir {selectedSocialPlatform}{" "}
                              {selectedPlacement ? `(${selectedPlacement})` : ""} 🚀
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>

              {/* Right Column: Visual Poster Generator (Instagram/Story format mockup) */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 text-center">
                    Prévia do Post Personalizado (Kit)
                  </span>

                  {/* Visual card mimicking a premium Instagram Story post */}
                  <div
                    id="promotion-card-preview"
                    className="relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between text-white shadow-xl"
                  >
                    <div className="absolute inset-0 opacity-40">
                      <img
                        src={sharingProduct.coverImage}
                        alt="Promo backdrop"
                        className="w-full h-full object-cover filter blur-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>

                    {/* Top Content */}
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-blue-700 text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full font-mono tracking-widest shadow-sm">
                        Oportunidade
                      </div>
                      <span className="text-[10px] text-slate-300 font-display font-semibold bg-slate-900/60 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
                        IndiqueLeads
                      </span>
                    </div>

                    {/* Center image snippet */}
                    <div className="relative z-10 my-2 rounded-lg overflow-hidden border border-white/10 shadow-lg aspect-video">
                      <img
                        src={sharingProduct.coverImage}
                        alt="Promo focus"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Lower Info */}
                    <div className="relative z-10 space-y-1 text-left">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                        {sharingProduct.advertiserName}
                      </p>
                      <h4 className="font-display font-bold text-sm tracking-tight line-clamp-2">
                        {sharingProduct.title}
                      </h4>

                      <div className="flex items-baseline gap-2 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-400 font-mono">Preço:</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          R$ {sharingProduct.price.toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <p className="text-[8px] text-slate-400 border-t border-white/5 pt-1.5 italic text-center">
                        Indicado por {indicator.name} • Consulte condições
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setDownloadingKit(true);
                    const gallery = sharingProduct.gallery?.length
                      ? sharingProduct.gallery
                      : sharingProduct.coverImage
                        ? [sharingProduct.coverImage]
                        : [];
                    try {
                      // 1) Baixa TODAS as imagens do produto (carrossel) no dispositivo.
                      for (let i = 0; i < gallery.length; i++) {
                        const url = gallery[i];
                        try {
                          const res = await fetch(url, { mode: "cors" });
                          const blob = await res.blob();
                          const objectUrl = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = objectUrl;
                          a.download = `${sharingProduct.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${i + 1}.jpg`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
                        } catch {
                          // fallback: abre em nova aba para o usuário salvar
                          window.open(url, "_blank");
                        }
                      }
                      onAddNotification(
                        `Kit baixado: ${gallery.length} imagem(ns) do carrossel prontas para postar!`,
                        "success",
                      );
                    } finally {
                      setDownloadingKit(false);
                    }
                  }}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 self-center"
                >
                  {downloadingKit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Baixando Kit...
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      Baixar Arte Kit (Feed/Stories)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PHYSICAL CHECK-IN SIMULATOR */}

      {/* MODAL: WHATSAPP NOTIFICATION FOR ADVERTISER */}
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
                Notificar Anunciante via WhatsApp
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Uma mensagem contendo todos os dados do financiamento e o link de acesso foi gerada
                para você enviar diretamente via WhatsApp.
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
                  const cleanedPhone = whatsAppNotificationData.advertiserPhone.replace(/\D/g, "");
                  const phoneWithCountry =
                    cleanedPhone.length === 10 || cleanedPhone.length === 11
                      ? "55" + cleanedPhone
                      : cleanedPhone;
                  const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsAppNotificationData.text)}`;
                  window.open(url, "_blank");
                  setWhatsAppNotificationData(null);
                  onAddNotification("Mensagem enviada ou direcionada para o WhatsApp!", "success");
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" /> Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
