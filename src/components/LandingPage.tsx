import { useState } from "react";
import { motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";
import {
  Building2,
  ArrowRight,
  Shield,
  UserCheck,
  Check,
  Users,
  Calendar,
  Percent,
  Sparkles,
  Zap,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Category } from "../types";
import { VERTICALS, VERTICALS_ORDER } from "../lib/verticals";
import SponsorSlot from "./SponsorSlot";
import {
  Reveal,
  RevealGroup,
  RevealItem,
  CountUp,
  LiveNumber,
  GlowBlob,
  Marquee,
  MagneticButton,
} from "./landing/motion-primitives";

export default function LandingPage() {
  // Navigation & Active View state inside landing page
  const [activeSection, setActiveSection] = useState<
    "home" | "niches" | "how-it-works" | "how-to-profit" | "how-to-sell"
  >("home");
  // Dynamic Calculator states
  const [calcNiche, setCalcNiche] = useState<Category>("imovel");
  const [calcSaleValue, setCalcSaleValue] = useState<number>(350000);
  const [calcCommPct, setCalcCommPct] = useState<number>(4); // 4% typical builder/owner commission
  const [calcType, setCalcType] = useState<"digital" | "presencial">("digital");

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

  const openAuth = (_role: "indicador" | "anunciante" | "admin", _isRegister = false) => {
    // Fluxo unificado: todo cadastro/login vai para a rota /auth (Supabase real).
    // O modal interno legado foi desativado — evita cadastros em localStorage que sumiam.
    window.location.href = "/auth";
  };

  const scrollTo = (
    id: string,
    section: "home" | "niches" | "how-it-works" | "how-to-profit" | "how-to-sell",
  ) => {
    setActiveSection(section);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-navy-950 min-h-screen font-sans antialiased text-platinum-100 selection:bg-gold-400/30 selection:text-white">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-navy-950/70 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              className="flex items-center cursor-pointer"
              onClick={() => {
                setActiveSection("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <BrandLogo className="h-9 w-auto" variant="light" />
            </button>

            <div className="hidden md:flex items-center gap-7">
              {(
                [
                  { id: "nichos", label: "Nossos Nichos", section: "niches" },
                  { id: "como-funciona", label: "Como Funciona", section: "how-it-works" },
                  { id: "como-lucrar", label: "Simulador de Lucros", section: "how-to-profit" },
                  { id: "anunciar", label: "Como Anunciar", section: "how-to-sell" },
                ] as const
              ).map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.id, link.section);
                  }}
                  className={`text-xs uppercase font-bold tracking-wider transition-colors ${
                    activeSection === link.section
                      ? "text-gold-400"
                      : "text-platinum-200/70 hover:text-platinum-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuth("indicador")}
                className="hidden sm:inline-flex bg-white/5 border border-white/10 text-platinum-100 text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                Área do Indicador
              </button>
              <MagneticButton
                onClick={() => openAuth("anunciante")}
                className="bg-gradient-to-r from-royal-500 to-royal-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-[0_0_24px_-6px_rgba(59,111,160,0.7)]"
              >
                Área do Anunciante
              </MagneticButton>
              <button
                onClick={() => openAuth("admin")}
                className="p-2 text-platinum-200/40 hover:text-gold-400 rounded-lg transition-colors"
                title="Acesso Administrador"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Ambient gradient mesh */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950" />
        <GlowBlob
          className="w-[32rem] h-[32rem] -top-40 -right-20"
          color="radial-gradient(circle, rgba(59,111,160,0.35) 0%, transparent 70%)"
        />
        <GlowBlob
          className="w-[26rem] h-[26rem] top-40 -left-32"
          color="radial-gradient(circle, rgba(212,181,106,0.18) 0%, transparent 70%)"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.03] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px]"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-gold-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Plataforma de Afiliados de Alto Padrão
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-[1.08]"
              >
                Indique Leads Premium e{" "}
                <span className="relative inline-block bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 bg-clip-text text-transparent">
                  ganhe comissões
                </span>{" "}
                via PIX.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-platinum-200/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Conectamos indicadores autônomos a grandes marcas de carros, imóveis, lanchas e
                motos aquáticas. Indique amigos ou leads qualificados e receba pagamentos
                expressivos em cada venda finalizada.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <MagneticButton
                  onClick={() => openAuth("indicador", true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-royal-500 to-royal-400 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-[0_0_40px_-10px_rgba(59,111,160,0.8)] flex items-center justify-center gap-2"
                >
                  Seja um Indicador <ArrowRight className="w-4 h-4" />
                </MagneticButton>
                <MagneticButton
                  onClick={() => openAuth("anunciante", true)}
                  className="w-full sm:w-auto bg-white/5 border border-white/15 hover:border-gold-400/40 text-platinum-100 hover:text-gold-400 font-bold text-sm px-8 py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" /> Anunciar Produtos
                </MagneticButton>
              </motion.div>

              {/* Bullet points benefits */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="block text-xl font-bold text-white font-mono">
                    <CountUp value={2.4} decimals={1} prefix="R$ " suffix="M+" />
                  </span>
                  <span className="text-[10px] text-platinum-200/50 uppercase font-semibold">
                    Comissões Pagas
                  </span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-white font-mono">
                    <CountUp value={12} suffix="k+" />
                  </span>
                  <span className="text-[10px] text-platinum-200/50 uppercase font-semibold">
                    Leads Gerados
                  </span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-white font-mono">
                    <CountUp value={100} suffix="%" />
                  </span>
                  <span className="text-[10px] text-platinum-200/50 uppercase font-semibold">
                    Auditado em Tempo Real
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column Interactive Preview */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-navy-900/80 backdrop-blur-xl rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/10"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-royal-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-400/10 rounded-full blur-3xl" />

                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3 relative">
                  <span className="text-xs font-mono text-platinum-200/60 tracking-wider">
                    VITRINE EM TEMPO REAL
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>

                <div className="space-y-4 relative">
                  {/* Item 1 */}
                  <div className="bg-navy-950/60 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-royal-500/20 text-royal-400 flex items-center justify-center font-bold text-sm">
                      🏠
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Cobertura Triplex Guarujá</p>
                      <p className="text-[10px] text-platinum-200/50">Vanguard Imóveis</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gold-400 font-mono block font-bold">
                        R$ 18.000
                      </span>
                      <span className="text-[9px] text-platinum-200/40 block">
                        Comissão Indicação
                      </span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-navy-950/60 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-royal-500/20 text-royal-400 flex items-center justify-center font-bold text-sm">
                      🚗
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">Porsche Macan 2024</p>
                      <p className="text-[10px] text-platinum-200/50">Motorsport SP</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gold-400 font-mono block font-bold">
                        R$ 5.500
                      </span>
                      <span className="text-[9px] text-platinum-200/40 block">
                        Comissão Indicação
                      </span>
                    </div>
                  </div>

                  {/* Funnel visualization */}
                  <div className="bg-navy-950/30 p-4 rounded-2xl border border-dashed border-white/10">
                    <span className="text-[9px] text-platinum-200/50 uppercase tracking-widest block font-bold mb-2">
                      Histórico de Atividade Recente
                    </span>
                    <div className="space-y-1.5 font-mono text-[10px] text-platinum-200/80">
                      <p className="flex justify-between">
                        <span>Gabriel M. indicou Porsche</span>
                        <span className="text-emerald-400 font-bold">Venda Concluída R$ 450k</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Juliana S. indicou Lancha</span>
                        <span className="text-gold-400">Visita Confirmada</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center relative">
                  <p className="text-[11px] text-platinum-200/50">
                    Você indica usando um link inteligente exclusivo gerado na hora.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= VERTICALS MARQUEE ================= */}
      <section className="py-6 border-y border-white/5 bg-navy-900/40">
        <Marquee>
          {VERTICALS_ORDER.map((cat) => {
            const v = VERTICALS[cat];
            return (
              <span
                key={v.id}
                className="flex items-center gap-2 text-platinum-200/40 hover:text-gold-400 transition-colors text-sm font-semibold uppercase tracking-wider shrink-0"
              >
                <span className="text-lg leading-none">{v.emoji}</span>
                {v.shortLabel}
              </span>
            );
          })}
        </Marquee>
      </section>

      {/* ================= SPONSOR BAND ================= */}
      <section className="py-8 sm:py-10 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-1">
            <SponsorSlot variant="banner" label="Patrocinadores oficiais" className="p-4" />
          </div>
        </div>
      </section>

      {/* ================= NICHOS ================= */}
      <section id="nichos" className="py-24 bg-navy-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs bg-white/5 border border-white/10 text-gold-400 font-bold tracking-widest uppercase px-3.5 py-1 rounded-full inline-block">
              NICHOS HIGH-TICKET DISPONÍVEIS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Segmentos Lucrativos para Você Indicar
            </h2>
            <p className="text-platinum-200/60 text-sm sm:text-base leading-relaxed">
              Trabalhamos exclusivamente com bens de alto ticket. Isso significa que uma única
              indicação sua que resulte em venda garante comissões maiores do que meses de trabalho
              comum.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {nichesData.map((niche) => (
              <RevealItem key={niche.id}>
                <div className="group h-full rounded-2xl p-6 border border-white/8 bg-navy-900/50 hover:border-gold-400/30 hover:bg-navy-900/80 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_20px_50px_-20px_rgba(212,181,106,0.25)]">
                  <div>
                    <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl inline-block mb-4 group-hover:border-gold-400/30 transition-colors">
                      {niche.icon}
                    </div>
                    <h3 className="font-display font-bold text-white text-lg leading-snug mb-2">
                      {niche.title}
                    </h3>
                    <p className="text-platinum-200/60 text-xs leading-relaxed mb-4">
                      {niche.description}
                    </p>
                  </div>

                  <div className="border-t border-white/8 pt-4 mt-2 space-y-2.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-platinum-200/50 font-medium">Ticket Médio:</span>
                      <span className="font-bold text-platinum-100">{niche.averageValue}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-platinum-200/50 font-medium">Comissão PIX:</span>
                      <span className="font-bold text-gold-400">{niche.avgCommission}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-platinum-200/50 font-medium">Grau de Venda:</span>
                      <span className="font-semibold text-platinum-200/70">{niche.difficulty}</span>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ================= COMO FUNCIONA ================= */}
      <section id="como-funciona" className="py-24 bg-navy-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs bg-white/5 border border-white/10 text-gold-400 font-bold tracking-widest uppercase px-3.5 py-1 rounded-full inline-block">
              SISTEMA SIMPLES E TRANSPARENTE
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Como Funciona a Plataforma IndiqueLeads?
            </h2>
            <p className="text-platinum-200/60 text-sm">
              Desenvolvemos dois painéis totalmente automatizados para que Indicadores e Anunciantes
              acompanhem cada etapa com integridade.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Como Funciona para Indicadores */}
            <Reveal className="bg-navy-950/60 p-8 rounded-3xl border border-white/8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-royal-500/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="bg-royal-500/15 text-royal-400 p-2.5 rounded-xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-white text-xl">
                  Para o Indicador Autônomo
                </h3>
              </div>

              <div className="space-y-6 relative">
                {[
                  {
                    title: "Cadastre-se na Plataforma",
                    desc: "Crie seu cadastro informando seus dados básicos e sua Chave PIX para pagamentos automáticos.",
                  },
                  {
                    title: "Escolha Produtos na Vitrine",
                    desc: "Acesse a vitrine com dezenas de carros, lanchas, imóveis e jetskis autorizados para indicações.",
                  },
                  {
                    title: "Compartilhe seu Link Exclusivo",
                    desc: "Obtenha o link de indicação gerado pelo sistema e envie ao seu cliente interessado ou cadastre os dados dele diretamente no painel.",
                  },
                  {
                    title: "Acompanhe pelo Funil de Vendas",
                    desc: "Receba atualizações imediatas no painel: quando o anunciante faz contato, agenda a visita e fecha a proposta.",
                  },
                ].map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-royal-500/15 text-royal-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{step.title}</h4>
                      <p className="text-platinum-200/60 text-xs">{step.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">Saque seu Saldo via PIX</h4>
                    <p className="text-emerald-400 text-xs font-semibold">
                      Quando a venda é concluída, a comissão é liberada para saque instantâneo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/8 relative">
                <button
                  onClick={() => openAuth("indicador", true)}
                  className="text-gold-400 hover:text-gold-500 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  Criar Cadastro de Indicador Autônomo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Reveal>

            {/* Como Funciona para Anunciantes */}
            <Reveal
              delay={0.1}
              className="bg-navy-950/60 p-8 rounded-3xl border border-white/8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="bg-gold-400/15 text-gold-400 p-2.5 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-white text-xl">
                  Para o Anunciante (Vendedor)
                </h3>
              </div>

              <div className="space-y-6 relative">
                {[
                  {
                    title: "Cadastre sua Empresa",
                    desc: "Faça login com CNPJ ou CPF particular, escolha suas verticais de venda e assine um plano.",
                  },
                  {
                    title: "Publique Seus Bens",
                    desc: "Insira fotos, descrições detalhadas, valor de mercado e a porcentagem de comissão digital e presencial que você deseja pagar.",
                  },
                  {
                    title: "Receba Leads Auditados",
                    desc: "Os leads gerados por promotores caem instantaneamente no seu painel. Quando o indicador chega à loja com o cliente, você confirma a presença dele com um clique.",
                  },
                  {
                    title: "Atualize o Status do Atendimento",
                    desc: "Mova o lead pelo funil (Contato Feito → Visita Agendada → Proposta) mantendo a transparência e confiança com o indicador.",
                  },
                ].map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-white/8 text-platinum-100 flex items-center justify-center font-bold text-xs shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{step.title}</h4>
                      <p className="text-platinum-200/60 text-xs">{step.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">
                      Marque a Venda como Fechada
                    </h4>
                    <p className="text-emerald-400 text-xs font-semibold">
                      Ao marcar a venda como fechada no painel, a comissão do indicador é liberada
                      automaticamente — anexar NF/contrato é opcional, só como prova em caso de
                      disputa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/8 relative">
                <button
                  onClick={() => openAuth("anunciante", true)}
                  className="text-gold-400 hover:text-gold-500 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  Anunciar como Empresa / Vendedor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= SIMULADOR DE LUCROS ================= */}
      <section id="como-lucrar" className="py-24 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Calculator */}
            <Reveal className="lg:col-span-6 bg-navy-900/60 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/8 relative overflow-hidden">
              <GlowBlob
                className="w-64 h-64 -top-20 -right-20"
                color="radial-gradient(circle, rgba(212,181,106,0.15) 0%, transparent 70%)"
              />
              <span className="text-[10px] bg-white/5 border border-white/10 text-gold-400 font-bold uppercase px-3 py-1 rounded-full font-mono inline-block relative">
                SIMULADOR INTERATIVO
              </span>
              <h3 className="font-display font-bold text-white text-2xl mt-3 mb-6 relative">
                Quanto eu posso lucrar por indicação?
              </h3>

              <div className="space-y-5 relative">
                {/* 1. Niche selector */}
                <div>
                  <label className="block text-xs text-platinum-200/50 font-bold uppercase mb-2">
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
                              ? "bg-gradient-to-r from-royal-500 to-royal-400 border-transparent text-white"
                              : "bg-white/5 border-white/10 hover:bg-white/10 text-platinum-200/70"
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
                    <span className="text-platinum-200/50 uppercase">Valor Estimado do Bem</span>
                    <span className="text-white font-mono">
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
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-400"
                  />
                </div>

                {/* 3. Commission slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-platinum-200/50 uppercase">
                      Comissão Total Oferecida pelo Vendedor
                    </span>
                    <span className="text-white font-mono">
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
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-400"
                  />
                </div>

                {/* 4. Type Selector */}
                <div>
                  <label className="block text-xs text-platinum-200/50 font-bold uppercase mb-2">
                    Qual seu nível de envolvimento?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCalcType("digital")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        calcType === "digital"
                          ? "bg-royal-500/15 border-royal-400/50 ring-2 ring-royal-400/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="block font-bold text-white text-xs">
                        Apenas Indicação (Digital)
                      </span>
                      <span className="block text-[10px] text-platinum-200/50 mt-1">
                        Você apenas envia o link ou cadastra os contatos do lead. Comissão de 15% da
                        verba.
                      </span>
                    </button>
                    <button
                      onClick={() => setCalcType("presencial")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        calcType === "presencial"
                          ? "bg-royal-500/15 border-royal-400/50 ring-2 ring-royal-400/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="block font-bold text-white text-xs">
                        Visita Acompanhada (Presencial)
                      </span>
                      <span className="block text-[10px] text-platinum-200/50 mt-1">
                        Você acompanha o lead presencialmente na visita de demonstração. Comissão de
                        35% da verba.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Result Card */}
                <div className="bg-gradient-to-br from-royal-500 to-royal-700 text-white p-5 rounded-2xl shadow-[0_20px_50px_-15px_rgba(59,111,160,0.6)] space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">
                    Sua Comissão Estimada via PIX
                  </span>
                  <div className="text-3xl font-display font-black font-mono">
                    <LiveNumber value={calculatedEarnings} decimals={2} prefix="R$ " />
                  </div>
                  <p className="text-[10px] text-white/60">
                    Simulação baseada no regulamento de comissões autônomas IndiqueLeads.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Right Col: Details */}
            <Reveal delay={0.15} className="lg:col-span-6 space-y-6">
              <span className="text-xs bg-white/5 border border-white/10 text-gold-400 font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block">
                COMO LUCRAR MAIS
              </span>
              <h3 className="text-3xl font-display font-black text-white tracking-tight leading-tight">
                Duas modalidades de ganhos adaptadas ao seu estilo
              </h3>
              <p className="text-platinum-200/60 text-sm">
                Na nossa plataforma, você tem total liberdade. Não exigimos dedicação exclusiva ou
                metas. Você pode trabalhar indicando contatos do seu círculo social de forma digital
                ou atuando de forma ativa acompanhando visitas.
              </p>

              <RevealGroup className="space-y-4">
                {[
                  {
                    icon: Percent,
                    title: "Indicação Digital Direta (Sem Burocracia)",
                    desc: "Simplesmente identifique um amigo, colega ou familiar interessado em comprar um carro ou imóvel. Gere seu link de indicação, envie a ele, e quando ele preencher, ele se torna seu lead com cookie ativado por 60 dias.",
                    color: "royal",
                  },
                  {
                    icon: Calendar,
                    title: "Acompanhamento Presencial (Comissão Turbinada)",
                    desc: "Quer lucrar 2x ou 3x mais? No agendamento da visita, opte por acompanhar o lead presencialmente na imobiliária, marina ou concessionária. Ao chegar à loja, sinalize sua presença com um clique — o anunciante confirma direto no painel dele para validar sua comissão.",
                    color: "royal",
                  },
                  {
                    icon: Check,
                    title: "Parceria Legal Protegida (Art. 442-B da CLT)",
                    desc: "Todo cadastro assina digitalmente um Contrato de Parceria Autônoma, blindando juridicamente as duas pontas contra vínculo trabalhista, garantindo total conformidade legal para anunciantes PJ.",
                    color: "emerald",
                  },
                ].map((item) => (
                  <RevealItem key={item.title}>
                    <div className="flex gap-4 bg-navy-900/50 p-4 rounded-2xl border border-white/8 hover:border-white/15 transition-colors">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          item.color === "emerald"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-royal-500/15 text-royal-400"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                        <p className="text-platinum-200/60 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= COMO ANUNCIAR ================= */}
      <section
        id="anunciar"
        className="py-24 bg-navy-900/60 relative overflow-hidden border-t border-white/5"
      >
        <GlowBlob
          className="w-[30rem] h-[30rem] top-0 right-0"
          color="radial-gradient(circle, rgba(59,111,160,0.2) 0%, transparent 70%)"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text details */}
            <Reveal className="lg:col-span-6 space-y-6">
              <span className="text-xs bg-royal-500/15 border border-royal-400/20 text-royal-300 font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block">
                PARA INCORPORADORAS, LOJAS E CONCESSIONÁRIAS
              </span>
              <h3 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight text-white">
                Venda Bens de Alto Ticket Sem Custo Fixo de Marketing
              </h3>
              <p className="text-platinum-200/60 text-sm sm:text-base leading-relaxed">
                Por que queimar dinheiro com anúncios patrocinados frios quando você pode ter
                centenas de promotores locais motivados indicando leads super quentes e auditados?
                Na plataforma IndiqueLeads, você só paga comissão se a venda for de fato assinada e
                fechada!
              </p>

              <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Catálogo Zero-Deploy",
                    desc: "Seu anúncio gera automaticamente uma landing page profissional instantânea pronta para converter sem você programar nada.",
                  },
                  {
                    title: "Auditoria de Visitas",
                    desc: "Evite fraudes: quem confirma que a visita aconteceu é você, o anunciante — com um clique no seu painel quando o indicador chega à loja com o cliente.",
                  },
                  {
                    title: "Taxa por Lead ou Faturamento",
                    desc: "Configure se prefere pagar uma pequena taxa por lead qualificado, ou se prefere o modelo puro de comissão final.",
                  },
                  {
                    title: "Gestão de Leads Completa",
                    desc: "Mova os clientes no funil de vendas, registre reuniões e anexe comprovantes de faturamento em um único dashboard.",
                  },
                ].map((card) => (
                  <RevealItem key={card.title}>
                    <div className="bg-navy-950/60 p-4 rounded-2xl border border-white/8 h-full">
                      <h4 className="text-gold-400 font-bold text-xs uppercase mb-1">
                        {card.title}
                      </h4>
                      <p className="text-platinum-200/50 text-[11px]">{card.desc}</p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>

              <div className="pt-2">
                <MagneticButton
                  onClick={() => openAuth("anunciante", true)}
                  className="bg-gradient-to-r from-royal-500 to-royal-400 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-[0_0_30px_-8px_rgba(59,111,160,0.7)]"
                >
                  Cadastrar Empresa Grátis
                </MagneticButton>
              </div>
            </Reveal>

            {/* Plans comparison cards */}
            <Reveal
              delay={0.15}
              className="lg:col-span-6 bg-navy-950/70 backdrop-blur-sm p-6 rounded-3xl border border-white/8 shadow-2xl space-y-6"
            >
              <h4 className="font-display font-bold text-sm tracking-widest text-platinum-200/50 uppercase text-center border-b border-white/8 pb-3">
                PLANOS DE ASSINATURA
              </h4>

              <div className="space-y-4">
                {/* Plan 1 */}
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/8 flex justify-between items-center hover:border-white/15 transition-all">
                  <div>
                    <span className="text-[10px] bg-white/5 text-platinum-200/70 font-bold uppercase px-2 py-0.5 rounded font-mono">
                      Simples
                    </span>
                    <h5 className="font-bold text-sm mt-1 text-white">
                      Plano Starter (Imóvel / Carro)
                    </h5>
                    <p className="text-[10px] text-platinum-200/40">
                      Até 3 anúncios ativos simultâneos.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-platinum-200/60 block font-mono font-bold">
                      R$ 149 /mês
                    </span>
                  </div>
                </div>

                {/* Plan 2 */}
                <div className="bg-gradient-to-br from-royal-500/15 to-royal-900/30 p-4 rounded-2xl border border-royal-400/30 flex justify-between items-center hover:border-royal-400/50 transition-all shadow-[0_10px_30px_-15px_rgba(59,111,160,0.6)]">
                  <div>
                    <span className="text-[10px] bg-royal-500 text-white font-bold uppercase px-2 py-0.5 rounded font-mono">
                      Mais Vendido
                    </span>
                    <h5 className="font-bold text-sm mt-1 text-white">
                      Plano Pro (Multi-Vertical)
                    </h5>
                    <p className="text-[10px] text-platinum-200/60">
                      Até 10 anúncios ativos com confirmação de visita pelo anunciante.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gold-400 block font-mono font-bold">
                      R$ 399 /mês
                    </span>
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                      Fidelidade
                    </span>
                  </div>
                </div>

                {/* Plan 3 */}
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/8 flex justify-between items-center hover:border-white/15 transition-all">
                  <div>
                    <span className="text-[10px] bg-white/5 text-platinum-200/70 font-bold uppercase px-2 py-0.5 rounded font-mono">
                      Corporativo
                    </span>
                    <h5 className="font-bold text-sm mt-1 text-white">Plano Premium Corporativo</h5>
                    <p className="text-[10px] text-platinum-200/40">
                      Anúncios ilimitados, assessoria jurídica de contratos.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-platinum-200/60 block font-mono font-bold">
                      R$ 799 /mês
                    </span>
                    <span className="text-[8px] bg-gold-400/15 text-gold-400 px-1.5 py-0.5 rounded">
                      Premium
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="py-10 bg-navy-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealGroup className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: ShieldCheck, label: "Contrato Autônomo Blindado" },
              { icon: Lock, label: "Pagamentos Auditados" },
              { icon: Zap, label: "PIX Instantâneo" },
              { icon: Users, label: "Comunidade Ativa" },
            ].map((item) => (
              <RevealItem key={item.label}>
                <div className="flex flex-col items-center gap-2 text-platinum-200/50">
                  <item.icon className="w-5 h-5 text-gold-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-navy-950 text-platinum-200/50 py-12 border-t border-white/5 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo className="h-8 w-auto" variant="light" />
            <p className="text-[11px] text-platinum-200/40 leading-relaxed">
              A primeira rede de afiliação e comissões para bens de alto padrão no Brasil.
            </p>
          </div>
          <div>
            <span className="text-white font-bold block mb-3 uppercase text-[10px] tracking-wider">
              Para Promotores
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="#como-funciona" className="hover:text-gold-400 transition-colors">
                  Passo a Passo
                </a>
              </li>
              <li>
                <a href="#como-lucrar" className="hover:text-gold-400 transition-colors">
                  Simulador de PIX
                </a>
              </li>
              <li>
                <button
                  onClick={() => openAuth("indicador")}
                  className="hover:text-gold-400 text-left transition-colors"
                >
                  Login Indicador
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuth("indicador", true)}
                  className="hover:text-gold-400 text-left transition-colors"
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
                <a href="#anunciar" className="hover:text-gold-400 transition-colors">
                  Nossos Planos
                </a>
              </li>
              <li>
                <a href="#nichos" className="hover:text-gold-400 transition-colors">
                  Categorias Aceitas
                </a>
              </li>
              <li>
                <button
                  onClick={() => openAuth("anunciante")}
                  className="hover:text-gold-400 text-left transition-colors"
                >
                  Painel da Empresa
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuth("anunciante", true)}
                  className="hover:text-gold-400 text-left transition-colors"
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
            <p className="text-[11px] text-platinum-200/40 leading-relaxed">
              Contratos digitais baseados no Art. 442-B da CLT. Segurança e transparência fiscal com
              Nota Fiscal eletrônica ou comprovantes.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-white/5 text-center text-[10px] text-platinum-200/30 flex justify-between flex-wrap gap-4">
          <span>© 2026 IndiqueLeads Tecnologia Ltda. CNPJ: 34.567.890/0001-11</span>
          <span>Sede: Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP</span>
        </div>
      </footer>
    </div>
  );
}
