import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

import { Product, Lead, Category, FinancingSimulation } from "./types";
import { VERTICALS, VERTICALS_ORDER } from "./lib/verticals";
import { isUuid } from "./lib/repositories";
import {
  useAdvertiserProfile,
  useIndicatorProfile,
  useUpdateAdvertiser,
  useUpdateIndicator,
  useIndicatorRealtimeSync,
  useActiveProducts,
  useAdvertiserProducts,
  useAllProducts,
  useCreateProduct,
  useUpdateProductStatus,
  useUpdateProduct,
  useDeleteProduct,
  useIndicatorCommissions,
  useAdvertiserCommissions,
  usePayCommission,
  useAllCommissions,
  useAllSimulations,
  useNotifications,
  useMarkNotificationsRead,
  useAdvertiserLeads,
  useIndicatorLeads,
  useAllLeads,
  useCreateLead,
  useUpdateLead,
  useRequestCheckIn,
  useLeadsRealtimeSync,
  useChatMessages,
  useSendChatMessage,
  useChatRealtimeSync,
  useAdvertiserSimulations,
  useIndicatorSimulations,
  useCreateSimulation,
  useUpdateSimulationStatus,
  useAllAdvertisers,
  useAllIndicators,
  useAdvertiserRelatedIndicators,
  usePlatformConfig,
  useUpdatePlatformConfig,
} from "./hooks/queries";

import AffiliateDashboard from "./components/AffiliateDashboard";
import AdvertiserDashboard from "./components/AdvertiserDashboard";
import AdminPanel from "./components/AdminPanel";
import VisitorView from "./components/VisitorView";
import LandingPage from "./components/LandingPage";
import AuthBar from "./components/AuthBar";
import CommissionCelebration from "./components/CommissionCelebration";
import { useAuth, signOut as supabaseSignOut } from "./hooks/useAuth";

type LoggedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "indicador" | "anunciante" | "admin";
};

