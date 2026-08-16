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

/**
 * Estado, handlers e derivados do painel do anunciante.
 *
 * Movido sem reescrita de AdvertiserDashboard.tsx para que cada aba possa
 * viver no seu próprio arquivo recebendo um `ctx` só, em vez de dezenas de
 * props repetidas.
 */

export interface AdvertiserDashboardProps {
  advertiser: Advertiser;
  onUpdateAdvertiser: (updated: Advertiser) => void;
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProductStatus: (productId: string, status: ProductStatus) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onPayCommission: (commissionId: string, reference?: string) => void;
  /** Ledger de comissões dos negócios deste anunciante (leads e simulações). */
  commissions: Commission[];
  leads: Lead[];
  simulations: FinancingSimulation[];
  onUpdateSimulationStatus: (
    simId: string,
    status: FinancingStatus,
    bankResponses?: BankSimulationResponse[],
    approvedContract?: ApprovedContract,
  ) => void;
  onUpdateLeadStatus: (
    leadId: string,
    status: any,
    extra?: { visitDate?: string; notes?: string; checkInRequested?: boolean },
  ) => void;
  /** `url` é opcional — o upload é só prova em caso de disputa, não trava o pagamento. */
  onAttachLeadContract: (leadId: string, url: string | null, notes: string) => void;
  indicators: Indicator[];
  onAddNotification: (msg: string, type: "success" | "info") => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (
    leadId: string,
    senderId: string,
    senderName: string,
    senderRole: "client" | "advertiser",
    text: string,
  ) => void;
}

