import { useState, FormEvent } from "react";
import { useTabParam } from "@/hooks/useTabParam";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldAlert,
  Settings,
  TrendingUp,
  AlertTriangle,
  ListFilter,
  Play,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Users,
  FileText,
  UserPlus,
  Loader2,
} from "lucide-react";
import { createAdminUser } from "@/lib/admin-users.functions";
import {
  Product,
  Advertiser,
  Indicator,
  Lead,
  Category,
  PlatformConfig,
  Commission,
  FinancingSimulation,
} from "../types";
import { VERTICALS, VERTICALS_ORDER } from "../lib/verticals";
import { useApplications, useReviewApplication } from "@/hooks/queries";
import PushCenter from "./admin/PushCenter";

interface AdminPanelProps {
  products: Product[];
  onUpdateProductStatus: (productId: string, status: any) => void;
  advertisers: Advertiser[];
  indicators: Indicator[];
  leads: Lead[];
  /** Ledger completo — fonte de verdade financeira da plataforma. */
  commissions: Commission[];
  simulations: FinancingSimulation[];
  platformConfig: PlatformConfig;
  onUpdatePlatformConfig: (config: PlatformConfig) => void;
  categories: Array<{ id: Category | string; name: string; icon: string; fields: string[] }>;
  onAddCategory: (cat: { id: string; name: string; icon: string; fields: string[] }) => void;
  onAddNotification: (msg: string, type: "success" | "info") => void;
  /** Admin logado — destino do envio de teste na central de mensagens. */
  adminUserId: string;
}

