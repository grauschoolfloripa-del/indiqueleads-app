import React, { useState } from "react";
import {
  Sparkles,
  Award,
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Shield,
  UserCheck,
  PlusCircle,
  Check,
  HelpCircle,
  TrendingUp,
  Coins,
  Users,
  Home,
  Car,
  Compass,
  Calendar,
  Play,
  Calculator,
  Percent,
} from "lucide-react";
import { Category, Indicator, Advertiser } from "../types";
import { VERTICALS, VERTICALS_ORDER } from "../lib/verticals";

interface LandingPageProps {
  indicators: Indicator[];
  advertisers: Advertiser[];
  onLoginIndicator: (email: string, pass: string) => boolean;
  onRegisterIndicator: (newInd: Partial<Indicator> & { password?: string }) => void;
  onLoginAdvertiser: (email: string, pass: string) => boolean;
  onRegisterAdvertiser: (newAdv: Partial<Advertiser> & { password?: string }) => void;
  onLoginAdmin: (email: string, pass: string) => boolean;
}

export default function LandingPage({
  indicators,
  advertisers,
  onLoginIndicator,
  onRegisterIndicator,
  onLoginAdvertiser,
  onRegisterAdvertiser,
  onLoginAdmin,
}: LandingPageProps) {
  // Navigation & Active View state inside landing page
  const [activeSection, setActiveSection] = useState<
    "home" | "niches" | "how-it-works" | "how-to-profit" | "how-to-sell"
  >("home");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authRole, setAuthRole] = useState<"indicador" | "anunciante" | "admin">("indicador");
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Forms states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration Form Indicator
  const [regIndName, setRegIndName] = useState("");
  const [regIndEmail, setRegIndEmail] = useState("");
  const [regIndPassword, setRegIndPassword] = useState("");
  const [regIndCpf, setRegIndCpf] = useState("");
  const [regIndPhone, setRegIndPhone] = useState("");
  const [regIndPixKey, setRegIndPixKey] = useState("");
  const [regIndPixType, setRegIndPixType] = useState<"cpf" | "email" | "phone" | "random">("email");
  const [regIndCity, setRegIndCity] = useState("");
  const [regIndState, setRegIndState] = useState("SP");

  // Registration Form Advertiser
  const [regAdvName, setRegAdvName] = useState("");
  const [regAdvEmail, setRegAdvEmail] = useState("");
  const [regAdvPassword, setRegAdvPassword] = useState("");
  const [regAdvCnpjOrCpf, setRegAdvCnpjOrCpf] = useState("");
  const [regAdvType, setRegAdvType] = useState<"PF" | "PJ">("PJ");
  const [regAdvPhone, setRegAdvPhone] = useState("");
  const [regAdvPlan, setRegAdvPlan] = useState<"starter" | "premium" | "pro">("starter");
  const [regAdvCategories, setRegAdvCategories] = useState<Category[]>(["imovel"]);
  const [regAdvCity, setRegAdvCity] = useState("");
  const [regAdvState, setRegAdvState] = useState("SP");

  // Dynamic Calculator states
  const [calcNiche, setCalcNiche] = useState<Category>("imovel");
  const [calcSaleValue, setCalcSaleValue] = useState<number>(350000);
  const [calcCommPct, setCalcCommPct] = useState<number>(4); // 4% typical builder/owner commission
  const [calcType, setCalcType] = useState<"digital" | "presencial">("digital");

  // Local helper alerts
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Niches derivados de VERTICALS (fonte única de verdade)
  const nichesData = VERTICALS_ORDER.map((catId) => {
    const v = VERTICALS[catId];
    return {
      id: v.id,
      title: v.label,
      icon: <span className="text-3xl leading-none">{v.emoji}</span>,
      description: v.description,
      averageValue: v.averageValue,
      avgCommission: v.avgCommission,
      difficulty: v.difficulty,
      popularBrands: v.popularBrands,
      gradient: v.gradient,
    };
  });

  // Calculated values
  const totalAdvertiserCommission = (calcSaleValue * calcCommPct) / 100;
  // Let's assume digital indicator gets 15% of the total advertiser commission or a fixed rate
  // Let's model it: Digital gets 12% of total commission, Presencial gets 35% of total commission
  const calculatedEarnings =
    calcType === "digital" ? totalAdvertiserCommission * 0.15 : totalAdvertiserCommission * 0.35;

  const handleQuickLogin = (
    email: string,
    pass: string,
    role: "indicador" | "anunciante" | "admin",
  ) => {
    setAuthRole(role);
    setIsRegisterMode(false);
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg("");
    setSuccessMsg("");

    setTimeout(() => {
      let success = false;
      if (role === "indicador") {
        success = onLoginIndicator(email, pass);
      } else if (role === "anunciante") {
        success = onLoginAdvertiser(email, pass);
      } else if (role === "admin") {
        success = onLoginAdmin(email, pass);
      }

      if (success) {
        setSuccessMsg("Bem-vindo! Acesso rápido concedido.");
        setTimeout(() => {
          setShowAuthModal(false);
          setSuccessMsg("");
        }, 800);
      } else {
        setErrorMsg("Erro de autenticação automática.");
      }
    }, 50);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginEmail || !loginPassword) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    if (authRole === "indicador") {
      const success = onLoginIndicator(loginEmail, loginPassword);
      if (success) {
        setSuccessMsg("Login efetuado! Redirecionando...");
        setTimeout(() => setShowAuthModal(false), 800);
      } else {
        setErrorMsg("E-mail ou senha incorretos para Indicador.");
      }
    } else if (authRole === "anunciante") {
      const success = onLoginAdvertiser(loginEmail, loginPassword);
      if (success) {
        setSuccessMsg("Login efetuado! Redirecionando...");
        setTimeout(() => setShowAuthModal(false), 800);
      } else {
        setErrorMsg("E-mail ou senha incorretos para Anunciante.");
      }
    } else if (authRole === "admin") {
      const success = onLoginAdmin(loginEmail, loginPassword);
      if (success) {
        setSuccessMsg("Acesso administrativo liberado!");
        setTimeout(() => setShowAuthModal(false), 800);
      } else {
        setErrorMsg("Senha administrativa inválida.");
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (authRole === "indicador") {
      if (
        !regIndName ||
        !regIndEmail ||
        !regIndPassword ||
        !regIndCpf ||
        !regIndPixKey ||
        !regIndCity ||
        !regIndState
      ) {
        setErrorMsg(
          "Preencha os campos obrigatórios (Nome, E-mail, Senha, CPF, Chave PIX, Cidade e Estado).",
        );
        return;
      }
      onRegisterIndicator({
        name: regIndName,
        email: regIndEmail,
        password: regIndPassword,
        cpf: regIndCpf,
        phone: regIndPhone || "(11) 99999-9999",
        pixKey: regIndPixKey,
        pixType: regIndPixType,
        league: "bronze",
        score: 100,
        clicks: 0,
        hasAcceptedTerms: true,
        balanceAvailable: 0,
        balancePending: 0,
        city: regIndCity,
        state: regIndState,
      });
      setSuccessMsg("Cadastro efetuado com sucesso! Agora faça seu login.");
      setIsRegisterMode(false);
      setLoginEmail(regIndEmail);
    } else {
      if (
        !regAdvName ||
        !regAdvEmail ||
        !regAdvPassword ||
        !regAdvCnpjOrCpf ||
        !regAdvCity ||
        !regAdvState
      ) {
        setErrorMsg(
          "Preencha os campos obrigatórios (Nome da Empresa, E-mail, Senha, CNPJ/CPF, Cidade e Estado).",
        );
        return;
      }
      onRegisterAdvertiser({
        name: regAdvName,
        email: regAdvEmail,
        password: regAdvPassword,
        cnpjOrCpf: regAdvCnpjOrCpf,
        type: regAdvType,
        phone: regAdvPhone || "(11) 99999-9999",
        plan: regAdvPlan,
        categoriesSelected: regAdvCategories,
        hasAcceptedTerms: true,
        city: regAdvCity,
        state: regAdvState,
      });
      setSuccessMsg("Cadastro efetuado com sucesso! Agora faça seu login.");
      setIsRegisterMode(false);
      setLoginEmail(regAdvEmail);
    }
  };

  const toggleCategorySelection = (cat: Category) => {
    if (regAdvCategories.includes(cat)) {
      if (regAdvCategories.length > 1) {
        setRegAdvCategories(regAdvCategories.filter((c) => c !== cat));
      }
    } else {
      setRegAdvCategories([...regAdvCategories, cat]);
    }
  };

  const openAuth = (_role: "indicador" | "anunciante" | "admin", _isRegister = false) => {
    // Fluxo unificado: todo cadastro/login vai para a rota /auth (Supabase real).
    // O modal interno legado foi desativado — evita cadastros em localStorage que sumiam.
    window.location.href = "/auth";
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-800">
      {/* PROFESSIONAL NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveSection("home")}
            >
              <div className="bg-orange-600 p-2 rounded-xl text-white shadow shadow-orange-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-slate-900 text-lg tracking-tight">
                IndicaAqui<span className="text-orange-600">.</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#nichos"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("niches");
                  document.getElementById("nichos")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-xs uppercase font-bold tracking-wider hover:text-orange-600 transition-colors ${activeSection === "niches" ? "text-orange-600" : "text-slate-600"}`}
              >
                Nossos Nichos
              </a>
              <a
                href="#como-funciona"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("how-it-works");
                  document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-xs uppercase font-bold tracking-wider hover:text-orange-600 transition-colors ${activeSection === "how-it-works" ? "text-slate-600" : "text-slate-600"}`}
              >
                Como Funciona
              </a>
              <a
                href="#como-lucrar"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("how-to-profit");
                  document.getElementById("como-lucrar")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-xs uppercase font-bold tracking-wider hover:text-orange-600 transition-colors ${activeSection === "how-to-profit" ? "text-slate-600" : "text-slate-600"}`}
              >
                Simulador de Lucros
              </a>
              <a
                href="#anunciar"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("how-to-sell");
                  document.getElementById("anunciar")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-xs uppercase font-bold tracking-wider hover:text-orange-600 transition-colors ${activeSection === "how-to-sell" ? "text-slate-600" : "text-slate-600"}`}
              >
                Como Anunciar
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuth("indicador")}
                className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-200 transition-all"
              >
                Área do Indicador
              </button>
              <button
                onClick={() => openAuth("anunciante")}
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-100 hover:scale-[1.01] active:scale-[0.99]"
              >
                Área do Anunciante
              </button>
              <button
                onClick={() => openAuth("admin")}
                className="p-2 text-slate-400 hover:text-orange-600 rounded-lg transition-colors"
                title="Acesso Administrador"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                Plataforma de Afiliados de Alto Padrão
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-slate-900 leading-[1.1]">
                Indique Leads Premium e{" "}
                <span className="text-orange-600 relative inline-block">
                  ganhe comissões
                  <span className="absolute left-0 bottom-1 w-full h-2 bg-orange-200 -z-10 rounded"></span>
                </span>{" "}
                via PIX.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Conectamos indicadores autônomos a grandes marcas de carros, imóveis, lanchas e
                motos aquáticas. Indique amigos ou leads qualificados e receba pagamentos
                expressivos em cada venda finalizada.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => openAuth("indicador", true)}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Seja um Indicador <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openAuth("anunciante", true)}
                  className="w-full sm:w-auto bg-white border border-slate-200 hover:border-orange-500 text-slate-800 hover:text-orange-600 font-bold text-sm px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" /> Anunciar Produtos
                </button>
              </div>

              {/* Bullet points benefits */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="block text-xl font-bold text-slate-900">R$ 2.4M+</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Comissões Pagas
                  </span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-900">12k+</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Leads Gerados
                  </span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-900">100%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Auditado em Tempo Real
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column Interactive Bento Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl"></div>

                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400">VITRINE EM TEMPO REAL</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center font-bold text-sm">
                      🏠
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Cobertura Triplex Guarujá</p>
                      <p className="text-[10px] text-slate-400">Vanguard Imóveis</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-orange-400 font-mono block font-bold">
                        R$ 18.000
                      </span>
                      <span className="text-[9px] text-slate-500 block">Comissão Indicação</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center font-bold text-sm">
                      🚗
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Porsche Macan 2024</p>
                      <p className="text-[10px] text-slate-400">Motorsport SP</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-orange-400 font-mono block font-bold">
                        R$ 5.500
                      </span>
                      <span className="text-[9px] text-slate-500 block">Comissão Indicação</span>
                    </div>
                  </div>

                  {/* Funnel visualization */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-dashed border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold mb-2">
                      Histórico de Atividade Recente
                    </span>
                    <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
                      <p className="flex justify-between">
                        <span>Gabriel M. indicou Porsche</span>
                        <span className="text-emerald-400 font-bold">Venda Concluída R$ 450k</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Juliana S. indicou Lancha</span>
                        <span className="text-amber-400">Visita Confirmada</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <p className="text-[11px] text-slate-400">
                    Você indica usando um link inteligente exclusivo gerado na hora.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION NICHOS (OUR NICHES) */}
      <section id="nichos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs bg-orange-100 text-orange-800 font-bold tracking-widest uppercase px-3.5 py-1 rounded-full">
              NICHOS HIGH-TICKET DISPONÍVEIS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Segmentos Lucrativos para Você Indicar
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Trabalhamos exclusivamente com bens de alto ticket. Isso significa que uma única
              indicação sua que resulte em venda garante comissões maiores do que meses de trabalho
              comum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {nichesData.map((niche) => (
              <div
                key={niche.id}
                className={`rounded-2xl p-6 border border-slate-100 hover:border-orange-500/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-gradient-to-b ${niche.gradient}`}
              >
                <div>
                  <div className="bg-white p-3.5 rounded-xl inline-block shadow-sm mb-4 border border-slate-50">
                    {niche.icon}
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-lg leading-snug mb-2">
                    {niche.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{niche.description}</p>
                </div>

                <div className="border-t border-slate-100/60 pt-4 mt-2 space-y-2.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Ticket Médio:</span>
                    <span className="font-bold text-slate-800">{niche.averageValue}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Comissão PIX:</span>
                    <span className="font-bold text-orange-600">{niche.avgCommission}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Grau de Venda:</span>
                    <span className="font-semibold text-slate-600">{niche.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION COMO FUNCIONA (HOW IT WORKS) */}
      <section id="como-funciona" className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs bg-orange-100 text-orange-800 font-bold tracking-widest uppercase px-3.5 py-1 rounded-full">
              SISTEMA SIMPLES E TRANSPARENTE
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Como Funciona a Plataforma IndicaAqui?
            </h2>
            <p className="text-slate-600 text-sm">
              Desenvolvemos dois painéis totalmente automatizados para que Indicadores e Anunciantes
              acompanhem cada etapa com integridade.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Como Funciona para Indicadores */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 text-orange-700 p-2.5 rounded-xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-slate-900 text-xl">
                  Para o Indicador Autônomo
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Cadastre-se na Plataforma
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Crie seu cadastro informando seus dados básicos e sua Chave PIX para
                      pagamentos automáticos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Escolha Produtos na Vitrine
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Acesse a vitrine com dezenas de carros, lanchas, imóveis e jetskis autorizados
                      para indicações.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Compartilhe seu Link Exclusivo
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Obtenha o link de indicação gerado pelo sistema e envie ao seu cliente
                      interessado ou cadastre os dados dele diretamente no painel.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    4
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Acompanhe pelo Funil de Vendas
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Receba atualizações imediatas no painel: quando o anunciante faz contato,
                      agenda a visita e fecha a proposta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Saque seu Saldo via PIX
                    </h4>
                    <p className="text-slate-600 text-xs font-semibold text-emerald-700">
                      Quando a venda é concluída, a comissão é liberada para saque instantâneo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openAuth("indicador", true)}
                  className="text-orange-600 hover:text-orange-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  Criar Cadastro de Indicador Autônomo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Como Funciona para Anunciantes */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 text-orange-700 p-2.5 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-slate-900 text-xl">
                  Para o Anunciante (Vendedor)
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Cadastre sua Empresa</h4>
                    <p className="text-slate-600 text-xs">
                      Faça login com CNPJ ou CPF particular, escolha suas verticais de venda e
                      assine um plano.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Publique Seus Bens</h4>
                    <p className="text-slate-600 text-xs">
                      Insira fotos, descrições detalhadas, valor de mercado e a porcentagem de
                      comissão digital e presencial que você deseja pagar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Receba Leads Auditados
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Os leads gerados por promotores caem instantaneamente no seu painel. O
                      promotor pode ainda fazer check-in de visita via GPS.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    4
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Atualize o Status do Atendimento
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Mova o lead pelo funil (Contato Feito → Visita Agendada → Proposta) mantendo a
                      transparência e confiança com o indicador.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Comprove o Fechamento</h4>
                    <p className="text-slate-600 text-xs font-semibold text-emerald-700">
                      Ao faturar, envie a Nota Fiscal ou contrato simplificado de comprovação de
                      venda para liberar a comissão do promotor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openAuth("anunciante", true)}
                  className="text-orange-600 hover:text-orange-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  Anunciar como Empresa / Vendedor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION COMO LUCRAR (PROFIT CALCULATOR) */}
      <section id="como-lucrar" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Calculator */}
            <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-md">
              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold uppercase px-3 py-1 rounded-full font-mono">
                SIMULADOR INTERATIVO
              </span>
              <h3 className="font-display font-bold text-slate-900 text-2xl mt-3 mb-6">
                Quanto eu posso lucrar por indicação?
              </h3>

              <div className="space-y-5">
                {/* 1. Niche selector */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase mb-2">
                    Selecione o Nicho do Produto
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {VERTICALS_ORDER.map((cat) => {
                      const v = VERTICALS[cat];
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setCalcNiche(cat);
                            setCalcSaleValue(v.calc.saleValue);
                            setCalcCommPct(v.calc.commPct);
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                            calcNiche === cat
                              ? "bg-orange-600 border-orange-600 text-white"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                          title={v.label}
                        >
                          {v.emoji} {v.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Value slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 uppercase">Valor Estimado do Bem</span>
                    <span className="text-slate-900">
                      R$ {calcSaleValue.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={VERTICALS[calcNiche].calc.min}
                    max={VERTICALS[calcNiche].calc.max}
                    step={1000}
                    value={calcSaleValue}
                    onChange={(e) => setCalcSaleValue(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                {/* 3. Commission slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 uppercase">
                      Comissão Total Oferecida pelo Vendedor
                    </span>
                    <span className="text-slate-900">
                      {calcCommPct}% (R$ {totalAdvertiserCommission.toLocaleString("pt-BR")})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={calcCommPct}
                    onChange={(e) => setCalcCommPct(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                {/* 4. Type Selector */}
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase mb-2">
                    Qual seu nível de envolvimento?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCalcType("digital")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        calcType === "digital"
                          ? "bg-orange-50 border-orange-500 ring-2 ring-orange-500/20"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block font-bold text-slate-900 text-xs">
                        Apenas Indicação (Digital)
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1">
                        Você apenas envia o link ou cadastra os contatos do lead. Comissão de 15% da
                        verba.
                      </span>
                    </button>
                    <button
                      onClick={() => setCalcType("presencial")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        calcType === "presencial"
                          ? "bg-orange-50 border-orange-500 ring-2 ring-orange-500/20"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block font-bold text-slate-900 text-xs">
                        Visita Acompanhada (Presencial)
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1">
                        Você acompanha o lead presencialmente na visita de demonstração. Comissão de
                        35% da verba.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Result Card */}
                <div className="bg-orange-600 text-white p-5 rounded-2xl shadow-md space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-orange-200">
                    Sua Comissão Estimada via PIX
                  </span>
                  <div className="text-3xl font-display font-black">
                    R${" "}
                    {calculatedEarnings.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-[10px] text-orange-100">
                    Simulação baseada no regulamento de comissões autônomas IndicaAqui.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Details */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs bg-orange-100 text-orange-800 font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                COMO LUCRAR MAIS
              </span>
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-tight">
                Duas modalidades de ganhos adaptadas ao seu estilo
              </h3>
              <p className="text-slate-600 text-sm">
                Na nossa plataforma, você tem total liberdade. Não exigimos dedicação exclusiva ou
                metas. Você pode trabalhar indicando contatos do seu círculo social de forma digital
                ou atuando de forma ativa acompanhando visitas.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-950 text-sm mb-1">
                      Indicação Digital Direta (Sem Burocracia)
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Simplesmente identifique um amigo, colega ou familiar interessado em comprar
                      um carro ou imóvel. Gere seu link de indicação, envie a ele, e quando ele
                      preencher, ele se torna seu lead com cookie ativado por 60 dias.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-950 text-sm mb-1">
                      Acompanhamento Presencial (Comissão Turbinada)
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Quer lucrar 2x ou 3x mais? No agendamento da visita, opte por acompanhar o
                      lead presencialmente na imobiliária, marina ou concessionária. Utilize nosso
                      app de celular para realizar o check-in por GPS auditado para validar sua
                      comissão.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-950 text-sm mb-1">
                      Parceria Legal Protegida (Art. 442-B da CLT)
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Todo cadastro assina digitalmente um Contrato de Parceria Autônoma, blindando
                      juridicamente as duas pontas contra vínculo trabalhista, garantindo total
                      conformidade legal para anunciantes PJ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION COMO VENDER (FOR ADVERTISERS) */}
      <section id="anunciar" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950 via-slate-900 to-slate-950 opacity-90"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text details */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs bg-orange-600 text-white font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                PARA INCORPORADORAS, LOJAS E CONCESSIONÁRIAS
              </span>
              <h3 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight">
                Venda Bens de Alto Ticket Sem Custo Fixo de Marketing
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Por que queimar dinheiro com anúncios patrocinados frios quando você pode ter
                centenas de promotores locais motivados indicando leads super quentes e auditados?
                Na plataforma IndicaAqui, você só paga comissão se a venda for de fato assinada e
                fechada!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-orange-400 font-bold text-xs uppercase mb-1">
                    Catálogo Zero-Deploy
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Seu anúncio gera automaticamente uma landing page profissional instantânea
                    pronta para converter sem você programar nada.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-orange-400 font-bold text-xs uppercase mb-1">
                    Auditoria de Visitas
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Evite fraudes: promotores confirmam visitas tirando foto na fachada da loja ou
                    realizando check-in com GPS no local.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-orange-400 font-bold text-xs uppercase mb-1">
                    Taxa por Lead ou Faturamento
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Configure se prefere pagar uma pequena taxa por lead de demonstração ou se
                    prefere o modelo puro de comissão final.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-orange-400 font-bold text-xs uppercase mb-1">
                    Gestão de Leads Completa
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Mova os clientes no funil de vendas, registre reuniões e anexe comprovantes de
                    faturamento em um único dashboard.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openAuth("anunciante", true)}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-950/40"
                >
                  Cadastrar Empresa Grátis
                </button>
              </div>
            </div>

            {/* Plans comparison cards */}
            <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-white/5 shadow-2xl space-y-6">
              <h4 className="font-display font-bold text-sm tracking-widest text-slate-400 uppercase text-center border-b border-white/5 pb-3">
                PLANOS DE ASSINATURA
              </h4>

              <div className="space-y-4">
                {/* Plan 1 */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center hover:border-orange-500/30 transition-all">
                  <div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-bold uppercase px-2 py-0.5 rounded font-mono">
                      Simples
                    </span>
                    <h5 className="font-bold text-sm mt-1">Plano Starter (Imóvel / Carro)</h5>
                    <p className="text-[10px] text-slate-500">Até 3 anúncios ativos simultâneos.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono font-bold">
                      R$ 149 /mês
                    </span>
                    <span className="text-[8px] bg-orange-600/20 text-orange-400 px-1.5 py-0.5 rounded">
                      Popular
                    </span>
                  </div>
                </div>

                {/* Plan 2 */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-orange-500/20 flex justify-between items-center hover:border-orange-500/50 transition-all shadow-md shadow-orange-950/50">
                  <div>
                    <span className="text-[10px] bg-orange-600 text-white font-bold uppercase px-2 py-0.5 rounded font-mono">
                      Mais Vendido
                    </span>
                    <h5 className="font-bold text-sm mt-1">Plano Pro (Multi-Vertical)</h5>
                    <p className="text-[10px] text-slate-400">
                      Até 10 anúncios ativos com auditoria GPS.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-orange-400 block font-mono font-bold">
                      R$ 399 /mês
                    </span>
                    <span className="text-[8px] bg-emerald-600/20 text-emerald-400 px-1.5 py-0.5 rounded">
                      Fidelidade
                    </span>
                  </div>
                </div>

                {/* Plan 3 */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center hover:border-orange-500/30 transition-all">
                  <div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-bold uppercase px-2 py-0.5 rounded font-mono">
                      Corporativo
                    </span>
                    <h5 className="font-bold text-sm mt-1">Plano Premium Corporativo</h5>
                    <p className="text-[10px] text-slate-500">
                      Anúncios ilimitados, assessoria jurídica de contratos.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono font-bold">
                      R$ 799 /mês
                    </span>
                    <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      Premium
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-white font-display font-black text-base">
              IndicaAqui<span className="text-orange-600">.</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              A primeira rede de afiliação e comissões para bens de alto padrão no Brasil.
            </p>
          </div>
          <div>
            <span className="text-white font-bold block mb-3 uppercase text-[10px] tracking-wider">
              Para Promotores
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="#como-funciona" className="hover:text-white">
                  Passo a Passo
                </a>
              </li>
              <li>
                <a href="#como-lucrar" className="hover:text-white">
                  Simulador de PIX
                </a>
              </li>
              <li>
                <button
                  onClick={() => openAuth("indicador")}
                  className="hover:text-white text-left"
                >
                  Login Indicador
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuth("indicador", true)}
                  className="hover:text-white text-left"
                >
                  Cadastro Indicador
                </button>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-white font-bold block mb-3 uppercase text-[10px] tracking-wider">
              Para Anunciantes
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="#anunciar" className="hover:text-white">
                  Nossos Planos
                </a>
              </li>
              <li>
                <a href="#nichos" className="hover:text-white">
                  Categorias Aceitas
                </a>
              </li>
              <li>
                <button
                  onClick={() => openAuth("anunciante")}
                  className="hover:text-white text-left"
                >
                  Painel da Empresa
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuth("anunciante", true)}
                  className="hover:text-white text-left"
                >
                  Registrar Conta
                </button>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-white font-bold block mb-3 uppercase text-[10px] tracking-wider">
              Segurança Jurídica
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Contratos digitais baseados no Art. 442-B da CLT. Segurança e transparência fiscal com
              Nota Fiscal eletrônica ou comprovantes.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-900 text-center text-[10px] text-slate-600 flex justify-between flex-wrap gap-4">
          <span>© 2026 IndicaAqui Tecnologia Ltda. CNPJ: 34.567.890/0001-11</span>
          <span>Sede: Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP</span>
        </div>
      </footer>

      {/* FULL AUTH MODAL (LOGIN & CADASTRO COM LOGIN/SENHA) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-bold z-10"
            >
              ✕
            </button>

            {/* Header Tabs */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 pt-6 flex justify-center gap-2">
              <button
                onClick={() => {
                  setAuthRole("indicador");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  authRole === "indicador"
                    ? "bg-orange-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Sou Indicador (Afiliado)
              </button>
              <button
                onClick={() => {
                  setAuthRole("anunciante");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  authRole === "anunciante"
                    ? "bg-orange-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Sou Anunciante (Vendedor)
              </button>
              <button
                onClick={() => {
                  setAuthRole("admin");
                  setIsRegisterMode(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  authRole === "admin"
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Admin
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold uppercase px-2.5 py-1 rounded-full font-mono">
                  {authRole === "admin"
                    ? "Acesso Administrativo"
                    : isRegisterMode
                      ? "Cadastro Completo"
                      : "Área Restrita"}
                </span>
                <h3 className="font-display font-black text-slate-900 text-2xl mt-2">
                  {authRole === "admin"
                    ? "Acesso Admin"
                    : isRegisterMode
                      ? `Registrar como ${authRole === "indicador" ? "Indicador" : "Anunciante"}`
                      : `Entrar como ${authRole === "indicador" ? "Indicador" : "Anunciante"}`}
                </h3>
                {authRole !== "admin" && (
                  <p className="text-xs text-slate-500 mt-1">
                    {isRegisterMode
                      ? "Preencha o formulário abaixo"
                      : "Entre com e-mail e senha cadastrados"}
                  </p>
                )}
              </div>

              {/* Error and Success states */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {/* FORMS */}
              {!isRegisterMode ? (
                // LOGIN FORM
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                      E-mail de Acesso
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={
                        authRole === "admin" ? "admin@indicaaqui.com" : "ex: gabriel@exemplo.com"
                      }
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                      Senha Secreta
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Entrar no Painel Seguro
                  </button>

                  {authRole !== "admin" && (
                    <div className="text-center pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        Não possui cadastro?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegisterMode(true);
                            setErrorMsg("");
                            setSuccessMsg("");
                          }}
                          className="text-orange-600 font-bold hover:underline"
                        >
                          Cadastre-se Agora
                        </button>
                      </p>
                    </div>
                  )}

                  {/* Quick demo login links */}
                  <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Acesso Rápido (Demonstração)
                    </span>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickLogin("gabriel.martins@indica.com", "senha123", "indicador")
                        }
                        className="bg-orange-50 hover:bg-orange-100 border border-orange-200/50 text-orange-950 rounded-xl py-2 px-1 text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 shadow-xs"
                      >
                        <span className="opacity-90">Indicador</span>
                        <span className="text-[8px] text-orange-700 font-normal">Gabriel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickLogin("contato@vanguardluxo.com.br", "senha123", "anunciante")
                        }
                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-emerald-950 rounded-xl py-2 px-1 text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 shadow-xs"
                      >
                        <span className="opacity-90">Anunciante</span>
                        <span className="text-[8px] text-emerald-700 font-normal">Vanguard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickLogin("admin@indicaaqui.com", "admin123", "admin")
                        }
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-950 rounded-xl py-2 px-1 text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 shadow-xs"
                      >
                        <span className="opacity-90">Administrador</span>
                        <span className="text-[8px] text-slate-600 font-normal">Admin Geral</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // REGISTER FORMS
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {authRole === "indicador" ? (
                    // INDICATOR REGISTER FIELDS
                    <>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Roberto Carlos"
                          value={regIndName}
                          onChange={(e) => setRegIndName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="roberto@email.com"
                            value={regIndEmail}
                            onChange={(e) => setRegIndEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Senha
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="Mínimo 6 caracteres"
                            value={regIndPassword}
                            onChange={(e) => setRegIndPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            CPF
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="000.000.000-00"
                            value={regIndCpf}
                            onChange={(e) => setRegIndCpf(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            WhatsApp / Telefone
                          </label>
                          <input
                            type="text"
                            placeholder="(11) 99999-9999"
                            value={regIndPhone}
                            onChange={(e) => setRegIndPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Tipo de PIX
                          </label>
                          <select
                            value={regIndPixType}
                            onChange={(e: any) => setRegIndPixType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            <option value="email">E-mail</option>
                            <option value="cpf">CPF</option>
                            <option value="phone">Celular</option>
                            <option value="random">Chave Aleatória</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Chave PIX de Recebimento
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Chave para transferências"
                            value={regIndPixKey}
                            onChange={(e) => setRegIndPixKey(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Cidade de Atuação
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ex: São Paulo"
                            value={regIndCity}
                            onChange={(e) => setRegIndCity(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Estado (UF)
                          </label>
                          <select
                            value={regIndState}
                            onChange={(e) => setRegIndState(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                    </>
                  ) : (
                    // ADVERTISER REGISTER FIELDS
                    <>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                          Nome Fantasia da Empresa
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Incorporadora Sul"
                          value={regAdvName}
                          onChange={(e) => setRegAdvName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            E-mail Corporativo
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="contato@empresa.com"
                            value={regAdvEmail}
                            onChange={(e) => setRegAdvEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Senha
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="Min. 6 caracteres"
                            value={regAdvPassword}
                            onChange={(e) => setRegAdvPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Tipo
                          </label>
                          <select
                            value={regAdvType}
                            onChange={(e: any) => setRegAdvType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            <option value="PJ">CNPJ (PJ)</option>
                            <option value="PF">CPF (Autônomo)</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Documento (CNPJ/CPF)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="CNPJ ou CPF"
                            value={regAdvCnpjOrCpf}
                            onChange={(e) => setRegAdvCnpjOrCpf(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            WhatsApp / Comercial
                          </label>
                          <input
                            type="text"
                            placeholder="(11) 98888-8888"
                            value={regAdvPhone}
                            onChange={(e) => setRegAdvPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Plano Pretendido
                          </label>
                          <select
                            value={regAdvPlan}
                            onChange={(e: any) => setRegAdvPlan(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          >
                            <option value="starter">Starter (R$ 149/mês)</option>
                            <option value="pro">Pro (R$ 399/mês)</option>
                            <option value="premium">Premium (R$ 799/mês)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Cidade da Sede / Loja
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ex: Rio de Janeiro"
                            value={regAdvCity}
                            onChange={(e) => setRegAdvCity(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                            Estado (UF)
                          </label>
                          <select
                            value={regAdvState}
                            onChange={(e) => setRegAdvState(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                          Nichos Atuantes (Múltiplas Verticais)
                        </label>
                        <div className="grid grid-cols-5 md:grid-cols-7 gap-1 pt-1">
                          {VERTICALS_ORDER.map((cat) => {
                            const v = VERTICALS[cat];
                            return (
                              <button
                                type="button"
                                key={cat}
                                onClick={() => toggleCategorySelection(cat)}
                                title={v.label}
                                className={`py-1 rounded text-[11px] font-bold border transition-all ${
                                  regAdvCategories.includes(cat)
                                    ? "bg-orange-600 border-orange-600 text-white"
                                    : "bg-slate-100 border-slate-200 text-slate-600"
                                }`}
                              >
                                {v.emoji}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Cadastrar e Concordar com os Termos
                  </button>

                  <div className="text-center pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Já possui cadastro?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(false);
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Fazer Login
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
