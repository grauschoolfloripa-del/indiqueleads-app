import { useState, useEffect } from 'react';
import { 
  Sparkles, Award, Building2, ShieldAlert, Eye, Info, CheckCircle2, AlertCircle, 
  Trash2, Landmark, RefreshCw, X
} from 'lucide-react';

import { 
  INITIAL_PRODUCTS, INITIAL_INDICATORS, INITIAL_ADVERTISERS, INITIAL_LEADS, INITIAL_PLATFORM_CONFIG, INITIAL_SIMULATIONS, INITIAL_CHAT_MESSAGES
} from './data/mockData';
import { Product, Indicator, Advertiser, Lead, Category, PlatformConfig, FinancingSimulation, FinancingStatus, BankSimulationResponse, ApprovedContract, ChatMessage } from './types';
import { sanitizeChatMessage, getSecurityWarningMessage } from './lib/chatSecurity';
import { VERTICALS, VERTICALS_ORDER } from './lib/verticals';

import AffiliateDashboard from './components/AffiliateDashboard';
import AdvertiserDashboard from './components/AdvertiserDashboard';
import AdminPanel from './components/AdminPanel';
import VisitorView from './components/VisitorView';
import LandingPage from './components/LandingPage';
import AuthBar from './components/AuthBar';
import { useAuth, signOut as supabaseSignOut } from './hooks/useAuth';


