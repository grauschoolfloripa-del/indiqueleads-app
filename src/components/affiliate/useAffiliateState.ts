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

/**
 * Todo o estado, handlers e valores derivados do painel do indicador.
 *
 * Existe para que cada aba possa morar no seu próprio arquivo sem receber
 * uma lista gigante de props: o painel chama este hook uma vez e passa o
 * resultado inteiro adiante como `ctx`.
 *
 * O conteúdo foi movido sem reescrita a partir de AffiliateDashboard.tsx.
 */

export interface AffiliateDashboardProps {
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
  /**
   * Nichos que este indicador liberou na Academy.
   *
   * A vitrine já chega filtrada por eles, mas os filtros de categoria
   * precisam da lista para não oferecer nichos que a pessoa não pode
   * indicar — oferecer e não ter nada dentro parece defeito.
   */
  certifiedCategories: Category[];
}

export function useAffiliateState(props: AffiliateDashboardProps) {
  const {
    certifiedCategories,
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
  } = props;

  const [activeTab, setActiveTab] = useTabParam(
    ["vitrine", "desempenho", "carteira", "financiamentos"] as const,
    "vitrine",
  );

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

  return {
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
  };
}

export type AffiliateCtx = ReturnType<typeof useAffiliateState>;
