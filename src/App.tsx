import { useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  Award,
  Building2,
  ShieldAlert,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Landmark,
  RefreshCw,
  X,
} from "lucide-react";

import {
  INITIAL_PRODUCTS,
  INITIAL_INDICATORS,
  INITIAL_ADVERTISERS,
  INITIAL_LEADS,
  INITIAL_PLATFORM_CONFIG,
  INITIAL_SIMULATIONS,
  INITIAL_CHAT_MESSAGES,
} from "./data/mockData";
import {
  Product,
  Indicator,
  Advertiser,
  Lead,
  Category,
  PlatformConfig,
  FinancingSimulation,
  FinancingStatus,
  BankSimulationResponse,
  ApprovedContract,
  ChatMessage,
} from "./types";
import { sanitizeChatMessage, getSecurityWarningMessage } from "./lib/chatSecurity";
import { VERTICALS, VERTICALS_ORDER } from "./lib/verticals";
import {
  ensureAdvertiserRow,
  ensureIndicatorRow,
  fetchProductsForAdvertiser,
  fetchAllActiveProducts,
  fetchLeadsForAdvertiser,
  fetchLeadsForIndicator,
  fetchChatsForLeads,
  fetchIndicatorsByIds,
  pushProduct,
  updateProductStatus as cloudUpdateProductStatus,
  pushLead,
  updateLead as cloudUpdateLead,
  pushChatMessage,
  subscribeChatMessagesAll,
  subscribeLeads,
  isUuid,
} from "./lib/cloudSync";
import { supabase } from "./integrations/supabase/client";
import { getVisitorLeadChats, sendVisitorChatMessage } from "./lib/visitor-chat.functions";

import AffiliateDashboard from "./components/AffiliateDashboard";
import AdvertiserDashboard from "./components/AdvertiserDashboard";
import AdminPanel from "./components/AdminPanel";
import VisitorView from "./components/VisitorView";
import LandingPage from "./components/LandingPage";
import AuthBar from "./components/AuthBar";
import { useAuth, signOut as supabaseSignOut } from "./hooks/useAuth";