export function useAdvertiserState(props: AdvertiserDashboardProps) {
  const {
    advertiser,
    onUpdateAdvertiser,
    products,
    onAddProduct,
    onUpdateProductStatus,
    onUpdateProduct,
    onDeleteProduct,
    onPayCommission,
    commissions,
    leads,
    simulations,
    onUpdateSimulationStatus,
    onUpdateLeadStatus,
    onAttachLeadContract,
    indicators,
    onAddNotification,
    chatMessages,
    onSendChatMessage,
  } = props;

  // Navigation
  const [activeTab, setActiveTab] = useTabParam(
    ["funnel", "produtos", "financeiro", "afiliados", "financiamentos"] as const,
    "funnel",
  );

  // Local Chat state
  const [advertiserChatText, setAdvertiserChatText] = useState("");

  // Product management sub-tabs
  const [productSubTab, setProductSubTab] = useState<"lista" | "carga" | "integracoes">("lista");

  // Bulk Import Wizard states
  const [bulkCategory, setBulkCategory] = useState<Category>("imovel");
  const [bulkRawText, setBulkRawText] = useState<string>("");
  const [bulkSelectedFileName, setBulkSelectedFileName] = useState<string>("");
  const [bulkParsedRows, setBulkParsedRows] = useState<any[]>([]);
  const [bulkStep, setBulkStep] = useState<"upload" | "mapping" | "validation">("upload");
  const [bulkHeaders, setBulkHeaders] = useState<string[]>([]);
  const [bulkMapping, setBulkMapping] = useState<Record<string, string>>({
    title: "",
    price: "",
    description: "",
    city: "",
    state: "",
    coverImage: "",
  });

  // Integration states
  const [integrations, setIntegrations] = useState({
    vistaCrm: { active: false, token: "", url: "", autoSync: true, lastSync: "" },
    kenlo: {
      active: false,
      clientId: "",
      clientSecret: "",
      agencyId: "",
      autoSync: true,
      lastSync: "",
    },
    webmotors: { active: false, feedUrl: "", autoSync: false, lastSync: "" },
    bling: { active: false, apikey: "", autoSync: true, lastSync: "" },
    shopify: { active: false, shopUrl: "", accessToken: "", lastSync: "" },
  });

  const [activeIntegrationDetail, setActiveIntegrationDetail] = useState<
    "vistaCrm" | "kenlo" | "webmotors" | "bling" | "shopify" | "api_doc" | null
  >(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [apiToken] = useState<string>(
    `indica_token_${advertiser?.id || "123"}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  );

  // New Product Modal/Form States
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  // Quando preenchido, o mesmo modal do cadastro opera em modo edição.
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  // Comissão sendo quitada (abre o modal de repasse PIX).
  const [payingCommission, setPayingCommission] = useState<Commission | null>(null);
  const [payReference, setPayReference] = useState<string>("");
  const [pixCopied, setPixCopied] = useState<boolean>(false);
  const [newProductCategory, setNewProductCategory] = useState<Category>("imovel");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    city: "São Paulo",
    state: "SP",
    allowPresencialTier: true,
    allowNegotiateTier: false,
    commissionDigitalPct: "1",
    commissionPresencialPct: "3",
    commissionLeadValue: "0",
    coverImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    attributes: {} as Record<string, any>,
  });

  // Onboarding PJ Form
  const [onboardForm, setOnboardForm] = useState({
    name: advertiser?.name || "",
    cnpjOrCpf: advertiser?.cnpjOrCpf || "",
    type: advertiser?.type || "PJ",
    phone: advertiser?.phone || "",
    email: advertiser?.email || "",
    plan: advertiser?.plan || "starter",
    city: advertiser?.city || "",
    state: advertiser?.state || "SP",
  });
  const [scrolledTerms, setScrolledTerms] = useState<boolean>(false);

  // Closing Sale Modal
  const [closingSaleLead, setClosingSaleLead] = useState<Lead | null>(null);
  const [invoiceUploaded, setInvoiceUploaded] = useState<boolean>(false);
  const [saleNotes, setSaleNotes] = useState<string>("");

  // Lead Details & Scheduling Modal States
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null);
  const [visitDateInput, setVisitDateInput] = useState<string>("");
  const [visitTimeInput, setVisitTimeInput] = useState<string>("");
  const [visitNotesInput, setVisitNotesInput] = useState<string>("");

  // Credit simulation states
  const [editingSimId, setEditingSimId] = useState<string | null>(null);
  const [showSimEditModal, setShowSimEditModal] = useState<boolean>(false);
  const [editBankResponses, setEditBankResponses] = useState<BankSimulationResponse[]>([]);
  const [approvedContractForm, setApprovedContractForm] = useState({
    bankName: "Banco Itaú Veículos",
    approvedAmount: "",
    downPaymentRequired: "",
    installmentsCount: 48,
    installmentValue: "",
    interestRate: "1.49",
    additionalNotes: "Crédito pré-aprovado mediante apresentação de holerite original.",
  });

  // WhatsApp notification modal state for Advertiser to Indicator
  const [whatsAppNotificationData, setWhatsAppNotificationData] = useState<{
    indicatorPhone: string;
    indicatorName: string;
    text: string;
  } | null>(null);

  // Profile location editing
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempCity, setTempCity] = useState(advertiser?.city || "");
  const [tempState, setTempState] = useState(advertiser?.state || "SP");

  const handleScrollTerms = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 10) {
      setScrolledTerms(true);
    }
  };

  const handleRegisterAdvertiser = (e: FormEvent) => {
    e.preventDefault();
    if (!scrolledTerms) {
      onAddNotification("Você precisa ler e rolar os Termos de Adesão até o fim.", "info");
      return;
    }
    if (!onboardForm.city || !onboardForm.state) {
      onAddNotification("Por favor, informe a cidade e o estado da sua empresa.", "info");
      return;
    }

    onUpdateAdvertiser({
      ...advertiser,
      ...onboardForm,
      hasAcceptedTerms: true,
      termsAcceptedAt: new Date().toISOString(),
    });
    onAddNotification(
      "Conta de Anunciante cadastrada com sucesso! Seu catálogo está liberado.",
      "success",
    );
  };

  // Bank analysis initiator
  const handleInitiateBankAnalysis = (simId: string) => {
    const sim = simulations.find((s) => s.id === simId);
    if (!sim) return;

    // Generate 3 standard bank options based on the vehicle cost and input downpayment
    const totalToFinance = sim.productPrice - sim.downPayment;
    const standardRateItau = 1.39;
    const standardRateBradesco = 1.45;
    const standardRateBV = 1.55;

    const responses: BankSimulationResponse[] = [
      {
        bankName: "Banco Itaú Veículos",
        approvedAmount: totalToFinance,
        interestRate: standardRateItau,
        installmentsCount: sim.desiredInstallments,
        installmentValue: Math.round(
          (totalToFinance * (1 + (standardRateItau / 100) * sim.desiredInstallments)) /
            sim.desiredInstallments,
        ),
        approvedStatus: "aprovado",
      },
      {
        bankName: "Banco Bradesco Financiamentos",
        approvedAmount: totalToFinance,
        interestRate: standardRateBradesco,
        installmentsCount: sim.desiredInstallments,
        installmentValue: Math.round(
          (totalToFinance * (1 + (standardRateBradesco / 100) * sim.desiredInstallments)) /
            sim.desiredInstallments,
        ),
        approvedStatus: "aprovado",
      },
      {
        bankName: "BV Financeira",
        approvedAmount: totalToFinance - 5000,
        interestRate: standardRateBV,
        installmentsCount: sim.desiredInstallments,
        installmentValue: Math.round(
          ((totalToFinance - 5000) * (1 + (standardRateBV / 100) * sim.desiredInstallments)) /
            sim.desiredInstallments,
        ),
        approvedStatus: "revisar_entrada",
      },
    ];

    onUpdateSimulationStatus(simId, "analise_bancos", responses);
    onAddNotification(
      "Ficha de crédito enviada para simulação multi-banco com sucesso!",
      "success",
    );
  };

  const handleOpenEditModal = (sim: FinancingSimulation) => {
    setEditingSimId(sim.id);
    setEditBankResponses(sim.bankResponses || []);
    setApprovedContractForm({
      bankName: sim.approvedContract?.bankName || "Banco Itaú Veículos",
      approvedAmount:
        sim.approvedContract?.approvedAmount.toString() ||
        (sim.productPrice - sim.downPayment).toString(),
      downPaymentRequired:
        sim.approvedContract?.downPaymentRequired.toString() || sim.downPayment.toString(),
      installmentsCount: sim.approvedContract?.installmentsCount || sim.desiredInstallments,
      installmentValue:
        sim.approvedContract?.installmentValue.toString() ||
        Math.round(
          ((sim.productPrice - sim.downPayment) * 1.5) / sim.desiredInstallments,
        ).toString(),
      interestRate: sim.approvedContract?.interestRate.toString() || "1.49",
      additionalNotes:
        sim.approvedContract?.additionalNotes ||
        "Crédito aprovado! Favor enviar RG, CPF e comprovante de renda atualizados para formalização digital.",
    });
    setShowSimEditModal(true);
  };

  const handleSaveSimUpdates = (e: FormEvent) => {
    e.preventDefault();
    if (!editingSimId) return;

    const sim = simulations.find((s) => s.id === editingSimId);
    if (!sim) return;

    const contract: ApprovedContract = {
      bankName: approvedContractForm.bankName,
      approvedAmount: parseFloat(approvedContractForm.approvedAmount) || 0,
      downPaymentRequired: parseFloat(approvedContractForm.downPaymentRequired) || 0,
      installmentsCount: approvedContractForm.installmentsCount,
      installmentValue: parseFloat(approvedContractForm.installmentValue) || 0,
      interestRate: parseFloat(approvedContractForm.interestRate) || 1.49,
      additionalNotes: approvedContractForm.additionalNotes,
    };

    onUpdateSimulationStatus(editingSimId, "aprovado", editBankResponses, contract);
    onAddNotification("Crédito Aprovado! Propostas de bancos enviadas ao indicador.", "success");
    setShowSimEditModal(false);
    setEditingSimId(null);
    triggerIndicatorNotification(editingSimId, "aprovado", contract);
  };

  const triggerIndicatorNotification = (
    simId: string,
    status: FinancingStatus,
    approvedContract?: ApprovedContract,
  ) => {
    const sim = simulations.find((s) => s.id === simId);
    if (!sim) return;

    const indicator = indicators.find((i) => i.id === sim.indicatorId);
    if (!indicator) return;

    const indicatorPhone = indicator.phone || "";
    const indicatorName = indicator.name || "Indicador";
    const indicatorLink = `${window.location.origin}/?role=indicador`;

    let statusText = "";
    let extraDetails = "";

    if (status === "aprovado" && approvedContract) {
      statusText = "✅ CRÉDITO APROVADO!";
      extraDetails = `\n\n*📋 Condições do Financiamento:*\n- *Instituição:* ${approvedContract.bankName}\n- *Valor Financiado:* R$ ${approvedContract.approvedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n- *Entrada Requerida:* R$ ${approvedContract.downPaymentRequired.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n- *Termo:* ${approvedContract.installmentsCount}x de R$ ${approvedContract.installmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n- *Taxa:* ${approvedContract.interestRate}% a.m.\n- *Orientação:* ${approvedContract.additionalNotes || "Nenhuma"}`;
    } else if (status === "rejeitado") {
      statusText = "❌ CRÉDITO RECUSADO";
      extraDetails = `\n\nInfelizmente, a ficha de crédito não pôde ser aprovada no perfil atual do comprador pelas instituições parceiras consultadas.`;
    } else if (status === "concluido") {
      statusText = "🎉 CONTRATO ASSINADO!";
      extraDetails = `\n\nO contrato de financiamento foi assinado e finalizado! A comissão correspondente já foi liberada e está disponível no seu painel.`;
    }

    const textMessage = `Olá, *${indicatorName}*! 👋\n\nAqui é o anunciante *${advertiser.name}*.\n\nTenho novidades sobre a simulação do produto *"${sim.productTitle}"* para o cliente *${sim.clientName}*.\n\n*📢 Status do Crédito:* ${statusText}${extraDetails}\n\n*🔗 Acesse o seu Painel do Indicador para acompanhar todos os detalhes:* \n${indicatorLink}\n\nMuito obrigado pela indicação!`;

    setWhatsAppNotificationData({
      indicatorPhone,
      indicatorName,
      text: textMessage,
    });
  };

  const handleUpdateSimStatusOnly = (simId: string, status: FinancingStatus) => {
    onUpdateSimulationStatus(simId, status);
    if (status === "rejeitado") {
      onAddNotification("Crédito recusado para esta ficha.", "info");
      triggerIndicatorNotification(simId, "rejeitado");
    } else if (status === "concluido") {
      onAddNotification("Contrato finalizado e assinado com sucesso!", "success");
      triggerIndicatorNotification(simId, "concluido");
    }
  };

  // Preselected high-end images based on category
  const presetImages: Record<Category, string[]> = {
    imovel: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    ],
    carro: [
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    ],
    moto: [
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    ],
    barco: [
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80",
    ],
    jetski: [
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
    ],
    saude: [
      "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    ],
    energia_solar: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
    ],
    educacao: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    ],
    turismo: [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    ],
    seguros: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    ],
    franquias: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    ],
    veiculos_pesados: [
      "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=800&q=80",
    ],
    imoveis_comerciais_locacao: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    ],
  };

  // Handle Category changes on creation
  const handleCategoryChange = (cat: Category) => {
    setNewProductCategory(cat);
    // Preset cover image based on category
    setProductForm((prev) => ({
      ...prev,
      coverImage: presetImages[cat][0],
      attributes: {},
    }));
  };

  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    const priceVal = parseFloat(productForm.price);
    if (isNaN(priceVal) || priceVal <= 0) {
      onAddNotification("Valor do anúncio inválido.", "info");
      return;
    }

    const digitalPct = parseFloat(productForm.commissionDigitalPct) || 1;
    const presencialPct = parseFloat(productForm.commissionPresencialPct) || 3;
    const leadCommissionVal = parseFloat(productForm.commissionLeadValue) || 0;

    const finalCoverImage = uploadedImages.length > 0 ? uploadedImages[0] : productForm.coverImage;
    const finalGallery = uploadedImages.length > 0 ? uploadedImages : [productForm.coverImage];

    // Em modo edição preservamos identidade e histórico do anúncio: mesmo id,
    // mesma data de criação e o status atual (editar um anúncio vendido não o
    // devolve para "ativo").
    const existing = editingProductId ? myProducts.find((p) => p.id === editingProductId) : null;

    const newProd: Product = {
      id: existing ? existing.id : `prod-${Date.now()}`,
      category: newProductCategory,
      advertiserId: advertiser.id,
      advertiserName: advertiser.name,
      title: productForm.title,
      description: productForm.description,
      price: priceVal,
      currency: "BRL",
      status: existing ? existing.status : "ativo",
      location: {
        lat: -23.5505, // default coordinates
        lng: -46.6333,
        city: productForm.city,
        state: productForm.state,
      },
      coverImage: finalCoverImage,
      gallery: finalGallery,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commissionDigitalPct: digitalPct,
      commissionDigitalValue: (priceVal * digitalPct) / 100,
      commissionPresencialPct: productForm.allowPresencialTier ? presencialPct : undefined,
      commissionPresencialValue: productForm.allowPresencialTier
        ? (priceVal * presencialPct) / 100
        : undefined,
      commissionLeadValue: leadCommissionVal,
      allowPresencialTier: productForm.allowPresencialTier,
      allowNegotiateTier: productForm.allowNegotiateTier,
      attributes: productForm.attributes,
    };

    if (existing) {
      onUpdateProduct(newProd);
    } else {
      onAddProduct(newProd);
      onAddNotification(
        `Produto "${newProd.title}" adicionado e disponível para indicação!`,
        "success",
      );
    }
    setIsAddingProduct(false);
    setEditingProductId(null);
    setUploadedImages([]);
    // Reset
    setProductForm({
      title: "",
      description: "",
      price: "",
      city: "São Paulo",
      state: "SP",
      allowPresencialTier: true,
      allowNegotiateTier: false,
      commissionDigitalPct: "1",
      commissionPresencialPct: "3",
      commissionLeadValue: "0",
      coverImage: presetImages.imovel[0],
      attributes: {},
    });
  };

  // ==========================================
  // BULK IMPORT & INTEGRATION HELPERS
  // ==========================================

  const parseBulkText = (text: string) => {
    if (!text.trim()) {
      onAddNotification("O texto de importação está vazio!", "info");
      return;
    }
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) {
      onAddNotification(
        "Por favor, inclua pelo menos uma linha de cabeçalho e uma linha de dados.",
        "info",
      );
      return;
    }

    // Detect separator (tab for Excel copy/paste, else comma or semicolon)
    let separator = ",";
    if (lines[0].includes("\t")) separator = "\t";
    else if (lines[0].includes(";")) separator = ";";

    const headers = lines[0].split(separator).map((h) => h.replace(/^["']|["']$/g, "").trim());
    const rows = lines.slice(1).map((line, rIdx) => {
      const values = line.split(separator).map((v) => v.replace(/^["']|["']$/g, "").trim());
      const rowObj: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] || "";
      });
      return { id: `row-${rIdx}`, data: rowObj };
    });

    setBulkHeaders(headers);
    setBulkParsedRows(rows);

    // Auto map obvious columns
    const initialMapping: Record<string, string> = {
      title: "",
      price: "",
      description: "",
      city: "",
      state: "",
      coverImage: "",
    };

    headers.forEach((h) => {
      const lower = h.toLowerCase();
      if (lower.includes("tit") || lower.includes("nome") || lower.includes("title"))
        initialMapping.title = h;
      else if (lower.includes("pre") || lower.includes("val") || lower.includes("price"))
        initialMapping.price = h;
      else if (lower.includes("des") || lower.includes("det") || lower.includes("desc"))
        initialMapping.description = h;
      else if (lower.includes("cid") || lower.includes("city")) initialMapping.city = h;
      else if (lower.includes("est") || lower.includes("uf") || lower.includes("state"))
        initialMapping.state = h;
      else if (
        lower.includes("img") ||
        lower.includes("capa") ||
        lower.includes("imag") ||
        lower.includes("photo") ||
        lower.includes("url")
      )
        initialMapping.coverImage = h;
    });

    setBulkMapping(initialMapping);
    setBulkStep("mapping");
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setBulkRawText(text);
      parseBulkText(text);
    };
    reader.readAsText(file);
  };

  const handleApplyMapping = () => {
    // Validate mapping: Title and Price are required
    if (!bulkMapping.title) {
      onAddNotification("O campo de Título é obrigatório no mapeamento.", "info");
      return;
    }
    if (!bulkMapping.price) {
      onAddNotification("O campo de Preço é obrigatório no mapeamento.", "info");
      return;
    }

    // Advance to validation step
    setBulkStep("validation");
  };

  const handleImportBulkProducts = () => {
    let successCount = 0;

    bulkParsedRows.forEach((row, idx) => {
      const title = row.data[bulkMapping.title] || "";
      const priceRaw = row.data[bulkMapping.price] || "";
      const description = bulkMapping.description
        ? row.data[bulkMapping.description] || ""
        : "Sem descrição importada.";
      const city = bulkMapping.city ? row.data[bulkMapping.city] || "São Paulo" : "São Paulo";
      const state = bulkMapping.state ? row.data[bulkMapping.state] || "SP" : "SP";

      const cleanPrice = parseFloat(priceRaw.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

      let coverImage =
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80";
      if (bulkMapping.coverImage && row.data[bulkMapping.coverImage]) {
        coverImage = row.data[bulkMapping.coverImage];
      } else {
        // Fallback Unsplash images based on category
        if (bulkCategory === "carro")
          coverImage =
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80";
        else if (bulkCategory === "moto")
          coverImage =
            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80";
        else if (bulkCategory === "barco")
          coverImage =
            "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80";
        else if (bulkCategory === "jetski")
          coverImage =
            "https://images.unsplash.com/photo-1633534591456-e9e034ea3efb?auto=format&fit=crop&w=800&q=80";
      }

      if (title && cleanPrice > 0) {
        const newProd: Product = {
          id: `prod-bulk-${Date.now()}-${idx}`,
          category: bulkCategory,
          advertiserId: advertiser.id,
          advertiserName: advertiser.name,
          title: title,
          description: description,
          price: cleanPrice,
          currency: "R$",
          status: "ativo",
          location: {
            lat: -23.5505,
            lng: -46.6333,
            city: city,
            state: state,
          },
          coverImage: coverImage,
          gallery: [coverImage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          commissionDigitalPct: 1,
          commissionDigitalValue: cleanPrice * 0.01,
          commissionPresencialPct: 3,
          commissionPresencialValue: cleanPrice * 0.03,
          commissionLeadValue: 0,
          allowPresencialTier: true,
          allowNegotiateTier: false,
          attributes: {},
        };

        onAddProduct(newProd);
        successCount++;
      }
    });

    onAddNotification(
      `${successCount} produtos importados com sucesso para a categoria ${bulkCategory.toUpperCase()}!`,
      "success",
    );

    // Reset wizard
    setBulkStep("upload");
    setBulkRawText("");
    setBulkParsedRows([]);
    setProductSubTab("lista");
  };

  const handleTriggerSync = (
    platform: "vistaCrm" | "kenlo" | "webmotors" | "bling" | "shopify",
  ) => {
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      let syncCount = 0;

      const appendProduct = (
        title: string,
        price: number,
        description: string,
        city: string,
        state: string,
        category: Category,
        cover: string,
      ) => {
        const newProd: Product = {
          id: `prod-sync-${platform}-${Date.now()}-${syncCount}`,
          category: category,
          advertiserId: advertiser.id,
          advertiserName: advertiser.name,
          title: title,
          description: description,
          price: price,
          currency: "R$",
          status: "ativo",
          location: { lat: -23.5505, lng: -46.6333, city, state },
          coverImage: cover,
          gallery: [cover],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          commissionDigitalPct: 1.5,
          commissionDigitalValue: price * 0.015,
          commissionPresencialPct: 4,
          commissionPresencialValue: price * 0.04,
          commissionLeadValue: 0,
          allowPresencialTier: true,
          allowNegotiateTier: true,
          attributes: {},
        };
        onAddProduct(newProd);
        syncCount++;
      };

      if (platform === "vistaCrm") {
        appendProduct(
          "Apartamento de Alto Padrão no Itaim Bibi",
          2450000,
          "Excelente imóvel com 3 suítes, 4 vagas de garagem, varanda gourmet envidraçada e acabamento de luxo.",
          "São Paulo",
          "SP",
          "imovel",
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
        );
        appendProduct(
          "Casa Duplex em Condomínio Fechado Barra",
          3890000,
          "Maravilhosa casa com projeto contemporâneo, 5 suítes, piscina, área gourmet integrada e segurança 24h.",
          "Rio de Janeiro",
          "RJ",
          "imovel",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        );
      } else if (platform === "kenlo") {
        appendProduct(
          "Cobertura Penthouse com Vista para o Mar",
          5200000,
          "Cobertura exclusiva reformada, piscina privativa com borda infinita, amplo deck de madeira e churrasqueira.",
          "Santos",
          "SP",
          "imovel",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        );
        appendProduct(
          "Apartamento Studio Mobiliado na Consolação",
          420000,
          "Studio decorado por arquiteto, ar-condicionado, eletrodomésticos premium, condomínio com lazer completo no rooftop.",
          "São Paulo",
          "SP",
          "imovel",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        );
      } else if (platform === "webmotors") {
        appendProduct(
          "Porsche 911 Carrera S Coupé 2022",
          890000,
          "Único dono, todas as revisões feitas na concessionária, teto solar elétrico, interior em couro bicolor, apenas 12.000km.",
          "São Paulo",
          "SP",
          "carro",
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
        );
        appendProduct(
          "BMW M3 Competition Track Pack 2021",
          699000,
          "Motor de 510cv, freios de cerâmica, bancos concha em carbono, película de proteção PPF integral.",
          "Curitiba",
          "PR",
          "carro",
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
        );
      } else if (platform === "bling") {
        appendProduct(
          "Lancha NX Boats NX 360 Sport Coupé 2022",
          780000,
          "Equipada com 2 motores Volvo Penta 250hp, gerador, ar-condicionado, churrasqueira elétrica, som premium Hertz.",
          "Angra dos Reis",
          "RJ",
          "barco",
          "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80",
        );
        appendProduct(
          "Jet Ski Yamaha VX Cruiser HO 2023",
          145000,
          "Edição de luxo com sistema de som JetSound integrado, GPS Garmin, assento Ergo-Fit de 3 lugares.",
          "Campinas",
          "SP",
          "jetski",
          "https://images.unsplash.com/photo-1633534591456-e9e034ea3efb?auto=format&fit=crop&w=800&q=80",
        );
      } else if (platform === "shopify") {
        appendProduct(
          "Moto Harley-Davidson Fat Boy 114 2023",
          115000,
          "Cor Vivid Black, motor Milwaukee-Eight 114, rodas de alumínio fundido Lakeside, escapamento Vance & Hines.",
          "Belo Horizonte",
          "MG",
          "moto",
          "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
        );
      }

      setIntegrations((prev) => {
        const u = { ...prev } as Record<string, any>;
        u[platform] = {
          ...u[platform],
          active: true,
          lastSync: new Date().toLocaleString("pt-BR"),
        };
        return u as typeof prev;
      });

      onAddNotification(
        `Sincronização concluída! ${syncCount} anúncio(s) importados de ${platform.toUpperCase()}.`,
        "success",
      );
    }, 1800);
  };

  // Submitting Proof to Close Sale — o anexo (NF-e/contrato) é opcional: só
  // serve como prova em caso de disputa, não bloqueia mais o pagamento.
  const handleCloseSaleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!closingSaleLead) return;

    onAttachLeadContract(
      closingSaleLead.id,
      invoiceUploaded
        ? "https://cdn.pixabay.com/photo/2016/09/20/11/27/document-1682317_1280.png" // simulated PDF link
        : null,
      saleNotes,
    );
    onUpdateLeadStatus(closingSaleLead.id, "venda_concluida");

    // Also change related product status to "Vendido"
    onUpdateProductStatus(closingSaleLead.productId, "vendido");

    onAddNotification(
      `Venda de "${closingSaleLead.productTitle}" concluída! Comissão de R$ ${closingSaleLead.commissionValue.toLocaleString()} liberada para ${closingSaleLead.indicatorName}.`,
      "success",
    );
    setClosingSaleLead(null);
    setInvoiceUploaded(false);
    setSaleNotes("");
  };

  // If NOT onboarded

  // Active Dashboard
  const myProducts = products.filter((p) => p.advertiserId === advertiser.id);

  /**
   * Comissão devida ao indicador por anúncio.
   *
   * O ledger não guarda `product_id` (uma comissão nasce de um lead ou de uma
   * simulação), então a ligação até o anúncio é feita aqui: lead -> productId
   * e simulação -> productId. Assim o anunciante vê, no próprio anúncio,
   * quanto saiu de comissão — venha de lead, de venda ou de financiamento.
   */
  // Sem useMemo de propósito: este componente tem returns antecipados acima
  // (onboarding), e um hook depois deles quebraria a regra de ordem dos hooks.
  // O cálculo percorre poucas dezenas de itens — não justifica memoizar.
  const commissionByProduct = (() => {
    const leadToProduct = new Map(leads.map((l) => [l.id, l.productId]));
    const simToProduct = new Map((simulations ?? []).map((sim) => [sim.id, sim.productId]));
    const acc = new Map<string, { total: number; devido: number; eventos: Commission[] }>();

    for (const c of commissions) {
      const productId = c.leadId
        ? leadToProduct.get(c.leadId)
        : c.simulationId
          ? simToProduct.get(c.simulationId)
          : undefined;
      if (!productId) continue;
      const cur = acc.get(productId) ?? { total: 0, devido: 0, eventos: [] };
      cur.total += c.amount;
      // 'paid' já saiu do bolso; o que ainda é obrigação é pending + available.
      if (c.status !== "paid") cur.devido += c.amount;
      cur.eventos.push(c);
      acc.set(productId, cur);
    }
    return acc;
  })();

  /** Preenche o modal com os dados do anúncio para edição. */
  const startEditingProduct = (p: Product) => {
    setEditingProductId(p.id);
    setNewProductCategory(p.category);
    setUploadedImages(p.gallery?.length ? p.gallery : [p.coverImage]);
    setProductForm({
      title: p.title,
      description: p.description,
      price: String(p.price),
      city: p.location.city,
      state: p.location.state,
      allowPresencialTier: p.allowPresencialTier,
      allowNegotiateTier: p.allowNegotiateTier,
      commissionDigitalPct: String(p.commissionDigitalPct ?? 1),
      commissionPresencialPct: String(p.commissionPresencialPct ?? 3),
      commissionLeadValue: String(p.commissionLeadValue ?? 0),
      coverImage: p.coverImage,
      attributes: p.attributes ?? {},
    });
    setIsAddingProduct(true);
  };
  const myLeads = leads.filter((l) => l.advertiserId === advertiser.id);
  const pendingArrivals = myLeads.filter(
    (l) => l.status === "visita_agendada" && l.checkInRequested,
  );

  // Group leads for pipeline funnel
  const funnelStages: Record<string, { label: string; color: string; list: Lead[] }> = {
    lead_recebido: { label: "Recebido", color: "bg-slate-100 text-slate-700", list: [] },
    contato_feito: { label: "Contato Feito", color: "bg-blue-100 text-blue-800", list: [] },
    visita_agendada: { label: "Visita Agendada", color: "bg-amber-100 text-amber-800", list: [] },
    visita_confirmada: { label: "Visita Confirmada", color: "bg-cyan-100 text-cyan-800", list: [] },
    proposta: { label: "Proposta", color: "bg-blue-100 text-blue-900", list: [] },
    venda_concluida: { label: "Vendido", color: "bg-emerald-100 text-emerald-800", list: [] },
  };

  myLeads.forEach((lead) => {
    if (funnelStages[lead.status]) {
      funnelStages[lead.status].list.push(lead);
    }
  });

  return {
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
  };
}

export type AdvertiserCtx = ReturnType<typeof useAdvertiserState>;