export default function App() {
  // --- UI / NAVEGAÇÃO ---
  const [currentRole, setCurrentRole] = useState<
    "indicador" | "anunciante" | "admin" | "visitante"
  >("indicador");
  const [activeReferralId, setActiveReferralId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string>("");
  // Quando true, o visitante chegou via link único (?p=). Impede navegação para outros anúncios.
  const [lockedToSharedProduct, setLockedToSharedProduct] = useState<boolean>(false);
  // Lead criado pelo próprio visitante nesta sessão (para acompanhar o chat sem estar logado).
  const [visitorLeadId, setVisitorLeadId] = useState<string | null>(null);

  // Sessão real vem exclusivamente do Supabase (useAuth) via bridge abaixo.
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);

  // Categorias: derivadas de verticals.ts (fonte oficial). Adições feitas no admin
  // valem só para a sessão — não há tabela dedicada no banco para isso.
  const [categories, setCategories] = useState<
    Array<{ id: Category | string; name: string; icon: string; fields: string[] }>
  >(() =>
    VERTICALS_ORDER.map((id) => ({
      id,
      name: VERTICALS[id].shortLabel,
      icon: VERTICALS[id].emoji,
      fields: VERTICALS[id].attributes.map((a) => a.label),
    })),
  );

  // Notifications Queue
  const [notifications, setNotifications] = useState<
    Array<{ id: string; msg: string; type: "success" | "info" }>
  >([]);

  const addNotification = (msg: string, type: "success" | "info" = "info") => {
    const id = `notif-${Date.now()}`;
    setNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // --- BRIDGE: Supabase Auth → loggedUser (única fonte de sessão) ---
  const { user: supaUser, roles: supaRoles, loading: supaLoading } = useAuth();
  useEffect(() => {
    if (supaLoading) return;
    if (!supaUser) {
      setLoggedUser(null);
      return;
    }
    const role: "indicador" | "anunciante" | "admin" = supaRoles.includes("admin")
      ? "admin"
      : supaRoles.includes("advertiser")
        ? "anunciante"
        : "indicador";
    const displayName =
      (supaUser.user_metadata?.full_name as string) ||
      (supaUser.user_metadata?.name as string) ||
      supaUser.email?.split("@")[0] ||
      "Usuário";
    const phone = (supaUser.user_metadata?.phone as string) || (supaUser.phone as string) || "";
    setLoggedUser({ id: supaUser.id, name: displayName, email: supaUser.email ?? "", phone, role });
    setCurrentRole(role);
  }, [supaUser, supaRoles, supaLoading]);

  // --- Query params: link de indicação / produto compartilhado ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    const prodParam = params.get("p");
    const srcParam = params.get("src");
    const roleParam = params.get("role");

    if (srcParam) localStorage.setItem("indica_cookie_src", srcParam);

    const cachedCookie = localStorage.getItem("indica_cookie_ref");
    if (cachedCookie) setActiveReferralId(cachedCookie);

    if (refParam) {
      localStorage.setItem("indica_cookie_ref", refParam);
      setActiveReferralId(refParam);
      setCurrentRole("visitante");
      addNotification(`Link de Indicação ativado! ID Promotor: ${refParam}`, "success");
    }

    if (prodParam) {
      setActiveProductId(prodParam);
      setCurrentRole("visitante");
      setLockedToSharedProduct(true);
    }

    // `?role=` não autentica ninguém: a sessão só vem do Supabase Auth (bridge acima).
    // O parâmetro apenas escolhe qual tela de login exibir.
    if (roleParam === "anunciante" || roleParam === "indicador") {
      setCurrentRole(roleParam);
    }
  }, []);

  // --- IDs derivados da sessão ---
  const indicatorId = loggedUser?.role === "indicador" ? loggedUser.id : undefined;
  const advertiserId = loggedUser?.role === "anunciante" ? loggedUser.id : undefined;
  const isAdmin = loggedUser?.role === "admin";
  const profileSeed = loggedUser
    ? { name: loggedUser.name, email: loggedUser.email, phone: loggedUser.phone }
    : {};

  // --- Perfis (garante + busca a linha do usuário logado) ---
  const indicatorProfileQuery = useIndicatorProfile(indicatorId, profileSeed);
  const advertiserProfileQuery = useAdvertiserProfile(advertiserId, profileSeed);
  const updateIndicatorMutation = useUpdateIndicator();
  const updateAdvertiserMutation = useUpdateAdvertiser();
  useIndicatorRealtimeSync(indicatorProfileQuery.data?.id);

  // --- Produtos ---
  const activeProductsQuery = useActiveProducts();
  const advertiserProductsQuery = useAdvertiserProducts(advertiserId);
  const allProductsQuery = useAllProducts(isAdmin);
  const createProductMutation = useCreateProduct();
  const updateProductStatusMutation = useUpdateProductStatus();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const payCommissionMutation = usePayCommission();
  // Comemoração de comissão paga — só o indicador recebe esse tipo de aviso.
  const notificationsQuery = useNotifications(!!indicatorId);
  const markNotificationsReadMutation = useMarkNotificationsRead();

  const products = useMemo<Product[]>(() => {
    if (isAdmin) return allProductsQuery.data ?? [];
    const byId = new Map<string, Product>();
    for (const p of activeProductsQuery.data ?? []) byId.set(p.id, p);
    for (const p of advertiserProductsQuery.data ?? []) byId.set(p.id, p);
    return Array.from(byId.values());
  }, [isAdmin, allProductsQuery.data, activeProductsQuery.data, advertiserProductsQuery.data]);

  // --- Leads ---
  const advertiserLeadsQuery = useAdvertiserLeads(advertiserId);
  const indicatorLeadsQuery = useIndicatorLeads(indicatorId);
  const allLeadsQuery = useAllLeads(isAdmin);
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const requestCheckInMutation = useRequestCheckIn();
  useLeadsRealtimeSync(loggedUser?.role ?? null);

  const leads = useMemo<Lead[]>(() => {
    if (isAdmin) return allLeadsQuery.data ?? [];
    if (advertiserId) return advertiserLeadsQuery.data ?? [];
    if (indicatorId) return indicatorLeadsQuery.data ?? [];
    return [];
  }, [
    isAdmin,
    advertiserId,
    indicatorId,
    allLeadsQuery.data,
    advertiserLeadsQuery.data,
    indicatorLeadsQuery.data,
  ]);

  // --- Anunciantes / Indicadores (listas usadas pelos painéis) ---
  const allAdvertisersQuery = useAllAdvertisers();
  const allIndicatorsQuery = useAllIndicators(isAdmin);
  const advertiserRelatedIndicatorsQuery = useAdvertiserRelatedIndicators(advertiserId);
  const advertiserCommissionsQuery = useAdvertiserCommissions(advertiserId);
  const indicatorCommissionsQuery = useIndicatorCommissions(indicatorId);
  const allCommissionsQuery = useAllCommissions(isAdmin);
  const allSimulationsQuery = useAllSimulations(isAdmin);
  const advertisers = allAdvertisersQuery.data ?? [];
  const indicators = isAdmin
    ? (allIndicatorsQuery.data ?? [])
    : advertiserId
      ? (advertiserRelatedIndicatorsQuery.data ?? [])
      : [];

  // --- Simulações de financiamento ---
  const advertiserSimulationsQuery = useAdvertiserSimulations(advertiserId);
  const indicatorSimulationsQuery = useIndicatorSimulations(indicatorId);
  const createSimulationMutation = useCreateSimulation();
  const updateSimulationStatusMutation = useUpdateSimulationStatus();
  const simulations: FinancingSimulation[] = advertiserId
    ? (advertiserSimulationsQuery.data ?? [])
    : indicatorId
      ? (indicatorSimulationsQuery.data ?? [])
      : [];

  // --- Chat: mensagens dos leads visíveis nesta sessão + lead do visitante atual ---
  const chatLeadIds = useMemo(() => {
    const ids = new Set(leads.map((l) => l.id));
    if (visitorLeadId) ids.add(visitorLeadId);
    return Array.from(ids);
  }, [leads, visitorLeadId]);
  const chatQuery = useChatMessages(chatLeadIds);
  const sendChatMessageMutation = useSendChatMessage();
  useChatRealtimeSync(chatLeadIds.length > 0);
  const chatMessages = chatQuery.data ?? [];

  // --- Config da plataforma ---
  const platformConfigQuery = usePlatformConfig();
  const updatePlatformConfigMutation = useUpdatePlatformConfig();

  // --- HANDLERS ---

  const handleSimulateReferral = (refId: string, prodId: string) => {
    localStorage.setItem("indica_cookie_ref", refId);
    setActiveReferralId(refId);
    setActiveProductId(prodId);
    setCurrentRole("visitante");
    addNotification(`Simulando visita via link de indicação de ${refId}!`, "success");
  };

  const handleUpdateIndicator = (updated: import("./types").Indicator) => {
    updateIndicatorMutation.mutate(updated, {
      onError: () => addNotification("Não foi possível salvar as alterações do indicador.", "info"),
    });
  };

  const handleUpdateAdvertiser = (updated: import("./types").Advertiser) => {
    updateAdvertiserMutation.mutate(updated, {
      onError: () =>
        addNotification("Não foi possível salvar as alterações do anunciante.", "info"),
    });
  };

  const handleAddProduct = (newProd: Product) => {
    const normalized: Product = isUuid(newProd.id)
      ? newProd
      : { ...newProd, id: crypto.randomUUID() };
    createProductMutation.mutate(normalized, {
      onError: () =>
        addNotification(
          "Não foi possível salvar o anúncio na nuvem. Verifique sua conexão.",
          "info",
        ),
    });
  };

  const handleUpdateProductStatus = (productId: string, status: Product["status"]) => {
    updateProductStatusMutation.mutate(
      { id: productId, status },
      { onSuccess: () => addNotification(`Status do produto atualizado para: ${status}`, "info") },
    );
  };

  const handleUpdateProduct = (updated: Product) => {
    updateProductMutation.mutate(updated, {
      onSuccess: () => addNotification(`Anúncio "${updated.title}" atualizado.`, "success"),
      onError: () => addNotification("Não foi possível atualizar o anúncio.", "info"),
    });
  };

  const handlePayCommission = (commissionId: string, reference?: string) => {
    payCommissionMutation.mutate(
      { commissionId, reference },
      {
        onSuccess: () => addNotification("Repasse registrado! O indicador foi avisado.", "success"),
        onError: (err) =>
          addNotification(
            err instanceof Error ? err.message : "Não foi possível registrar o repasse.",
            "info",
          ),
      },
    );
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId, {
      onSuccess: () => addNotification("Anúncio removido do catálogo.", "success"),
      onError: () => addNotification("Não foi possível remover o anúncio.", "info"),
    });
  };

  const buildSystemMessage = (leadId: string, text: string) => ({
    leadId,
    senderId: "system",
    senderName: "Sistema",
    senderRole: "system" as const,
    text,
    isSystem: true,
  });

  const handleUpdateLeadStatus = (
    leadId: string,
    status: Lead["status"],
    extra?: { visitDate?: string; notes?: string; checkInRequested?: boolean },
  ) => {
    updateLeadMutation.mutate({ id: leadId, patch: { status, ...(extra || {}) } });

    const stageLabels: Record<string, string> = {
      lead_recebido: "Lead recebido pela loja",
      contato_feito: "Primeiro contato realizado com o comprador",
      visita_agendada: "Visita agendada ao showroom",
      visita_confirmada: "Visita realizada e presença do indicador confirmada",
      proposta: "Proposta comercial apresentada",
      venda_concluida: "Venda concluída com sucesso!",
    };
    const label = stageLabels[status] || status.replace("_", " ");
    let systemText = `🔄 STATUS ALTERADO: O atendimento mudou para "${label}".`;
    if (extra?.visitDate) {
      const formattedDate = new Date(extra.visitDate).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
      systemText += ` Agendamento marcado para: ${formattedDate}.`;
    }
    if (extra?.notes) systemText += ` Observações: "${extra.notes}"`;
    if (extra?.checkInRequested) {
      systemText += ` 📍 O indicador sinalizou chegada com o comprador na loja física e aguarda confirmação.`;
    } else if (status === "visita_confirmada") {
      systemText += ` 📍 Presença física do indicador confirmada no showroom! Saldo pendente liberado.`;
    }
    const systemMsg = buildSystemMessage(leadId, systemText);
    sendChatMessageMutation.mutate(systemMsg, {
      onError: (e) => console.error("[App] system message (status change) failed", e),
    });

    addNotification(`Etapa do funil alterada: ${status.replace("_", " ")}`, "success");
  };

  // "Cheguei na Loja" — o indicador só sinaliza chegada (RPC estreita, não
  // consegue mudar status/comissão sozinho). Confirmar a visita continua
  // sendo exclusivo do anunciante, via handleUpdateLeadStatus acima.
  const handleRequestCheckIn = (leadId: string) => {
    requestCheckInMutation.mutate(leadId, {
      onSuccess: () => {
        sendChatMessageMutation.mutate(
          buildSystemMessage(
            leadId,
            "📍 O indicador sinalizou chegada com o comprador na loja física e aguarda confirmação.",
          ),
        );
        addNotification(
          "Você sinalizou que chegou à loja com o cliente! Uma notificação foi enviada ao lojista para confirmar.",
          "success",
        );
      },
      onError: (e) => {
        console.error("[App] requestCheckIn failed", e);
        addNotification("Não foi possível sinalizar chegada — tente novamente.", "info");
      },
    });
  };

  // O anexo (NF-e/contrato) é opcional — só serve como prova em caso de
  // disputa. A comissão é paga assim que o anunciante marca a venda como
  // fechada, com ou sem comprovante.
  const handleAttachLeadContract = (leadId: string, url: string | null, notes: string) => {
    const lead = leads.find((l) => l.id === leadId);
    updateLeadMutation.mutate(
      {
        id: leadId,
        patch: {
          ...(url ? { contractUrl: url } : {}),
          notes,
          commissionPaid: true,
          status: "venda_concluida",
        },
      },
      {
        onSuccess: () => {
          if (lead) {
            const proofText = url
              ? "e anexou o comprovante"
              : "sem anexar comprovante (fica disponível como prova opcional em caso de disputa)";
            const systemMsg = buildSystemMessage(
              leadId,
              `🎉 VENDA FECHADA! O anunciante oficializou o fechamento do negócio ${proofText}. Uma comissão de R$ ${lead.commissionValue.toLocaleString("pt-BR")} foi creditada diretamente na carteira disponível do indicador ${lead.indicatorName}!`,
            );
            sendChatMessageMutation.mutate(systemMsg, {
              onError: (e) => console.error("[App] system message (contract) failed", e),
            });
          }
        },
      },
    );
  };

  const handleSendChatMessage = (
    leadId: string,
    senderId: string,
    senderName: string,
    senderRole: "client" | "advertiser",
    text: string,
  ) => {
    // A sanitização (telefone/e-mail/links) roda no servidor, dentro da Edge
    // Function `send-chat-message` — o cliente só envia o texto bruto.
    sendChatMessageMutation.mutate(
      { leadId, senderId, senderName, senderRole, text },
      {
        onSuccess: (result) => {
          if (result.hasLeakage) {
            addNotification(
              "Contato externo bloqueado por segurança para proteger a indicação!",
              "info",
            );
          } else {
            addNotification("Mensagem enviada com sucesso!", "success");
          }
        },
        onError: () => addNotification("Falha ao enviar mensagem — tente novamente.", "info"),
      },
    );
  };

  const handleAddCategory = (newCat: {
    id: Category | string;
    name: string;
    icon: string;
    fields: string[];
  }) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdatePlatformConfig = (newConfig: import("./types").PlatformConfig) => {
    updatePlatformConfigMutation.mutate(newConfig, {
      onError: () =>
        addNotification("Não foi possível salvar a configuração da plataforma.", "info"),
    });
  };

  // Submit Lead from Visitor View
  const handleSubmitLeadFromVisitor = (leadData: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    notes?: string;
  }) => {
    const viewedProduct = products.find((p) => p.id === activeProductId);
    if (!viewedProduct) return;

    const currentRefId =
      activeReferralId || (loggedUser && loggedUser.role === "indicador" ? loggedUser.id : null);
    if (!currentRefId) {
      addNotification("Não foi possível identificar o indicador deste link.", "info");
      return;
    }

    const currentSrc = localStorage.getItem("indica_cookie_src") || "whatsapp";
    let channelLabel = "Link Direto / WhatsApp";
    if (currentSrc === "instagram") channelLabel = "Post no Instagram";
    else if (currentSrc === "facebook") channelLabel = "Facebook Grupo / Feed";
    else if (currentSrc === "tiktok") channelLabel = "TikTok Vídeo / Link na Bio";
    else if (currentSrc === "linkedin") channelLabel = "LinkedIn Publicação";

    // A comissão é calculada no servidor (Edge Function `create-lead`) a
    // partir do produto — o cliente nunca envia um valor de comissão.
    createLeadMutation.mutate(
      {
        productId: viewedProduct.id,
        indicatorId: currentRefId,
        clientName: leadData.clientName,
        clientPhone: leadData.clientPhone,
        clientEmail: leadData.clientEmail,
        notes: leadData.notes,
        referralChannel: channelLabel,
      },
      {
        onSuccess: (lead) => {
          setVisitorLeadId(lead.id);
          const systemText = `🚀 ATENDIMENTO INICIADO: Novo lead recebido sob indicação do parceiro. Canal de origem: *${channelLabel}*. O chat direto entre você e a loja parceira está ativo e protegido contra fraudes!`;
          sendChatMessageMutation.mutate(buildSystemMessage(lead.id, systemText));
          if (leadData.notes) {
            sendChatMessageMutation.mutate({
              leadId: lead.id,
              senderId: "client",
              senderName: leadData.clientName,
              senderRole: "client",
              text: leadData.notes,
            });
          }
          addNotification("Novo Lead registrado com sucesso!", "success");
        },
        onError: (err) => {
          console.error("[App] persist lead failed", err);
          addNotification("Falha ao sincronizar lead com o servidor.", "info");
        },
      },
    );
  };

  const handleLogout = () => {
    void supabaseSignOut();
    setLoggedUser(null);
    setCurrentRole("indicador");
    addNotification("Sessão encerrada com segurança.", "info");
  };

  const handleAddSimulation = (
    sim: Omit<FinancingSimulation, "id" | "createdAt" | "updatedAt" | "status">,
  ) => {
    const newSim: FinancingSimulation = {
      ...sim,
      id: crypto.randomUUID(),
      status: "pendente",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createSimulationMutation.mutate(newSim, {
      onSuccess: () =>
        addNotification(
          `Simulação de financiamento para ${sim.clientName} enviada à loja!`,
          "success",
        ),
      onError: () => addNotification("Não foi possível enviar a simulação.", "info"),
    });
  };

  const handleUpdateSimulationStatus = (
    simId: string,
    status: import("./types").FinancingStatus,
    bankResponses?: import("./types").BankSimulationResponse[],
    approvedContract?: import("./types").ApprovedContract,
  ) => {
    updateSimulationStatusMutation.mutate(
      { id: simId, status, bankResponses, approvedContract },
      { onSuccess: () => addNotification(`Simulação atualizada!`, "info") },
    );
  };

  // Find active promoter info for Visitor View
  const referralIndicator = indicators.find((i) => i.id === activeReferralId);
  const activeProductForVisitor = products.find((p) => p.id === activeProductId) || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white">
      <CommissionCelebration
        notifications={notificationsQuery.data ?? []}
        onDismiss={(ids) => markNotificationsReadMutation.mutate(ids)}
      />

      {/* Persistent Profile / Session Bar for Logged-In Users */}
      {loggedUser && currentRole !== "visitante" && (
        <div className="bg-blue-50/80 backdrop-blur-sm border-b border-blue-100/60 py-2.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-950 font-medium font-sans">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              Sessão Ativa: <strong className="font-bold">{loggedUser.name}</strong> (
              {loggedUser.role === "admin"
                ? "Administrador Geral"
                : loggedUser.role === "indicador"
                  ? "Indicador Autônomo"
                  : "Anunciante Parceiro"}
              ) — <span className="font-mono text-[10px] text-slate-500">{loggedUser.email}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AuthBar />
            <button
              onClick={handleLogout}
              className="bg-white border border-blue-200 text-blue-800 font-bold px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-sm text-[11px]"
            >
              <X className="w-3.5 h-3.5" />
              Sair do Painel
            </button>
          </div>
        </div>
      )}

      {/* Main Content Render Box based on current simulation role and login state */}
      <main className="flex-1 pb-16">
        {currentRole === "visitante" && activeProductForVisitor ? (
          <VisitorView
            product={activeProductForVisitor}
            /* Quando o visitante chega via link único, só vê esse produto — não pode navegar pelos outros. */
            products={lockedToSharedProduct ? [activeProductForVisitor] : products}
            referralId={
              activeReferralId ||
              (loggedUser && loggedUser.role === "indicador" ? loggedUser.id : null)
            }
            referralIndicatorName={
              referralIndicator?.name ||
              (loggedUser && loggedUser.role === "indicador" ? loggedUser.name : undefined)
            }
            /* Só permite "voltar" quando NÃO chegou via link compartilhado. */
            onGoBack={
              lockedToSharedProduct
                ? undefined
                : () => {
                    // Volta para o painel da sessão real (vinda do Supabase via bridge).
                    setCurrentRole(loggedUser ? loggedUser.role : "indicador");
                  }
            }
            onSubmitLead={handleSubmitLeadFromVisitor}
            onAddNotification={addNotification}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
            leads={leads}
          />
        ) : currentRole === "visitante" ? (
          /* Link único aberto mas produto ainda não carregado (ou removido). */
          <div className="flex-1 min-h-[60vh] flex items-center justify-center p-8">
            <div className="max-w-md text-center space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Anúncio não encontrado</h2>
              <p className="text-sm text-slate-500">
                Se esta mensagem persistir, o anúncio pode ter sido removido ou o link está
                incorreto.
              </p>
            </div>
          </div>
        ) : !loggedUser || loggedUser.role !== currentRole ? (
          /* Render beautiful complete Landing Page with Login Forms if no user is authenticated for this role */
          <LandingPage />
        ) : (
          /* Render respective authenticated dashboards */
          <>
            {currentRole === "indicador" && loggedUser && indicatorProfileQuery.data && (
              <AffiliateDashboard
                indicator={indicatorProfileQuery.data}
                onUpdateIndicator={handleUpdateIndicator}
                products={products}
                leads={leads}
                simulations={simulations}
                commissions={indicatorCommissionsQuery.data ?? []}
                onAddSimulation={handleAddSimulation}
                onUpdateLeadStatus={handleUpdateLeadStatus}
                onRequestCheckIn={handleRequestCheckIn}
                onAddNotification={addNotification}
                advertisers={advertisers}
                onViewProduct={(prodId) => {
                  setActiveProductId(prodId);
                  setCurrentRole("visitante");
                }}
                chatMessages={chatMessages}
                onSendChatMessage={handleSendChatMessage}
              />
            )}

            {currentRole === "anunciante" && loggedUser && advertiserProfileQuery.data && (
              <AdvertiserDashboard
                advertiser={advertiserProfileQuery.data}
                onUpdateAdvertiser={handleUpdateAdvertiser}
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProductStatus={handleUpdateProductStatus}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onPayCommission={handlePayCommission}
                commissions={advertiserCommissionsQuery.data ?? []}
                leads={leads}
                simulations={simulations}
                onUpdateSimulationStatus={handleUpdateSimulationStatus}
                onUpdateLeadStatus={handleUpdateLeadStatus}
                onAttachLeadContract={handleAttachLeadContract}
                indicators={indicators}
                onAddNotification={addNotification}
                chatMessages={chatMessages}
                onSendChatMessage={handleSendChatMessage}
              />
            )}

            {currentRole === "admin" && platformConfigQuery.data && (
              <AdminPanel
                products={products}
                onUpdateProductStatus={handleUpdateProductStatus}
                advertisers={advertisers}
                indicators={indicators}
                leads={leads}
                commissions={allCommissionsQuery.data ?? []}
                simulations={allSimulationsQuery.data ?? []}
                platformConfig={platformConfigQuery.data}
                onUpdatePlatformConfig={handleUpdatePlatformConfig}
                categories={categories}
                onAddCategory={handleAddCategory}
                onAddNotification={addNotification}
              />
            )}
          </>
        )}
      </main>

      {/* Floating real-time slide-in notification toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xl backdrop-blur-sm animate-slide-in transition-all ${
              notif.type === "success"
                ? "bg-blue-950/95 border-blue-500/30 text-blue-100"
                : "bg-slate-900/95 border-slate-700/50 text-slate-100"
            }`}
          >
            {notif.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-semibold leading-relaxed">{notif.msg}</div>
            <button
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-xs text-slate-400 font-mono max-w-7xl mx-auto w-full">
        <span>IndiqueLeads MVP (v1.0)</span>
      </footer>
    </div>
  );
}