export default function AdminPanel({
  products,
  onUpdateProductStatus,
  advertisers,
  indicators,
  leads,
  commissions,
  simulations,
  platformConfig,
  onUpdatePlatformConfig,
  categories,
  onAddCategory,
  onAddNotification,
  adminUserId,
}: AdminPanelProps) {
  // Navigation
  const [activeTab, setActiveTab] = useTabParam(
    [
      "geral",
      "candidaturas",
      "mensagens",
      "financeiro",
      "categorias",
      "verticais",
      "fraudes",
      "taxas",
      "admins",
    ] as const,
    "geral",
  );

  // Criação de novos administradores
  const createAdminFn = useServerFn(createAdminUser);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminFormError, setAdminFormError] = useState<string | null>(null);

  // Dynamic Category Form
  const [newCatId, setNewCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatFields, setNewCatFields] = useState("");

  // Candidaturas a indicador
  const applicationsQuery = useApplications(true);
  const reviewApplication = useReviewApplication();
  const applications = applicationsQuery.data ?? [];
  const pendingApplications = applications.filter((a) => a.status === "em_analise").length;
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Local config edits
  const [configEdit, setConfigEdit] = useState({ ...platformConfig });

  // ---- Financeiro da plataforma, lido do ledger (não estimado) ----
  // Antes estes números eram derivados de heurísticas (commissionValue * 20,
  // advertisers.length * 199). Agora saem de `commissions`, que é o registro
  // real de cada evento de comissão.
  const sum = (list: Commission[]) => list.reduce((acc, c) => acc + c.amount, 0);
  const commissionsPaid = sum(commissions.filter((c) => c.status === "paid"));
  const commissionsAvailable = sum(commissions.filter((c) => c.status === "available"));
  const commissionsPending = sum(commissions.filter((c) => c.status === "pending"));
  const commissionsTotal = commissionsPaid + commissionsAvailable + commissionsPending;
  const commissionsByKind = {
    lead: sum(commissions.filter((c) => c.kind === "lead")),
    venda: sum(commissions.filter((c) => c.kind === "venda" && !c.simulationId)),
    financiamento: sum(commissions.filter((c) => !!c.simulationId)),
  };

  // Volume: preço dos bens efetivamente vendidos.
  const totalVolume = products
    .filter((p) => p.status === "vendido")
    .reduce((acc, p) => acc + p.price, 0);

  // Receita da plataforma: spread sobre a comissão + taxa por lead + planos.
  const platformAccruedFees = commissionsTotal * (platformConfig.feePercent / 100);
  const totalLeadsChargedFee = leads.length * platformConfig.feePerLead;
  const planIncomes = advertisers.length * 199.0; // média de plano — ainda estimado
  const totalRevenue = platformAccruedFees + totalLeadsChargedFee + planIncomes;

  const handleSaveConfig = (e: FormEvent) => {
    e.preventDefault();
    onUpdatePlatformConfig(configEdit);
    onAddNotification("Configurações de taxas e comissões atualizadas!", "success");
  };

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) {
      onAddNotification("Insira um ID e Nome válidos para a categoria.", "info");
      return;
    }

    const fieldsArr = newCatFields
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    onAddCategory({
      id: newCatId.toLowerCase(),
      name: newCatName,
      icon: newCatIcon,
      fields: fieldsArr.length > 0 ? fieldsArr : ["Ano", "Modelo", "Observações"],
    });

    onAddNotification(
      `Nova vertical "${newCatName}" criada com sucesso no sistema dinâmico!`,
      "success",
    );
    setNewCatId("");
    setNewCatName("");
    setNewCatIcon("📦");
    setNewCatFields("");
  };

  // Mock Fraud & Auditing center alerts
  const mockFraudAlerts = [
    {
      id: "alert-1",
      indicatorName: "Gabriel Martins",
      type: "Anomalia de Cliques",
      severity: "alta",
      time: "Há 5 minutos",
      description:
        "Acúmulo de 340 cliques em intervalo de 3 segundos no link Cobertura Duplex. Padrão de script ou robot de indexação de redes sociais detectado.",
    },
    {
      id: "alert-2",
      indicatorName: "Juliana Silva",
      type: "Divergência de IP em Lead",
      severity: "media",
      time: "Há 25 minutos",
      description:
        "O lead da Porsche GTS chegou de um IP associado a mais de 12 leads diferentes na última hora, sem relação com o histórico de cliques do indicador.",
    },
    {
      id: "alert-3",
      indicatorName: "Roberto Alencar",
      type: "Múltiplos Clones de IP",
      severity: "baixa",
      time: "Há 2 horas",
      description:
        "Mesmo IP simulando geração de 3 leads em menos de 10 minutos para o anúncio Sea-Doo.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white mb-8 shadow-xl border border-blue-950/20">
        <div className="flex items-center gap-4">
          <div className="bg-red-600/20 text-red-400 p-3 rounded-2xl border border-red-500/30">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Central Administrativa</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Controle global de regras comerciais, fraudes e novas categorias.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Submenu */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-slate-200 mb-6 font-display font-medium text-sm [-webkit-overflow-scrolling:touch]">
        <button
          onClick={() => setActiveTab("geral")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "geral"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Visão Geral & Métricas
        </button>
        <button
          onClick={() => setActiveTab("categorias")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "categorias"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Campos Dinâmicos (Verticais)
        </button>
        <button
          onClick={() => setActiveTab("candidaturas")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "candidaturas"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Candidaturas{pendingApplications > 0 ? ` (${pendingApplications})` : ""}
        </button>
        <button
          onClick={() => setActiveTab("mensagens")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "mensagens"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Mensagens Push
        </button>
        <button
          onClick={() => setActiveTab("financeiro")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "financeiro"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Financeiro / Ledger ({commissions.length})
        </button>
        <button
          onClick={() => setActiveTab("fraudes")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "fraudes"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Auditoria de Fraudes ({mockFraudAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab("taxas")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "taxas"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Taxas & Comissões
        </button>
        <button
          onClick={() => setActiveTab("verticais")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "verticais"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Verticais
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`pb-3 px-4 shrink-0 whitespace-nowrap border-b-2 transition-all ${
            activeTab === "admins"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Administradores
        </button>
      </div>

      {/* VIEW: VERTICAIS METRICS */}
      {activeTab === "verticais" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Desempenho por Vertical</h3>
            <p className="text-xs text-slate-500 mb-4">
              Anúncios ativos, leads gerados e conversão em cada vertical cadastrada.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-3">Vertical</th>
                    <th className="py-2 pr-3">Anúncios ativos</th>
                    <th className="py-2 pr-3">Leads</th>
                    <th className="py-2 pr-3">Vendas / Concluídos</th>
                    <th className="py-2 pr-3">Conversão</th>
                    <th className="py-2 pr-3">Modelo</th>
                    <th className="py-2 pr-3">Funil</th>
                  </tr>
                </thead>
                <tbody>
                  {VERTICALS_ORDER.map((catId) => {
                    const v = VERTICALS[catId];
                    const prodsAtivos = products.filter(
                      (p) => p.category === catId && p.status === "ativo",
                    ).length;
                    const leadsCat = leads.filter((l) => l.productCategory === catId);
                    const finalStatuses = new Set([
                      "venda_concluida",
                      "tratamento_iniciado",
                      "contrato_assinado",
                      "matricula_efetivada",
                      "pacote_fechado",
                      "apolice_emitida",
                      "contrato_franquia",
                      "locacao_assinada",
                    ]);
                    const concluidos = leadsCat.filter((l) => finalStatuses.has(l.status)).length;
                    const conv = leadsCat.length
                      ? ((concluidos / leadsCat.length) * 100).toFixed(1) + "%"
                      : "—";
                    return (
                      <tr key={catId} className="border-b border-slate-50 hover:bg-slate-50/60">
                        <td className="py-2 pr-3 font-semibold text-slate-800">
                          <span className="mr-1.5">{v.emoji}</span>
                          {v.shortLabel}
                        </td>
                        <td className="py-2 pr-3">{prodsAtivos}</td>
                        <td className="py-2 pr-3">{leadsCat.length}</td>
                        <td className="py-2 pr-3">{concluidos}</td>
                        <td className="py-2 pr-3 font-mono text-xs">{conv}</td>
                        <td className="py-2 pr-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                            {v.commissionModel === "recorrente"
                              ? "Recorrente"
                              : v.commissionModel === "digital"
                                ? "Digital"
                                : "Pres.+Digital"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-[11px] text-slate-500">
                          {v.statusFlow.length} etapas
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VERTICALS_ORDER.map((catId) => {
              const v = VERTICALS[catId];
              return (
                <div
                  key={catId}
                  className={`bg-gradient-to-br ${v.gradient} rounded-2xl border border-slate-100 p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-500 uppercase">{catId}</div>
                      <div className="text-lg font-bold text-slate-900">
                        {v.emoji} {v.label}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-white/70 border border-slate-200 rounded-full px-2 py-0.5 text-slate-700">
                      {v.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2">{v.description}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                    <div className="bg-white/70 rounded-lg p-2 border border-slate-100">
                      <div className="text-slate-500">Ticket médio</div>
                      <div className="font-semibold text-slate-900">{v.averageValue}</div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2 border border-slate-100">
                      <div className="text-slate-500">Comissão</div>
                      <div className="font-semibold text-emerald-700">{v.avgCommission}</div>
                    </div>
                  </div>
                  {v.disclaimer && (
                    <div className="text-[10px] mt-2 bg-amber-100/70 border border-amber-200 rounded p-2 text-amber-900">
                      ⚠️ {v.disclaimer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: CONSOLIDATED METRICS */}
      {activeTab === "geral" && (
        <div className="space-y-6">
          {/* Key metrics blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Volume de Vendas (GMV)
              </span>
              <span className="text-xl font-mono font-bold text-slate-900 mt-1 block">
                R$ {totalVolume.toLocaleString("pt-BR")}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                Volume total negociado na rede
              </p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Receita da Plataforma
              </span>
              <span className="text-xl font-mono font-bold text-emerald-600 mt-1 block">
                R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                Spread de comissão + taxas lead + mensalidades
              </p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Anunciantes Cadastrados
              </span>
              <span className="text-xl font-mono font-bold text-blue-700 mt-1 block">
                {advertisers.length} Contas
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                Imobiliárias, lojas e concessionárias PJ
              </p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Indicadores Autônomos
              </span>
              <span className="text-xl font-mono font-bold text-blue-700 mt-1 block">
                {indicators.filter((i) => i.name).length} Contas
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                Parceiros com termos vigentes
              </p>
            </div>
          </div>

          {/* Pending catalog moderation queue */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-red-600" />
              Moderação de Anúncios de Bens
            </h3>
            <p className="text-xs text-slate-500">
              Aprovação comercial ou suspensão preventiva de novos carros/imóveis cadastrados por
              anunciantes.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[9px] bg-slate-50 tracking-wider">
                    <th className="py-2.5 px-4">Anunciante</th>
                    <th className="py-2.5 px-4">Anúncio</th>
                    <th className="py-2.5 px-4">Valor</th>
                    <th className="py-2.5 px-4">Localização</th>
                    <th className="py-2.5 px-4">Status Moderação</th>
                    <th className="py-2.5 px-4 text-right">Ações de Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {prod.advertiserName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold block text-slate-900">{prod.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono capitalize">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        R$ {prod.price.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        {prod.location.city} - {prod.location.state}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            prod.status === "ativo"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            onUpdateProductStatus(prod.id, "ativo");
                            onAddNotification(
                              "Anúncio auditado e aprovado com sucesso!",
                              "success",
                            );
                          }}
                          className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => {
                            onUpdateProductStatus(prod.id, "pausado");
                            onAddNotification(
                              "Anúncio pausado preventivamente para verificação.",
                              "info",
                            );
                          }}
                          className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                        >
                          Suspender
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DYNAMIC CATEGORIES CREATOR */}
      {activeTab === "categorias" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-1 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-red-600" />
              Adicionar Nova Vertical
            </h3>
            <p className="text-xs text-slate-500">
              Insira as configurações básicas para criar uma nova vertical de dados que os
              anunciantes podem usar no catálogo sem deploy.
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  ID (Slug do Banco)
                </label>
                <input
                  type="text"
                  required
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  placeholder="ex: aeronave ou caminhao"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nome Exibição
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="ex: Aeronaves Privadas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Emoji / Ícone
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="🛩️"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Taxa Mínima Padronizada
                  </label>
                  <div className="bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-700 rounded-xl">
                    R$ 1.500
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Atributos JSONB Dinâmicos (Vírgulas)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newCatFields}
                  onChange={(e) => setNewCatFields(e.target.value)}
                  placeholder="ex: fabricante, horas_voo, turbinas, autonomia_km"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 leading-tight block mt-1">
                  ✓ O formulário de novos produtos gerará estes campos de dados dinamicamente no
                  onboarding.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Registrar Vertical Dinâmica
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm">
              Estruturas de Atributos de Verticais Ativas
            </h3>
            <p className="text-xs text-slate-500">
              Estas são as verticais ativas gerenciadas pelo core de comissionamento.
            </p>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-slate-100 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span>
                        {cat.name}{" "}
                        <span className="text-slate-400 text-xs font-normal">({cat.id})</span>
                      </span>
                    </span>
                    <span className="text-[9px] bg-blue-50 text-blue-800 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">
                      {cat.fields.length} Campos
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.fields.map((f, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 font-mono"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SUSPICIOUS FRAUDS */}
      {activeTab === "candidaturas" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-base">
              Credenciamento de indicadores
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              São bens de alto valor: cada candidatura é avaliada por uma pessoa. Aprovar libera o
              acesso à Academy — a vitrine só abre depois dos módulos concluídos.
            </p>
          </div>

          {applications.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-10">
              Nenhuma candidatura recebida ainda.
            </p>
          )}

          <div className="space-y-3">
            {applications.map((a) => (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 ${
                  a.status === "em_analise"
                    ? "border-amber-200 bg-amber-50/50"
                    : a.status === "aprovado"
                      ? "border-emerald-100 bg-emerald-50/40"
                      : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{a.fullName}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          a.status === "aprovado"
                            ? "bg-emerald-100 text-emerald-700"
                            : a.status === "rejeitado"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {a.status === "em_analise" ? "em análise" : a.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      CPF {a.cpf} • {a.phone} • {a.email}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {a.addressCity}/{a.addressState}
                      {a.occupation ? ` • ${a.occupation}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.interestCategories.map((cat) => (
                        <span
                          key={cat}
                          className="bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        >
                          {VERTICALS[cat]?.emoji} {VERTICALS[cat]?.shortLabel ?? cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                {(a.experience || a.motivation) && (
                  <div className="mt-3 space-y-1.5 border-t border-slate-200/60 pt-3">
                    {a.experience && (
                      <p className="text-[11px] text-slate-600">
                        <strong className="text-slate-800">Experiência:</strong> {a.experience}
                      </p>
                    )}
                    {a.motivation && (
                      <p className="text-[11px] text-slate-600">
                        <strong className="text-slate-800">Motivação:</strong> {a.motivation}
                      </p>
                    )}
                  </div>
                )}

                {a.status === "em_analise" && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <input
                      value={reviewNotes[a.id] ?? ""}
                      onChange={(e) => setReviewNotes((n) => ({ ...n, [a.id]: e.target.value }))}
                      placeholder="Observação (obrigatória ao rejeitar)"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      onClick={() =>
                        reviewApplication.mutate(
                          { id: a.id, approve: true, notes: reviewNotes[a.id] },
                          {
                            onSuccess: () =>
                              onAddNotification(`${a.fullName} aprovado(a)!`, "success"),
                            onError: (e) =>
                              onAddNotification(
                                e instanceof Error ? e.message : "Não foi possível aprovar.",
                                "info",
                              ),
                          },
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => {
                        const notes = (reviewNotes[a.id] ?? "").trim();
                        if (!notes) {
                          onAddNotification(
                            "Escreva o motivo — o candidato recebe essa mensagem.",
                            "info",
                          );
                          return;
                        }
                        reviewApplication.mutate(
                          { id: a.id, approve: false, notes },
                          {
                            onSuccess: () => onAddNotification("Candidatura recusada.", "info"),
                            onError: (e) =>
                              onAddNotification(
                                e instanceof Error ? e.message : "Não foi possível recusar.",
                                "info",
                              ),
                          },
                        );
                      }}
                      className="border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                    >
                      Recusar
                    </button>
                  </div>
                )}

                {a.reviewNotes && a.status !== "em_analise" && (
                  <p className="mt-2 text-[11px] text-slate-500 italic">"{a.reviewNotes}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "mensagens" && (
        <PushCenter
          indicators={indicators}
          advertisers={advertisers}
          onAddNotification={onAddNotification}
          adminUserId={adminUserId}
        />
      )}

      {activeTab === "financeiro" && (
        <div className="space-y-6">
          {/* Totais do ledger */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Comissão total gerada",
                value: commissionsTotal,
                hint: "todos os eventos do ledger",
                cls: "bg-slate-900 text-white border-slate-800",
              },
              {
                label: "Já pago aos indicadores",
                value: commissionsPaid,
                hint: "repasses confirmados",
                cls: "bg-emerald-50 text-emerald-900 border-emerald-200",
              },
              {
                label: "Liberado, a pagar",
                value: commissionsAvailable,
                hint: "obrigação em aberto dos anunciantes",
                cls: "bg-amber-50 text-amber-900 border-amber-200",
              },
              {
                label: "Pendente de confirmação",
                value: commissionsPending,
                hint: "aguarda anunciante confirmar",
                cls: "bg-slate-50 text-slate-800 border-slate-200",
              },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl border p-4 ${c.cls}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {c.label}
                </span>
                <span className="block font-mono font-black text-xl mt-1">
                  R$ {c.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="block text-[10px] opacity-60 mt-0.5">{c.hint}</span>
              </div>
            ))}
          </div>

          {/* Composição por modelo de comissão */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-base">
              Composição por modelo de comissão
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Quanto cada trilha de remuneração representa no total distribuído.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { k: "Indicação (lead)", v: commissionsByKind.lead, color: "bg-blue-600" },
                { k: "Venda direta", v: commissionsByKind.venda, color: "bg-emerald-600" },
                {
                  k: "Financiamento",
                  v: commissionsByKind.financiamento,
                  color: "bg-brand-500",
                },
              ].map((row) => {
                const pct = commissionsTotal > 0 ? (row.v / commissionsTotal) * 100 : 0;
                return (
                  <div key={row.k} className="rounded-2xl border border-slate-100 p-4">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      {row.k}
                    </span>
                    <span className="block font-mono font-bold text-slate-900 text-lg mt-1">
                      R$ {row.v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {pct.toFixed(1)}% do total
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ledger completo */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-base">
              Ledger de comissões ({commissions.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Cada linha é um evento imutável, escrito por trigger do banco — nenhuma tela cria ou
              edita comissão diretamente.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 pr-4">Data</th>
                    <th className="py-2.5 pr-4">Indicador</th>
                    <th className="py-2.5 pr-4">Origem</th>
                    <th className="py-2.5 pr-4">Negócio</th>
                    <th className="py-2.5 pr-4 text-right">Valor</th>
                    <th className="py-2.5 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {commissions.map((c) => {
                    const ind = indicators.find((i) => i.id === c.indicatorId);
                    const lead = c.leadId ? leads.find((l) => l.id === c.leadId) : undefined;
                    const sim = c.simulationId
                      ? simulations.find((x) => x.id === c.simulationId)
                      : undefined;
                    const origem = sim
                      ? "Financiamento"
                      : c.kind === "lead"
                        ? "Indicação"
                        : "Venda";
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 pr-4 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-2.5 pr-4 font-semibold text-slate-800">
                          {ind?.name ?? c.indicatorId.slice(0, 8)}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                            {origem}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-600 max-w-[16rem] truncate">
                          {lead?.productTitle ?? sim?.productTitle ?? "—"}
                          {(lead?.clientName ?? sim?.clientName) &&
                            ` • ${lead?.clientName ?? sim?.clientName}`}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          R$ {c.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              c.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : c.status === "available"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-slate-50 text-slate-500 border border-slate-100"
                            }`}
                          >
                            {c.status === "paid"
                              ? "pago"
                              : c.status === "available"
                                ? "a pagar"
                                : "pendente"}
                          </span>
                          {c.paymentReference && (
                            <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                              {c.paymentReference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {commissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                        Nenhuma comissão registrada na plataforma ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mesa de financiamentos — visão global */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-base">
              Simulações de financiamento ({simulations.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Fluxo paralelo ao de leads — hoje também gera comissão de venda ao concluir.
            </p>
            <div className="space-y-2">
              {simulations.map((sim) => (
                <div
                  key={sim.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {sim.productTitle} • {sim.clientName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Indicador: {sim.indicatorName || "—"}
                      {sim.approvedContract ? ` • ${sim.approvedContract.bankName}` : ""}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${
                      sim.status === "concluido"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : sim.status === "rejeitado"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {sim.status}
                  </span>
                </div>
              ))}
              {simulations.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">
                  Nenhuma simulação registrada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "fraudes" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Auditoria de Fraudes
              </h3>
              <p className="text-xs text-slate-500">
                Alertas em tempo real gerados pelo sistema de cookies de atribuição e por
                divergências de cliques/IP.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {mockFraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border border-slate-150 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-all flex flex-col sm:flex-row justify-between items-start gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                        alert.severity === "alta"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "media"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      Risco {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-display">
                      {alert.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">• {alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {alert.description}
                  </p>
                  <p className="text-[10px] text-blue-700 font-semibold font-mono">
                    Indicador Envolvido: {alert.indicatorName}
                  </p>
                </div>

                <div className="flex gap-1.5 sm:self-center">
                  <button
                    onClick={() => {
                      onAddNotification(
                        `Investigação aberta para o log de ${alert.indicatorName}.`,
                        "info",
                      );
                    }}
                    className="bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-[10px] font-bold hover:bg-slate-100"
                  >
                    Investigar
                  </button>
                  <button
                    onClick={() => {
                      onAddNotification(
                        `Indicador ${alert.indicatorName} foi suspenso temporariamente por fraude flagrante.`,
                        "success",
                      );
                    }}
                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white py-1.5 px-3 rounded-lg text-[10px] font-bold"
                  >
                    Bloquear Conta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PARAMETERS AND FEES */}
      {activeTab === "taxas" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm max-w-xl">
          <h3 className="font-display font-bold text-slate-900 text-sm mb-4">
            Parâmetros Gerais de Rentabilidade
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-4 font-sans text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Spread de Comissão (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={configEdit.feePercent}
                  onChange={(e) =>
                    setConfigEdit({ ...configEdit, feePercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Taxa cobrada da comissão do indicador no saque.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Custo por Lead Ativo (R$)
                </label>
                <input
                  type="number"
                  required
                  value={configEdit.feePerLead}
                  onChange={(e) =>
                    setConfigEdit({ ...configEdit, feePerLead: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Valor fixo faturado do anunciante por lead de interesse gerado.
                </span>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Teto Mensal de Comissão por Lead / Indicador (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={configEdit.maxLeadCommissionPerIndicatorMonth ?? ""}
                  placeholder="Sem teto"
                  onChange={(e) =>
                    setConfigEdit({
                      ...configEdit,
                      maxLeadCommissionPerIndicatorMonth:
                        e.target.value === "" ? null : parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Freio de emergência contra abuso da comissão por lead. Deixe em branco para não
                  aplicar teto.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow"
            >
              Gravar Alterações de Parâmetros
            </button>
          </form>
        </div>
      )}

      {activeTab === "admins" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-blue-700" />
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Criar Novo Administrador
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            O usuário será criado já confirmado e receberá permissão total de administrador. Somente
            administradores podem executar esta ação.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAdminFormError(null);
              setCreatingAdmin(true);
              try {
                await createAdminFn({
                  data: {
                    fullName: newAdminName.trim(),
                    email: newAdminEmail.trim().toLowerCase(),
                    password: newAdminPassword,
                  },
                });
                onAddNotification(`Administrador ${newAdminEmail} criado com sucesso!`, "success");
                setNewAdminName("");
                setNewAdminEmail("");
                setNewAdminPassword("");
              } catch (err) {
                setAdminFormError(
                  err instanceof Error ? err.message : "Falha ao criar administrador.",
                );
              } finally {
                setCreatingAdmin(false);
              }
            }}
            className="space-y-3 font-sans text-slate-700"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nome completo
              </label>
              <input
                type="text"
                required
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900"
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900"
                placeholder="admin@empresa.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Senha temporária
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {adminFormError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
                {adminFormError}
              </div>
            )}

            <button
              type="submit"
              disabled={creatingAdmin}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition-all shadow"
            >
              {creatingAdmin && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Administrador
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