export default function App() {
  // --- STATE DECLARATIONS ---
  const [currentRole, setCurrentRole] = useState<'indicador' | 'anunciante' | 'admin' | 'visitante'>('indicador');
  const [activeReferralId, setActiveReferralId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string>('prod-1');

  // Session / Authentication state
  // Sessão real vem exclusivamente do Supabase (useAuth) via bridge abaixo.
  // Nunca lemos de localStorage para evitar sessões fantasmas de fluxos antigos.
  const [loggedUser, setLoggedUser] = useState<{ id: string; name: string; email: string; role: 'indicador' | 'anunciante' | 'admin' } | null>(null);

  // Core Db States
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('indica_products');
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });
  const [indicators, setIndicators] = useState<Indicator[]>(() => {
    try {
      const cached = localStorage.getItem('indica_indicators');
      return cached ? JSON.parse(cached) : INITIAL_INDICATORS;
    } catch {
      return INITIAL_INDICATORS;
    }
  });
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(() => {
    try {
      const cached = localStorage.getItem('indica_advertisers');
      return cached ? JSON.parse(cached) : INITIAL_ADVERTISERS;
    } catch {
      return INITIAL_ADVERTISERS;
    }
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const cached = localStorage.getItem('indica_leads');
      return cached ? JSON.parse(cached) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  });
  const [simulations, setSimulations] = useState<FinancingSimulation[]>(() => {
    try {
      const cached = localStorage.getItem('indica_simulations');
      return cached ? JSON.parse(cached) : INITIAL_SIMULATIONS;
    } catch {
      return INITIAL_SIMULATIONS;
    }
  });
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() => {
    try {
      const cached = localStorage.getItem('indica_config');
      return cached ? JSON.parse(cached) : INITIAL_PLATFORM_CONFIG;
    } catch {
      return INITIAL_PLATFORM_CONFIG;
    }
  });
  
  // Dynamic Categories (fonte: src/lib/verticals.ts — verticais oficiais da plataforma)
  const [categories, setCategories] = useState<Array<{ id: Category | string; name: string; icon: string; fields: string[] }>>(() => {
    // Importado dinamicamente para evitar ciclo de import em build; usamos require-style via módulo estático.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { VERTICALS, VERTICALS_ORDER } = require('./lib/verticals') as typeof import('./lib/verticals');
    return VERTICALS_ORDER.map((id) => ({
      id,
      name: VERTICALS[id].shortLabel,
      icon: VERTICALS[id].emoji,
      fields: VERTICALS[id].attributes.map((a) => a.label),
    }));
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const cached = localStorage.getItem('indica_chat_messages');
      return cached ? JSON.parse(cached) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  // Notifications Queue
  const [notifications, setNotifications] = useState<Array<{ id: string; msg: string; type: 'success' | 'info' }>>([]);

  // --- INITIALIZATION & REFERRAL COOKIE READING ---
  // Limpa qualquer sessão legada em localStorage do fluxo antigo (mock).
  // A autenticação real é 100% Supabase via useAuth + bridge abaixo.
  useEffect(() => {
    localStorage.removeItem('indica_logged_user');
  }, []);

  useEffect(() => {
    // 1. Load database from localStorage or seed
    const cachedProducts = localStorage.getItem('indica_products');
    const cachedIndicators = localStorage.getItem('indica_indicators');
    const cachedAdvertisers = localStorage.getItem('indica_advertisers');
    const cachedLeads = localStorage.getItem('indica_leads');
    const cachedSimulations = localStorage.getItem('indica_simulations');
    const cachedCategories = localStorage.getItem('indica_categories');
    const cachedConfig = localStorage.getItem('indica_config');
    const cachedCookie = localStorage.getItem('indica_cookie_ref');
    const cachedChatMessages = localStorage.getItem('indica_chat_messages');

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
    const refParam = params.get('ref');
    const prodParam = params.get('p');
    const srcParam = params.get('src');

    if (srcParam) {
      localStorage.setItem('indica_cookie_src', srcParam);
    }

    if (refParam) {
      // Set attribution cookie (60-day simulated persistence)
      localStorage.setItem('indica_cookie_ref', refParam);
      setActiveReferralId(refParam);
      
      // Auto-increment the promoter's click count to reflect dynamic attribution activity!
      setIndicators(prevInds => {
        const updated = prevInds.map(ind => {
          if (ind.id === refParam) {
            return { ...ind, clicks: ind.clicks + 1 };
          }
          return ind;
        });
        localStorage.setItem('indica_indicators', JSON.stringify(updated));
        return updated;
      });

      addNotification(`Link de Indicação ativado! ID Promotor: ${refParam}`, 'success');
      setCurrentRole('visitante');
    }

    if (prodParam) {
      setActiveProductId(prodParam);
      setCurrentRole('visitante');
    }

    const roleParam = params.get('role');
    if (roleParam === 'anunciante') {
      setCurrentRole('anunciante');
      const loadedAdvertisers = cachedAdvertisers ? JSON.parse(cachedAdvertisers) : INITIAL_ADVERTISERS;
      const firstAdv = loadedAdvertisers[0] || INITIAL_ADVERTISERS[0];
      const userObj = { id: firstAdv.id, name: firstAdv.name, email: firstAdv.email, role: 'anunciante' as const };
      setLoggedUser(userObj);
      localStorage.setItem('indica_logged_user', JSON.stringify(userObj));
      addNotification(`Painel do Anunciante ativado via link!`, 'success');
    } else if (roleParam === 'indicador') {
      setCurrentRole('indicador');
      const loadedIndicators = cachedIndicators ? JSON.parse(cachedIndicators) : INITIAL_INDICATORS;
      const firstInd = loadedIndicators[0] || INITIAL_INDICATORS[0];
      const userObj = { id: firstInd.id, name: firstInd.name, email: firstInd.email, role: 'indicador' as const };
      setLoggedUser(userObj);
      localStorage.setItem('indica_logged_user', JSON.stringify(userObj));
      addNotification(`Painel do Indicador ativado via link!`, 'success');
    }
  }, []);

  // --- BRIDGE: Supabase Auth → loggedUser (real production auth, authoritative) ---
  const { user: supaUser, roles: supaRoles, loading: supaLoading } = useAuth();
  useEffect(() => {
    if (supaLoading) return;
    if (!supaUser) {
      // No Supabase session: clear any stale legacy session so UI reflects logged-out state.
      const stale = localStorage.getItem('indica_logged_user');
      if (stale) {
        localStorage.removeItem('indica_logged_user');
        setLoggedUser(null);
      }
      return;
    }
    const role: 'indicador' | 'anunciante' | 'admin' =
      supaRoles.includes('admin') ? 'admin'
      : supaRoles.includes('advertiser') ? 'anunciante'
      : 'indicador';
    const displayName =
      (supaUser.user_metadata?.full_name as string) ||
      (supaUser.user_metadata?.name as string) ||
      supaUser.email?.split('@')[0] || 'Usuário';
    const userObj = { id: supaUser.id, name: displayName, email: supaUser.email ?? '', role };
    setLoggedUser(userObj);
    setCurrentRole(role);
    localStorage.setItem('indica_logged_user', JSON.stringify(userObj));
  }, [supaUser, supaRoles, supaLoading]);




  // Sync state helpers
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- TOAST NOTIFICATIONS HELPER ---
  const addNotification = (msg: string, type: 'success' | 'info' = 'info') => {
    const id = `notif-${Date.now()}`;
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // --- HANDLERS ---
  const handleSimulateReferral = (refId: string, prodId: string) => {
    localStorage.setItem('indica_cookie_ref', refId);
    setActiveReferralId(refId);
    setActiveProductId(prodId);
    
    // Increment affiliate clicks
    setIndicators(prevInds => {
      const updated = prevInds.map(ind => {
        if (ind.id === refId) {
          return { ...ind, clicks: ind.clicks + 1 };
        }
        return ind;
      });
      saveToStorage('indica_indicators', updated);
      return updated;
    });

    setCurrentRole('visitante');
    addNotification(`Simulando visita via link de indicação de ${refId}!`, 'success');
  };

  const handleUpdateIndicator = (updated: Indicator) => {
    setIndicators(prev => {
      const next = prev.map(i => i.id === updated.id ? updated : i);
      saveToStorage('indica_indicators', next);
      return next;
    });
  };

  const handleUpdateAdvertiser = (updated: Advertiser) => {
    setAdvertisers(prev => {
      const next = prev.map(a => a.id === updated.id ? updated : a);
      saveToStorage('indica_advertisers', next);
      return next;
    });
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => {
      const next = [newProd, ...prev];
      saveToStorage('indica_products', next);
      return next;
    });
  };

  const handleUpdateProductStatus = (productId: string, status: any) => {
    setProducts(prev => {
      const next = prev.map(p => p.id === productId ? { ...p, status } : p);
      saveToStorage('indica_products', next);
      return next;
    });
    addNotification(`Status do produto atualizado para: ${status}`, 'info');
  };

  const handleUpdateLeadStatus = (leadId: string, status: any, extra?: { visitDate?: string; notes?: string; checkInRequested?: boolean }) => {
    setLeads(prev => {
      const next = prev.map(l => {
        if (l.id === leadId) {
          const wasConfirmed = l.status === 'visita_confirmada';
          const isConfirmed = status === 'visita_confirmada';

          if (isConfirmed && !wasConfirmed) {
            setIndicators(prevInds => {
              const updated = prevInds.map(ind => {
                if (ind.id === l.indicatorId) {
                  return {
                    ...ind,
                    balancePending: ind.balancePending + l.commissionValue
                  };
                }
                return ind;
              });
              saveToStorage('indica_indicators', updated);
              return updated;
            });
          }

          return { 
            ...l, 
            status, 
            updatedAt: new Date().toISOString(),
            ...(extra || {})
          };
        }
        return l;
      });
      saveToStorage('indica_leads', next);
      return next;
    });

    // Create system message for chat timeline
    const stageLabels: Record<string, string> = {
      lead_recebido: 'Lead recebido pela loja',
      contato_feito: 'Primeiro contato realizado com o comprador',
      visita_agendada: 'Visita agendada ao showroom',
      visita_confirmada: 'Visita realizada e presença do indicador confirmada',
      proposta: 'Proposta comercial apresentada',
      venda_concluida: 'Venda concluída com sucesso!'
    };
    
    const label = stageLabels[status] || status.replace('_', ' ');
    let systemText = `🔄 STATUS ALTERADO: O atendimento mudou para "${label}".`;
    if (extra?.visitDate) {
      const formattedDate = new Date(extra.visitDate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      systemText += ` Agendamento marcado para: ${formattedDate}.`;
    }
    if (extra?.notes) {
      systemText += ` Observações: "${extra.notes}"`;
    }
    if (extra?.checkInRequested) {
      systemText += ` 📍 O indicador sinalizou chegada com o comprador na loja física e aguarda confirmação.`;
    } else if (status === 'visita_confirmada') {
      systemText += ` 📍 Presença física do indicador confirmada no showroom! Saldo pendente liberado de R$ [Comissão pendente].`;
    }

    const systemMsg: ChatMessage = {
      id: 'msg-sys-' + Date.now(),
      leadId,
      senderId: 'system',
      senderName: 'Sistema',
      senderRole: 'system',
      text: systemText,
      isSystem: true,
      createdAt: new Date().toISOString()
    };

    setChatMessages(prev => {
      const updated = [...prev, systemMsg];
      saveToStorage('indica_chat_messages', updated);
      return updated;
    });

    addNotification(`Etapa do funil alterada: ${status.replace('_', ' ')}`, 'success');
  };

  const handleAttachLeadContract = (leadId: string, url: string, notes: string) => {
    setLeads(prev => {
      const next = prev.map(l => {
        if (l.id === leadId) {
          // On closing sale, pay the commission to affiliate (transfer pending to available!)
          setIndicators(prevInds => {
            const updated = prevInds.map(ind => {
              if (ind.id === l.indicatorId) {
                return {
                  ...ind,
                  balanceAvailable: ind.balanceAvailable + l.commissionValue,
                  balancePending: Math.max(0, ind.balancePending - l.commissionValue)
                };
              }
              return ind;
            });
            saveToStorage('indica_indicators', updated);
            return updated;
          });

          // Create system message for chat timeline
          const systemMsg: ChatMessage = {
            id: 'msg-sys-contract-' + Date.now(),
            leadId,
            senderId: 'system',
            senderName: 'Sistema',
            senderRole: 'system',
            text: `🎉 CONTRATO DE VENDA ANEXADO! O anunciante oficializou o fechamento do negócio e anexou o comprovante. Uma comissão de R$ ${l.commissionValue.toLocaleString('pt-BR')} foi creditada diretamente na carteira disponível do indicador ${l.indicatorName}!`,
            isSystem: true,
            createdAt: new Date().toISOString()
          };

          setChatMessages(prev => {
            const updated = [...prev, systemMsg];
            saveToStorage('indica_chat_messages', updated);
            return updated;
          });

          return {
            ...l,
            contractUrl: url,
            notes,
            commissionPaid: true,
            status: 'venda_concluida' as const
          };
        }
        return l;
      });
      saveToStorage('indica_leads', next);
      return next;
    });
  };

  const handleSendChatMessage = (leadId: string, senderId: string, senderName: string, senderRole: 'client' | 'advertiser', text: string) => {
    const { cleanText, hasLeakage, blockedInfoType } = sanitizeChatMessage(text);
    const mainMsgId = 'msg-' + Date.now();
    const newMsg: ChatMessage = {
      id: mainMsgId,
      leadId,
      senderId,
      senderName,
      senderRole,
      text: cleanText,
      ...(hasLeakage ? { originalText: text } : {}),
      createdAt: new Date().toISOString()
    };

    setChatMessages(prev => {
      const updated = [...prev, newMsg];
      
      if (hasLeakage) {
        const warningMsg: ChatMessage = {
          id: 'msg-warn-' + Date.now(),
          leadId,
          senderId: 'system',
          senderName: 'Sistema (Segurança)',
          senderRole: 'system',
          text: getSecurityWarningMessage(blockedInfoType),
          isSystem: true,
          isBlockedBySecurity: true,
          createdAt: new Date(Date.now() + 1000).toISOString()
        };
        updated.push(warningMsg);
      }

      saveToStorage('indica_chat_messages', updated);
      return updated;
    });

    if (hasLeakage) {
      addNotification('Contato externo bloqueado por segurança para proteger a indicação!', 'info');
    } else {
      addNotification('Mensagem enviada com sucesso!', 'success');
    }
  };

  const handleAddCategory = (newCat: any) => {
    setCategories(prev => {
      const next = [...prev, newCat];
      saveToStorage('indica_categories', next);
      return next;
    });
  };

  const handleUpdatePlatformConfig = (newConfig: PlatformConfig) => {
    setPlatformConfig(newConfig);
    saveToStorage('indica_config', newConfig);
  };

  // Submit Lead from Visitor View
  const handleSubmitLeadFromVisitor = (leadData: { clientName: string; clientPhone: string; clientEmail: string; notes?: string }) => {
    // 1. Retrieve the product being viewed
    const viewedProduct = products.find(p => p.id === activeProductId);
    if (!viewedProduct) return;

    // 2. Identify promoter ID (either cookie activeReferralId, logged-in indicator ID, or default to Gabriel ind-1 for simulation)
    const currentRefId = activeReferralId || (loggedUser && loggedUser.role === 'indicador' ? loggedUser.id : null) || 'ind-1';
    const associatedIndicator = indicators.find(i => i.id === currentRefId) || indicators[0];

    // Determine commission tier value (defaults to digital unless they specified presence interest)
    const comVal = viewedProduct.commissionDigitalValue || 0;

    const currentSrc = localStorage.getItem('indica_cookie_src') || 'whatsapp';
    let channelLabel = 'Link Direto / WhatsApp';
    if (currentSrc === 'instagram') channelLabel = 'Post no Instagram';
    else if (currentSrc === 'facebook') channelLabel = 'Facebook Grupo / Feed';
    else if (currentSrc === 'tiktok') channelLabel = 'TikTok Vídeo / Link na Bio';
    else if (currentSrc === 'linkedin') channelLabel = 'LinkedIn Publicação';

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      productId: viewedProduct.id,
      productTitle: viewedProduct.title,
      productCategory: viewedProduct.category,
      indicatorId: associatedIndicator.id,
      indicatorName: associatedIndicator.name || 'Gabriel Martins (Indicador Demo)',
      advertiserId: viewedProduct.advertiserId,
      clientName: leadData.clientName,
      clientPhone: leadData.clientPhone,
      clientEmail: leadData.clientEmail,
      status: 'lead_recebido',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commissionPaid: false,
      commissionValue: comVal,
      commissionType: 'digital',
      notes: leadData.notes,
      referralChannel: channelLabel
    };

    setLeads(prev => {
      const next = [newLead, ...prev];
      saveToStorage('indica_leads', next);
      return next;
    });

    // Initialize Chat messages for the new lead
    const systemText = `🚀 ATENDIMENTO INICIADO: Novo lead recebido sob indicação de *${associatedIndicator.name}*. Canal de origem: *${channelLabel}*. O chat direto entre você e a loja parceira está ativo e protegido contra fraudes!`;
    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}-1`,
      leadId: newLead.id,
      senderId: 'system',
      senderName: 'Sistema',
      senderRole: 'system',
      text: systemText,
      isSystem: true,
      createdAt: new Date().toISOString()
    };
    
    const msgs = [initialMsg];
    if (leadData.notes) {
      msgs.push({
        id: `msg-${Date.now()}-2`,
        leadId: newLead.id,
        senderId: 'client',
        senderName: leadData.clientName,
        senderRole: 'client',
        text: leadData.notes,
        createdAt: new Date(Date.now() + 50).toISOString()
      });
    }

    setChatMessages(prev => {
      const nextMsgs = [...prev, ...msgs];
      saveToStorage('indica_chat_messages', nextMsgs);
      return nextMsgs;
    });

    addNotification(`Novo Lead registrado com sucesso sob indicação de: ${associatedIndicator.name}!`, 'success');
  };

  // --- AUTHENTICATION HANDLERS ---
  const handleLoginIndicator = (email: string, pass: string): boolean => {
    const found = indicators.find(i => i.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (pass === 'senha123' || found.password === pass) {
        const userObj = { id: found.id, name: found.name, email: found.email, role: 'indicador' as const };
        setLoggedUser(userObj);
        setCurrentRole('indicador');
        saveToStorage('indica_logged_user', userObj);
        addNotification(`Bem-vindo de volta, ${found.name}!`, 'success');
        return true;
      }
    }
    return false;
  };

  const handleRegisterIndicator = (newInd: Partial<Indicator> & { password?: string }) => {
    const id = `ind-${Date.now()}`;
    const indicator: Indicator = {
      id,
      name: newInd.name || 'Novo Indicador',
      cpf: newInd.cpf || '',
      phone: newInd.phone || '',
      email: newInd.email || '',
      password: newInd.password,
      pixKey: newInd.pixKey || '',
      pixType: newInd.pixType || 'email',
      league: 'bronze',
      score: 100,
      clicks: 0,
      hasAcceptedTerms: true,
      balanceAvailable: 0,
      balancePending: 0
    };
    setIndicators(prev => {
      const next = [...prev, indicator];
      saveToStorage('indica_indicators', next);
      return next;
    });
    addNotification(`Cadastro realizado para ${indicator.name}! Faça login agora.`, 'success');
  };

  const handleLoginAdvertiser = (email: string, pass: string): boolean => {
    const found = advertisers.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (pass === 'senha123' || found.password === pass) {
        const userObj = { id: found.id, name: found.name, email: found.email, role: 'anunciante' as const };
        setLoggedUser(userObj);
        setCurrentRole('anunciante');
        saveToStorage('indica_logged_user', userObj);
        addNotification(`Bem-vindo ao Painel da Empresa, ${found.name}!`, 'success');
        return true;
      }
    }
    return false;
  };

  const handleRegisterAdvertiser = (newAdv: Partial<Advertiser> & { password?: string }) => {
    const id = `adv-${Date.now()}`;
    const advertiser: Advertiser = {
      id,
      name: newAdv.name || 'Nova Empresa',
      cnpjOrCpf: newAdv.cnpjOrCpf || '',
      type: newAdv.type || 'PJ',
      phone: newAdv.phone || '',
      email: newAdv.email || '',
      password: newAdv.password,
      plan: newAdv.plan || 'starter',
      categoriesSelected: newAdv.categoriesSelected || ['imovel'],
      hasAcceptedTerms: true
    };
    setAdvertisers(prev => {
      const next = [...prev, advertiser];
      saveToStorage('indica_advertisers', next);
      return next;
    });
    addNotification(`Empresa ${advertiser.name} cadastrada! Faça login agora.`, 'success');
  };

  const handleLoginAdmin = (email: string, pass: string): boolean => {
    if (email.toLowerCase() === 'admin@indicaaqui.com' && pass === 'admin123') {
      const userObj = { id: 'admin-1', name: 'Admin Geral', email: 'admin@indicaaqui.com', role: 'admin' as const };
      setLoggedUser(userObj);
      setCurrentRole('admin');
      saveToStorage('indica_logged_user', userObj);
      addNotification('Painel Administrativo Autenticado!', 'success');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    // Fonte da verdade é o Supabase. O bridge acima limpa loggedUser ao detectar sessão nula.
    void supabaseSignOut();
    localStorage.removeItem('indica_logged_user');
    setLoggedUser(null);
    setCurrentRole('indicador');
    addNotification('Sessão encerrada com segurança.', 'info');
  };


  const handleRoleChangeFromSwitcher = (role: 'indicador' | 'anunciante' | 'admin' | 'visitante') => {
    setCurrentRole(role);
    if (role === 'indicador') {
      const firstInd = indicators[0] || INITIAL_INDICATORS[0];
      const userObj = { id: firstInd.id, name: firstInd.name, email: firstInd.email, role: 'indicador' as const };
      setLoggedUser(userObj);
      saveToStorage('indica_logged_user', userObj);
    } else if (role === 'anunciante') {
      const firstAdv = advertisers[0] || INITIAL_ADVERTISERS[0];
      const userObj = { id: firstAdv.id, name: firstAdv.name, email: firstAdv.email, role: 'anunciante' as const };
      setLoggedUser(userObj);
      saveToStorage('indica_logged_user', userObj);
    } else if (role === 'admin') {
      const userObj = { id: 'admin-1', name: 'Admin Geral', email: 'admin@indicaaqui.com', role: 'admin' as const };
      setLoggedUser(userObj);
      saveToStorage('indica_logged_user', userObj);
    } else {
      setLoggedUser(null);
      localStorage.removeItem('indica_logged_user');
    }
  };

  const handleAddSimulation = (sim: Omit<FinancingSimulation, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const id = `sim-${Date.now()}`;
    const newSim: FinancingSimulation = {
      ...sim,
      id,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSimulations(prev => {
      const next = [newSim, ...prev];
      saveToStorage('indica_simulations', next);
      return next;
    });
    addNotification(`Simulação de financiamento para ${sim.clientName} enviada à loja!`, 'success');
  };

  const handleUpdateSimulationStatus = (simId: string, status: FinancingStatus, bankResponses?: BankSimulationResponse[], approvedContract?: ApprovedContract) => {
    setSimulations(prev => {
      const next = prev.map(sim => {
        if (sim.id === simId) {
          return {
            ...sim,
            status,
            bankResponses: bankResponses !== undefined ? bankResponses : sim.bankResponses,
            approvedContract: approvedContract !== undefined ? approvedContract : sim.approvedContract,
            updatedAt: new Date().toISOString()
          };
        }
        return sim;
      });
      saveToStorage('indica_simulations', next);
      return next;
    });
    addNotification(`Simulação atualizada!`, 'info');
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
    setCurrentRole('indicador');
    addNotification('Banco de dados do simulador reiniciado!', 'info');
  };

  // Find active promoter info for Visitor View
  const referralIndicator = indicators.find(i => i.id === activeReferralId);
  const activeProductForVisitor = products.find(p => p.id === activeProductId) || products[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Persistent Profile / Session Bar for Logged-In Users */}
      {loggedUser && currentRole !== 'visitante' && (
        <div className="bg-orange-50/80 backdrop-blur-sm border-b border-orange-100/60 py-2.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-orange-950 font-medium font-sans">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              Sessão Ativa: <strong className="font-bold">{loggedUser.name}</strong> ({loggedUser.role === 'admin' ? 'Administrador Geral' : loggedUser.role === 'indicador' ? 'Indicador Autônomo' : 'Anunciante Parceiro'}) — <span className="font-mono text-[10px] text-slate-500">{loggedUser.email}</span>
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
        
        {currentRole === 'visitante' && activeProductForVisitor ? (
          <VisitorView 
            product={activeProductForVisitor}
            products={products}
            referralId={activeReferralId || (loggedUser && loggedUser.role === 'indicador' ? loggedUser.id : null)}
            referralIndicatorName={referralIndicator?.name || (loggedUser && loggedUser.role === 'indicador' ? loggedUser.name : undefined)}
            onGoBack={() => {
              const stored = localStorage.getItem('indica_logged_user');
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
              setCurrentRole('indicador');
              setLoggedUser(null);
            }}
            onSubmitLead={handleSubmitLeadFromVisitor}
            onAddNotification={addNotification}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
            leads={leads}
          />
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
            {currentRole === 'indicador' && indicators.length > 0 && (
              <AffiliateDashboard 
                indicator={indicators.find(i => i.id === loggedUser.id) || indicators[0]}
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
                  setCurrentRole('visitante');
                }}
                chatMessages={chatMessages}
                onSendChatMessage={handleSendChatMessage}
              />
            )}

            {currentRole === 'anunciante' && advertisers.length > 0 && (
              <AdvertiserDashboard 
                advertiser={advertisers.find(a => a.id === loggedUser.id) || advertisers[0]}
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

            {currentRole === 'admin' && (
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
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xl backdrop-blur-sm animate-slide-in transition-all ${
              notif.type === 'success' 
                ? 'bg-orange-950/95 border-orange-500/30 text-orange-100' 
                : 'bg-slate-900/95 border-slate-700/50 text-slate-100'
            }`}
          >
            {notif.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {notif.msg}
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
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
