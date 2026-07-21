import React, { useState, FormEvent, UIEvent } from "react";
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
} from "../types";
import { VERTICALS, VERTICALS_ORDER, getVertical } from "@/lib/verticals";
import DynamicAttributesFields from "@/components/product/DynamicAttributesFields";

interface AdvertiserDashboardProps {
  advertiser: Advertiser;
  onUpdateAdvertiser: (updated: Advertiser) => void;
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProductStatus: (productId: string, status: ProductStatus) => void;
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
  onAttachLeadContract: (leadId: string, url: string, notes: string) => void;
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

export default function AdvertiserDashboard({
  advertiser,
  onUpdateAdvertiser,
  products,
  onAddProduct,
  onUpdateProductStatus,
  leads,
  simulations,
  onUpdateSimulationStatus,
  onUpdateLeadStatus,
  onAttachLeadContract,
  indicators,
  onAddNotification,
  chatMessages,
  onSendChatMessage,
}: AdvertiserDashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<
    "funnel" | "produtos" | "financeiro" | "afiliados" | "financiamentos"
  >("funnel");

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

    const finalCoverImage = uploadedImages.length > 0 ? uploadedImages[0] : productForm.coverImage;
    const finalGallery = uploadedImages.length > 0 ? uploadedImages : [productForm.coverImage];

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      category: newProductCategory,
      advertiserId: advertiser.id,
      advertiserName: advertiser.name,
      title: productForm.title,
      description: productForm.description,
      price: priceVal,
      currency: "BRL",
      status: "ativo",
      location: {
        lat: -23.5505, // default coordinates
        lng: -46.6333,
        city: productForm.city,
        state: productForm.state,
      },
      coverImage: finalCoverImage,
      gallery: finalGallery,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commissionDigitalPct: digitalPct,
      commissionDigitalValue: (priceVal * digitalPct) / 100,
      commissionPresencialPct: productForm.allowPresencialTier ? presencialPct : undefined,
      commissionPresencialValue: productForm.allowPresencialTier
        ? (priceVal * presencialPct) / 100
        : undefined,
      allowPresencialTier: productForm.allowPresencialTier,
      allowNegotiateTier: productForm.allowNegotiateTier,
      attributes: productForm.attributes,
    };

    onAddProduct(newProd);
    onAddNotification(
      `Produto "${newProd.title}" adicionado e disponível para indicação!`,
      "success",
    );
    setIsAddingProduct(false);
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

