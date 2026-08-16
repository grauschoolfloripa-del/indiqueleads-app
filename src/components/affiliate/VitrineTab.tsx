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

/** Aba `vitrine` do painel do indicador. JSX movido sem alteração. */
export default function VitrineTab({ ctx }: { ctx: AffiliateCtx }) {
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* Sidebar filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5 lg:col-span-1">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-700" />
            Filtros de Busca
          </span>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setCityFilter("");
              setMinCommission(0);
              setOnlyPresencial(false);
            }}
            className="text-xs text-slate-400 hover:text-blue-700 font-medium"
          >
            Limpar
          </button>
        </div>

        {/* Verticals Icon Filter (dinâmico via VERTICALS) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
            Categoria (Vertical)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`py-2 px-1 rounded-xl border text-xs font-medium text-center transition-all ${
                selectedCategory === "all"
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Todas
            </button>
            {VERTICALS_ORDER.map((catId) => {
              const v = VERTICALS[catId];
              const active = selectedCategory === catId;
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className={`py-2 px-1 rounded-xl border text-xs font-medium text-center transition-all ${
                    active
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  title={v.label}
                >
                  <span className="mr-1">{v.emoji}</span>
                  {v.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* City location filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Cidade
          </label>
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="ex: São Paulo"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Min commission value */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Comissão Mínima (R$)
          </label>
          <select
            value={minCommission}
            onChange={(e) => setMinCommission(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={0}>Qualquer Valor</option>
            <option value={500}>Acima de R$ 500</option>
            <option value={1000}>Acima de R$ 1.000</option>
            <option value={5000}>Acima de R$ 5.000</option>
            <option value={20000}>Acima de R$ 20.000</option>
          </select>
        </div>

        {/* Toggle Only Presencial Tier */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <input
            type="checkbox"
            id="only_presencial"
            checked={onlyPresencial}
            onChange={(e) => setOnlyPresencial(e.target.checked)}
            className="w-4 h-4 text-blue-700 rounded border-slate-300 focus:ring-blue-500"
          />
          <label
            htmlFor="only_presencial"
            className="text-xs text-slate-600 select-none font-semibold"
          >
            Permitir Acompanhamento Presencial (Comissão Maior)
          </label>
        </div>

        {/* Toggle My Region */}
        {indicator.city && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="filter_my_region"
              checked={filterByMyRegion}
              onChange={(e) => setFilterByMyRegion(e.target.checked)}
              className="w-4 h-4 text-blue-700 rounded border-slate-300 focus:ring-blue-500"
            />
            <label
              htmlFor="filter_my_region"
              className="text-xs text-slate-600 select-none font-semibold flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              Filtrar por Minha Região ({indicator.city})
            </label>
          </div>
        )}
      </div>

      {/* Product grid list */}
      <div className="lg:col-span-3 space-y-4">
        {(() => {
          const userCityClean = (indicator.city || "").trim().toLowerCase();
          const userStateClean = (indicator.state || "").trim().toLowerCase();

          const regionalHighlights = products.filter((prod) => {
            if (prod.status !== "ativo" && prod.status !== "reservado") return false;
            const prodCity = prod.location.city.toLowerCase().trim();
            const prodState = prod.location.state.toLowerCase().trim();

            const cityMatch = userCityClean && prodCity.includes(userCityClean);
            const stateMatch = userStateClean && prodState === userStateClean;
            return cityMatch || stateMatch;
          });

          const sortedRegionalHighlights = [...regionalHighlights]
            .sort((a, b) => {
              const aCityMatch =
                userCityClean && a.location.city.toLowerCase().includes(userCityClean) ? 1 : 0;
              const bCityMatch =
                userCityClean && b.location.city.toLowerCase().includes(userCityClean) ? 1 : 0;
              return bCityMatch - aCityMatch;
            })
            .slice(0, 3);

          if (!indicator.city) return null;

          return (
            <div className="bg-gradient-to-br from-blue-50 to-amber-50 rounded-3xl p-5 border border-blue-200/60 shadow-xs mb-6">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                    <MapPin className="w-5 h-5 text-blue-700 relative" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      Novidades na Sua Região{" "}
                      <span className="text-blue-700 font-extrabold font-mono text-xs bg-blue-100 px-2.5 py-0.5 rounded-full uppercase">
                        {indicator.city} - {indicator.state}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Identificamos {regionalHighlights.length} produtos em toda a sua localidade e
                      categorias associadas.
                    </p>
                  </div>
                </div>
              </div>

              {sortedRegionalHighlights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sortedRegionalHighlights.map((prod) => {
                    const bestComm =
                      prod.allowPresencialTier && prod.commissionPresencialValue
                        ? prod.commissionPresencialValue
                        : prod.commissionDigitalValue || 0;

                    return (
                      <div
                        key={`highlight-${prod.id}`}
                        className="bg-white rounded-2xl p-3 border border-blue-100 hover:border-blue-200/80 shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-2">
                            <img
                              src={prod.coverImage}
                              alt={prod.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-1.5 left-1.5 bg-blue-700 text-white px-2 py-0.5 rounded-md text-[8px] font-bold font-mono uppercase">
                              {prod.category}
                            </div>
                            <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur-xs rounded px-1.5 py-0.5 text-[8px] font-bold text-slate-200 flex items-center gap-0.5">
                              <MapPin className="w-2 h-2 text-red-400" />
                              <span>{prod.location.city}</span>
                            </div>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 line-clamp-1 leading-tight">
                            {prod.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {prod.advertiserName}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase block font-bold leading-none">
                              Comissão
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-600 leading-none">
                              R$ {bestComm.toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {onViewProduct && (
                              <button
                                onClick={() => onViewProduct(prod.id)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1"
                                title="Ver Detalhes"
                              >
                                <Eye className="w-3 h-3" /> Detalhes
                              </button>
                            )}
                            <button
                              onClick={() => setSharingProduct(prod)}
                              className="bg-blue-700 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Share2 className="w-2.5 h-2.5" /> Indicar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/80 rounded-2xl p-4 border border-blue-100 text-center">
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    💡{" "}
                    <strong className="font-semibold text-blue-950">
                      Sabedoria de Profissional:
                    </strong>{" "}
                    Não há ofertas ativas em {indicator.city} atualmente, mas você pode indicar e
                    simular produtos de qualquer região do Brasil para ganhar comissões agora mesmo!
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {filteredProducts.length === 0 ? (
          <div className="text-center bg-white p-12 border border-slate-150 rounded-3xl">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 text-base">
              Nenhum produto ativo encontrado
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tente afrouxar os filtros de busca para visualizar mais opções.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((prod) => {
              const digitalComm = prod.commissionDigitalValue || 0;
              const presencialComm = prod.commissionPresencialValue || 0;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={prod.coverImage}
                      alt={prod.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-sm">
                      {verticalBadge(prod.category)}
                    </div>
                    {prod.status === "reservado" && (
                      <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                        <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
                          RESERVADO
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm rounded-lg py-1 px-2.5 text-xs font-semibold text-slate-200 border border-white/5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>
                        {prod.location.city} - {prod.location.state}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-blue-700 font-bold tracking-wider uppercase font-mono">
                        {prod.advertiserName}
                      </span>
                      <h3 className="font-display font-bold text-slate-900 text-base leading-tight mt-0.5 line-clamp-1">
                        {prod.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.description}</p>

                      <div className="mt-3 font-mono">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Valor de Venda
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          R$ {prod.price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    {/* Commissions Tiers detail */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                          Digital (Indicação)
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-800">
                          R$ {digitalComm.toLocaleString("pt-BR")}{" "}
                          <span className="text-[9px] font-normal text-slate-500">
                            ({prod.commissionDigitalPct}%)
                          </span>
                        </span>
                      </div>
                      <div className="border-l border-slate-200 pl-2">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                          Presencial (Acompanha)
                        </span>
                        <span
                          className={`text-xs font-mono font-bold ${prod.allowPresencialTier ? "text-emerald-700" : "text-slate-400"}`}
                        >
                          {prod.allowPresencialTier ? (
                            <>
                              R$ {presencialComm.toLocaleString("pt-BR")}{" "}
                              <span className="text-[9px] font-normal text-slate-500">
                                ({prod.commissionPresencialPct}%)
                              </span>
                            </>
                          ) : (
                            "Não permitido"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Primary Call to Action */}
                    <div className="mt-4 flex gap-2">
                      {onViewProduct && (
                        <button
                          onClick={() => onViewProduct(prod.id)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          Ver Detalhes
                        </button>
                      )}
                      <button
                        onClick={() => setSharingProduct(prod)}
                        className="flex-1 bg-blue-700 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 shadow-blue-100"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Obter Link
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