export default function App() {
  // --- STATE DECLARATIONS ---
  const [currentRole, setCurrentRole] = useState<
    "indicador" | "anunciante" | "admin" | "visitante"
  >("indicador");
  const [activeReferralId, setActiveReferralId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string>("prod-1");
  // Quando true, o visitante chegou via link único (?p=). Impede navegação para outros anúncios.
  const [lockedToSharedProduct, setLockedToSharedProduct] = useState<boolean>(false);


  // Session / Authentication state
  // Sessão real vem exclusivamente do Supabase (useAuth) via bridge abaixo.
  // Nunca lemos de localStorage para evitar sessões fantasmas de fluxos antigos.
  const [loggedUser, setLoggedUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: "indicador" | "anunciante" | "admin";
  } | null>(null);

  // Core Db States
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem("indica_products");
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });
  const [indicators, setIndicators] = useState<Indicator[]>(() => {
    try {
      const cached = localStorage.getItem("indica_indicators");
      return cached ? JSON.parse(cached) : INITIAL_INDICATORS;
    } catch {
      return INITIAL_INDICATORS;
    }
  });
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(() => {
    try {
      const cached = localStorage.getItem("indica_advertisers");
      return cached ? JSON.parse(cached) : INITIAL_ADVERTISERS;
    } catch {
      return INITIAL_ADVERTISERS;
    }
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const cached = localStorage.getItem("indica_leads");
      return cached ? JSON.parse(cached) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  });
  const [simulations, setSimulations] = useState<FinancingSimulation[]>(() => {
    try {
      const cached = localStorage.getItem("indica_simulations");
      return cached ? JSON.parse(cached) : INITIAL_SIMULATIONS;
    } catch {
      return INITIAL_SIMULATIONS;
    }
  });
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() => {
    try {
      const cached = localStorage.getItem("indica_config");
      return cached ? JSON.parse(cached) : INITIAL_PLATFORM_CONFIG;
    } catch {
      return INITIAL_PLATFORM_CONFIG;
    }
  });

  // Dynamic Categories (fonte: src/lib/verticals.ts — verticais oficiais da plataforma)
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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const cached = localStorage.getItem("indica_chat_messages");
      return cached ? JSON.parse(cached) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  // Notifications Queue
  const [notifications, setNotifications] = useState<
    Array<{ id: string; msg: string; type: "success" | "info" }>
  >([]);
  const getVisitorLeadChatsFn = useServerFn(getVisitorLeadChats);
  const sendVisitorChatMessageFn = useServerFn(sendVisitorChatMessage);

  // --- TOAST NOTIFICATIONS HELPER (declarado cedo para eliminar TDZ em effects) ---
  const addNotification = useCallback((msg: string, type: "success" | "info" = "info") => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const mergeLeadsIntoState = useCallback((incoming: Lead[]) => {
    if (!incoming.length) return;
    setLeads((prev) => {
      const incomingIds = new Set(incoming.map((lead) => lead.id));
      const next = [...incoming, ...prev.filter((lead) => !incomingIds.has(lead.id))];
      saveToStorage("indica_leads", next);
      return next;
    });
  }, []);

  const mergeChatMessagesIntoState = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setChatMessages((prev) => {
      const ids = new Set(prev.map((message) => message.id));
      const next = [...prev, ...incoming.filter((message) => !ids.has(message.id))].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      saveToStorage("indica_chat_messages", next);
      return next;
    });
  }, []);

  const handleSyncVisitorChats = useCallback(
    async (lookup: string, productId?: string) => {
      const result = await getVisitorLeadChatsFn({
        data: {
          lookup,
          productId: productId && isUuid(productId) ? productId : undefined,
        },
      });
      mergeLeadsIntoState(result.leads);
      mergeChatMessagesIntoState(result.messages);
      return result;
    },
    [getVisitorLeadChatsFn, mergeChatMessagesIntoState, mergeLeadsIntoState],
  );

  // --- INITIALIZATION & REFERRAL COOKIE READING ---
  // Limpa qualquer sessão legada em localStorage do fluxo antigo (mock).
  // A autenticação real é 100% Supabase via useAuth + bridge abaixo.
  useEffect(() => {
    localStorage.removeItem("indica_logged_user");
  }, []);

  useEffect(() => {
    // 1. Load database from localStorage or seed
    const cachedProducts = localStorage.getItem("indica_products");
    const cachedIndicators = localStorage.getItem("indica_indicators");
    const cachedAdvertisers = localStorage.getItem("indica_advertisers");
    const cachedLeads = localStorage.getItem("indica_leads");
    const cachedSimulations = localStorage.getItem("indica_simulations");
    const cachedCategories = localStorage.getItem("indica_categories");
    const cachedConfig = localStorage.getItem("indica_config");
    const cachedCookie = localStorage.getItem("indica_cookie_ref");
    const cachedChatMessages = localStorage.getItem("indica_chat_messages");

    if (cachedProducts) setProducts(JSON.parse(cachedProducts));
    else setProducts(INITIAL_PRODUCTS);

    if (cachedIndicators) setIndicators(JSON.parse(cachedIndicators));
    else setIndicators(INITIAL_INDICATORS);

    if (cachedAdvertisers) setAdvertisers(JSON.parse(cachedAdvertisers));
    else setAdvertisers(INITIAL_ADVERTISERS);

    if (cachedLeads) setLeads(JSON.parse(cachedLeads));
    else setLeads(INITIAL_LEADS);

    if (cachedSimulations) setSimulations(JSON.parse(cachedSimulations));
    else setSimulations(INITIAL_SIMULATIONS);

    if (cachedChatMessages) setChatMessages(JSON.parse(cachedChatMessages));
    else setChatMessages(INITIAL_CHAT_MESSAGES);

    if (cachedCategories) setCategories(JSON.parse(cachedCategories));
    if (cachedConfig) setPlatformConfig(JSON.parse(cachedConfig));

    if (cachedCookie) {
      setActiveReferralId(cachedCookie);
    }

    // 2. Read Query parameters (simulating landing through an affiliate link)
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    const prodParam = params.get("p");
    const srcParam = params.get("src");

    if (srcParam) {
      localStorage.setItem("indica_cookie_src", srcParam);
    }

    if (refParam) {
      // Set attribution cookie (60-day simulated persistence)
      localStorage.setItem("indica_cookie_ref", refParam);
      setActiveReferralId(refParam);

      // Auto-increment the promoter's click count to reflect dynamic attribution activity!
      setIndicators((prevInds) => {
        const updated = prevInds.map((ind) => {
          if (ind.id === refParam) {
            return { ...ind, clicks: ind.clicks + 1 };
          }
          return ind;
        });
        localStorage.setItem("indica_indicators", JSON.stringify(updated));
        return updated;
      });

      addNotification(`Link de Indicação ativado! ID Promotor: ${refParam}`, "success");
      setCurrentRole("visitante");
    }

    let cancelled = false;

    if (prodParam) {
      setActiveProductId(prodParam);
      setCurrentRole("visitante");
      setLockedToSharedProduct(true);
      // Se o produto não está no estado local (link vindo de outro dispositivo),
      // busca no banco e injeta para que a página do produto abra correta.
      const existsLocal = (cachedProducts ? JSON.parse(cachedProducts) : INITIAL_PRODUCTS)
        .some((p: Product) => p.id === prodParam);
      if (!existsLocal && isUuid(prodParam)) {
        void import("./lib/cloudSync").then(({ fetchProductById }) =>
          fetchProductById(prodParam).then((prod) => {
            if (cancelled) return;
            if (prod) {
              setProducts((prev) =>
                prev.some((p) => p.id === prod.id) ? prev : [prod, ...prev],
              );
            } else {
              // Produto removido/inacessível: destrava o visitante para não ficar
              // preso no spinner e mostra a landing pública.
              addNotification("Este anúncio não está mais disponível.", "info");
              setLockedToSharedProduct(false);
              setActiveProductId("");
              setCurrentRole("indicador");
            }
          }),
        );
      }
    }


    const roleParam = params.get("role");
    if (roleParam === "anunciante") {
      setCurrentRole("anunciante");
      const loadedAdvertisers = cachedAdvertisers
        ? JSON.parse(cachedAdvertisers)
        : INITIAL_ADVERTISERS;
      const firstAdv = loadedAdvertisers[0] || INITIAL_ADVERTISERS[0];
      const userObj = {
        id: firstAdv.id,
        name: firstAdv.name,
        email: firstAdv.email,
        role: "anunciante" as const,
      };
      setLoggedUser(userObj);
      localStorage.setItem("indica_logged_user", JSON.stringify(userObj));
      addNotification(`Painel do Anunciante ativado via link!`, "success");
    } else if (roleParam === "indicador") {
      setCurrentRole("indicador");
      const loadedIndicators = cachedIndicators ? JSON.parse(cachedIndicators) : INITIAL_INDICATORS;
      const firstInd = loadedIndicators[0] || INITIAL_INDICATORS[0];
      const userObj = {
        id: firstInd.id,
        name: firstInd.name,
        email: firstInd.email,
        role: "indicador" as const,
      };
      setLoggedUser(userObj);
      localStorage.setItem("indica_logged_user", JSON.stringify(userObj));
      addNotification(`Painel do Indicador ativado via link!`, "success");
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // --- BRIDGE: Supabase Auth → loggedUser (real production auth, authoritative) ---
  const { user: supaUser, roles: supaRoles, loading: supaLoading } = useAuth();

  // Reusable cloud hydrate — safe to call multiple times (merges by id).
  const hydrateFromCloud = useCallback(
    async (
      role: "anunciante" | "indicador" | "admin",
      userId: string,
      displayName: string,
      email: string,
      phone: string,
    ) => {
      try {
        if (role === "anunciante") {
          const advId = await ensureAdvertiserRow(userId, { name: displayName, email, phone });
          if (!advId) return;
          const [cloudProducts, cloudLeads] = await Promise.all([
            fetchProductsForAdvertiser(advId),
            fetchLeadsForAdvertiser(advId),
          ]);
          console.log("[App] hydrate anunciante", { advId, products: cloudProducts.length, leads: cloudLeads.length });
          if (cloudProducts.length) {
            setProducts((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              const merged = [...cloudProducts.filter((p) => !ids.has(p.id)), ...prev];
              localStorage.setItem("indica_products", JSON.stringify(merged));
              return merged;
            });
          }
          if (cloudLeads.length) {
            mergeLeadsIntoState(cloudLeads);
            const relatedIndicators = await fetchIndicatorsByIds(
              cloudLeads.map((lead) => lead.indicatorId),
            );
            if (relatedIndicators.length) {
              setIndicators((prev) => {
                const incomingIds = new Set(relatedIndicators.map((indicator) => indicator.id));
                const merged = [
                  ...relatedIndicators,
                  ...prev.filter((indicator) => !incomingIds.has(indicator.id)),
                ];
                localStorage.setItem("indica_indicators", JSON.stringify(merged));
                return merged;
              });
            }
            const chats = await fetchChatsForLeads(cloudLeads.map((l) => l.id));
            mergeChatMessagesIntoState(chats);
          }
        } else if (role === "indicador") {
          const indId = await ensureIndicatorRow(userId, { name: displayName, email, phone });
          if (!indId) return;
          const [activeProducts, cloudLeads] = await Promise.all([
            fetchAllActiveProducts(),
            fetchLeadsForIndicator(indId),
          ]);
          console.log("[App] hydrate indicador", { indId, products: activeProducts.length, leads: cloudLeads.length });
          if (activeProducts.length) {
            setProducts((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              const merged = [...activeProducts.filter((p) => !ids.has(p.id)), ...prev];
              localStorage.setItem("indica_products", JSON.stringify(merged));
              return merged;
            });
          }
          if (cloudLeads.length) {
            mergeLeadsIntoState(cloudLeads);
            const chats = await fetchChatsForLeads(cloudLeads.map((l) => l.id));
            mergeChatMessagesIntoState(chats);
          }
        }
      } catch (e) {
        console.error("[App] cloud hydrate failed", e);
      }
    },
    [mergeChatMessagesIntoState, mergeLeadsIntoState],
  );

  useEffect(() => {
    if (supaLoading) return;
    if (!supaUser) {
      // No Supabase session: clear any stale legacy session so UI reflects logged-out state.
      const stale = localStorage.getItem("indica_logged_user");
      if (stale) {
        localStorage.removeItem("indica_logged_user");
        setLoggedUser(null);
      }
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
    const emailLc = (supaUser.email ?? "").toLowerCase();
    const phone = (supaUser.user_metadata?.phone as string) || (supaUser.phone as string) || "";
    const userObj = { id: supaUser.id, name: displayName, email: supaUser.email ?? "", role };
    setLoggedUser(userObj);
    setCurrentRole(role);
    localStorage.setItem("indica_logged_user", JSON.stringify(userObj));

    // Garantir que o registro de Anunciante/Indicador reflita o usuário real logado.
    if (role === "anunciante") {
      setAdvertisers((prev) => {
        const byId = prev.find((a) => a.id === supaUser.id);
        if (byId) {
          // Sincroniza nome/email/telefone com o cadastro real do usuário logado.
          const next = prev.map((a) =>
            a.id === supaUser.id
              ? { ...a, name: displayName, email: supaUser.email ?? a.email, phone: phone || a.phone }
              : a,
          );
          saveToStorage("indica_advertisers", next);
          return next;
        }
        const byEmail = prev.findIndex((a) => a.email.toLowerCase() === emailLc && emailLc);
        if (byEmail >= 0) {
          // Migra o registro existente (mesmo email) para o id do Supabase.
          const next = [...prev];
          next[byEmail] = { ...next[byEmail], id: supaUser.id, name: displayName, email: supaUser.email ?? next[byEmail].email };
          saveToStorage("indica_advertisers", next);
          return next;
        }
        // Cria um novo registro real a partir do usuário Supabase (sem mock).
        const created: Advertiser = {
          id: supaUser.id,
          name: displayName,
          cnpjOrCpf: "",
          type: "PJ",
          phone,
          email: supaUser.email ?? "",
          plan: "gratuito",
          categoriesSelected: [],
          hasAcceptedTerms: true,
        };
        const next = [...prev, created];
        saveToStorage("indica_advertisers", next);
        return next;
      });
    } else if (role === "indicador") {
      setIndicators((prev) => {
        const byId = prev.find((i) => i.id === supaUser.id);
        if (byId) {
          const next = prev.map((i) =>
            i.id === supaUser.id
              ? { ...i, name: displayName, email: supaUser.email ?? i.email, phone: phone || i.phone }
              : i,
          );
          saveToStorage("indica_indicators", next);
          return next;
        }
        const byEmail = prev.findIndex((i) => i.email.toLowerCase() === emailLc && emailLc);
        if (byEmail >= 0) {
          const next = [...prev];
          next[byEmail] = { ...next[byEmail], id: supaUser.id, name: displayName, email: supaUser.email ?? next[byEmail].email };
          saveToStorage("indica_indicators", next);
          return next;
        }
        const created: Indicator = {
          id: supaUser.id,
          name: displayName,
          cpf: "",
          phone,
          email: supaUser.email ?? "",
          pixKey: supaUser.email ?? "",
          pixType: "email",
          league: "bronze",
          score: 0,
          clicks: 0,
          hasAcceptedTerms: true,
          balanceAvailable: 0,
          balancePending: 0,
        };
        const next = [...prev, created];
        saveToStorage("indica_indicators", next);
        return next;
      });
    }

    // --- Cloud sync: ensure DB rows exist for this user, then hydrate from cloud. ---
    void hydrateFromCloud(role, supaUser.id, displayName, supaUser.email ?? "", phone);
  }, [supaUser, supaRoles, supaLoading, hydrateFromCloud]);


  // Re-hydrate on tab focus / visibility (fixes stale state after cache clear on mobile).
  useEffect(() => {
    if (!supaUser || supaLoading) return;
    const role: "indicador" | "anunciante" | "admin" = supaRoles.includes("admin")
      ? "admin"
      : supaRoles.includes("advertiser")
        ? "anunciante"
        : "indicador";
    if (role === "admin") return;
    const displayName =
      (supaUser.user_metadata?.full_name as string) ||
      (supaUser.user_metadata?.name as string) ||
      supaUser.email?.split("@")[0] ||
      "Usuário";
    const phone =
      (supaUser.user_metadata?.phone as string) || (supaUser.phone as string) || "";
    const onFocus = () => {
      if (document.visibilityState === "visible") {
        void hydrateFromCloud(role, supaUser.id, displayName, supaUser.email ?? "", phone);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [supaUser, supaRoles, supaLoading, hydrateFromCloud]);

  // --- Realtime: incoming chat messages + leads updates (dedupe by id). ---
  useEffect(() => {
    if (!loggedUser || loggedUser.role === "admin") return;
    const offChat = subscribeChatMessagesAll((msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const next = [...prev, msg];
        saveToStorage("indica_chat_messages", next);
        return next;
      });
    });
    const offLeads = subscribeLeads((lead) => {
      setLeads((prev) => {
        const idx = prev.findIndex((l) => l.id === lead.id);
        // preserve local product/indicator names when db payload lacks join info
        const next = idx >= 0
          ? prev.map((l) => (l.id === lead.id ? { ...l, ...lead, productTitle: lead.productTitle || l.productTitle, indicatorName: lead.indicatorName || l.indicatorName } : l))
          : [lead, ...prev];
        saveToStorage("indica_leads", next);
        return next;
      });
      void fetchChatsForLeads([lead.id]).then(mergeChatMessagesIntoState).catch((error) => {
        console.error("[App] lead chat resync failed", error);
      });
    });
    return () => {
      offChat();
      offLeads();
    };
  }, [loggedUser?.id, loggedUser?.role, mergeChatMessagesIntoState]);



  // Sync state helpers
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // (addNotification foi movido para o topo do componente para evitar TDZ em useEffects)


  // --- HANDLERS ---
  const handleSimulateReferral = (refId: string, prodId: string) => {
    localStorage.setItem("indica_cookie_ref", refId);
    setActiveReferralId(refId);
    setActiveProductId(prodId);

    // Increment affiliate clicks
    setIndicators((prevInds) => {
      const updated = prevInds.map((ind) => {
        if (ind.id === refId) {
          return { ...ind, clicks: ind.clicks + 1 };
        }
        return ind;
      });
      saveToStorage("indica_indicators", updated);
      return updated;
    });

    setCurrentRole("visitante");
    addNotification(`Simulando visita via link de indicação de ${refId}!`, "success");
  };

  const handleUpdateIndicator = (updated: Indicator) => {
    setIndicators((prev) => {
      const next = prev.map((i) => (i.id === updated.id ? updated : i));
      saveToStorage("indica_indicators", next);
      return next;
    });
    // Persist edits to cloud for real users.
    if (isUuid(updated.id)) {
      void supabase
        .from("indicators")
        .update({
          name: updated.name,
          cpf: updated.cpf,
          phone: updated.phone,
          email: updated.email,
          pix_key: updated.pixKey,
          pix_type: updated.pixType,
          city: updated.city ?? null,
          state: updated.state ?? null,
        })
        .eq("id", updated.id)
        .then(({ error }: { error: unknown }) => error && console.error("[App] update indicator", error));
    }
  };

  const handleUpdateAdvertiser = (updated: Advertiser) => {
    setAdvertisers((prev) => {
      const next = prev.map((a) => (a.id === updated.id ? updated : a));
      saveToStorage("indica_advertisers", next);
      return next;
    });
    if (isUuid(updated.id)) {
      void supabase
        .from("advertisers")
        .update({
          name: updated.name,
          cnpj_or_cpf: updated.cnpjOrCpf,
          type: updated.type,
          phone: updated.phone,
          email: updated.email,
          plan: updated.plan,
          categories: updated.categoriesSelected,
          city: updated.city ?? null,
          state: updated.state ?? null,
        })
        .eq("id", updated.id)
        .then(({ error }: { error: unknown }) => error && console.error("[App] update advertiser", error));
    }
  };

  const handleAddProduct = (newProd: Product) => {
    // Garante UUID para persistência em nuvem (mocks começam com "prod-").
    const normalized: Product = isUuid(newProd.id)
      ? newProd
      : { ...newProd, id: crypto.randomUUID() };
    setProducts((prev) => {
      const next = [normalized, ...prev];
      saveToStorage("indica_products", next);
      return next;
    });
    // Espelha no banco (não bloqueia a UI). Só grava se o anunciante for real.
    if (isUuid(normalized.advertiserId)) {
      void pushProduct(normalized).catch(() =>
        addNotification("Não foi possível salvar o anúncio na nuvem. Verifique sua conexão.", "info"),
      );
    }
  };

  const handleUpdateProductStatus = (productId: string, status: any) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, status } : p));
      saveToStorage("indica_products", next);
      return next;
    });
    void cloudUpdateProductStatus(productId, status);
    addNotification(`Status do produto atualizado para: ${status}`, "info");
  };

  const handleUpdateLeadStatus = (
    leadId: string,
    status: any,
    extra?: { visitDate?: string; notes?: string; checkInRequested?: boolean },
  ) => {
    setLeads((prev) => {
      const next = prev.map((l) => {
        if (l.id === leadId) {
          const wasConfirmed = l.status === "visita_confirmada";
          const isConfirmed = status === "visita_confirmada";

          if (isConfirmed && !wasConfirmed) {
            setIndicators((prevInds) => {
              const updated = prevInds.map((ind) => {
                if (ind.id === l.indicatorId) {
                  return {
                    ...ind,
                    balancePending: ind.balancePending + l.commissionValue,
                  };
                }
                return ind;
              });
              saveToStorage("indica_indicators", updated);
              return updated;
            });
          }

          return {
            ...l,
            status,
            updatedAt: new Date().toISOString(),
            ...(extra || {}),
          };
        }
        return l;
      });
      saveToStorage("indica_leads", next);
      return next;
    });

    // Create system message for chat timeline
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
    if (extra?.notes) {
      systemText += ` Observações: "${extra.notes}"`;
    }
    if (extra?.checkInRequested) {
      systemText += ` 📍 O indicador sinalizou chegada com o comprador na loja física e aguarda confirmação.`;
    } else if (status === "visita_confirmada") {
      systemText += ` 📍 Presença física do indicador confirmada no showroom! Saldo pendente liberado de R$ [Comissão pendente].`;
    }

    const systemMsg: ChatMessage = {
      id: crypto.randomUUID(),
      leadId,
      senderId: "system",
      senderName: "Sistema",
      senderRole: "system",
      text: systemText,
      isSystem: true,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => {
      const updated = [...prev, systemMsg];
      saveToStorage("indica_chat_messages", updated);
      return updated;
    });

    // Persist status + system message to cloud (best-effort).
    void cloudUpdateLead(leadId, { status, ...(extra || {}) });
    void pushChatMessage(systemMsg);

    addNotification(`Etapa do funil alterada: ${status.replace("_", " ")}`, "success");
  };

  const handleAttachLeadContract = (leadId: string, url: string, notes: string) => {
    setLeads((prev) => {
      const next = prev.map((l) => {
        if (l.id === leadId) {
          // On closing sale, pay the commission to affiliate (transfer pending to available!)
          setIndicators((prevInds) => {
            const updated = prevInds.map((ind) => {
              if (ind.id === l.indicatorId) {
                return {
                  ...ind,
                  balanceAvailable: ind.balanceAvailable + l.commissionValue,
                  balancePending: Math.max(0, ind.balancePending - l.commissionValue),
                };
              }
              return ind;
            });
            saveToStorage("indica_indicators", updated);
            return updated;
          });

          // Create system message for chat timeline
          const systemMsg: ChatMessage = {
            id: crypto.randomUUID(),
            leadId,
            senderId: "system",
            senderName: "Sistema",
            senderRole: "system",
            text: `🎉 CONTRATO DE VENDA ANEXADO! O anunciante oficializou o fechamento do negócio e anexou o comprovante. Uma comissão de R$ ${l.commissionValue.toLocaleString("pt-BR")} foi creditada diretamente na carteira disponível do indicador ${l.indicatorName}!`,
            isSystem: true,
            createdAt: new Date().toISOString(),
          };

          setChatMessages((prev) => {
            const updated = [...prev, systemMsg];
            saveToStorage("indica_chat_messages", updated);
            return updated;
          });

          // Persist to cloud.
          void cloudUpdateLead(leadId, { contractUrl: url, notes, commissionPaid: true, status: "venda_concluida" });
          void pushChatMessage(systemMsg);

          return {
            ...l,
            contractUrl: url,
            notes,
            commissionPaid: true,
            status: "venda_concluida" as const,
          };
        }
        return l;
      });
      saveToStorage("indica_leads", next);
      return next;
    });
  };

  const handleSendChatMessage = async (
    leadId: string,
    senderId: string,
    senderName: string,
    senderRole: "client" | "advertiser",
    text: string,
    clientLookup?: string,
  ): Promise<boolean> => {
    const { cleanText, hasLeakage, blockedInfoType } = sanitizeChatMessage(text);
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      leadId,
      senderId,
      senderName,
      senderRole,
      text: cleanText,
      ...(hasLeakage ? { originalText: text } : {}),
      createdAt: new Date().toISOString(),
    };
    const warningMsg: ChatMessage | null = hasLeakage
      ? {
          id: crypto.randomUUID(),
          leadId,
          senderId: "system",
          senderName: "Sistema (Segurança)",
          senderRole: "system",
          text: getSecurityWarningMessage(blockedInfoType),
          isSystem: true,
          isBlockedBySecurity: true,
          createdAt: new Date(Date.now() + 1000).toISOString(),
        }
      : null;
    const messagesToSend = warningMsg ? [newMsg, warningMsg] : [newMsg];

    const appendMessages = (messages: ChatMessage[]) => {
      setChatMessages((prev) => {
        const existingIds = new Set(prev.map((message) => message.id));
        const updated = [...prev, ...messages.filter((message) => !existingIds.has(message.id))].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        saveToStorage("indica_chat_messages", updated);
        return updated;
      });
    };

    if (!isUuid(leadId)) {
      appendMessages(messagesToSend);
      addNotification("Mensagem enviada com sucesso!", "success");
      return true;
    }

    try {
      if (senderRole === "client") {
        const lead = leads.find((item) => item.id === leadId);
        const lookup = lead?.clientEmail || lead?.clientPhone || "";
        if (!lead || !lookup) throw new Error("Atendimento do cliente não encontrado.");

        const result = await sendVisitorChatMessageFn({
          data: {
            lookup,
            leadId,
            productId: isUuid(lead.productId) ? lead.productId : undefined,
            messages: messagesToSend.map((message) => ({
              id: message.id,
              senderName: message.senderName,
              senderRole: message.senderRole === "system" ? ("system" as const) : ("client" as const),
              text: message.text,
              originalText: message.originalText ?? null,
              isSystem: message.isSystem ?? false,
              isBlockedBySecurity: message.isBlockedBySecurity ?? false,
              createdAt: message.createdAt,
            })),
          },
        });
        mergeChatMessagesIntoState(result.messages);
      } else {
        for (const message of messagesToSend) {
          await pushChatMessage(message);
        }
        const freshMessages = await fetchChatsForLeads([leadId]);
        mergeChatMessagesIntoState(freshMessages.length ? freshMessages : messagesToSend);
      }

      if (hasLeakage) {
        addNotification("Contato externo bloqueado por segurança para proteger a indicação!", "info");
      } else {
        addNotification("Mensagem enviada com sucesso!", "success");
      }
      return true;
    } catch (error) {
      console.error("[App] chat send failed", error);
      addNotification("Não foi possível entregar a mensagem. Tente novamente em alguns segundos.", "info");
      return false;
    }
  };

  const handleAddCategory = (newCat: any) => {
    setCategories((prev) => {
      const next = [...prev, newCat];
      saveToStorage("indica_categories", next);
      return next;
    });
  };

  const handleUpdatePlatformConfig = (newConfig: PlatformConfig) => {
    setPlatformConfig(newConfig);
    saveToStorage("indica_config", newConfig);
  };

  // Submit Lead from Visitor View
  const handleSubmitLeadFromVisitor = (leadData: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    notes?: string;
  }) => {
    // 1. Retrieve the product being viewed
    const viewedProduct = products.find((p) => p.id === activeProductId);
    if (!viewedProduct) return;

    // 2. Identify promoter ID from the unique referral link or the logged-in indicator.
    const currentRefId =
      activeReferralId ||
      (loggedUser && loggedUser.role === "indicador" ? loggedUser.id : null);
    const associatedIndicator = indicators.find((i) => i.id === currentRefId);
    const indicatorId = currentRefId && isUuid(currentRefId)
      ? currentRefId
      : associatedIndicator?.id ?? "";
    const indicatorName = associatedIndicator?.name || "Indicador parceiro";

    // Determine commission tier value (defaults to digital unless they specified presence interest)
    const comVal = viewedProduct.commissionDigitalValue || 0;

    const currentSrc = localStorage.getItem("indica_cookie_src") || "whatsapp";
    let channelLabel = "Link Direto / WhatsApp";
    if (currentSrc === "instagram") channelLabel = "Post no Instagram";
    else if (currentSrc === "facebook") channelLabel = "Facebook Grupo / Feed";
    else if (currentSrc === "tiktok") channelLabel = "TikTok Vídeo / Link na Bio";
    else if (currentSrc === "linkedin") channelLabel = "LinkedIn Publicação";

    const newLead: Lead = {
      id: crypto.randomUUID(),
      productId: viewedProduct.id,
      productTitle: viewedProduct.title,
      productCategory: viewedProduct.category,
      indicatorId,
      indicatorName,
      advertiserId: viewedProduct.advertiserId,
      clientName: leadData.clientName,
      clientPhone: leadData.clientPhone,
      clientEmail: leadData.clientEmail,
      status: "lead_recebido",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commissionPaid: false,
      commissionValue: comVal,
      commissionType: "digital",
      notes: leadData.notes,
      referralChannel: channelLabel,
    };

    setLeads((prev) => {
      const next = [newLead, ...prev];
      saveToStorage("indica_leads", next);
      return next;
    });

    // Initialize Chat messages for the new lead
    const systemText = `🚀 ATENDIMENTO INICIADO: Novo lead recebido sob indicação de *${indicatorName}*. Canal de origem: *${channelLabel}*. O chat direto entre você e a loja parceira está ativo e protegido contra fraudes!`;
    const initialMsg: ChatMessage = {
      id: crypto.randomUUID(),
      leadId: newLead.id,
      senderId: "system",
      senderName: "Sistema",
      senderRole: "system",
      text: systemText,
      isSystem: true,
      createdAt: new Date().toISOString(),
    };

    const msgs = [initialMsg];
    if (leadData.notes) {
      msgs.push({
        id: crypto.randomUUID(),
        leadId: newLead.id,
        senderId: "client",
        senderName: leadData.clientName,
        senderRole: "client",
        text: leadData.notes,
        createdAt: new Date(Date.now() + 50).toISOString(),
      });
    }

    setChatMessages((prev) => {
      const nextMsgs = [...prev, ...msgs];
      saveToStorage("indica_chat_messages", nextMsgs);
      return nextMsgs;
    });

    // Persist to cloud (async, best-effort). Chat messages depend on lead existing.
    void (async () => {
      try {
        await pushLead(newLead);
        for (const m of msgs) await pushChatMessage(m);
      } catch (err) {
        console.error("[App] persist lead failed", err);
      }
    })();

    addNotification(
      `Novo Lead registrado com sucesso sob indicação de: ${indicatorName}!`,
      "success",
    );
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleLoginIndicator = (email: string, pass: string): boolean => {
    const found = indicators.find((i) => i.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (pass === "senha123" || found.password === pass) {
        const userObj = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: "indicador" as const,
        };
        setLoggedUser(userObj);
        setCurrentRole("indicador");
        saveToStorage("indica_logged_user", userObj);
        addNotification(`Bem-vindo de volta, ${found.name}!`, "success");
        return true;
      }
    }
    return false;
  };

  const handleRegisterIndicator = (newInd: Partial<Indicator> & { password?: string }) => {
    const id = `ind-${Date.now()}`;
    const indicator: Indicator = {
      id,
      name: newInd.name || "Novo Indicador",
      cpf: newInd.cpf || "",
      phone: newInd.phone || "",
      email: newInd.email || "",
      password: newInd.password,
      pixKey: newInd.pixKey || "",
      pixType: newInd.pixType || "email",
      league: "bronze",
      score: 100,
      clicks: 0,
      hasAcceptedTerms: true,
      balanceAvailable: 0,
      balancePending: 0,
    };
    setIndicators((prev) => {
      const next = [...prev, indicator];
      saveToStorage("indica_indicators", next);
      return next;
    });
    addNotification(`Cadastro realizado para ${indicator.name}! Faça login agora.`, "success");
  };

  const handleLoginAdvertiser = (email: string, pass: string): boolean => {
    const found = advertisers.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (pass === "senha123" || found.password === pass) {
        const userObj = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: "anunciante" as const,
        };
        setLoggedUser(userObj);
        setCurrentRole("anunciante");
        saveToStorage("indica_logged_user", userObj);
        addNotification(`Bem-vindo ao Painel da Empresa, ${found.name}!`, "success");
        return true;
      }
    }
    return false;
  };

  const handleRegisterAdvertiser = (newAdv: Partial<Advertiser> & { password?: string }) => {
    const id = `adv-${Date.now()}`;
    const advertiser: Advertiser = {
      id,
      name: newAdv.name || "Nova Empresa",
      cnpjOrCpf: newAdv.cnpjOrCpf || "",
      type: newAdv.type || "PJ",
      phone: newAdv.phone || "",
      email: newAdv.email || "",
      password: newAdv.password,
      plan: newAdv.plan || "starter",
      categoriesSelected: newAdv.categoriesSelected || ["imovel"],
      hasAcceptedTerms: true,
    };
    setAdvertisers((prev) => {
      const next = [...prev, advertiser];
      saveToStorage("indica_advertisers", next);
      return next;
    });
    addNotification(`Empresa ${advertiser.name} cadastrada! Faça login agora.`, "success");
  };

  const handleLoginAdmin = (email: string, pass: string): boolean => {
    if (email.toLowerCase() === "admin@indicaaqui.com" && pass === "admin123") {
      const userObj = {
        id: "admin-1",
        name: "Admin Geral",
        email: "admin@indicaaqui.com",
        role: "admin" as const,
      };
      setLoggedUser(userObj);
      setCurrentRole("admin");
      saveToStorage("indica_logged_user", userObj);
      addNotification("Painel Administrativo Autenticado!", "success");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    // Fonte da verdade é o Supabase. O bridge acima limpa loggedUser ao detectar sessão nula.
    void supabaseSignOut();
    localStorage.removeItem("indica_logged_user");
    setLoggedUser(null);
    setCurrentRole("indicador");
    addNotification("Sessão encerrada com segurança.", "info");
  };

  const handleRoleChangeFromSwitcher = (
    role: "indicador" | "anunciante" | "admin" | "visitante",
  ) => {
    setCurrentRole(role);
    if (role === "indicador") {
      const firstInd = indicators[0] || INITIAL_INDICATORS[0];
      const userObj = {
        id: firstInd.id,
        name: firstInd.name,
        email: firstInd.email,
        role: "indicador" as const,
      };
      setLoggedUser(userObj);
      saveToStorage("indica_logged_user", userObj);
    } else if (role === "anunciante") {
      const firstAdv = advertisers[0] || INITIAL_ADVERTISERS[0];
      const userObj = {
        id: firstAdv.id,
        name: firstAdv.name,
        email: firstAdv.email,
        role: "anunciante" as const,
      };
      setLoggedUser(userObj);
      saveToStorage("indica_logged_user", userObj);
    } else if (role === "admin") {
      const userObj = {
        id: "admin-1",
        name: "Admin Geral",
        email: "admin@indicaaqui.com",
        role: "admin" as const,
      };
      setLoggedUser(userObj);
      saveToStorage("indica_logged_user", userObj);
    } else {
      setLoggedUser(null);
      localStorage.removeItem("indica_logged_user");
    }
  };

  const handleAddSimulation = (
    sim: Omit<FinancingSimulation, "id" | "createdAt" | "updatedAt" | "status">,
  ) => {
    const id = `sim-${Date.now()}`;
    const newSim: FinancingSimulation = {
      ...sim,
      id,
      status: "pendente",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSimulations((prev) => {
      const next = [newSim, ...prev];
      saveToStorage("indica_simulations", next);
      return next;
    });
    addNotification(`Simulação de financiamento para ${sim.clientName} enviada à loja!`, "success");
  };

  const handleUpdateSimulationStatus = (
    simId: string,
    status: FinancingStatus,
    bankResponses?: BankSimulationResponse[],
    approvedContract?: ApprovedContract,
  ) => {
    setSimulations((prev) => {
      const next = prev.map((sim) => {
        if (sim.id === simId) {
          return {
            ...sim,
            status,
            bankResponses: bankResponses !== undefined ? bankResponses : sim.bankResponses,
            approvedContract:
              approvedContract !== undefined ? approvedContract : sim.approvedContract,
            updatedAt: new Date().toISOString(),
          };
        }
        return sim;
      });
      saveToStorage("indica_simulations", next);
      return next;
    });
    addNotification(`Simulação atualizada!`, "info");
  };

  const handleResetDatabase = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setIndicators(INITIAL_INDICATORS);
    setAdvertisers(INITIAL_ADVERTISERS);
    setLeads(INITIAL_LEADS);
    setSimulations(INITIAL_SIMULATIONS);
    setPlatformConfig(INITIAL_PLATFORM_CONFIG);
    setActiveReferralId(null);
    setLoggedUser(null);
    setCurrentRole("indicador");
    addNotification("Banco de dados do simulador reiniciado!", "info");
  };

  // Find active promoter info for Visitor View
  const referralIndicator = indicators.find((i) => i.id === activeReferralId);
  // Sem fallback para products[0] — se o produto do link não existir localmente,
  // renderiza uma tela informativa em vez de outro anúncio qualquer.
  const activeProductForVisitor = products.find((p) => p.id === activeProductId) || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-orange-500 selection:text-white">
      {/* Persistent Profile / Session Bar for Logged-In Users */}
      {loggedUser && currentRole !== "visitante" && (
        <div className="bg-orange-50/80 backdrop-blur-sm border-b border-orange-100/60 py-2.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-orange-950 font-medium font-sans">
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
              className="bg-white border border-orange-200 text-orange-700 font-bold px-3 py-1 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1 shadow-sm text-[11px]"
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
                    const stored = localStorage.getItem("indica_logged_user");
                    if (stored) {
                      try {
                        const parsed = JSON.parse(stored);
                        if (parsed && parsed.role) {
                          setCurrentRole(parsed.role);
                          setLoggedUser(parsed);
                          return;
                        }
                      } catch (e) {
                        // Ignore
                      }
                    }
                    setCurrentRole("indicador");
                    setLoggedUser(null);
                  }
            }
            onSubmitLead={handleSubmitLeadFromVisitor}
            onAddNotification={addNotification}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
            leads={leads}
            onSyncClientChats={handleSyncVisitorChats}
          />
        ) : currentRole === "visitante" ? (
          /* Link único aberto mas produto ainda não carregado (ou removido). */
          <div className="flex-1 min-h-[60vh] flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Anúncio indisponível</h2>
              <p className="text-sm text-slate-500">
                Este link pode ter expirado ou o anúncio foi removido. Volte à vitrine para explorar outras oportunidades.
              </p>
              <button
                onClick={() => {
                  setLockedToSharedProduct(false);
                  setActiveProductId("");
                  setCurrentRole("indicador");
                  // Limpa query params para não re-disparar o carregamento do link inválido.
                  if (typeof window !== "undefined" && window.history?.replaceState) {
                    window.history.replaceState({}, "", window.location.pathname);
                  }
                }}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                Voltar para a vitrine
              </button>
            </div>
          </div>



        ) : !loggedUser || loggedUser.role !== currentRole ? (
          /* Render beautiful complete Landing Page with Login Forms if no user is authenticated for this role */
          <LandingPage
            indicators={indicators}
            advertisers={advertisers}
            onLoginIndicator={handleLoginIndicator}
            onRegisterIndicator={handleRegisterIndicator}
            onLoginAdvertiser={handleLoginAdvertiser}
            onRegisterAdvertiser={handleRegisterAdvertiser}
            onLoginAdmin={handleLoginAdmin}
          />
        ) : (
          /* Render respective authenticated dashboards */
          <>
            {currentRole === "indicador" && loggedUser && indicators.find((i) => i.id === loggedUser.id) && (
              <AffiliateDashboard
                indicator={indicators.find((i) => i.id === loggedUser.id)!}
                onUpdateIndicator={handleUpdateIndicator}
                products={products}
                leads={leads}
                simulations={simulations}
                onAddSimulation={handleAddSimulation}
                onUpdateLeadStatus={handleUpdateLeadStatus}
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

            {currentRole === "anunciante" && loggedUser && advertisers.find((a) => a.id === loggedUser.id) && (
              <AdvertiserDashboard
                advertiser={advertisers.find((a) => a.id === loggedUser.id)!}

                onUpdateAdvertiser={handleUpdateAdvertiser}
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProductStatus={handleUpdateProductStatus}
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

            {currentRole === "admin" && (
              <AdminPanel
                products={products}
                onUpdateProductStatus={handleUpdateProductStatus}
                advertisers={advertisers}
                indicators={indicators}
                leads={leads}
                platformConfig={platformConfig}
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
                ? "bg-orange-950/95 border-orange-500/30 text-orange-100"
                : "bg-slate-900/95 border-slate-700/50 text-slate-100"
            }`}
          >
            {notif.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
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

      {/* Micro-footer with Reset Database function */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>IndicaAqui MVP (v1.0) • Prova de Conceito Concluída</span>
        <button
          onClick={handleResetDatabase}
          className="text-red-500 hover:text-red-700 font-bold hover:underline flex items-center gap-1 bg-red-50 hover:bg-red-100/50 px-2.5 py-1 rounded-lg border border-red-100"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reiniciar Banco do Simulador (Limpar Cache)
        </button>
      </footer>
    </div>
  );
}
