import { useState, FormEvent, UIEvent } from "react";
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

interface AffiliateDashboardProps {
  indicator: Indicator;
  onUpdateIndicator: (updated: Indicator) => void;
  products: Product[];
  leads: Lead[];
  simulations: FinancingSimulation[];
  /** Ledger de comissões do indicador — fonte de verdade dos ganhos. */
  commissions: Commission[];
  onAddSimulation: (
    sim: Omit<FinancingSimulation, "id" | "createdAt" | "updatedAt" | "status">,
  ) => void;
  onUpdateLeadStatus: (
    leadId: string,
    status: any,
    extra?: { visitDate?: string; notes?: string; checkInRequested?: boolean },
  ) => void;
  /** "Cheguei na Loja" — sinaliza chegada; só o anunciante confirma a visita. */
  onRequestCheckIn: (leadId: string) => void;
  onAddNotification: (msg: string, type: "success" | "info") => void;
  advertisers: Advertiser[];
  onViewProduct?: (productId: string) => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (
    leadId: string,
    senderId: string,
    senderName: string,
    senderRole: "client" | "advertiser",
    text: string,
  ) => void;
}

export default function AffiliateDashboard({
  indicator,
  onUpdateIndicator,
  products,
  leads,
  simulations,
  commissions,
  onAddSimulation,
  onUpdateLeadStatus,
  onRequestCheckIn,
  onAddNotification,
  advertisers,
  onViewProduct,
  chatMessages,
  onSendChatMessage,
}: AffiliateDashboardProps) {
  // Navigation / Tabs inside Dashboard
  const [activeTab, setActiveTab] = useState<
    "vitrine" | "desempenho" | "carteira" | "financiamentos"
  >("vitrine");

  // Active Chat lead monitor
  const [activeChatLeadId, setActiveChatLeadId] = useState<string | null>(null);

  // WhatsApp notification modal state
  const [whatsAppNotificationData, setWhatsAppNotificationData] = useState<{
    advertiserPhone: string;
    advertiserName: string;
    text: string;
  } | null>(null);

  // Simulation modal and form states
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [simFormProductId, setSimFormProductId] = useState<string>("");
  const [simFormClientName, setSimFormClientName] = useState<string>("");
  const [simFormClientCpf, setSimFormClientCpf] = useState<string>("");
  const [simFormClientPhone, setSimFormClientPhone] = useState<string>("");
  const [simFormClientBirthDate, setSimFormClientBirthDate] = useState<string>("");
  const [simFormClientIncome, setSimFormClientIncome] = useState<string>("");
  const [simFormDownPayment, setSimFormDownPayment] = useState<string>("");
  const [simFormDesiredInstallments, setSimFormDesiredInstallments] = useState<number>(48);

  // Showcase filters
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [minCommission, setMinCommission] = useState<number>(0);
  const [onlyPresencial, setOnlyPresencial] = useState<boolean>(false);
  const [filterByMyRegion, setFilterByMyRegion] = useState<boolean>(false);

  // Sharing states
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [downloadingKit, setDownloadingKit] = useState<boolean>(false);
  const [sharingMethod, setSharingMethod] = useState<string>("");
  const [selectedSocialPlatform, setSelectedSocialPlatform] = useState<
    "instagram" | "whatsapp" | "facebook" | "tiktok" | "linkedin" | ""
  >("");
  const [selectedPlacement, setSelectedPlacement] = useState<string>("");

  // PIX Withdrawal
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  // Onboarding registration states
  const [onboardForm, setOnboardForm] = useState({
    name: indicator?.name || "",
    cpf: indicator?.cpf || "",
    phone: indicator?.phone || "",
    email: indicator?.email || "",
    pixKey: indicator?.pixKey || "",
    pixType: indicator?.pixType || "cpf",
    city: indicator?.city || "",
    state: indicator?.state || "SP",
  });
  const [scrolledTerms, setScrolledTerms] = useState<boolean>(false);
  const [creciWarningAccepted, setCreciWarningAccepted] = useState<boolean>(false);

  // Profile location editing
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempCity, setTempCity] = useState(indicator?.city || "");
  const [tempState, setTempState] = useState(indicator?.state || "SP");

  // Handle Terms scroll tracking
  const handleScrollTerms = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 10) {
      setScrolledTerms(true);
    }
  };

  const handleRegisterOnboard = (e: FormEvent) => {
    e.preventDefault();
    if (!scrolledTerms) {
      onAddNotification(
        "Você precisa rolar os termos de parceria até o final para aceitar.",
        "info",
      );
      return;
    }
    if (!onboardForm.city || !onboardForm.state) {
      onAddNotification("Por favor, informe sua cidade e estado de atuação.", "info");
      return;
    }

    onUpdateIndicator({
      ...indicator,
      ...onboardForm,
      hasAcceptedTerms: true,
      termsAcceptedAt: new Date().toISOString(),
      balanceAvailable: 0,
      balancePending: 0,
      league: "bronze",
      score: 100,
    });
    onAddNotification("Parceria Comercial aceita com sucesso! Cadastro ativo.", "success");
  };

  const handleSimFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!simFormProductId) {
      onAddNotification("Por favor, selecione um veículo/produto.", "info");
      return;
    }
    const product = products.find((p) => p.id === simFormProductId);
    if (!product) return;

    onAddSimulation({
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.coverImage,
      indicatorId: indicator.id,
      indicatorName: indicator.name,
      advertiserId: product.advertiserId,
      clientName: simFormClientName,
      clientCpf: simFormClientCpf,
      clientPhone: simFormClientPhone,
      clientBirthDate: simFormClientBirthDate,
      clientIncome: parseFloat(simFormClientIncome) || 0,
      downPayment: parseFloat(simFormDownPayment) || 0,
      desiredInstallments: simFormDesiredInstallments,
    });

    // Prepare WhatsApp Message for Advertiser
    const advertiser = advertisers.find((a) => a.id === product.advertiserId);
    const advertiserPhone = advertiser?.phone || "";
    const advertiserName = advertiser?.name || "Anunciante Parceiro";

    // Base advertiser link directly opening their panel
    const advertiserLink = `${window.location.origin}/?role=anunciante`;

    const formattedIncome = (parseFloat(simFormClientIncome) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const formattedDownPayment = (parseFloat(simFormDownPayment) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const textMessage = `Olá, *${advertiserName}*! 🚀\n\nSou o indicador *${indicator.name}* e acabo de enviar uma ficha para simulação de financiamento para o seu produto: *${product.title}*.\n\n*📋 Detalhes do Comprador:*\n- *Nome Completo:* ${simFormClientName}\n- *CPF:* ${simFormClientCpf}\n- *WhatsApp do Cliente:* ${simFormClientPhone}\n- *Renda Comprovada:* ${formattedIncome}\n- *Entrada Ofertada:* ${formattedDownPayment}\n- *Prazo Desejado:* ${simFormDesiredInstallments} meses\n\n*🔗 Acesse o seu Painel de Anunciante para ver e analisar esta simulação:*\n${advertiserLink}\n\nFico no aguardo do retorno se foi aprovado ou não! Obrigado.`;

    setWhatsAppNotificationData({
      advertiserPhone,
      advertiserName,
      text: textMessage,
    });

    // Reset form states
    setSimFormProductId("");
    setSimFormClientName("");
    setSimFormClientCpf("");
    setSimFormClientPhone("");
    setSimFormClientBirthDate("");
    setSimFormClientIncome("");
    setSimFormDownPayment("");
    setSimFormDesiredInstallments(48);
    setShowSimulateModal(false);
  };

  // Perform PIX payout
  const handleRequestWithdraw = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      onAddNotification("Insira um valor válido para saque.", "info");
      return;
    }
    if (amount > indicator.balanceAvailable) {
      onAddNotification("Saldo insuficiente para o saque solicitado.", "info");
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      onUpdateIndicator({
        ...indicator,
        balanceAvailable: indicator.balanceAvailable - amount,
      });
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      onAddNotification(
        `Saque de R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} enviado para sua chave PIX!`,
        "success",
      );
      setTimeout(() => setWithdrawSuccess(false), 3000);
    }, 1500);
  };

  // Simulate Web Share API
  const handleShareLink = async (prod: Product) => {
    const trackingUrl = `${window.location.origin}/?p=${prod.id}&ref=${indicator.id}`;
    const shareData = {
      title: prod.title,
      text: `Veja essa excelente oportunidade: ${prod.title}. Interessados podem falar diretamente comigo!`,
      url: trackingUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onAddNotification("Menu de compartilhamento aberto com sucesso!", "success");
      } catch (err) {
        // user cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(trackingUrl);
      setShareCopied(true);
      onAddNotification("Link de indicação copiado! Cole nas suas redes.", "success");
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Web Share Instagram / WhatsApp dropdown simulation
  const simulateSocialShare = (method: string, prod: Product) => {
    setSharingMethod(method);
    const trackingUrl = `${window.location.origin}/?p=${prod.id}&ref=${indicator.id}`;

    if (method === "whatsapp") {
      const text = encodeURIComponent(
        `Olá! Veja este excelente item: ${prod.title}\nConfira todos os detalhes aqui: ${trackingUrl}`,
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
      onAddNotification("Redirecionando para o WhatsApp...", "success");
    } else if (method === "instagram") {
      onAddNotification(
        "Iniciando Kit Instagram: Baixe a arte e anexe o link nos Stories!",
        "info",
      );
    }
  };

  const downloadAllImages = (gallery: string[]) => {
    gallery.forEach((url, index) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = `produto-imagem-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    onAddNotification(
      `Abrindo ${gallery.length} imagem(ns) do produto para você salvar no seu dispositivo!`,
      "success",
    );
  };

  // If NOT registered yet, display the beautiful Onboarding/Terms interface
  if (!indicator.hasAcceptedTerms) {
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
                <strong className="text-blue-400">CLÁUSULA 1ª - DA AUTONOMIA REAL:</strong> O
                parceiro comercial (Indicador) atuará de forma totalmente independente e sem
                subordinação. O parceiro é livre para fixar seus próprios dias, horários e locais de
                atividade, não estando sujeito a carga horária de trabalho mínima ou obrigatoriedade
                de presença.
              </p>
              <p className="mb-2">
                <strong className="text-blue-400">CLÁUSULA 2ª - DA MULTIPLICIDADE:</strong> É
                garantido ao Indicador o direito de exercer atividades correlatas para outros
                anunciantes, imobiliárias, concessionárias ou plataformas concorrentes de forma
                simultânea.
              </p>
              <p className="mb-2">
                <strong className="text-blue-400">CLÁUSULA 3ª - DA EXCLUSÃO DE VÍNCULO:</strong>{" "}
                Este contrato não cria sob qualquer hipótese qualquer tipo de vínculo de emprego,
                relação de subordinação ou representação estatutária, conforme o Art. 442-B da CLT.
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

  // Active dashboard view after registration
  // Filter products for Vitrine
  const filteredProducts = products.filter((prod) => {
    if (prod.status !== "ativo" && prod.status !== "reservado") return false;
    if (selectedCategory !== "all" && prod.category !== selectedCategory) return false;
    if (cityFilter && !prod.location.city.toLowerCase().includes(cityFilter.toLowerCase()))
      return false;
    if (minCommission > 0) {
      const bestCommission =
        prod.allowPresencialTier && prod.commissionPresencialValue
          ? prod.commissionPresencialValue
          : prod.commissionDigitalValue || 0;
      if (bestCommission < minCommission) return false;
    }
    if (onlyPresencial && !prod.allowPresencialTier) return false;

    if (filterByMyRegion) {
      const userCity = (indicator.city || "").toLowerCase().trim();
      const userState = (indicator.state || "").toLowerCase().trim();
      const prodCity = prod.location.city.toLowerCase().trim();
      const prodState = prod.location.state.toLowerCase().trim();

      const cityMatch = userCity && prodCity.includes(userCity);
      const stateMatch = userState && prodState === userState;
      if (!cityMatch && !stateMatch) return false;
    }

    return true;
  });

  const activeLeads = leads.filter((l) => l.indicatorId === indicator.id);
  const scheduledVisits = activeLeads.filter((l) => l.status === "visita_agendada");

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
          </div>
        </div>
      </div>

      {/* Sponsor slot — top of affiliate dashboard */}
      <div className="mb-6">
        <SponsorSlot variant="card" label="Patrocinadores" />
      </div>

      {/* Dashboard Sub-navigation Tabs */}

      <div className="flex border-b border-slate-200 mb-6 font-display font-medium text-sm">
        <button
          onClick={() => setActiveTab("vitrine")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "vitrine"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Vitrine de Produtos ({filteredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("desempenho")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "desempenho"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Minha Performance ({activeLeads.length} leads)
        </button>
        <button
          onClick={() => setActiveTab("carteira")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "carteira"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Carteira / PIX
        </button>
        <button
          onClick={() => setActiveTab("financiamentos")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "financiamentos"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Simular Financiamentos (
          {simulations?.filter((s) => s.indicatorId === indicator.id).length || 0})
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

      {/* VIEW: VITRINE DE PRODUTOS */}
      {activeTab === "vitrine" && (
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
                          Identificamos {regionalHighlights.length} produtos em toda a sua
                          localidade e categorias associadas.
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
                        Não há ofertas ativas em {indicator.city} atualmente, mas você pode indicar
                        e simular produtos de qualquer região do Brasil para ganhar comissões agora
                        mesmo!
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
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {prod.description}
                          </p>

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
      )}

      {/* VIEW: DESEMPENHO E LEADS */}
      {activeTab === "desempenho" && (
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
                        <>
                          <tr
                            key={lead.id}
                            className={`hover:bg-slate-50/50 transition-all ${isChatOpen ? "bg-blue-50/20" : ""}`}
                          >
                            <td className="py-4 px-4 font-medium text-slate-900">
                              <div>{lead.clientName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {lead.clientPhone} • {lead.clientEmail}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                              <span className="font-semibold line-clamp-1">
                                {lead.productTitle}
                              </span>
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
                                        <Clock className="w-3 h-3 animate-spin" /> Aguardando
                                        Loja...
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
                            <tr key={`${lead.id}-chat-expanded`} className="bg-slate-50/50">
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
                                      Você está visualizando a conversa entre o lojista e o
                                      comprador em tempo real. Se o lojista concluir a venda, a sua
                                      comissão de{" "}
                                      <strong>
                                        R$ {lead.commissionValue.toLocaleString("pt-BR")}
                                      </strong>{" "}
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
                                                  {new Date(msg.createdAt).toLocaleTimeString(
                                                    "pt-BR",
                                                    { hour: "2-digit", minute: "2-digit" },
                                                  )}
                                                </span>
                                              </div>

                                              {msg.originalText && msg.originalText !== msg.text ? (
                                                <div className="space-y-1">
                                                  <p className="line-through text-slate-400 text-[10px] italic">
                                                    {msg.originalText}
                                                  </p>
                                                  <div className="bg-red-50 text-red-800 text-[10px] p-1.5 rounded-lg border border-red-100 font-medium">
                                                    🚫 Interceptado por vazamento de contato:{" "}
                                                    {msg.text}
                                                  </div>
                                                </div>
                                              ) : (
                                                <p className="leading-relaxed font-sans">
                                                  {msg.text}
                                                </p>
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
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: CARTEIRA / RETIRADA PIX */}
      {activeTab === "carteira" && (
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
                R${" "}
                {indicator.balanceAvailable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                    Elas aparecem quando o anunciante confirma uma visita, fecha a venda ou conclui
                    um financiamento que você indicou.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SIMULAR FINANCIAMENTOS (INTEGRATED AUTO FINANCE & DIRECT DEAL INTERMEDIATION) */}
      {activeTab === "financiamentos" && (
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
                parceiros. Cadastre os dados de crédito do comprador para que a loja faça a
                simulação automática multi-bancos. Quando aprovado, você visualiza as parcelas e
                termos para fechar o negócio com total transparência!
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
                              <span className="text-slate-400 block font-medium">
                                CPF do Cliente:
                              </span>
                              <span className="font-semibold text-slate-950 font-mono">
                                {sim.clientCpf.replace(
                                  /(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/,
                                  "$1.***.***-$4",
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">WhatsApp:</span>
                              <span className="font-semibold text-slate-950">
                                {sim.clientPhone}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Data Nasc:</span>
                              <span className="font-semibold text-slate-950 font-mono">
                                {sim.clientBirthDate}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">
                                Renda Mensal:
                              </span>
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
                                liberação de crédito para este perfil de renda/score. Tente
                                re-ajustar o valor da entrada.
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
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Contrato
                                  de Crédito Ativo
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
                                    {sim.approvedContract.downPaymentRequired.toLocaleString(
                                      "pt-BR",
                                    )}
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
                                  Sua comissão está garantida na assinatura eletrônica deste
                                  contrato.
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
      )}

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