  // Submitting Proof to Close Sale
  const handleCloseSaleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!invoiceUploaded) {
      onAddNotification("Anexe uma cópia da NF-e ou Contrato Assinado para auditoria.", "info");
      return;
    }
    if (!closingSaleLead) return;

    onAttachLeadContract(
      closingSaleLead.id,
      "https://cdn.pixabay.com/photo/2016/09/20/11/27/document-1682317_1280.png", // simulated PDF link
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
  if (!advertiser.hasAcceptedTerms) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans">
        <div className="text-center mb-6">
          <div className="bg-orange-100 text-orange-700 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Portal do Anunciante</h2>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre seus bens imobiliários ou automotivos e utilize nossa rede de divulgadores
            autônomos por performance.
          </p>
        </div>

        <form onSubmit={handleRegisterAdvertiser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Razão Social / Nome Fantasia
            </label>
            <input
              type="text"
              required
              value={onboardForm.name}
              onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
              placeholder="ex: Imobiliária Prime SP"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Conta
              </label>
              <select
                value={onboardForm.type}
                onChange={(e) =>
                  setOnboardForm({ ...onboardForm, type: e.target.value as "PF" | "PJ" })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PJ">Pessoa Jurídica (Empresa)</option>
                <option value="PF">Pessoa Física (Particular)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                CNPJ / CPF
              </label>
              <input
                type="text"
                required
                value={onboardForm.cnpjOrCpf}
                onChange={(e) => setOnboardForm({ ...onboardForm, cnpjOrCpf: e.target.value })}
                placeholder="00.000.000/0001-00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Telefone Comercial
              </label>
              <input
                type="text"
                required
                value={onboardForm.phone}
                onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                placeholder="(11) 3322-1100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                E-mail Corporativo
              </label>
              <input
                type="email"
                required
                value={onboardForm.email}
                onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                placeholder="anuncios@empresa.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cidade da Sede / Loja
              </label>
              <input
                type="text"
                required
                value={onboardForm.city}
                onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
                placeholder="ex: Rio de Janeiro"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado (UF)
              </label>
              <select
                value={onboardForm.state}
                onChange={(e) => setOnboardForm({ ...onboardForm, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Escolha seu Plano Mensal de Acesso
            </label>
            <div className="grid grid-cols-3 gap-2 text-center mt-1">
              {(["starter", "premium", "pro"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setOnboardForm({ ...onboardForm, plan: p })}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between transition-all ${
                    onboardForm.plan === p
                      ? "bg-orange-50 border-orange-500 text-orange-800 shadow"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">{p}</span>
                  <span className="text-xs font-mono font-extrabold mt-1">
                    {p === "starter" ? "R$ 99" : p === "premium" ? "R$ 199" : "R$ 299"}/m
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Advertiser Contract Accept */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Contrato de Credenciamento & Adesão do Anunciante
              </label>
              {scrolledTerms && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  ✓ Lido
                </span>
              )}
            </div>

            <div
              onScroll={handleScrollTerms}
              className="h-28 overflow-y-scroll bg-slate-900 text-slate-300 p-3 rounded-xl border border-slate-800 text-[10px] font-mono leading-relaxed select-none"
            >
              <p className="font-bold text-white mb-2 uppercase text-center border-b border-slate-800 pb-1">
                CONTRATO DE ADESÃO DO ANUNCIANTE
              </p>
              <p className="mb-2">
                Ao registrar sua conta corporativa, o Anunciante se compromete a reportar com
                fidelidade o encerramento de qualquer negociação iniciada por indicação recebida na
                plataforma IndicaAqui.
              </p>
              <p className="mb-2">
                <strong>DA COMISSÃO DEVIDA:</strong> O Anunciante se obriga a efetuar o repasse
                financeiro do comissionamento pactuado por lead/venda em até 7 (sete) dias após o
                recebimento dos valores contratuais do cliente indicado.
              </p>
              <p className="mb-2">
                <strong>DA PENALIDADE DE EXCLUSÃO:</strong> Lojas ou imobiliárias que negarem o
                crédito de atribuição de venda de indicadores ou que sonegarem comprovantes de
                fechamento serão banidas permanentemente, sem reembolso das mensalidades pagas.
              </p>
              <p className="text-orange-300 font-bold text-center mt-2">
                === ROLAR ATÉ O FIM PARA ATIVAR O ACEITE ===
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!scrolledTerms}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
              scrolledTerms
                ? "bg-orange-600 text-white hover:bg-orange-500 active:scale-[0.98]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Credenciar Empresa & Aceitar Contrato
          </button>
        </form>
      </div>
    );
  }

  // Active Dashboard
  const myProducts = products.filter((p) => p.advertiserId === advertiser.id);
  const myLeads = leads.filter((l) => l.advertiserId === advertiser.id);
  const pendingArrivals = myLeads.filter(
    (l) => l.status === "visita_agendada" && l.checkInRequested,
  );

  // Group leads for pipeline funnel
  const funnelStages: Record<string, { label: string; color: string; list: Lead[] }> = {
    lead_recebido: { label: "Recebido", color: "bg-slate-100 text-slate-700", list: [] },
    contato_feito: { label: "Contato Feito", color: "bg-blue-100 text-blue-800", list: [] },
    visita_agendada: { label: "Visita Agendada", color: "bg-amber-100 text-amber-800", list: [] },
    visita_confirmada: { label: "Check-In Feito", color: "bg-cyan-100 text-cyan-800", list: [] },
    proposta: { label: "Proposta", color: "bg-orange-100 text-orange-800", list: [] },
    venda_concluida: { label: "Vendido", color: "bg-emerald-100 text-emerald-800", list: [] },
  };

  myLeads.forEach((lead) => {
    if (funnelStages[lead.status]) {
      funnelStages[lead.status].list.push(lead);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white mb-8 shadow-xl border border-orange-900/20">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center font-bold text-xl uppercase shadow border border-orange-500">
              {advertiser.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">{advertiser.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-950/40 border border-orange-800 text-orange-300 uppercase tracking-wider">
                  Plano {advertiser.plan}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono flex items-center gap-2 flex-wrap">
                <span>
                  {advertiser.email} • WhatsApp: {advertiser.phone}
                </span>
                {advertiser.city && !isEditingLocation && (
                  <span className="bg-orange-950/80 text-orange-200 px-2 py-0.5 rounded-md border border-orange-800/40 font-semibold flex items-center gap-1">
                    📍 {advertiser.city} ({advertiser.state})
                    <button
                      onClick={() => {
                        setTempCity(advertiser.city || "");
                        setTempState(advertiser.state || "SP");
                        setIsEditingLocation(true);
                      }}
                      className="text-[10px] text-orange-400 hover:text-white font-bold ml-1 hover:underline"
                    >
                      Alterar
                    </button>
                  </span>
                )}
                {!advertiser.city && !isEditingLocation && (
                  <button
                    onClick={() => {
                      setTempCity("");
                      setTempState("SP");
                      setIsEditingLocation(true);
                    }}
                    className="bg-orange-500/20 text-orange-300 hover:text-white px-2 py-0.5 rounded-md border border-orange-500/30 font-semibold text-[11px] hover:underline"
                  >
                    + Adicionar Localização
                  </button>
                )}
              </p>

              {isEditingLocation && (
                <div className="mt-2 flex items-center gap-2 bg-slate-900/95 p-2 rounded-xl border border-orange-900/40 max-w-sm">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={tempCity}
                    onChange={(e) => setTempCity(e.target.value)}
                    className="bg-slate-950 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 flex-1"
                  />
                  <select
                    value={tempState}
                    onChange={(e) => setTempState(e.target.value)}
                    className="bg-slate-950 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 w-16"
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
                      onUpdateAdvertiser({
                        ...advertiser,
                        city: tempCity,
                        state: tempState,
                      });
                      setIsEditingLocation(false);
                      onAddNotification("Localização atualizada!", "success");
                    }}
                    className="bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md transition-all"
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
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Anunciar Novo Bem
            </button>
          </div>
        </div>
      </div>

      {/* Sponsor slot — top of advertiser dashboard */}
      <div className="mb-6">
        <SponsorSlot variant="card" label="Patrocinadores" />
      </div>

      {/* Navigation tabs inside dashboard */}

      <div className="flex border-b border-slate-200 mb-6 font-display font-medium text-sm">
        <button
          onClick={() => setActiveTab("funnel")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "funnel"
              ? "border-orange-600 text-orange-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Funil de Atendimento e Vendas ({myLeads.length})
        </button>
        <button
          onClick={() => setActiveTab("produtos")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "produtos"
              ? "border-orange-600 text-orange-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Seus Anúncios ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("financeiro")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "financeiro"
              ? "border-orange-600 text-orange-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Financeiro / Repasses
        </button>
        <button
          onClick={() => setActiveTab("afiliados")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "afiliados"
              ? "border-orange-600 text-orange-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Nossos Indicadores
        </button>
        <button
          onClick={() => setActiveTab("financiamentos")}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === "financiamentos"
              ? "border-orange-600 text-orange-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Mesa de Financiamentos (
          {simulations?.filter((s) => s.advertiserId === advertiser.id).length || 0})
        </button>
      </div>

      {/* VIEW: FUNNEL KANBAN */}
      {activeTab === "funnel" && (
        <div className="space-y-6">
          {pendingArrivals.length > 0 && (
            <div className="space-y-3">
              {pendingArrivals.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-700 p-2 rounded-xl mt-0.5">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        O Indicador Chegou na Loja!
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        O indicador{" "}
                        <strong className="text-slate-900 font-bold">{lead.indicatorName}</strong>{" "}
                        informou que acabou de chegar para a visita do cliente{" "}
                        <strong className="text-slate-900 font-bold">{lead.clientName}</strong>{" "}
                        (interesse em{" "}
                        <span className="text-orange-700 font-semibold">{lead.productTitle}</span>).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateLeadStatus(lead.id, "visita_confirmada", { checkInRequested: false });
                      onAddNotification(
                        `Presença do indicador ${lead.indicatorName} confirmada!`,
                        "success",
                      );
                    }}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 self-end md:self-auto active:scale-95 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" /> Confirmar Presença do Indicador
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Simulador de Leads do Anunciante:</p>
              <p className="mt-0.5 leading-snug">
                Neste painel você atua como o Lojista/Imobiliária. Você pode mover os leads gerados
                pelos indicadores através das fases de atendimento. Quando marcar como{" "}
                <strong>"Vendido"</strong>, você simulará o envio do contrato de venda para o
                comissionamento cair na carteira do indicador correspondente.
              </p>
            </div>
          </div>

          {/* Kanban board structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
            {Object.entries(funnelStages).map(([stageId, stage]) => (
              <div
                key={stageId}
                className="bg-slate-50 border border-slate-150 rounded-2xl p-3 min-w-[190px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <span className="font-display font-bold text-xs text-slate-800">
                    {stage.label}
                  </span>
                  <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                    {stage.list.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {stage.list.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setViewingLead(lead)}
                      className="bg-white rounded-xl p-3 border border-slate-200 hover:border-orange-400 cursor-pointer shadow-xs hover:shadow transition-all space-y-2 relative group text-left"
                      title="Clique para ver os detalhes completos do Lead e Indicador"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] text-orange-600 font-bold block truncate uppercase flex-1">
                          {lead.productTitle}
                        </span>
                        <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Abrir ↗
                        </span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 text-xs mt-0.5 flex items-center gap-1">
                          {lead.clientName}
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {lead.clientPhone}
                        </p>
                      </div>

                      {/* Social/Referral Channel Badge */}
                      {lead.referralChannel && (
                        <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded w-max">
                          {lead.referralChannel.toLowerCase().includes("instagram")
                            ? "📸"
                            : lead.referralChannel.toLowerCase().includes("whatsapp")
                              ? "💬"
                              : lead.referralChannel.toLowerCase().includes("facebook")
                                ? "👥"
                                : lead.referralChannel.toLowerCase().includes("tiktok")
                                  ? "🎵"
                                  : "🔗"}{" "}
                          {lead.referralChannel}
                        </div>
                      )}

                      {/* Scheduled Visit Info */}
                      {lead.visitDate && (
                        <div className="bg-amber-50 text-amber-950 border border-amber-200/60 px-2 py-1 rounded-lg text-[9px] font-semibold flex flex-col gap-0.5 font-sans">
                          <span className="flex items-center gap-1 text-amber-800">
                            <Calendar className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <strong>Visita Agendada:</strong>
                          </span>
                          <span className="font-mono text-amber-900 pl-4">
                            {new Date(lead.visitDate).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-slate-100 pt-1.5 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                        <span className="truncate">Por: {lead.indicatorName.split(" ")[0]}</span>
                        <span className="font-bold text-orange-700">
                          R$ {lead.commissionValue.toLocaleString("pt-BR")}
                        </span>
                      </div>

                      {/* Funnel action controller */}
                      <div
                        className="pt-2 border-t border-slate-100 flex gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {stageId === "lead_recebido" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateLeadStatus(lead.id, "contato_feito");
                            }}
                            className="w-full bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white py-1 rounded text-[10px] font-semibold transition-all flex items-center justify-center gap-1 border border-orange-100/50"
                          >
                            <span>Fazer Contato</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {stageId === "contato_feito" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSchedulingLead(lead);
                              setVisitDateInput("");
                              setVisitTimeInput("");
                              setVisitNotesInput(lead.notes || "");
                            }}
                            className="w-full bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white py-1 rounded text-[10px] font-semibold transition-all flex items-center justify-center gap-1 border border-amber-200/50"
                          >
                            <span>Agendar Visita</span>
                            <Calendar className="w-3 h-3" />
                          </button>
                        )}
                        {stageId === "visita_agendada" && (
                          <div className="space-y-1.5 w-full">
                            {lead.checkInRequested ? (
                              <>
                                <div className="text-[8px] text-orange-800 font-bold bg-orange-50 p-1.5 rounded border border-orange-200 text-center flex flex-col gap-0.5 animate-pulse">
                                  <span>📍 Presença Sinalizada!</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateLeadStatus(lead.id, "visita_confirmada", {
                                      checkInRequested: false,
                                    });
                                    onAddNotification(
                                      `Presença do indicador ${lead.indicatorName} confirmada!`,
                                      "success",
                                    );
                                  }}
                                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-1.5 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                                  title="Confirmar que o indicador está fisicamente presente na loja"
                                >
                                  <span>Confirmar Presença</span>
                                  <Check className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="text-[8px] text-amber-800 font-bold bg-amber-50/60 p-1.5 rounded border border-amber-100 text-center flex flex-col gap-0.5">
                                  <span>🕒 Aguardando Chegada</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateLeadStatus(lead.id, "visita_confirmada");
                                  }}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 rounded text-[9px] font-bold transition-all flex items-center justify-center gap-1"
                                  title="Confirmar visita manualmente (sem aguardar sinalização)"
                                >
                                  <span>Confirmar Visita</span>
                                  <Check className="w-2.5 h-2.5" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                        {stageId === "visita_confirmada" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateLeadStatus(lead.id, "proposta");
                            }}
                            className="w-full bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white py-1 rounded text-[10px] font-semibold transition-all flex items-center justify-center gap-1 border border-cyan-100/50"
                          >
                            <span>Registrar Proposta</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {stageId === "proposta" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClosingSaleLead(lead);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span>Faturar Venda!</span>
                          </button>
                        )}
                        {stageId === "venda_concluida" && (
                          <div className="text-[9px] text-emerald-800 font-bold bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 text-center w-full flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Comissão Paga
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {stage.list.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-8 italic">
                      Sem leads nesta fase
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: CATALOG PRODUCTS LIST */}
      {activeTab === "produtos" && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start">
              <button
                type="button"
                onClick={() => setProductSubTab("lista")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  productSubTab === "lista"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>📦</span> Meus Bens ({myProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setProductSubTab("carga")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  productSubTab === "carga"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>⚡</span> Carga em Lote (Excel/CSV)
              </button>
              <button
                type="button"
                onClick={() => setProductSubTab("integracoes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  productSubTab === "integracoes"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>🔌</span> Integrações & APIs
              </button>
            </div>

            {productSubTab === "lista" && (
              <button
                type="button"
                onClick={() => setIsAddingProduct(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 self-end sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" /> Cadastrar Bem Manualmente
              </button>
            )}
          </div>

          {/* SUB-TAB: LISTA DE PRODUTOS */}
          {productSubTab === "lista" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  💡 <strong>IndicaAqui Dica:</strong> Bens com fotos de alta qualidade e descrições
                  detalhadas recebem até 4x mais indicações da nossa rede. Defina comissões
                  atraentes para incentivar os melhores indicadores.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[9px] tracking-wider bg-slate-50/50">
                        <th className="py-3.5 px-4">Anúncio</th>
                        <th className="py-3.5 px-4">Localização</th>
                        <th className="py-3.5 px-4">Preço do Bem</th>
                        <th className="py-3.5 px-4">Comissão Digital</th>
                        <th className="py-3.5 px-4">Comissão Presencial</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                      {myProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-4 px-4 flex items-center gap-3">
                            <img
                              src={p.coverImage}
                              alt=""
                              className="w-12 h-10 object-cover rounded-xl border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">
                                {p.category}
                              </span>
                              <span className="block font-bold text-slate-900 leading-snug mt-1">
                                {p.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-600">
                            {p.location.city} - {p.location.state}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">
                            R$ {p.price.toLocaleString("pt-BR")}
                          </td>
                          <td className="py-4 px-4 font-mono font-semibold text-orange-600">
                            R$ {p.commissionDigitalValue?.toLocaleString("pt-BR")} (
                            {p.commissionDigitalPct}%)
                          </td>
                          <td className="py-4 px-4 font-mono font-semibold text-emerald-600">
                            {p.allowPresencialTier ? (
                              <>
                                R$ {p.commissionPresencialValue?.toLocaleString("pt-BR")} (
                                {p.commissionPresencialPct}%)
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Desativada</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                                p.status === "ativo"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : p.status === "reservado"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                    : "bg-slate-50 text-slate-600 border border-slate-100"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <select
                              value={p.status}
                              onChange={(e) =>
                                onUpdateProductStatus(p.id, e.target.value as ProductStatus)
                              }
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="ativo">Ativar</option>
                              <option value="reservado">Reservar</option>
                              <option value="pausado">Pausar</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {myProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-12 text-slate-400 italic font-medium bg-slate-50/20"
                          >
                            <div className="space-y-2">
                              <span className="text-3xl block">📦</span>
                              <p className="text-xs">
                                Nenhum bem cadastrado no seu catálogo de indicações.
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Cadastre um bem manualmente ou utilize a Carga em Lote para começar!
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB: CARGA EM LOTE */}
          {productSubTab === "carga" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">
                      Carga em Lote de Anúncios
                    </h4>
                    <p className="text-xs text-slate-500">
                      Importe dezenas de anúncios de uma só vez utilizando arquivos CSV/Excel ou
                      colando diretamente as células de sua planilha.
                    </p>
                  </div>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center justify-between max-w-lg mx-auto bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-center text-[10px] font-bold text-slate-400">
                  <div
                    className={`flex-1 py-1.5 rounded-lg ${bulkStep === "upload" ? "bg-orange-600 text-white" : ""}`}
                  >
                    1. Arquivo ou Ctrl+V
                  </div>
                  <div className="px-2 text-slate-300">➔</div>
                  <div
                    className={`flex-1 py-1.5 rounded-lg ${bulkStep === "mapping" ? "bg-orange-600 text-white" : ""}`}
                  >
                    2. Mapeamento
                  </div>
                  <div className="px-2 text-slate-300">➔</div>
                  <div
                    className={`flex-1 py-1.5 rounded-lg ${bulkStep === "validation" ? "bg-orange-600 text-white" : ""}`}
                  >
                    3. Validação e Carga
                  </div>
                </div>

                {/* STEP 1: UPLOAD / PASTING */}
                {bulkStep === "upload" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          1. Selecione a Vertical de Destino
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {(["imovel", "carro", "moto", "barco", "jetski"] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setBulkCategory(cat)}
                              className={`py-2 px-1 rounded-xl border text-[10px] font-bold text-center flex flex-col items-center gap-1 transition-all uppercase ${
                                bulkCategory === cat
                                  ? "bg-orange-600 border-orange-600 text-white shadow-md"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span className="text-lg">
                                {cat === "imovel" && "🏠"}
                                {cat === "carro" && "🚗"}
                                {cat === "moto" && "🏍️"}
                                {cat === "barco" && "🛥️"}
                                {cat === "jetski" && "🎿"}
                              </span>
                              <span className="text-[8px] truncate block w-full text-center">
                                {cat}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-xs font-bold text-slate-700 uppercase">
                          2. Baixar Modelo de Carga (CSV)
                        </span>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📥</span>
                            <div className="text-left">
                              <span className="block text-xs font-bold text-slate-800">
                                Modelo {bulkCategory.toUpperCase()}
                              </span>
                              <span className="block text-[9px] text-slate-500">
                                Colunas padrão para importação
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const csvHeaders =
                                "Título,Preço,Descrição,Cidade,Estado,ImagemCapa\n";
                              const csvRows =
                                bulkCategory === "imovel"
                                  ? "Apartamento Duplex Jardins,2450000,Excelente imóvel de luxo com vista 360,São Paulo,SP,https://...\n"
                                  : "Porsche Carrera GTS 2022,890000,Unico dono IPVA pago,Campinas,SP,https://...\n";
                              const blob = new Blob([csvHeaders + csvRows], {
                                type: "text/csv;charset=utf-8;",
                              });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.setAttribute("href", url);
                              link.setAttribute(
                                "download",
                                `modelo_importacao_${bulkCategory}.csv`,
                              );
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              onAddNotification(
                                "Modelo de planilha CSV baixado com sucesso!",
                                "success",
                              );
                            }}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <FileSpreadsheet className="w-3 h-3" /> Baixar CSV
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* File Drag and Drop */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Opção A: Carregar Arquivo de Dispositivo
                        </label>
                        <div className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-slate-100/40 rounded-2xl p-6 text-center transition-all relative">
                          <input
                            type="file"
                            accept=".csv, .txt, .tsv"
                            onChange={handleBulkFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="space-y-2 pointer-events-none">
                            <span className="text-3xl block">📄</span>
                            <span className="block text-xs font-bold text-slate-700">
                              Arraste seu arquivo CSV ou clique para selecionar
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              Suporta delimitadores como vírgula (,), ponto e vírgula (;) ou
                              Tabulações
                            </span>
                            {bulkSelectedFileName && (
                              <span className="inline-block mt-2 bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                Selecionado: {bulkSelectedFileName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Copy-Paste area */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Opção B: Copiar e Colar de sua Planilha (Excel / Sheets)
                        </label>
                        <div className="space-y-1">
                          <textarea
                            rows={4}
                            value={bulkRawText}
                            onChange={(e) => setBulkRawText(e.target.value)}
                            placeholder="Cole as colunas de sua planilha aqui. Exemplo:&#10;Título	Preço	Descrição	Cidade	Estado&#10;Apartamento de Luxo	1200000	Maravilhoso loft decorado	São Paulo	SP"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400">
                              Cole a linha de cabeçalhos e as linhas de dados juntas.
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const sample =
                                  "Título\tPreço\tDescrição\tCidade\tEstado\tImagemCapa\n" +
                                  `Lançamento Premium ${bulkCategory === "imovel" ? "Itaim Bibi" : "Esportivo"}\t${bulkCategory === "imovel" ? "1450000" : "390000"}\tExcelente oportunidade de investimento comercial com alta rentabilidade garantida.\tSão Paulo\tSP\thttps://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80\n` +
                                  `Opção Premium ${bulkCategory === "imovel" ? "Brooklin" : "Hatch"}\t${bulkCategory === "imovel" ? "920000" : "150000"}\tBelo design, moderno, reformado, próximo do metrô e comércios locais.\tSão Paulo\tSP\thttps://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80`;
                                setBulkRawText(sample);
                                onAddNotification(
                                  "Modelo colado na área de texto! Clique em Processar.",
                                  "info",
                                );
                              }}
                              className="text-[10px] text-orange-600 font-bold hover:underline"
                            >
                              Preencher Exemplo Rápido
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => parseBulkText(bulkRawText)}
                        disabled={!bulkRawText.trim()}
                        className={`font-bold text-xs py-2.5 px-5 rounded-xl shadow transition-all flex items-center gap-1 ${
                          bulkRawText.trim()
                            ? "bg-orange-600 hover:bg-orange-500 text-white cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        Processar e Mapear Colunas <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: COLUMN MAPPING */}
                {bulkStep === "mapping" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                      <span className="text-xl">🗺️</span>
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <strong>Mapeamento Inteligente:</strong> Identificamos os cabeçalhos de sua
                        tabela. Associe cada campo do IndicaAqui com a respectiva coluna encontrada
                        no seu arquivo ou texto colado.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                      {Object.keys(bulkMapping).map((field) => (
                        <div
                          key={field}
                          className="space-y-1 bg-white p-3 rounded-xl border border-slate-200"
                        >
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                              {field === "title" && "Título do Bem 🔴"}
                              {field === "price" && "Preço de Venda (R$) 🔴"}
                              {field === "description" && "Descrição Comercial"}
                              {field === "city" && "Cidade"}
                              {field === "state" && "Estado / UF"}
                              {field === "coverImage" && "URL da Foto de Capa"}
                            </label>
                            {(field === "title" || field === "price") && (
                              <span className="text-[9px] text-red-500 font-bold">Obrigatório</span>
                            )}
                          </div>
                          <select
                            value={bulkMapping[field]}
                            onChange={(e) =>
                              setBulkMapping({ ...bulkMapping, [field]: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                          >
                            <option value="">-- Ignorar ou Não Mapeado --</option>
                            {bulkHeaders.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setBulkStep("upload")}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl transition-all"
                      >
                        Voltar para Upload
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyMapping}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        Validar Dados <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: VALIDATION AND BULK IMPORT */}
                {bulkStep === "validation" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Preview de Dados Mapeados e Validação ({bulkParsedRows.length} itens)
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        Total detectado: {bulkParsedRows.length} linhas
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden">
                      <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                              <th className="py-2.5 px-4">#</th>
                              <th className="py-2.5 px-4">Título do Bem</th>
                              <th className="py-2.5 px-4">Preço Mapeado</th>
                              <th className="py-2.5 px-4">Localização</th>
                              <th className="py-2.5 px-4">Foto / Imagem</th>
                              <th className="py-2.5 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {bulkParsedRows.map((row, idx) => {
                              const title = row.data[bulkMapping.title] || "";
                              const priceRaw = row.data[bulkMapping.price] || "";
                              const city = bulkMapping.city
                                ? row.data[bulkMapping.city] || "São Paulo"
                                : "São Paulo";
                              const state = bulkMapping.state
                                ? row.data[bulkMapping.state] || "SP"
                                : "SP";
                              const coverImage = bulkMapping.coverImage
                                ? row.data[bulkMapping.coverImage] || ""
                                : "";

                              const cleanPrice =
                                parseFloat(priceRaw.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
                              const isValid = title && cleanPrice > 0;

                              return (
                                <tr
                                  key={row.id}
                                  className={
                                    isValid
                                      ? "hover:bg-slate-50/50"
                                      : "bg-red-50/30 hover:bg-red-50/50"
                                  }
                                >
                                  <td className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-slate-800 block truncate max-w-[200px]">
                                      {title || <span className="text-red-500 italic">Vazio!</span>}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-mono font-bold">
                                    {cleanPrice > 0 ? (
                                      `R$ ${cleanPrice.toLocaleString("pt-BR")}`
                                    ) : (
                                      <span className="text-red-500">
                                        Inválido ({priceRaw || "Nulo"})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 font-medium text-slate-500">
                                    {city} - {state}
                                  </td>
                                  <td className="py-3 px-4">
                                    {coverImage ? (
                                      <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[150px]">
                                        <span className="text-emerald-600">✓</span>
                                        <span className="text-[10px] truncate">{coverImage}</span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic text-[10px]">
                                        Imagem Fallback
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    {isValid ? (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                                        Válido
                                      </span>
                                    ) : (
                                      <span className="bg-red-50 text-red-700 border border-red-100 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                                        Rejeitar
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setBulkStep("mapping")}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl transition-all"
                      >
                        Ajustar Mapeamento
                      </button>
                      <button
                        type="button"
                        onClick={handleImportBulkProducts}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        Confirmar Importação de (
                        {
                          bulkParsedRows.filter(
                            (r) =>
                              r.data[bulkMapping.title] &&
                              (parseFloat(
                                r.data[bulkMapping.price].replace(/[^\d.,]/g, "").replace(",", "."),
                              ) || 0) > 0,
                          ).length
                        }
                        ) Itens <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB: INTEGRACOES (CRMs & ERPs HUB) */}
          {productSubTab === "integracoes" && (
            <div className="space-y-6">
              {!activeIntegrationDetail ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <h4 className="font-display font-bold text-slate-900 text-sm">
                      Central de Integrações e APIs
                    </h4>
                    <p className="text-xs text-slate-500">
                      Conecte o IndicaAqui diretamente com os sistemas que você já utiliza no seu
                      negócio. Sincronize seu catálogo automaticamente e elimine o trabalho manual
                      de cadastro.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Imóveis: Vista CRM */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition-all group">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">Vista</span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Imobiliário
                          </span>
                        </div>
                        <div>
                          <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-orange-600 transition-colors">
                            Vista CRM
                          </h5>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                            Sincronize sua carteira de imóveis do Vista CRM diretamente para o
                            IndicaAqui, atualizando preços e fotos diariamente.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${integrations.vistaCrm.active ? "bg-emerald-500" : "bg-slate-300"}`}
                          ></span>
                          {integrations.vistaCrm.active ? "Ativo" : "Não configurado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveIntegrationDetail("vistaCrm")}
                          className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Configurar
                        </button>
                      </div>
                    </div>

                    {/* Imóveis: Kenlo / inGaia */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition-all group">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">Kenlo</span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Imobiliário
                          </span>
                        </div>
                        <div>
                          <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-orange-600 transition-colors">
                            Kenlo (inGaia)
                          </h5>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                            Conexão direta com a plataforma imobiliária líder de mercado.
                            Sincronização automatizada por meio de chaves API integradoras.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${integrations.kenlo.active ? "bg-emerald-500" : "bg-slate-300"}`}
                          ></span>
                          {integrations.kenlo.active ? "Ativo" : "Não configurado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveIntegrationDetail("kenlo")}
                          className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Configurar
                        </button>
                      </div>
                    </div>

                    {/* Veículos: Webmotors */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition-all group">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">🚗</span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Automotivo
                          </span>
                        </div>
                        <div>
                          <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-orange-600 transition-colors">
                            Integradores de Veículos
                          </h5>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                            Carregue seu estoque de carros, motos e náutica informando um Feed XML
                            padrão Webmotors, iCarros, ou AutoGestor.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${integrations.webmotors.active ? "bg-emerald-500" : "bg-slate-300"}`}
                          ></span>
                          {integrations.webmotors.active ? "Ativo" : "Não configurado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveIntegrationDetail("webmotors")}
                          className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Configurar
                        </button>
                      </div>
                    </div>

                    {/* Bling ERP */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition-all group">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">Bling!</span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Varejo & Serviços
                          </span>
                        </div>
                        <div>
                          <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-orange-600 transition-colors">
                            Bling! ERP
                          </h5>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                            Integração por API v3 do ERP de e-commerce mais utilizado no Brasil.
                            Publique seu catálogo de produtos em lote.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${integrations.bling.active ? "bg-emerald-500" : "bg-slate-300"}`}
                          ></span>
                          {integrations.bling.active ? "Ativo" : "Não configurado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveIntegrationDetail("bling")}
                          className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Configurar
                        </button>
                      </div>
                    </div>

                    {/* Shopify */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition-all group">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">Shopify</span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            E-Commerce
                          </span>
                        </div>
                        <div>
                          <h5 className="font-display font-bold text-slate-900 text-xs group-hover:text-orange-600 transition-colors">
                            Shopify / WooCommerce
                          </h5>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                            Conecte sua loja virtual diretamente. Importe bens de alto valor,
                            acessórios e náutica usando tokens de aplicativos personalizados.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50 mt-4 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${integrations.shopify.active ? "bg-emerald-500" : "bg-slate-300"}`}
                          ></span>
                          {integrations.shopify.active ? "Ativo" : "Não configurado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveIntegrationDetail("shopify")}
                          className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Configurar
                        </button>
                      </div>
                    </div>

                    {/* API Personalizada */}
                    <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col justify-between hover:bg-slate-950 transition-all group">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">💻</span>
                          <span className="bg-orange-600/30 border border-orange-500/30 text-orange-300 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Para Desenvolvedores
                          </span>
                        </div>
                        <div>
                          <h5 className="font-display font-bold text-white text-xs group-hover:text-orange-500 transition-colors">
                            API Direta de Integração
                          </h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                            Desenvolveu seu próprio sistema? Integre seu backend via requisições
                            HTTP REST (POST JSON) usando tokens de autenticação.
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          API Disponível
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveIntegrationDetail("api_doc")}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Ver Token e Código
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* DETAILED INTEGRATION CONFIGURATION PANEL */
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-4">
                    <button
                      type="button"
                      onClick={() => setActiveIntegrationDetail(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
                    >
                      ⬅ Voltar para Hub
                    </button>
                    <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
                      {activeIntegrationDetail === "api_doc"
                        ? "API de Desenvolvedor"
                        : `Integração: ${activeIntegrationDetail.toUpperCase()}`}
                    </span>
                  </div>

                  {/* Vista CRM UI */}
                  {activeIntegrationDetail === "vistaCrm" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏢</span>
                          <div>
                            <h4 className="font-display font-bold text-slate-900 text-sm">
                              Vista CRM Conector
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                              Vertical: Imóveis / Lotes / Galpões
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          O Vista CRM possui uma API de integração robusta. Insira seu token de API
                          e subdomínio de cliente abaixo para realizar a autenticação e sincronizar
                          imóveis em tempo real.
                        </p>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-[10px] text-slate-500 space-y-1">
                          <p className="font-bold">Como obter essas chaves:</p>
                          <p>1. Acesse seu Vista CRM</p>
                          <p>2. Vá em Configurações &gt; Integrações &gt; Chaves de API</p>
                          <p>3. Gere um token com permissão de leitura de imóveis</p>
                        </div>
                      </div>

                      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase">
                            Subdomínio do Vista CRM (URL)
                          </label>
                          <input
                            type="text"
                            placeholder="ex: imobiliariamar.vistacrm.com.br"
                            value={integrations.vistaCrm.url}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                vistaCrm: { ...integrations.vistaCrm, url: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase">
                            API Key / Token Vista
                          </label>
                          <input
                            type="password"
                            placeholder="Insira o Token do Vista"
                            value={integrations.vistaCrm.token}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                vistaCrm: { ...integrations.vistaCrm, token: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            id="vista-auto-sync"
                            checked={integrations.vistaCrm.autoSync}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                vistaCrm: { ...integrations.vistaCrm, autoSync: e.target.checked },
                              })
                            }
                            className="rounded text-orange-600 focus:ring-orange-500"
                          />
                          <label
                            htmlFor="vista-auto-sync"
                            className="text-xs text-slate-600 select-none font-medium"
                          >
                            Sincronizar estoque automaticamente todos os dias às 03:00
                          </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              onAddNotification(
                                "Conexão com Vista CRM estabelecida e autenticada! (Ping de API OK)",
                                "success",
                              )
                            }
                            disabled={!integrations.vistaCrm.url || !integrations.vistaCrm.token}
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                              integrations.vistaCrm.url && integrations.vistaCrm.token
                                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            🧪 Testar Conexão
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerSync("vistaCrm")}
                            disabled={
                              !integrations.vistaCrm.url ||
                              !integrations.vistaCrm.token ||
                              isSyncing
                            }
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                              integrations.vistaCrm.url && integrations.vistaCrm.token && !isSyncing
                                ? "bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isSyncing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "🔄 Sincronizar Agora"
                            )}
                          </button>
                        </div>
                        {integrations.vistaCrm.lastSync && (
                          <div className="text-[10px] text-slate-400 italic text-center mt-1">
                            Última sincronização realizada em: {integrations.vistaCrm.lastSync}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Kenlo CRM UI */}
                  {activeIntegrationDetail === "kenlo" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏬</span>
                          <div>
                            <h4 className="font-display font-bold text-slate-900 text-sm">
                              Kenlo (inGaia) Conector
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                              Vertical: Imóveis / Lançamentos residenciais
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          A Kenlo (antiga inGaia Imob) disponibiliza um sistema de integradores
                          imobiliários via credenciais OAuth e chave da agência. Preencha seus
                          tokens de produção de agência para integrar seu portfólio.
                        </p>
                      </div>

                      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-700 uppercase">
                              Client ID
                            </label>
                            <input
                              type="text"
                              placeholder="ex: cli_9381283"
                              value={integrations.kenlo.clientId}
                              onChange={(e) =>
                                setIntegrations({
                                  ...integrations,
                                  kenlo: { ...integrations.kenlo, clientId: e.target.value },
                                })
                              }
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-700 uppercase">
                              Agência ID
                            </label>
                            <input
                              type="text"
                              placeholder="ex: ag_4812"
                              value={integrations.kenlo.agencyId}
                              onChange={(e) =>
                                setIntegrations({
                                  ...integrations,
                                  kenlo: { ...integrations.kenlo, agencyId: e.target.value },
                                })
                              }
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase">
                            Client Secret (Token)
                          </label>
                          <input
                            type="password"
                            placeholder="Insira o segredo do cliente"
                            value={integrations.kenlo.clientSecret}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                kenlo: { ...integrations.kenlo, clientSecret: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              onAddNotification(
                                "Kenlo API autenticada com sucesso! Credenciais salvas.",
                                "success",
                              )
                            }
                            disabled={
                              !integrations.kenlo.clientId || !integrations.kenlo.clientSecret
                            }
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                              integrations.kenlo.clientId && integrations.kenlo.clientSecret
                                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            🧪 Testar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerSync("kenlo")}
                            disabled={
                              !integrations.kenlo.clientId ||
                              !integrations.kenlo.clientSecret ||
                              isSyncing
                            }
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                              integrations.kenlo.clientId &&
                              integrations.kenlo.clientSecret &&
                              !isSyncing
                                ? "bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isSyncing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "🔄 Sincronizar"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webmotors XML Feed */}
                  {activeIntegrationDetail === "webmotors" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🚗</span>
                          <div>
                            <h4 className="font-display font-bold text-slate-900 text-sm">
                              XML Feed Integrador (Webmotors / iCarros)
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                              Vertical: Veículos / Motos / Náutica
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Importação contínua de estoque por meio de URLs de Feed XML estruturados.
                          Nosso sistema lê o padrão oficial Webmotors 2.0 de metadados de veículos
                          (Ano, KM, Cor, Opcionais, etc.) and o traduz em anúncios mapeados para
                          indicação.
                        </p>
                      </div>

                      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase">
                            URL do XML Feed de Estoque
                          </label>
                          <input
                            type="text"
                            placeholder="ex: https://meusite.com.br/estoque/webmotors_feed.xml"
                            value={integrations.webmotors.feedUrl}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                webmotors: { ...integrations.webmotors, feedUrl: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              onAddNotification(
                                "URL de Feed XML validada com sucesso! 2 veículos identificados.",
                                "success",
                              )
                            }
                            disabled={!integrations.webmotors.feedUrl}
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                              integrations.webmotors.feedUrl
                                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            🔍 Validar URL do Feed
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerSync("webmotors")}
                            disabled={!integrations.webmotors.feedUrl || isSyncing}
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                              integrations.webmotors.feedUrl && !isSyncing
                                ? "bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isSyncing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "🔄 Ler e Sincronizar"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bling ERP API UI */}
                  {activeIntegrationDetail === "bling" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📦</span>
                          <div>
                            <h4 className="font-display font-bold text-slate-900 text-sm">
                              Bling! ERP API v3
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                              Vertical: Geral / Serviços / Cotas de Alto Valor
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Conecte o ERP Bling! utilizando as credenciais de API v3 baseadas em
                          OAuth2 ou Chave de Acesso de Aplicativo. Publique produtos do seu
                          almoxarifado direto para indicações, ideal para revendas de veículos ou
                          empresas de serviços especiais.
                        </p>
                      </div>

                      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase">
                            Chave API v3 Bling!
                          </label>
                          <input
                            type="password"
                            placeholder="Insira o Token API v3 do Bling"
                            value={integrations.bling.apikey}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                bling: { ...integrations.bling, apikey: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              onAddNotification(
                                "API Token Bling! validado com o servidor do ERP.",
                                "success",
                              )
                            }
                            disabled={!integrations.bling.apikey}
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                              integrations.bling.apikey
                                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            🧪 Testar Conexão
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerSync("bling")}
                            disabled={!integrations.bling.apikey || isSyncing}
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                              integrations.bling.apikey && !isSyncing
                                ? "bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isSyncing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "🔄 Puxar Estoque"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shopify UI */}
                  {activeIntegrationDetail === "shopify" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🛍️</span>
                          <div>
                            <h4 className="font-display font-bold text-slate-900 text-sm">
                              Shopify / WooCommerce Sync
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                              Vertical: Bens E-Commerce / Náutica e Luxo
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Sincronize lojas virtuais do Shopify ou WooCommerce por meio de APIs REST.
                          Informe as credenciais do Custom App geradas no seu Admin do Shopify para
                          sincronização instantânea.
                        </p>
                      </div>

                      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase">
                            Domínio da Loja (.myshopify.com)
                          </label>
                          <input
                            type="text"
                            placeholder="ex: loja-veiculos.myshopify.com"
                            value={integrations.shopify.shopUrl}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                shopify: { ...integrations.shopify, shopUrl: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase">
                            Access Token (Admin API)
                          </label>
                          <input
                            type="password"
                            placeholder="shpat_..."
                            value={integrations.shopify.accessToken}
                            onChange={(e) =>
                              setIntegrations({
                                ...integrations,
                                shopify: { ...integrations.shopify, accessToken: e.target.value },
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              onAddNotification(
                                "Tokens de Custom App Shopify aceitos com sucesso!",
                                "success",
                              )
                            }
                            disabled={
                              !integrations.shopify.shopUrl || !integrations.shopify.accessToken
                            }
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl border text-center transition-all ${
                              integrations.shopify.shopUrl && integrations.shopify.accessToken
                                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                : "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            🧪 Testar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerSync("shopify")}
                            disabled={
                              !integrations.shopify.shopUrl ||
                              !integrations.shopify.accessToken ||
                              isSyncing
                            }
                            className={`flex-1 font-bold text-[10px] py-2 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow ${
                              integrations.shopify.shopUrl &&
                              integrations.shopify.accessToken &&
                              !isSyncing
                                ? "bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isSyncing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "🔄 Puxar Produtos"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dev API Docs UI */}
                  {activeIntegrationDetail === "api_doc" && (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💻</span>
                        <div>
                          <h4 className="font-display font-bold text-slate-900 text-sm">
                            Integração Direta por API REST
                          </h4>
                          <p className="text-xs text-slate-500">
                            Ideal para sistemas legados ou desenvolvimento sob medida. Seu
                            desenvolvedor pode cadastrar produtos na plataforma em tempo real.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase">
                            Seu Token Privado de API (Bearer Token)
                          </span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={apiToken}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(apiToken);
                                onAddNotification(
                                  "Token copiado para a área de transferência!",
                                  "success",
                                );
                              }}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-2 rounded-xl"
                            >
                              Copiar Token
                            </button>
                          </div>
                          <span className="block text-[9px] text-red-500 font-bold">
                            Atenção: Não compartilhe esse token publicamente. Ele dá acesso de
                            escrita ao seu catálogo.
                          </span>
                        </div>

                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase">
                            Instrução cURL de Exemplo (Adicionar Produto)
                          </span>
                          <div className="bg-slate-900 text-orange-200 font-mono text-[10px] p-4 rounded-xl overflow-x-auto relative group">
                            <button
                              type="button"
                              onClick={() => {
                                const code = `curl -X POST https://api.indicaaqui.com.br/v1/products \\\n  -H "Authorization: Bearer ${apiToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "category": "imovel",\n    "title": "Apartamento Luxo Jardins",\n    "price": 2500000,\n    "description": "...",\n    "location": { "city": "São Paulo", "state": "SP" }\n  }'`;
                                navigator.clipboard.writeText(code);
                                onAddNotification("cURL de exemplo copiado!", "success");
                              }}
                              className="absolute top-2 right-2 bg-slate-800 text-slate-300 font-sans hover:text-white font-bold text-[8px] px-2 py-1 rounded"
                            >
                              Copiar Código
                            </button>
                            <pre className="whitespace-pre">{`curl -X POST https://api.indicaaqui.com.br/v1/products \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "imovel",
    "title": "Apartamento Luxo Jardins",
    "price": 2500000,
    "description": "Excelente imóvel reformado com comissão premium.",
    "location": {
      "city": "São Paulo",
      "state": "SP"
    }
  }'`}</pre>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                          <p className="font-bold text-slate-800">
                            Parâmetros de Retorno Esperados:
                          </p>
                          <p>
                            •{" "}
                            <span className="font-mono font-bold text-orange-600">201 Created</span>
                            : Produto criado com sucesso.
                          </p>
                          <p>
                            •{" "}
                            <span className="font-mono font-bold text-red-600">
                              401 Unauthorized
                            </span>
                            : Token ausente ou inválido.
                          </p>
                          <p>
                            •{" "}
                            <span className="font-mono font-bold text-red-600">
                              422 Unprocessable Entity
                            </span>
                            : Falha de validação dos atributos requeridos.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW: FINANCEIRO */}
      {activeTab === "financeiro" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-1 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-base">
              Fatura / Mensalidade
            </h3>
            <p className="text-xs text-slate-500">Seu plano ativo na plataforma IndicaAqui.</p>

            <div className="bg-gradient-to-br from-orange-950 to-slate-950 text-white rounded-2xl p-5 border border-orange-900/30 relative overflow-hidden">
              <span className="text-[9px] bg-orange-600 text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                PREMIUM
              </span>
              <h4 className="font-display font-bold text-lg mt-2">Plano Corporativo</h4>
              <p className="text-xs text-slate-300 mt-1">
                Limite de anúncios ilimitado • Acesso a todas as verticais.
              </p>

              <div className="border-t border-orange-900/20 mt-4 pt-3 flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Vencimento em 10/07/2026:</span>
                <span className="text-lg font-mono font-bold text-white">R$ 199,00/mês</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-base">
              Comissões Pagas ou Pendentes
            </h3>
            <p className="text-xs text-slate-500">
              Auditoria completa de repasses devidos aos indicadores que trouxeram vendas.
            </p>

            <div className="space-y-3">
              {myLeads
                .filter((l) => l.status === "venda_concluida")
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="flex justify-between items-center border border-slate-100 rounded-2xl p-4 bg-slate-50"
                  >
                    <div className="flex gap-3">
                      <div className="bg-emerald-100 text-emerald-800 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-950">Comissão Quitada</h4>
                        <p className="text-xs text-slate-500">
                          {lead.productTitle} • Recebido por: {lead.indicatorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-emerald-600 block">
                        R$ {lead.commissionValue.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Ref: {lead.commissionType}
                      </span>
                    </div>
                  </div>
                ))}
              {myLeads
                .filter((l) => l.status === "proposta")
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="flex justify-between items-center border border-slate-150 rounded-2xl p-4 bg-amber-50"
                  >
                    <div className="flex gap-3">
                      <div className="bg-amber-100 text-amber-800 w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                        🕒
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-950">Aguardando Faturamento</h4>
                        <p className="text-xs text-slate-500">
                          {lead.productTitle} • Negociação de proposta por: {lead.indicatorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-amber-600 block">
                        R$ {lead.commissionValue.toLocaleString("pt-BR")}
                      </span>
                      <button
                        onClick={() => setClosingSaleLead(lead)}
                        className="bg-emerald-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded mt-1"
                      >
                        Pagar e Fechar
                      </button>
                    </div>
                  </div>
                ))}
              {myLeads.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">
                  Sem movimentação de comissão relevante
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: OUR AFFILIATES/PROMOTERS */}
      {activeTab === "afiliados" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-base">
            Rede de Indicadores Ativos
          </h3>
          <p className="text-xs text-slate-500">
            Métricas de performance dos promotores que estão divulgando sua loja.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indicators
              .filter((i) => i.name)
              .map((ind) => (
                <div
                  key={ind.id}
                  className="border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all space-y-3 bg-slate-50/50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 text-orange-700 font-bold rounded-lg flex items-center justify-center text-xs">
                        {ind.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{ind.name}</h4>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {ind.email}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                        ind.league === "ouro"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {ind.league}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono border-t border-slate-100 pt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Cliques Gerados
                      </span>
                      <span className="font-bold text-slate-800 text-xs">{ind.clicks}</span>
                    </div>
                    <div className="border-l border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Reputação Score
                      </span>
                      <span className="font-bold text-emerald-600 text-xs">{ind.score}/100</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-1">
                    <button
                      onClick={() => {
                        onAddNotification(`Bônus especial enviado para ${ind.name}!`, "success");
                      }}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-slate-100"
                    >
                      Enviar Bônus
                    </button>
                    <button
                      onClick={() => {
                        onAddNotification(
                          `Indicador ${ind.name} foi notificado para revisão de dados.`,
                          "info",
                        );
                      }}
                      className="flex-1 bg-white border border-slate-200 text-red-600 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-red-50"
                    >
                      Auditar Indicador
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* FORM MODAL: ADD PRODUCT */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => setIsAddingProduct(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Novo Anúncio de Catálogo
              </span>
              <h2 className="font-display font-bold text-slate-900 text-xl mt-2">
                Escolha a Vertical e Cadastre o Bem
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                O formulário de atributos de dados se adaptará automaticamente.
              </p>
            </div>

            {/* Vertical picker — todas as verticais suportadas */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 mb-6">
              {VERTICALS_ORDER.map((cat) => {
                const v = VERTICALS[cat];
                const active = newProductCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    title={v.label}
                    className={`py-3 px-1 rounded-2xl border text-xs font-bold text-center flex flex-col items-center gap-1.5 transition-all uppercase tracking-wide ${
                      active
                        ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xl">{v.emoji}</span>
                    <span className="text-[9px] block leading-tight">{v.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Título do Anúncio
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="ex: Porsche Carrera GTS 2022 ou Mansão Alphaville"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Descrição Comercial
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    placeholder="Destaque os principais diferenciais, opcionais, revisões and condições comerciais."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="ex: 159000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.city}
                      onChange={(e) => setProductForm({ ...productForm, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={productForm.state}
                      onChange={(e) =>
                        setProductForm({ ...productForm, state: e.target.value.toUpperCase() })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC ATTRIBUTES FIELDS — renderizados a partir de src/lib/verticals.ts */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-xs font-bold text-slate-800 uppercase mb-3">
                  Atributos Específicos ({getVertical(newProductCategory)?.shortLabel ?? newProductCategory})
                </span>
                <DynamicAttributesFields
                  category={newProductCategory}
                  values={productForm.attributes ?? {}}
                  onChange={(next) => setProductForm({ ...productForm, attributes: next })}
                  mode="product"
                />
              </div>

              {/* Commission Config Block */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="block text-xs font-bold text-slate-800 uppercase mb-1">
                    Configuração de Comissionamento
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Insira a porcentagem de repasse sobre o valor de venda.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-600 font-semibold mb-1 uppercase">
                    Digital (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={productForm.commissionDigitalPct}
                    onChange={(e) =>
                      setProductForm({ ...productForm, commissionDigitalPct: e.target.value })
                    }
                    placeholder="1"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-600 font-semibold mb-1 uppercase flex items-center justify-between">
                    <span>Presencial (%)</span>
                    <input
                      type="checkbox"
                      checked={productForm.allowPresencialTier}
                      onChange={(e) =>
                        setProductForm({ ...productForm, allowPresencialTier: e.target.checked })
                      }
                      className="w-3.5 h-3.5 text-orange-600 focus:ring-orange-500 animate-pulse"
                    />
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!productForm.allowPresencialTier}
                    value={productForm.commissionPresencialPct}
                    onChange={(e) =>
                      setProductForm({ ...productForm, commissionPresencialPct: e.target.value })
                    }
                    placeholder="3"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Image selector (Preset OR Direct Upload) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="block text-xs font-semibold text-slate-700 uppercase">
                    Imagens do Anúncio
                  </span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold uppercase">
                    <span className="px-3 py-1 rounded-md bg-white text-slate-800 shadow">
                      {uploadedImages.length > 0
                        ? "Upload do Dispositivo Ativo"
                        : "Preset ou Upload"}
                    </span>
                  </div>
                </div>

                {/* Direct device upload button */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-100/50 transition-all relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="product-file-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      const readers: Promise<string>[] = (Array.from(files) as File[]).map(
                        (file: File) => {
                          return new Promise((resolve) => {
                            const r = new FileReader();
                            r.onloadend = () => resolve(r.result as string);
                            r.readAsDataURL(file);
                          });
                        },
                      );

                      Promise.all(readers).then((results) => {
                        setUploadedImages((prev) => [...prev, ...results]);
                        onAddNotification(
                          `${results.length} imagem(ns) carregada(s) do seu dispositivo!`,
                          "success",
                        );
                      });
                    }}
                  />
                  <div className="space-y-1 pointer-events-none">
                    <div className="text-2xl">📤</div>
                    <span className="block text-xs font-bold text-slate-700">
                      Clique ou arraste para carregar fotos do dispositivo
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Você pode carregar várias imagens (galeria completa)
                    </span>
                  </div>
                </div>

                {/* Show uploaded previews */}
                {uploadedImages.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Galeria Carregada ({uploadedImages.length} fotos)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImages([]);
                          onAddNotification("Galeria de uploads limpa.", "info");
                        }}
                        className="text-[9px] text-red-600 font-bold hover:underline"
                      >
                        Limpar tudo
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden aspect-video border border-slate-200"
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white text-[8px] px-1 rounded font-bold font-mono">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">
                      Ou selecione uma foto de capa rápida das predefinidas:
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      {presetImages[newProductCategory].map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setProductForm({ ...productForm, coverImage: img })}
                          className={`relative rounded-xl overflow-hidden cursor-pointer border-2 aspect-video transition-all ${
                            productForm.coverImage === img
                              ? "border-orange-600 scale-[1.03] shadow-md"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {productForm.coverImage === img && (
                            <div className="absolute top-1.5 right-1.5 bg-orange-600 text-white p-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 shadow-orange-100"
              >
                <Sparkles className="w-4 h-4 text-orange-200" />
                Publicar Anúncio no Catálogo Geral
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLOSING SALE AUDIT (NF AND CONTRACT RELEASE) */}
      {closingSaleLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => setClosingSaleLead(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="bg-emerald-100 text-emerald-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Faturamento & Quitação de Venda
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Garante a auditoria correta do faturamento da venda.
              </p>
            </div>

            <form onSubmit={handleCloseSaleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-2.5">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">
                    Cliente
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {closingSaleLead.clientName}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">
                    Indicado por
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {closingSaleLead.indicatorName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-150 pt-2.5">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">
                      Comissão Devida
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      R$ {closingSaleLead.commissionValue.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">
                      Atribuição
                    </span>
                    <span className="text-xs font-bold uppercase text-orange-700">
                      {closingSaleLead.commissionType}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Notas Internas de Fechamento
                </label>
                <textarea
                  rows={2}
                  required
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="ex: Venda de R$ 940.000,00 fechada com pagamento à vista via TED. Nota fiscal emitida."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              {/* Upload contract simulation */}
              <div className="border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-2xl p-5 text-center transition-colors cursor-pointer bg-slate-50/50">
                <input
                  type="file"
                  id="invoice_file_upload"
                  accept="image/*,.pdf"
                  onChange={() => {
                    setInvoiceUploaded(true);
                    onAddNotification(
                      "Nota Fiscal/Contrato anexado ao relatório de fechamento!",
                      "info",
                    );
                  }}
                  className="hidden"
                />
                <label htmlFor="invoice_file_upload" className="cursor-pointer space-y-1 block">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="block text-xs font-bold text-orange-600">
                    Anexar NF-e ou Contrato de Compra e Venda
                  </span>
                  <span className="block text-[9px] text-slate-400">
                    PDF ou Imagem de comprovação de fechamento
                  </span>
                </label>
              </div>

              {invoiceUploaded && (
                <p className="text-xs text-emerald-600 font-bold text-center flex items-center justify-center gap-1">
                  ✓ Comprovante anexado! Pronto para liquidar.
                </p>
              )}

              <button
                type="submit"
                disabled={!invoiceUploaded}
                className={`w-full py-3 rounded-xl font-semibold text-xs transition-all shadow ${
                  invoiceUploaded
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Confirmar Faturamento e Pagar Comissão
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: MESA DE FINANCIAMENTOS (ADVERTISER CAR CREDIT DESK) */}
      {activeTab === "financiamentos" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Intro header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-orange-500" />
                <h3 className="font-display font-bold text-lg">
                  Mesa de Análise de Crédito Veicular
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Gerencie as fichas cadastrais enviadas pelos seus Indicadores Parceiros. Consulte as
                mesas de crédito dos bancos integrados, simule as parcelas e retorne as opções
                aprovadas. O indicador poderá intermediar diretamente com o cliente para a
                assinatura digital do contrato!
              </p>
            </div>
            <span className="bg-orange-950/60 border border-orange-800 text-orange-400 text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider shrink-0">
              Mesa Ativa •{" "}
              {simulations?.filter((s) => s.advertiserId === advertiser.id).length || 0} Fichas
            </span>
          </div>

          {/* Quick status counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                Aguardando Loja
              </span>
              <span className="block font-display font-bold text-lg text-amber-500 mt-1">
                {simulations?.filter(
                  (s) => s.advertiserId === advertiser.id && s.status === "pendente",
                ).length || 0}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                Em Análise
              </span>
              <span className="block font-display font-bold text-lg text-indigo-500 mt-1">
                {simulations?.filter(
                  (s) => s.advertiserId === advertiser.id && s.status === "analise_bancos",
                ).length || 0}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                Aprovadas
              </span>
              <span className="block font-display font-bold text-lg text-emerald-500 mt-1">
                {simulations?.filter(
                  (s) => s.advertiserId === advertiser.id && s.status === "aprovado",
                ).length || 0}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                Contratos Assinados
              </span>
              <span className="block font-display font-bold text-lg text-slate-900 mt-1">
                {simulations?.filter(
                  (s) => s.advertiserId === advertiser.id && s.status === "concluido",
                ).length || 0}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center col-span-2 md:col-span-1">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                Crédito Recusado
              </span>
              <span className="block font-display font-bold text-lg text-red-500 mt-1">
                {simulations?.filter(
                  (s) => s.advertiserId === advertiser.id && s.status === "rejeitado",
                ).length || 0}
              </span>
            </div>
          </div>

          {/* Table list of simulations */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="font-display font-bold text-slate-900 text-sm">
                Fichas de Crédito Recebidas
              </h4>
              <p className="text-[11px] text-slate-500">
                Ordene por data para priorizar o atendimento rápido
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {simulations
                ?.filter((s) => s.advertiserId === advertiser.id)
                .map((sim) => (
                  <div key={sim.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Vehicle & Indicator information */}
                      <div className="lg:col-span-3 space-y-2">
                        <div className="flex gap-3 items-center">
                          <div className="w-12 h-9 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
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
                            <h5 className="font-bold text-xs text-slate-900 leading-tight">
                              {sim.productTitle}
                            </h5>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Valor: R$ {sim.productPrice.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/50 text-[10px] text-slate-600 space-y-0.5">
                          <p className="font-semibold text-slate-700">Enviado por:</p>
                          <p className="font-bold text-orange-700 line-clamp-1">
                            {sim.indicatorName}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">
                            ID: {sim.id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Buyer Cadastral Data */}
                      <div className="lg:col-span-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] leading-relaxed text-slate-700 grid grid-cols-2 gap-x-3 gap-y-1">
                        <div className="col-span-2 pb-1 border-b border-slate-200/50 mb-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">
                            Cadastro do Comprador
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Nome:</span>
                          <span className="font-bold text-slate-900 line-clamp-1">
                            {sim.clientName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">CPF do Cliente:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {sim.clientCpf}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">WhatsApp:</span>
                          <span className="font-bold text-slate-900">{sim.clientPhone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Data Nasc:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {sim.clientBirthDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Renda Mensal:</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            R$ {sim.clientIncome.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">
                            Entrada Proposta:
                          </span>
                          <span className="font-bold text-slate-900 font-mono">
                            R$ {sim.downPayment.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      {/* Banking Response & Contract summaries */}
                      <div className="lg:col-span-3 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Status atual:
                          </span>
                          {sim.status === "pendente" && (
                            <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Pendente
                            </span>
                          )}
                          {sim.status === "analise_bancos" && (
                            <span className="bg-indigo-100 text-indigo-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Em Análise
                            </span>
                          )}
                          {sim.status === "aprovado" && (
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Crédito Aprovado
                            </span>
                          )}
                          {sim.status === "rejeitado" && (
                            <span className="bg-red-100 text-red-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Recusado
                            </span>
                          )}
                          {sim.status === "concluido" && (
                            <span className="bg-slate-950 text-slate-100 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                              Assinado
                            </span>
                          )}
                        </div>

                        {/* Display final contract if approved */}
                        {sim.approvedContract ? (
                          <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-800 space-y-1 text-[10px] leading-relaxed">
                            <p className="font-bold text-[9px] text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />{" "}
                              {sim.approvedContract.bankName}
                            </p>
                            <p className="font-mono text-slate-300">
                              Termo:{" "}
                              <strong className="font-bold text-white">
                                {sim.approvedContract.installmentsCount}x R${" "}
                                {sim.approvedContract.installmentValue.toLocaleString("pt-BR")}
                              </strong>
                            </p>
                            <p className="font-mono text-slate-400">
                              Taxa:{" "}
                              <span className="font-bold text-orange-400">
                                {sim.approvedContract.interestRate}% a.m.
                              </span>{" "}
                              • Financiado: R${" "}
                              {sim.approvedContract.approvedAmount.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            {sim.status === "pendente" && "Aguardando simulação multi-banco."}
                            {sim.status === "analise_bancos" &&
                              "Simulação em andamento com bancos."}
                            {sim.status === "rejeitado" &&
                              "Nenhuma cotação aprovada para este perfil."}
                          </p>
                        )}
                      </div>

                      {/* Interactive back-office controls */}
                      <div className="lg:col-span-2 flex flex-col gap-2 self-center w-full">
                        {sim.status === "pendente" && (
                          <button
                            onClick={() => handleInitiateBankAnalysis(sim.id)}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3 animate-spin-slow" />
                            Iniciar Simulação
                          </button>
                        )}

                        {sim.status === "analise_bancos" && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(sim)}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Aprovar Crédito
                            </button>
                            <button
                              onClick={() => handleUpdateSimStatusOnly(sim.id, "rejeitado")}
                              className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-[10px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              Recusar Crédito
                            </button>
                          </>
                        )}

                        {sim.status === "aprovado" && (
                          <button
                            onClick={() => handleUpdateSimStatusOnly(sim.id, "concluido")}
                            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Registrar Assinatura
                          </button>
                        )}

                        {sim.status === "rejeitado" && (
                          <span className="text-center text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 p-2 rounded-xl">
                            Ficha Recusada
                          </span>
                        )}

                        {sim.status === "concluido" && (
                          <span className="text-center text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-xl flex items-center justify-center gap-1">
                            ✓ Venda Concluída
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {simulations?.filter((s) => s.advertiserId === advertiser.id).length === 0 && (
                <div className="text-center py-20 bg-white">
                  <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h5 className="font-bold text-slate-800 text-sm">
                    Nenhuma ficha de crédito enviada
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Você ainda não recebeu propostas de financiamento dos indicadores cadastrados
                    para os seus anúncios de veículos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADVERTISER CREDIT BANK COMPARISON & CONTRACT APPROVAL */}
      {showSimEditModal && editingSimId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative font-sans shadow-2xl max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowSimEditModal(false);
                setEditingSimId(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            >
              ✕
            </button>

            <div className="text-center mb-6 border-b border-slate-100 pb-4">
              <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Mesa de Crédito • Loja
              </span>
              <h2 className="font-display font-bold text-slate-900 text-xl mt-2">
                Simular e Aprovar Financiamento
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure os bancos credenciados e registre os termos do contrato aprovado de
                financiamento.
              </p>
            </div>

            <form onSubmit={handleSaveSimUpdates} className="space-y-4">
              {/* Step 1: Manage simulated bank responses (shown to indicators) */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  1. Cotações de Bancos Integrados (Editável)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {editBankResponses.map((bank, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 line-clamp-1">
                          {bank.bankName}
                        </span>
                        <span className="bg-orange-150 text-orange-800 text-[8px] font-bold px-1 py-0.5 rounded">
                          Banco
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div>
                          <label className="text-[9px] text-slate-400 block font-semibold">
                            Valor Financiado
                          </label>
                          <input
                            type="number"
                            required
                            value={bank.approvedAmount}
                            onChange={(e) => {
                              const copy = [...editBankResponses];
                              copy[index].approvedAmount = parseFloat(e.target.value) || 0;
                              setEditBankResponses(copy);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block font-semibold">
                            Parcela (R$)
                          </label>
                          <input
                            type="number"
                            required
                            value={bank.installmentValue}
                            onChange={(e) => {
                              const copy = [...editBankResponses];
                              copy[index].installmentValue = parseFloat(e.target.value) || 0;
                              setEditBankResponses(copy);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block font-semibold">
                            Taxa de Juros (% a.m.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={bank.interestRate}
                            onChange={(e) => {
                              const copy = [...editBankResponses];
                              copy[index].interestRate = parseFloat(e.target.value) || 0;
                              setEditBankResponses(copy);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Set the officially Approved Contract term */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  2. Condições Gerais do Contrato Aprovado (Oficial)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Instituição de Crédito Escolhida
                    </label>
                    <select
                      value={approvedContractForm.bankName}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          bankName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Banco Itaú Veículos">Banco Itaú Veículos</option>
                      <option value="Banco Bradesco Financiamentos">
                        Banco Bradesco Financiamentos
                      </option>
                      <option value="BV Financeira">BV Financeira</option>
                      <option value="Banco Santander Auto">Banco Santander Auto</option>
                      <option value="Safra Financeira">Safra Financeira</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor de Financiamento Aprovado (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={approvedContractForm.approvedAmount}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          approvedAmount: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor de Entrada Requerida (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={approvedContractForm.downPaymentRequired}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          downPaymentRequired: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Taxa de Juros Cadastrada (% a.m.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={approvedContractForm.interestRate}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          interestRate: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Quantidade de Parcelas
                    </label>
                    <select
                      value={approvedContractForm.installmentsCount}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          installmentsCount: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    >
                      <option value={12}>12x parcelas</option>
                      <option value={24}>24x parcelas</option>
                      <option value={36}>36x parcelas</option>
                      <option value={48}>48x parcelas</option>
                      <option value={60}>60x parcelas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valor Unitário da Parcela (R$)
                    </label>
                    <input
                      type="number"
                      required
                      value={approvedContractForm.installmentValue}
                      onChange={(e) =>
                        setApprovedContractForm({
                          ...approvedContractForm,
                          installmentValue: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Instruções para o Indicador / Comprador
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={approvedContractForm.additionalNotes}
                    onChange={(e) =>
                      setApprovedContractForm({
                        ...approvedContractForm,
                        additionalNotes: e.target.value,
                      })
                    }
                    placeholder="ex: Crédito liberado! Favor pedir para o comprador carregar a cópia legível da CNH e comprovante de residência diretamente no portal de assinatura eletrônica."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSimEditModal(false);
                    setEditingSimId(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Salvar e Aprovar Crédito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WHATSAPP NOTIFICATION FOR INDICATOR */}
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
                Notificar Indicador via WhatsApp
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Uma mensagem informando sobre a conclusão da análise de financiamento e o link do
                painel do indicador foi gerada com sucesso!
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
                  const cleanedPhone = whatsAppNotificationData.indicatorPhone.replace(/\D/g, "");
                  const phoneWithCountry =
                    cleanedPhone.length === 10 || cleanedPhone.length === 11
                      ? "55" + cleanedPhone
                      : cleanedPhone;
                  const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsAppNotificationData.text)}`;
                  window.open(url, "_blank");
                  setWhatsAppNotificationData(null);
                  onAddNotification("Notificação direcionada ao WhatsApp com sucesso!", "success");
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" /> Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALHES COMPLETOS DO LEAD E INDICADOR */}
      {viewingLead &&
        (() => {
          const associatedInd = indicators.find((ind) => ind.id === viewingLead.indicatorId);
          const relativeProduct = products.find((prod) => prod.id === viewingLead.productId);

          // Define human-readable referral channel details
          let channelDesc = "Acesso vindo de tráfego direto ou link compartilhado.";
          if (viewingLead.referralChannel?.toLowerCase().includes("instagram")) {
            channelDesc =
              "Este lead foi gerado após clicar em um link compartilhado no perfil (Bio) ou Stories do Instagram do indicador.";
          } else if (viewingLead.referralChannel?.toLowerCase().includes("whatsapp")) {
            channelDesc =
              "Este lead foi gerado através de um link de indicação enviado diretamente pelo WhatsApp pelo indicador.";
          } else if (viewingLead.referralChannel?.toLowerCase().includes("facebook")) {
            channelDesc =
              "Este lead veio de uma postagem ou indicação em grupos do Facebook do indicador.";
          } else if (viewingLead.referralChannel?.toLowerCase().includes("linkedin")) {
            channelDesc = "Este lead veio de uma publicação profissional no LinkedIn do indicador.";
          }

          return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative font-sans shadow-2xl my-8">
                <button
                  onClick={() => setViewingLead(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-orange-100 text-orange-800 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase font-mono">
                    Dossiê de Lead {viewingLead.id}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase font-mono">
                    {viewingLead.status.replace("_", " ")}
                  </span>
                </div>

                <h2 className="font-display font-bold text-slate-900 text-xl mb-1">
                  Atendimento & Rastreamento de Lead
                </h2>
                <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-4">
                  Consulte todas as informações do lead de venda e do indicador autônomo responsável
                  pelo direcionamento.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* COLUMN 1: CLIENT DETAILS & INTERESTS */}
                  <div className="space-y-4">
                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/40">
                      <h3 className="text-xs font-bold uppercase text-orange-800 mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Dados Completos do Lead
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                            Nome do Comprador
                          </span>
                          <p className="text-slate-900 font-bold text-sm">
                            {viewingLead.clientName}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                            Telefone de Contato
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-slate-900 font-mono font-semibold">
                              {viewingLead.clientPhone}
                            </span>
                            <a
                              href={`https://api.whatsapp.com/send?phone=55${viewingLead.clientPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Smartphone className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        </div>
                        {viewingLead.clientEmail && (
                          <div>
                            <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                              E-mail
                            </span>
                            <p className="text-slate-900 font-mono font-medium">
                              {viewingLead.clientEmail}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                            Data de Entrada
                          </span>
                          <p className="text-slate-700 font-mono">
                            {new Date(viewingLead.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
                      <h3 className="text-xs font-bold uppercase text-slate-800 mb-3 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        Produto de Interesse
                      </h3>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-950 text-sm">
                          {viewingLead.productTitle}
                        </p>
                        <p className="text-[10px] text-slate-500 capitalize">
                          Categoria: {viewingLead.productCategory}
                        </p>
                        {relativeProduct && (
                          <p className="text-[11px] font-bold text-orange-600 mt-1">
                            Valor do Produto: R$ {relativeProduct.price.toLocaleString("pt-BR")}
                          </p>
                        )}
                        <p className="text-[11px] font-bold text-emerald-600">
                          Comissão do Indicador: R${" "}
                          {viewingLead.commissionValue.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: REFERRAL SOURCE & INDICATOR DOSSIER */}
                  <div className="space-y-4">
                    {/* Indicator info card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
                      <h3 className="text-xs font-bold uppercase text-slate-800 mb-3 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Dossiê do Indicador
                      </h3>

                      {associatedInd ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-400 block font-semibold uppercase text-[9px]">
                              Indicador Responsável
                            </span>
                            <p className="text-slate-900 font-bold text-sm">{associatedInd.name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <span className="text-slate-400 block uppercase text-[8px] font-bold">
                                Liga Atual
                              </span>
                              <p className="text-slate-800 font-bold capitalize text-[11px] flex items-center gap-1">
                                👑 {associatedInd.league}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase text-[8px] font-bold">
                                Pontuação
                              </span>
                              <p className="text-slate-800 font-bold text-[11px] font-mono">
                                ⭐ {associatedInd.score} pts
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-slate-200/60 pt-2 mt-2 space-y-1">
                            <p className="text-[10px] text-slate-600 truncate">
                              <strong>E-mail:</strong> {associatedInd.email}
                            </p>
                            <p className="text-[10px] text-slate-600 flex items-center gap-1">
                              <strong>Celular:</strong> {associatedInd.phone}
                              <a
                                href={`https://api.whatsapp.com/send?phone=55${associatedInd.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline font-bold"
                              >
                                [WhatsApp]
                              </a>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{viewingLead.indicatorName}</p>
                          <p className="text-[10px] text-slate-400">
                            Indicador importado por link direto de simulação.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Channel tracking information */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
                      <h3 className="text-xs font-bold uppercase text-slate-800 mb-2 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        Canal de Origem / Rastreamento
                      </h3>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">
                            {viewingLead.referralChannel || "Link Direto / WhatsApp"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{channelDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHEDULING & OBSERVATIONS SECTION */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl">
                    <h3 className="text-xs font-bold uppercase text-amber-900 mb-3 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      Agendamento da Visita Física & Observações
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Dia da Visita
                        </label>
                        <input
                          type="date"
                          defaultValue={
                            viewingLead.visitDate ? viewingLead.visitDate.substring(0, 10) : ""
                          }
                          id="details_visit_date"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Horário da Visita
                        </label>
                        <input
                          type="time"
                          defaultValue={
                            viewingLead.visitDate ? viewingLead.visitDate.substring(11, 16) : ""
                          }
                          id="details_visit_time"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-xs">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Observações do Atendimento / Histórico de Contato
                      </label>
                      <textarea
                        rows={2}
                        defaultValue={viewingLead.notes || ""}
                        id="details_visit_notes"
                        placeholder="Adicione observações sobre o contato feito, preferências de horários, ou detalhes sobre o andamento do lead..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const dateVal = (
                            document.getElementById("details_visit_date") as HTMLInputElement
                          )?.value;
                          const timeVal = (
                            document.getElementById("details_visit_time") as HTMLInputElement
                          )?.value;
                          const notesVal = (
                            document.getElementById("details_visit_notes") as HTMLTextAreaElement
                          )?.value;

                          let combinedDate = undefined;
                          if (dateVal && timeVal) {
                            combinedDate = `${dateVal}T${timeVal}:00`;
                          } else if (dateVal) {
                            combinedDate = `${dateVal}T12:00:00`;
                          }

                          // Update lead notes and scheduling
                          onUpdateLeadStatus(
                            viewingLead.id,
                            viewingLead.visitDate || combinedDate
                              ? "visita_agendada"
                              : viewingLead.status,
                            {
                              visitDate: combinedDate,
                              notes: notesVal,
                            },
                          );

                          onAddNotification(
                            "Dados de agendamento e observações salvos com sucesso!",
                            "success",
                          );
                          setViewingLead(null);
                        }}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow shadow-orange-100 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Salvar Agendamento & Observações
                      </button>
                    </div>
                  </div>
                </div>

                {/* LIVE CHAT INTERFACE FOR ADVERTISER */}
                <div className="mt-6 border-t border-slate-100 pt-5 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                      Chat de Atendimento Exclusivo • Contato Seguro
                    </h3>
                    <div className="bg-slate-900 border border-slate-800 text-orange-400 rounded-full px-2.5 py-0.5 text-[8px] font-mono uppercase font-bold">
                      Monitoramento Antifraude Ativo
                    </div>
                  </div>

                  {/* Info banner about safety */}
                  <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl text-[10px] text-orange-950 mb-3 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Privacidade & Garantia de Atribuição:</p>
                      <p className="mt-0.5">
                        Para sua segurança e do indicador{" "}
                        <strong>{viewingLead.indicatorName}</strong>, este canal de chat possui
                        filtros em tempo real contra compartilhamento direto de celular, e-mail e
                        links externos. O indicador está em modo observador acompanhando o progresso
                        para garantir a comissão.
                      </p>
                    </div>
                  </div>

                  {/* Chat window body */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col h-[280px]">
                    {/* Message log wrapper */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                      {(() => {
                        const leadMessages = chatMessages.filter(
                          (msg) => msg.leadId === viewingLead.id,
                        );
                        if (leadMessages.length === 0) {
                          return (
                            <p className="text-center text-xs text-slate-400 py-8">
                              Não há histórico de conversas para este lead.
                            </p>
                          );
                        }

                        return leadMessages.map((msg) => {
                          if (msg.senderRole === "system") {
                            return (
                              <div key={msg.id} className="mx-auto max-w-[85%] text-center my-1">
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

                          const isMe = msg.senderRole === "advertiser";
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                                  isMe
                                    ? "bg-slate-900 text-white rounded-br-none"
                                    : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                                }`}
                              >
                                <span className="font-bold text-[9px] block opacity-85 mb-0.5">
                                  {isMe
                                    ? "Você (Anunciante)"
                                    : `Comprador (${viewingLead.clientName})`}
                                </span>

                                {msg.originalText && msg.originalText !== msg.text ? (
                                  <div className="space-y-1">
                                    <p className="line-through text-slate-400 text-[10px] italic">
                                      {msg.originalText}
                                    </p>
                                    <div className="bg-red-50 text-red-800 text-[10px] p-1 rounded border border-red-100 font-medium">
                                      🚫 Contato bloqueado: {msg.text}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="leading-relaxed font-sans">{msg.text}</p>
                                )}

                                <span className="block text-[8px] opacity-60 text-right mt-1">
                                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Chat input footer */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!advertiserChatText.trim()) return;
                        onSendChatMessage(
                          viewingLead.id,
                          advertiser.id,
                          advertiser.name,
                          "advertiser",
                          advertiserChatText.trim(),
                        );
                        setAdvertiserChatText("");
                      }}
                      className="p-2 bg-white border-t border-slate-200 flex gap-1.5"
                    >
                      <input
                        type="text"
                        value={advertiserChatText}
                        onChange={(e) => setAdvertiserChatText(e.target.value)}
                        placeholder="Responda ao cliente com segurança aqui..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-xl transition-all shadow active:scale-95 flex items-center justify-center"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100 text-xs font-semibold">
                  <button
                    onClick={() => setViewingLead(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors"
                  >
                    Fechar Janela
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* MODAL: REGISTRAR E AGENDAR VISITA DO LEAD */}
      {schedulingLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative font-sans shadow-2xl">
            <button
              onClick={() => setSchedulingLead(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="bg-amber-100 text-amber-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="font-display font-bold text-slate-900 text-lg">
                Agendamento de Visita Física
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Insira os dados acordados de data, horário e observações.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs mb-4 space-y-1">
              <p className="text-[9px] uppercase font-bold text-slate-400">Cliente Indicado</p>
              <p className="font-bold text-slate-800 text-sm">{schedulingLead.clientName}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {schedulingLead.clientPhone}
              </p>
              <p className="text-[10px] text-orange-600 font-bold block truncate uppercase mt-1">
                Interesse: {schedulingLead.productTitle}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!visitDateInput) {
                  onAddNotification("Por favor, informe o dia da visita!", "info");
                  return;
                }
                const finalTime = visitTimeInput || "12:00";
                const combinedISO = `${visitDateInput}T${finalTime}:00`;

                // Call status updater in App.tsx
                onUpdateLeadStatus(schedulingLead.id, "visita_agendada", {
                  visitDate: combinedISO,
                  notes: visitNotesInput,
                });

                onAddNotification("Visita agendada e registrada com sucesso!", "success");
                setSchedulingLead(null);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Dia da Visita *
                  </label>
                  <input
                    type="date"
                    required
                    value={visitDateInput}
                    onChange={(e) => setVisitDateInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Horário da Visita
                  </label>
                  <input
                    type="time"
                    value={visitTimeInput}
                    onChange={(e) => setVisitTimeInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Observações do Cliente / Notas de Visita
                </label>
                <textarea
                  rows={3}
                  value={visitNotesInput}
                  onChange={(e) => setVisitNotesInput(e.target.value)}
                  placeholder="ex: Cliente virá acompanhado do corretor de plantão. Precisa estacionar no local."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingLead(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Salvar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
