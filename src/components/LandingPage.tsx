import { useState } from "react";
import { motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";
import { Sparkles as SparklesField } from "@/components/ui/sparkles";
import {
  Building2,
  ArrowRight,
  Shield,
  Check,
  Users,
  Calendar,
  Percent,
  Sparkles,
  Zap,
  Lock,
  ShieldCheck,
  Link2,
  Handshake,
  Wallet,
} from "lucide-react";
import { Category } from "../types";
import { VERTICALS, VERTICALS_ORDER } from "../lib/verticals";
import { MEDIA, VERTICAL_PHOTO, photo } from "../lib/landing-media";
import SponsorSlot from "./SponsorSlot";
import VideoBackdrop from "./landing/VideoBackdrop";
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
  const [activeSection, setActiveSection] = useState<
    "home" | "niches" | "how-it-works" | "how-to-profit" | "how-to-sell"
  >("home");
  // Dynamic Calculator states
  const [calcNiche, setCalcNiche] = useState<Category>("imovel");
  const [calcSaleValue, setCalcSaleValue] = useState<number>(350000);
  const [calcCommPct, setCalcCommPct] = useState<number>(4);
  const [calcType, setCalcType] = useState<"digital" | "presencial">("digital");

  // Niches derivados de VERTICALS (fonte única de verdade)
  const nichesData = VERTICALS_ORDER.map((catId) => {
    const v = VERTICALS[catId];
    return {
      id: v.id,
      title: v.label,
      emoji: v.emoji,
      description: v.description,
      averageValue: v.averageValue,
      avgCommission: v.avgCommission,
      difficulty: v.difficulty,
      image: VERTICAL_PHOTO[v.id],
    };
  });

  // Calculated values
  const totalAdvertiserCommission = (calcSaleValue * calcCommPct) / 100;
  const calculatedEarnings =
    calcType === "digital" ? totalAdvertiserCommission * 0.15 : totalAdvertiserCommission * 0.35;

  const openAuth = (_role: "indicador" | "anunciante" | "admin", _isRegister = false) => {
    // Fluxo unificado: todo cadastro/login vai para a rota /auth (Supabase real).
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
    <div className="bg-ink-950 min-h-screen font-sans antialiased text-mist-100 selection:bg-brand-500/30 selection:text-white">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-ink-950/70 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              className="flex items-center cursor-pointer"
              onClick={() => {
                setActiveSection("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <BrandLogo className="h-8 w-auto" variant="light" />
            </button>

            <div className="hidden md:flex items-center gap-7">
              {(
                [
                  { id: "nichos", label: "Nichos", section: "niches" },
                  { id: "como-funciona", label: "Como Funciona", section: "how-it-works" },
                  { id: "como-lucrar", label: "Simulador", section: "how-to-profit" },
                  { id: "anunciar", label: "Anunciar", section: "how-to-sell" },
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
                      ? "text-brand-400"
                      : "text-mist-300 hover:text-mist-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuth("indicador")}
                className="hidden sm:inline-flex bg-white/5 border border-white/10 text-mist-100 text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                Área do Indicador
              </button>
              <MagneticButton
                onClick={() => openAuth("anunciante")}
                className="bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-[0_0_24px_-6px] shadow-brand-500/70 cursor-pointer transition-colors"
              >
                Área do Anunciante
              </MagneticButton>
              <button
                onClick={() => openAuth("admin")}
                className="p-2 text-mist-300/50 hover:text-brand-400 rounded-lg transition-colors cursor-pointer"
                title="Acesso Administrador"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pt-20 pb-28">
        {/* Camadas: vídeo + overlay → grid sutil → partículas */}
        <VideoBackdrop name="hero" overlay="soft" />
        <div
          aria-hidden
          className="absolute inset-0 z-[1] opacity-[0.04] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]"
        />
        <div className="absolute inset-0 z-[2] h-full w-full">
          <SparklesField
            id="hero-sparkles"
            background="transparent"
            minSize={0.5}
            maxSize={1.3}
            particleDensity={90}
            speed={1.4}
            particleColor="#8dd98d"
            className="h-full w-full"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-brand-300 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Indicou, ganhou. Simples assim.
          </motion.div>

          {/* Wordmark gigante + linha de luz, no espírito do componente sparkles */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 font-display font-black tracking-tight text-white text-5xl sm:text-7xl lg:text-8xl leading-[0.95]"
          >
            Indique
            <span className="bg-gradient-to-b from-brand-300 via-brand-400 to-brand-600 bg-clip-text text-transparent">
              Leads
            </span>
          </motion.h1>

          {/* Filete de luz sob o wordmark. O bloco anterior tinha uma máscara
              retangular opaca que funcionava sobre fundo sólido, mas sobre
              vídeo virava uma caixa cinza visível — trocado por uma linha
              simples, que é o que o fundo em vídeo pede. */}
          <div className="relative mx-auto mt-8 h-px w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
            <div className="absolute inset-0 h-[3px] -top-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent blur-sm" />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mt-8 text-base sm:text-lg text-mist-200 max-w-2xl mx-auto leading-relaxed [text-shadow:0_1px_12px_rgba(8,9,11,0.9)]"
          >
            A rede que conecta indicadores autônomos a imóveis, veículos e embarcações de alto
            padrão. Você indica com um link rastreável e recebe a comissão via PIX quando o negócio
            fecha.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <MagneticButton
              onClick={() => openAuth("indicador", true)}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-[0_0_44px_-10px] shadow-brand-500/80 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              Quero indicar e ganhar <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton
              onClick={() => openAuth("anunciante", true)}
              className="w-full sm:w-auto bg-white/5 border border-white/15 hover:border-brand-400/40 text-mist-100 hover:text-brand-300 font-bold text-sm px-8 py-4 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer transition-colors"
            >
              <Building2 className="w-4 h-4" /> Sou anunciante
            </MagneticButton>
          </motion.div>

          {/* Métricas */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto border-t border-white/10 pt-8">
            {[
              { value: 2.4, decimals: 1, prefix: "R$ ", suffix: "M+", label: "Comissões pagas" },
              { value: 12, decimals: 0, prefix: "", suffix: "k+", label: "Leads gerados" },
              { value: 13, decimals: 0, prefix: "", suffix: "", label: "Verticais ativas" },
            ].map((m) => (
              <div key={m.label}>
                <span className="block text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                  <CountUp
                    value={m.value}
                    decimals={m.decimals}
                    prefix={m.prefix}
                    suffix={m.suffix}
                  />
                </span>
                <span className="text-[10px] text-mist-300/70 uppercase font-semibold tracking-wider">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MARQUEE DE VERTICAIS ================= */}
      <section className="py-5 border-y border-white/5 bg-ink-900/50">
        <Marquee>
          {VERTICALS_ORDER.map((cat) => {
            const v = VERTICALS[cat];
            return (
              <span
                key={v.id}
                className="flex items-center gap-2 text-mist-300/40 hover:text-brand-400 transition-colors text-sm font-semibold uppercase tracking-wider shrink-0"
              >
                <span className="text-lg leading-none">{v.emoji}</span>
                {v.shortLabel}
              </span>
            );
          })}
        </Marquee>
      </section>

      {/* ================= COMO FUNCIONA (3 passos, com imagens) ================= */}
      <section id="como-funciona" className="py-24 bg-ink-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[11px] bg-white/5 border border-white/10 text-brand-300 font-bold tracking-widest uppercase px-3.5 py-1 rounded-full inline-block">
              Três passos
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              Do link ao PIX na sua conta
            </h2>
            <p className="text-mist-300 text-sm sm:text-base leading-relaxed">
              Sem meta, sem exclusividade e sem custo para começar. Você indica quem já estava
              pensando em comprar — a plataforma cuida do rastreio e do pagamento.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                icon: Link2,
                title: "Pegue seu link",
                desc: "Escolha um anúncio na vitrine e gere um link exclusivo seu. Todo clique fica rastreado por 60 dias.",
                img: MEDIA.celular,
                alt: "Celular na mão pronto para compartilhar o link de indicação",
              },
              {
                n: "02",
                icon: Handshake,
                title: "Indique quem tem interesse",
                desc: "Mande no WhatsApp, Instagram ou pessoalmente. Se quiser ganhar mais, acompanhe o cliente até a loja.",
                img: MEDIA.parceria,
                alt: "Aperto de mãos fechando negócio",
              },
              {
                n: "03",
                icon: Wallet,
                title: "Receba via PIX",
                desc: "O anunciante confirma a visita e marca a venda. A comissão cai no seu saldo, pronta para saque.",
                img: MEDIA.volante,
                alt: "Cliente ao volante durante a visita",
              },
            ].map((step) => (
              <RevealItem key={step.n}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/8 bg-ink-900/60 transition-all duration-300 hover:border-brand-400/30 hover:-translate-y-1">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={photo(step.img, 800)}
                      alt={step.alt}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                    <span className="absolute top-4 left-4 font-mono text-[11px] font-bold text-brand-300 bg-ink-950/70 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                      {step.n}
                    </span>
                  </div>
                  <div className="p-6 -mt-8 relative">
                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400 ring-1 ring-brand-400/20 backdrop-blur-sm">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">{step.title}</h3>
                    <p className="text-mist-300 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ================= NICHOS (cards com foto) ================= */}
      {/* overflow-hidden: o GlowBlob decorativo sangra para fora da seção e,
          sem clipping, criava scroll horizontal na página inteira. */}
      <section
        id="nichos"
        className="py-24 border-y border-white/5 relative overflow-hidden"
      >
        <VideoBackdrop name="nichos" overlay="strong" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[11px] bg-white/5 border border-white/10 text-brand-300 font-bold tracking-widest uppercase px-3.5 py-1 rounded-full inline-block">
              13 verticais de alto ticket
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              Uma indicação certa paga o seu mês
            </h2>
            <p className="text-mist-300 text-sm sm:text-base leading-relaxed">
              Trabalhamos só com bens de ticket alto. É a diferença entre comissão de cafezinho e
              comissão que muda o mês.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {nichesData.map((niche) => (
              <RevealItem key={niche.id}>
                <div className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-950/70 backdrop-blur-md transition-all duration-300 hover:border-brand-400/30 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px] hover:shadow-brand-500/25">
                  {niche.image ? (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={photo(niche.image, 640, 65)}
                        alt={niche.title}
                        loading="lazy"
                        className="h-full w-full object-cover opacity-65 transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                      <span className="absolute bottom-3 left-4 text-2xl leading-none drop-shadow-lg">
                        {niche.emoji}
                      </span>
                    </div>
                  ) : (
                    <div className="relative flex h-32 items-end bg-gradient-to-br from-sea-700/25 to-ink-950 p-4">
                      <span className="text-3xl leading-none">{niche.emoji}</span>
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="font-display font-bold text-white text-base leading-snug mb-1.5">
                      {niche.title}
                    </h3>
                    <p className="text-mist-300/80 text-xs leading-relaxed mb-4 line-clamp-2">
                      {niche.description}
                    </p>

                    <div className="space-y-2 border-t border-white/8 pt-3">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-mist-300/60">Ticket médio</span>
                        <span className="font-semibold text-mist-100">{niche.averageValue}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-mist-300/60">Comissão PIX</span>
                        <span className="font-bold text-brand-400">{niche.avgCommission}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ================= SIMULADOR ================= */}
      <section id="como-lucrar" className="py-24 relative overflow-hidden">
        <VideoBackdrop name="lucrar" overlay="strong" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Calculadora */}
            <Reveal className="lg:col-span-7 rounded-3xl border border-white/10 bg-ink-950/75 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              <GlowBlob
                className="w-64 h-64 -top-24 -right-24"
                color="radial-gradient(circle, rgba(72,168,72,0.16) 0%, transparent 70%)"
              />
              <span className="relative text-[10px] bg-white/5 border border-white/10 text-brand-300 font-bold uppercase px-3 py-1 rounded-full font-mono inline-block">
                Simulador interativo
              </span>
              <h3 className="relative font-display font-bold text-white text-2xl mt-3 mb-6">
                Quanto rende uma indicação sua?
              </h3>

              <div className="relative space-y-5">
                <div>
                  <label className="block text-[11px] text-mist-300/70 font-bold uppercase tracking-wider mb-2">
                    Nicho do produto
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {VERTICALS_ORDER.map((cat) => {
                      const v = VERTICALS[cat];
                      const active = calcNiche === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setCalcNiche(cat);
                            setCalcSaleValue(v.calc.saleValue);
                            setCalcCommPct(v.calc.commPct);
                          }}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            active
                              ? "bg-brand-500 border-brand-500 text-white shadow-[0_0_20px_-6px] shadow-brand-500/80"
                              : "bg-white/5 border-white/10 hover:bg-white/10 text-mist-300"
                          }`}
                          title={v.label}
                        >
                          {v.emoji} {v.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-mist-300/70 uppercase tracking-wider">Valor do bem</span>
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
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-mist-300/70 uppercase tracking-wider">
                      Comissão do vendedor
                    </span>
                    <span className="text-white font-mono">
                      {calcCommPct}% · R$ {totalAdvertiserCommission.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={calcCommPct}
                    onChange={(e) => setCalcCommPct(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-mist-300/70 font-bold uppercase tracking-wider mb-2">
                    Seu envolvimento
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        {
                          key: "digital",
                          title: "Só indicar",
                          desc: "Você manda o link. 15% da verba de comissão.",
                        },
                        {
                          key: "presencial",
                          title: "Acompanhar a visita",
                          desc: "Você vai junto na loja. 35% da verba.",
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setCalcType(opt.key)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          calcType === opt.key
                            ? "bg-brand-500/12 border-brand-400/50 ring-2 ring-brand-400/20"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="block font-bold text-white text-xs">{opt.title}</span>
                        <span className="block text-[10px] text-mist-300/70 mt-1 leading-relaxed">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 text-center shadow-[0_24px_60px_-20px] shadow-brand-500/60">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/75">
                    Sua comissão estimada via PIX
                  </span>
                  <div className="text-4xl font-display font-black font-mono text-white mt-1">
                    <LiveNumber value={calculatedEarnings} decimals={2} prefix="R$ " />
                  </div>
                  <p className="text-[10px] text-white/70 mt-1">
                    Simulação baseada no regulamento de comissões IndiqueLeads.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Modalidades */}
            <Reveal delay={0.12} className="lg:col-span-5 space-y-6">
              <span className="text-[11px] bg-white/5 border border-white/10 text-brand-300 font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block">
                Dois jeitos de ganhar
              </span>
              <h3 className="text-3xl font-display font-black text-white tracking-tight leading-tight">
                Do seu sofá ou dentro da loja
              </h3>

              <RevealGroup className="space-y-3">
                {[
                  {
                    icon: Percent,
                    title: "Indicação digital",
                    desc: "Mandou o link e a pessoa preencheu? O lead é seu, com cookie de 60 dias. Zero burocracia.",
                    tone: "sea" as const,
                  },
                  {
                    icon: Calendar,
                    title: "Visita acompanhada",
                    desc: "Vá junto até a loja e sinalize a chegada com um clique. O anunciante confirma e sua comissão mais que dobra.",
                    tone: "brand" as const,
                  },
                  {
                    icon: Check,
                    title: "Contrato de parceria",
                    desc: "Todo cadastro assina digitalmente um contrato de parceria autônoma (Art. 442-B da CLT), protegendo as duas pontas.",
                    tone: "brand" as const,
                  },
                ].map((item) => (
                  <RevealItem key={item.title}>
                    <div className="flex gap-4 rounded-2xl border border-white/10 bg-ink-950/65 backdrop-blur-md p-4 transition-colors hover:border-white/20">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          item.tone === "brand"
                            ? "bg-brand-500/15 text-brand-400"
                            : "bg-sea-500/15 text-sea-400"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                        <p className="text-mist-300/80 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= PARA O ANUNCIANTE (split com imagem) ================= */}
      <section id="anunciar" className="relative overflow-hidden border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Imagem */}
          <div className="relative min-h-[22rem] lg:min-h-full">
            <img
              src={photo(MEDIA.villa, 1400)}
              alt="Imóvel de alto padrão anunciado na plataforma"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-ink-950/40 to-ink-950 lg:bg-gradient-to-r lg:from-ink-950/60 lg:to-ink-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Conteúdo */}
          <div className="relative bg-ink-950 px-4 sm:px-8 lg:px-14 py-20">
            <Reveal className="max-w-xl space-y-6">
              <span className="text-[11px] bg-sea-500/15 border border-sea-400/20 text-sea-400 font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block">
                Para lojas, imobiliárias e concessionárias
              </span>
              <h3 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight text-white">
                Uma força de vendas que só custa quando vende
              </h3>
              <p className="text-mist-300 text-sm sm:text-base leading-relaxed">
                Em vez de queimar verba em anúncio frio, você ativa dezenas de indicadores locais
                motivados. Cada lead chega com origem rastreada e a visita é confirmada por você —
                ninguém recebe sem você validar.
              </p>

              <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: "Vitrine pronta",
                    desc: "Cada anúncio vira uma página de conversão automática, sem você programar nada.",
                  },
                  {
                    title: "Você valida a visita",
                    desc: "O indicador sinaliza a chegada; quem confirma a presença é você, com um clique.",
                  },
                  {
                    title: "Comissão sob seu controle",
                    desc: "Defina o valor por lead qualificado e o percentual sobre a venda em cada anúncio.",
                  },
                  {
                    title: "Funil e chat integrados",
                    desc: "Acompanhe cada lead pelas etapas e converse com o cliente no mesmo painel.",
                  },
                ].map((card) => (
                  <RevealItem key={card.title}>
                    <div className="h-full rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <h4 className="text-brand-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                        {card.title}
                      </h4>
                      <p className="text-mist-300/70 text-[11px] leading-relaxed">{card.desc}</p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <MagneticButton
                  onClick={() => openAuth("anunciante", true)}
                  className="bg-brand-500 hover:bg-brand-400 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-[0_0_32px_-8px] shadow-brand-500/70 cursor-pointer transition-colors"
                >
                  Cadastrar empresa grátis
                </MagneticButton>
                <button
                  onClick={() => scrollTo("nichos", "niches")}
                  className="text-mist-300 hover:text-white text-sm font-bold px-4 py-3.5 transition-colors cursor-pointer"
                >
                  Ver verticais aceitas →
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= PLANOS ================= */}
      <section className="py-24 bg-ink-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-4">
            <span className="text-[11px] bg-white/5 border border-white/10 text-brand-300 font-bold tracking-widest uppercase px-3.5 py-1 rounded-full inline-block">
              Planos do anunciante
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Assinatura pelo espaço, comissão pelo resultado
            </h2>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {[
              {
                name: "Starter",
                price: "R$ 149",
                tag: "Simples",
                desc: "Até 3 anúncios ativos simultâneos.",
                featured: false,
                perks: ["3 anúncios ativos", "Funil de leads", "Chat com o cliente"],
              },
              {
                name: "Pro",
                price: "R$ 399",
                tag: "Mais vendido",
                desc: "Até 10 anúncios ativos, multi-vertical.",
                featured: true,
                perks: [
                  "10 anúncios ativos",
                  "Multi-vertical",
                  "Confirmação de visita",
                  "Mesa de financiamentos",
                ],
              },
              {
                name: "Premium",
                price: "R$ 799",
                tag: "Corporativo",
                desc: "Anúncios ilimitados e apoio jurídico.",
                featured: false,
                perks: ["Anúncios ilimitados", "Assessoria de contratos", "Suporte prioritário"],
              },
            ].map((plan) => (
              <RevealItem key={plan.name}>
                <div
                  className={`relative flex h-full flex-col rounded-3xl border p-6 transition-all duration-300 ${
                    plan.featured
                      ? "border-brand-400/40 bg-gradient-to-b from-brand-500/12 to-ink-950 shadow-[0_28px_70px_-30px] shadow-brand-500/60 md:-translate-y-3"
                      : "border-white/8 bg-ink-950/60 hover:border-white/15"
                  }`}
                >
                  <span
                    className={`inline-block w-fit rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      plan.featured ? "bg-brand-500 text-white" : "bg-white/5 text-mist-300"
                    }`}
                  >
                    {plan.tag}
                  </span>
                  <h4 className="mt-3 font-display text-xl font-black text-white">{plan.name}</h4>
                  <p className="mt-1 text-xs text-mist-300/70">{plan.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-mist-300/60">/mês</span>
                  </div>
                  <ul className="mt-5 space-y-2 flex-1">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs text-mist-200">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openAuth("anunciante", true)}
                    className={`mt-6 w-full rounded-xl py-3 text-xs font-bold transition-all cursor-pointer ${
                      plan.featured
                        ? "bg-brand-500 text-white hover:bg-brand-400"
                        : "border border-white/15 text-mist-100 hover:bg-white/5"
                    }`}
                  >
                    Começar agora
                  </button>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ================= PATROCINADORES ================= */}
      <section className="py-10 bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-1">
            <SponsorSlot variant="banner" label="Patrocinadores oficiais" className="p-4" />
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="relative overflow-hidden py-24">
        <VideoBackdrop name="cta" overlay="default" />
        <div className="absolute inset-0 z-[1]">
          <SparklesField
            id="cta-sparkles"
            background="transparent"
            minSize={0.5}
            maxSize={1.2}
            particleDensity={70}
            speed={1.2}
            particleColor="#63c463"
            className="h-full w-full"
          />
        </div>
        <Reveal className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Sua próxima conversa pode valer{" "}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              uma comissão
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base text-mist-300 leading-relaxed">
            Cadastro gratuito, sem mensalidade para indicadores. Comece hoje e receba pelo primeiro
            negócio que fechar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton
              onClick={() => openAuth("indicador", true)}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-[0_0_44px_-10px] shadow-brand-500/80 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              Criar conta de indicador <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton
              onClick={() => openAuth("anunciante", true)}
              className="w-full sm:w-auto bg-white/5 border border-white/15 hover:border-brand-400/40 text-mist-100 font-bold text-sm px-8 py-4 rounded-xl backdrop-blur-sm cursor-pointer transition-colors"
            >
              Quero anunciar
            </MagneticButton>
          </div>

          <RevealGroup className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: "Contrato blindado" },
              { icon: Lock, label: "Pagamentos auditados" },
              { icon: Zap, label: "PIX instantâneo" },
              { icon: Users, label: "Rede em 13 verticais" },
            ].map((item) => (
              <RevealItem key={item.label}>
                <div className="flex flex-col items-center gap-2 text-mist-300/60">
                  <item.icon className="h-5 w-5 text-brand-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-ink-950 text-mist-300/60 py-12 border-t border-white/5 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo className="h-8 w-auto" variant="light" />
            <p className="text-[11px] text-mist-300/50 leading-relaxed">
              A rede de indicação e comissionamento para bens de alto padrão no Brasil.
            </p>
          </div>
          <div>
            <span className="text-white font-bold block mb-3 uppercase text-[10px] tracking-wider">
              Para Indicadores
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="#como-funciona" className="hover:text-brand-400 transition-colors">
                  Passo a passo
                </a>
              </li>
              <li>
                <a href="#como-lucrar" className="hover:text-brand-400 transition-colors">
                  Simulador de comissão
                </a>
              </li>
              <li>
                <button
                  onClick={() => openAuth("indicador")}
                  className="hover:text-brand-400 text-left transition-colors cursor-pointer"
                >
                  Entrar
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuth("indicador", true)}
                  className="hover:text-brand-400 text-left transition-colors cursor-pointer"
                >
                  Criar conta
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
                <a href="#anunciar" className="hover:text-brand-400 transition-colors">
                  Como anunciar
                </a>
              </li>
              <li>
                <a href="#nichos" className="hover:text-brand-400 transition-colors">
                  Verticais aceitas
                </a>
              </li>
              <li>
                <button
                  onClick={() => openAuth("anunciante")}
                  className="hover:text-brand-400 text-left transition-colors cursor-pointer"
                >
                  Painel da empresa
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuth("anunciante", true)}
                  className="hover:text-brand-400 text-left transition-colors cursor-pointer"
                >
                  Registrar conta
                </button>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-white font-bold block mb-3 uppercase text-[10px] tracking-wider">
              Segurança Jurídica
            </span>
            <p className="text-[11px] text-mist-300/50 leading-relaxed">
              Contratos digitais baseados no Art. 442-B da CLT, com transparência fiscal e trilha de
              auditoria por evento de comissão.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-white/5 text-center text-[10px] text-mist-300/40 flex justify-between flex-wrap gap-4">
          <span>© 2026 IndiqueLeads Tecnologia Ltda. CNPJ: 34.567.890/0001-11</span>
          <span>Sede: Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP</span>
        </div>
      </footer>
    </div>
  );
}
