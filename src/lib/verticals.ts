/**
 * Registro central de verticais da plataforma.
 * Fonte única da verdade para: label, ícone, campos personalizados, funil,
 * modelo de comissão e disclaimer legal por categoria.
 *
 * Adicionar uma nova vertical = adicionar uma entrada aqui.
 */
import type { Category, LeadStatus } from "@/types";

export type CommissionModel = "digital" | "presencial_digital" | "recorrente";

export interface AttributeField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "boolean" | "file";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface VerticalConfig {
  id: Category;
  label: string;
  shortLabel: string;
  emoji: string;
  /** Ícone lucide-react (nome). */
  iconName: string;
  /** Cor Tailwind base para badges/gradients. */
  color: string;
  gradient: string;
  description: string;
  averageValue: string;
  avgCommission: string;
  difficulty: "Baixo" | "Médio" | "Alto";
  popularBrands: string;
  /** Campos específicos do formulário de produto/oferta. */
  attributes: AttributeField[];
  /** Campos extras no formulário de lead. */
  leadFields?: AttributeField[];
  /** Funil de status na ordem. */
  statusFlow: LeadStatus[];
  /** Modelo de comissão dominante. */
  commissionModel: CommissionModel;
  /** Aviso legal/ético opcional (ex.: Saúde/CFM). */
  disclaimer?: string;
  /** Sugestões para o simulador de comissão. */
  calc: { saleValue: number; commPct: number; min: number; max: number };
}

const STD_FLOW: LeadStatus[] = [
  "lead_recebido",
  "contato_feito",
  "visita_agendada",
  "visita_confirmada",
  "proposta",
  "venda_concluida",
];

export const VERTICALS: Record<Category, VerticalConfig> = {
  imovel: {
    id: "imovel",
    label: "Mercado de Imóveis",
    shortLabel: "Imóvel",
    emoji: "🏠",
    iconName: "Home",
    color: "orange",
    gradient: "from-orange-50 to-orange-100/50",
    description: "Coberturas, casas em condomínio, apartamentos e lotes comerciais.",
    averageValue: "R$ 350.000 a R$ 2.000.000",
    avgCommission: "R$ 5.000 a R$ 35.000",
    difficulty: "Médio",
    popularBrands: "Vanguard, Prime Real Estate, Construtoras locais",
    attributes: [
      {
        key: "finalidade",
        label: "Finalidade",
        type: "select",
        options: ["Residencial", "Comercial", "Investimento"],
      },
      {
        key: "tipo",
        label: "Tipo",
        type: "select",
        options: ["Apartamento", "Casa", "Cobertura", "Lote", "Sala"],
      },
      { key: "areaUtil", label: "Área Útil (m²)", type: "number" },
      { key: "suites", label: "Suítes", type: "number" },
      { key: "garagem", label: "Vagas garagem", type: "number" },
      { key: "condominio", label: "Condomínio (R$)", type: "number" },
      { key: "matricula", label: "Matrícula", type: "text" },
    ],
    statusFlow: STD_FLOW,
    commissionModel: "presencial_digital",
    calc: { saleValue: 450000, commPct: 5, min: 100000, max: 3000000 },
  },
  carro: {
    id: "carro",
    label: "Veículos & SUVs",
    shortLabel: "Carro",
    emoji: "🚗",
    iconName: "Car",
    color: "amber",
    gradient: "from-amber-50 to-amber-100/30",
    description: "Carros esportivos, SUVs, utilitários e seminovos de concessionárias parceiras.",
    averageValue: "R$ 80.000 a R$ 250.000",
    avgCommission: "R$ 1.000 a R$ 6.000",
    difficulty: "Baixo",
    popularBrands: "Motorsport SP, Concessionárias credenciadas",
    attributes: [
      { key: "marca", label: "Marca", type: "text" },
      { key: "km", label: "KM", type: "number" },
      { key: "cor", label: "Cor", type: "text" },
      { key: "cambio", label: "Câmbio", type: "select", options: ["Manual", "Automático", "CVT"] },
      { key: "placa", label: "Placa", type: "text" },
      { key: "laudo", label: "Laudo Cautelar", type: "text" },
    ],
    statusFlow: STD_FLOW,
    commissionModel: "presencial_digital",
    calc: { saleValue: 120000, commPct: 3, min: 30000, max: 900000 },
  },
  moto: {
    id: "moto",
    label: "Motos Premium",
    shortLabel: "Moto",
    emoji: "🏍️",
    iconName: "Bike",
    color: "orange",
    gradient: "from-orange-50 to-amber-50",
    description: "Alta cilindrada, esportivas, estradeiras de luxo e urbanas premium.",
    averageValue: "R$ 30.000 a R$ 90.000",
    avgCommission: "R$ 400 a R$ 2.500",
    difficulty: "Baixo",
    popularBrands: "Kawasaki, BMW Motorrad, Honda Premium",
    attributes: [
      { key: "marca", label: "Marca", type: "text" },
      { key: "cc", label: "Cilindradas (cc)", type: "number" },
      { key: "km", label: "KM", type: "number" },
      {
        key: "tipo",
        label: "Tipo",
        type: "select",
        options: ["Naked", "Esportiva", "Custom", "Trail", "Scooter"],
      },
    ],
    statusFlow: STD_FLOW,
    commissionModel: "presencial_digital",
    calc: { saleValue: 45000, commPct: 2.5, min: 10000, max: 200000 },
  },
  barco: {
    id: "barco",
    label: "Náutica & Lanchas",
    shortLabel: "Barco",
    emoji: "🛥️",
    iconName: "Ship",
    color: "sky",
    gradient: "from-sky-50 to-sky-100/20",
    description: "Lanchas de passeio, veleiros, iates de luxo e barcos de pesca.",
    averageValue: "R$ 150.000 a R$ 1.500.000",
    avgCommission: "R$ 3.000 a R$ 25.000",
    difficulty: "Alto",
    popularBrands: "Náutica Blue Ocean, Estaleiros de Luxo",
    attributes: [
      { key: "estaleiro", label: "Estaleiro", type: "text" },
      { key: "pes", label: "Pés", type: "number" },
      { key: "horasMotor", label: "Horas de Motor", type: "number" },
      { key: "casco", label: "Casco", type: "text" },
      { key: "motorizacao", label: "Motorização", type: "text" },
      { key: "vagaMarina", label: "Vaga Marina", type: "text" },
    ],
    statusFlow: STD_FLOW,
    commissionModel: "presencial_digital",
    calc: { saleValue: 250000, commPct: 4, min: 80000, max: 2000000 },
  },
  jetski: {
    id: "jetski",
    label: "Motos Aquáticas",
    shortLabel: "Jetski",
    emoji: "🎿",
    iconName: "Waves",
    color: "sky",
    gradient: "from-orange-50/50 to-sky-50/50",
    description: "Jetskis modernos, esportivos, com reboque rodoviário incluso.",
    averageValue: "R$ 50.000 a R$ 130.000",
    avgCommission: "R$ 800 a R$ 3.500",
    difficulty: "Baixo",
    popularBrands: "Sea-Doo, Yamaha Marine",
    attributes: [
      { key: "marca", label: "Marca", type: "text" },
      { key: "horas", label: "Horas", type: "number" },
      { key: "cilindradas", label: "Cilindradas", type: "number" },
      { key: "capacidade", label: "Capacidade", type: "number" },
      { key: "carretinha", label: "Carretinha inclusa", type: "boolean" },
    ],
    statusFlow: STD_FLOW,
    commissionModel: "presencial_digital",
    calc: { saleValue: 65000, commPct: 3.5, min: 20000, max: 250000 },
  },

  // ---------- Novas verticais ----------
  saude: {
    id: "saude",
    label: "Saúde, Bem-Estar & Estética",
    shortLabel: "Saúde",
    emoji: "🏥",
    iconName: "Heart",
    color: "rose",
    gradient: "from-rose-50 to-pink-100/40",
    description:
      "Clínicas de estética avançada, odontologia estética, cirurgias eletivas e exames de alta complexidade.",
    averageValue: "R$ 5.000 a R$ 60.000",
    avgCommission: "R$ 300 a R$ 3.000",
    difficulty: "Médio",
    popularBrands: "Clínicas premium, consultórios odontológicos, centros estéticos",
    attributes: [
      { key: "procedimento", label: "Procedimento / Pacote", type: "text", required: true },
      {
        key: "especialidade",
        label: "Especialidade",
        type: "select",
        options: [
          "Odontologia estética",
          "Estética avançada",
          "Cirurgia plástica",
          "Oftalmologia",
          "Bariátrica",
          "Exames de imagem",
          "Outro",
        ],
      },
      { key: "duracaoEstimada", label: "Duração estimada do tratamento", type: "text" },
      { key: "requerAvaliacao", label: "Requer avaliação presencial", type: "boolean" },
      { key: "faixaEtaria", label: "Faixa etária alvo", type: "text" },
    ],
    leadFields: [{ key: "melhorHorario", label: "Melhor horário para contato", type: "text" }],
    statusFlow: [
      "lead_recebido",
      "triagem",
      "avaliacao_agendada",
      "avaliacao_confirmada",
      "orcamento_emitido",
      "tratamento_iniciado",
    ],
    commissionModel: "presencial_digital",
    disclaimer:
      "Este anúncio destina-se ao agendamento de avaliação clínica junto ao profissional/estabelecimento credenciado. Não constitui oferta ou venda direta de procedimento de saúde. Publicidade em conformidade com o Código de Ética do respectivo Conselho Federal (CFM/CRO/CFF).",
    calc: { saleValue: 25000, commPct: 5, min: 2000, max: 200000 },
  },
  energia_solar: {
    id: "energia_solar",
    label: "Energia Solar & Sustentabilidade",
    shortLabel: "Solar",
    emoji: "☀️",
    iconName: "Sun",
    color: "yellow",
    gradient: "from-yellow-50 to-amber-100/40",
    description:
      "Projetos fotovoltaicos para residências, condomínios, indústrias e propriedades rurais.",
    averageValue: "R$ 15.000 a R$ 500.000",
    avgCommission: "R$ 500 a R$ 8.000",
    difficulty: "Médio",
    popularBrands: "Integradoras certificadas, distribuidoras solares",
    attributes: [
      { key: "potenciaKwp", label: "Potência estimada (kWp)", type: "number" },
      {
        key: "tipoImovel",
        label: "Tipo de imóvel",
        type: "select",
        options: ["Residencial", "Comercial", "Industrial", "Rural", "Condomínio"],
      },
      { key: "geracaoMediaMes", label: "Geração média (kWh/mês)", type: "number" },
      { key: "prazoInstalacao", label: "Prazo de instalação (dias)", type: "number" },
    ],
    leadFields: [
      { key: "consumoMedio", label: "Consumo médio da conta (kWh)", type: "number" },
      { key: "contaLuzUrl", label: "Anexo conta de luz (URL)", type: "text" },
    ],
    statusFlow: [
      "lead_recebido",
      "contato_feito",
      "visita_tecnica_agendada",
      "visita_tecnica_realizada",
      "projeto_aprovado",
      "contrato_assinado",
    ],
    commissionModel: "digital",
    calc: { saleValue: 45000, commPct: 6, min: 10000, max: 500000 },
  },
  educacao: {
    id: "educacao",
    label: "Educação Premium",
    shortLabel: "Educação",
    emoji: "🎓",
    iconName: "GraduationCap",
    color: "indigo",
    gradient: "from-indigo-50 to-blue-100/40",
    description:
      "MBAs, pós-graduações, bootcamps de tecnologia, formações profissionalizantes e idiomas premium.",
    averageValue: "R$ 3.000 a R$ 60.000",
    avgCommission: "R$ 200 a R$ 2.500",
    difficulty: "Baixo",
    popularBrands: "Faculdades, escolas técnicas e polos parceiros",
    attributes: [
      {
        key: "modalidade",
        label: "Modalidade",
        type: "select",
        options: ["Presencial", "Online", "Híbrido"],
      },
      { key: "cargaHoraria", label: "Carga horária (h)", type: "number" },
      { key: "proximaTurma", label: "Próxima turma", type: "text" },
      {
        key: "nivel",
        label: "Nível",
        type: "select",
        options: ["Curta duração", "Graduação", "MBA/Pós", "Idiomas", "Técnico"],
      },
    ],
    leadFields: [{ key: "cursoInteresse", label: "Curso de interesse", type: "text" }],
    statusFlow: ["lead_recebido", "contato_feito", "proposta", "matricula_efetivada"],
    commissionModel: "digital",
    calc: { saleValue: 18000, commPct: 4, min: 1500, max: 80000 },
  },
  turismo: {
    id: "turismo",
    label: "Turismo de Luxo & Eventos",
    shortLabel: "Turismo",
    emoji: "✈️",
    iconName: "Plane",
    color: "cyan",
    gradient: "from-cyan-50 to-sky-100/40",
    description:
      "Pacotes de lua de mel, iates por temporada, camarotes corporativos, cruzeiros temáticos.",
    averageValue: "R$ 5.000 a R$ 200.000",
    avgCommission: "R$ 400 a R$ 12.000",
    difficulty: "Médio",
    popularBrands: "Agências boutique, operadoras premium",
    attributes: [
      { key: "destino", label: "Destino", type: "text" },
      { key: "diarias", label: "Nº de diárias", type: "number" },
      { key: "pessoas", label: "Nº de pessoas", type: "number" },
      {
        key: "tipoPacote",
        label: "Tipo",
        type: "select",
        options: ["Lua de mel", "Cruzeiro", "Iate", "Evento/Camarote", "Personalizado"],
      },
    ],
    statusFlow: ["lead_recebido", "contato_feito", "proposta", "pacote_fechado"],
    commissionModel: "digital",
    calc: { saleValue: 25000, commPct: 7, min: 3000, max: 200000 },
  },
  seguros: {
    id: "seguros",
    label: "Seguros & Proteção Patrimonial",
    shortLabel: "Seguros",
    emoji: "🛡️",
    iconName: "Shield",
    color: "emerald",
    gradient: "from-emerald-50 to-teal-100/40",
    description:
      "Seguros de vida, patrimoniais, garantia estendida e planos de saúde empresariais. Comissão recorrente sobre prêmio.",
    averageValue: "R$ 1.000 a R$ 50.000 (prêmio anual)",
    avgCommission: "R$ 100 a R$ 5.000/ano (recorrente)",
    difficulty: "Médio",
    popularBrands: "Corretoras credenciadas, seguradoras nacionais",
    attributes: [
      {
        key: "tipoSeguro",
        label: "Tipo de seguro",
        type: "select",
        options: [
          "Vida",
          "Residencial",
          "Automotivo",
          "Empresarial",
          "Saúde empresarial",
          "Garantia estendida",
        ],
      },
      { key: "premioAnual", label: "Prêmio anual estimado (R$)", type: "number" },
      { key: "comissaoRecorrentePct", label: "% comissão recorrente sobre prêmio", type: "number" },
      { key: "prazoContrato", label: "Prazo do contrato (meses)", type: "number" },
    ],
    statusFlow: ["lead_recebido", "contato_feito", "proposta", "apolice_emitida"],
    commissionModel: "recorrente",
    calc: { saleValue: 6000, commPct: 15, min: 1000, max: 100000 },
  },
  franquias: {
    id: "franquias",
    label: "Franquias & Negócios",
    shortLabel: "Franquias",
    emoji: "🏪",
    iconName: "Store",
    color: "purple",
    gradient: "from-purple-50 to-fuchsia-100/40",
    description:
      "Venda de franquias com ticket médio-alto para investidores. Comissão fixa por contrato assinado.",
    averageValue: "R$ 50.000 a R$ 800.000",
    avgCommission: "R$ 2.000 a R$ 40.000",
    difficulty: "Alto",
    popularBrands: "Redes nacionais, franqueadoras associadas ABF",
    attributes: [
      { key: "investimentoInicial", label: "Investimento inicial (R$)", type: "number" },
      { key: "faturamentoMedio", label: "Faturamento médio mensal (R$)", type: "number" },
      { key: "prazoRetorno", label: "Prazo de retorno (meses)", type: "number" },
      { key: "setor", label: "Setor", type: "text" },
      { key: "royaltiesPct", label: "Royalties (%)", type: "number" },
    ],
    statusFlow: [
      "lead_recebido",
      "contato_feito",
      "avaliacao_agendada",
      "proposta",
      "contrato_franquia",
    ],
    commissionModel: "digital",
    calc: { saleValue: 180000, commPct: 4, min: 30000, max: 1000000 },
  },
  veiculos_pesados: {
    id: "veiculos_pesados",
    label: "Veículos Pesados & Máquinas",
    shortLabel: "Pesados",
    emoji: "🚛",
    iconName: "Truck",
    color: "slate",
    gradient: "from-slate-100 to-zinc-100/40",
    description:
      "Caminhões, tratores, implementos agrícolas, ônibus e máquinas de linha amarela. Público B2B.",
    averageValue: "R$ 150.000 a R$ 900.000",
    avgCommission: "R$ 2.500 a R$ 25.000",
    difficulty: "Médio",
    popularBrands: "Concessionárias de caminhões, revendas de máquinas pesadas",
    attributes: [
      {
        key: "tipo",
        label: "Tipo",
        type: "select",
        options: [
          "Caminhão",
          "Trator",
          "Colheitadeira",
          "Ônibus",
          "Retroescavadeira",
          "Guindaste",
          "Implemento",
        ],
      },
      { key: "marca", label: "Marca", type: "text" },
      { key: "ano", label: "Ano", type: "number" },
      { key: "horimetro", label: "Horímetro / KM", type: "number" },
      { key: "capacidade", label: "Capacidade (t / cv)", type: "text" },
    ],
    statusFlow: STD_FLOW,
    commissionModel: "presencial_digital",
    calc: { saleValue: 350000, commPct: 2.5, min: 80000, max: 1500000 },
  },
  imoveis_comerciais_locacao: {
    id: "imoveis_comerciais_locacao",
    label: "Imóveis Comerciais (Locação)",
    shortLabel: "Locação Comercial",
    emoji: "🏢",
    iconName: "Building2",
    color: "stone",
    gradient: "from-stone-50 to-orange-50/40",
    description:
      "Salas, lojas, galpões e áreas industriais para locação. Comissão referente ao primeiro aluguel.",
    averageValue: "R$ 3.000 a R$ 80.000 / mês",
    avgCommission: "R$ 3.000 a R$ 80.000 (1 aluguel)",
    difficulty: "Médio",
    popularBrands: "Imobiliárias comerciais, proprietários de galpões",
    attributes: [
      {
        key: "tipoImovel",
        label: "Tipo",
        type: "select",
        options: ["Sala comercial", "Loja", "Galpão", "Área industrial", "Coworking"],
      },
      { key: "metragem", label: "Metragem (m²)", type: "number" },
      { key: "aluguelMensal", label: "Aluguel mensal (R$)", type: "number" },
      { key: "iptu", label: "IPTU (R$)", type: "number" },
      { key: "condominio", label: "Condomínio (R$)", type: "number" },
      { key: "prazoContrato", label: "Prazo mínimo (meses)", type: "number" },
    ],
    statusFlow: [
      "lead_recebido",
      "contato_feito",
      "visita_agendada",
      "visita_confirmada",
      "proposta",
      "locacao_assinada",
    ],
    commissionModel: "digital",
    calc: { saleValue: 12000, commPct: 100, min: 2000, max: 100000 },
  },
};

/** Ordem de exibição no catálogo/landing. */
export const VERTICALS_ORDER: Category[] = [
  "imovel",
  "carro",
  "moto",
  "barco",
  "jetski",
  "veiculos_pesados",
  "imoveis_comerciais_locacao",
  "saude",
  "energia_solar",
  "educacao",
  "turismo",
  "seguros",
  "franquias",
];

export function getVertical(cat: Category | string | undefined | null): VerticalConfig | undefined {
  if (!cat) return undefined;
  return (VERTICALS as Record<string, VerticalConfig>)[cat];
}

export function verticalLabel(cat: Category | string | undefined | null): string {
  return getVertical(cat)?.shortLabel ?? String(cat ?? "");
}

export function verticalEmoji(cat: Category | string | undefined | null): string {
  return getVertical(cat)?.emoji ?? "📦";
}

export function verticalBadge(cat: Category | string | undefined | null): string {
  const v = getVertical(cat);
  if (!v) return String(cat ?? "").toUpperCase();
  return `${v.emoji} ${v.shortLabel.toUpperCase()}`;
}

export function statusFlowFor(cat: Category | string | undefined | null): LeadStatus[] {
  return getVertical(cat)?.statusFlow ?? STD_FLOW;
}

/** Rótulos amigáveis de status de lead (todos os enums possíveis). */
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  lead_recebido: "Lead Recebido",
  contato_feito: "Contato Feito",
  visita_agendada: "Visita Agendada",
  visita_confirmada: "Visita Confirmada",
  proposta: "Proposta",
  venda_concluida: "Venda Concluída",
  triagem: "Triagem Telefônica",
  avaliacao_agendada: "Avaliação Agendada",
  avaliacao_confirmada: "Avaliação Confirmada",
  orcamento_emitido: "Orçamento Emitido",
  tratamento_iniciado: "Tratamento Iniciado",
  visita_tecnica_agendada: "Visita Técnica Agendada",
  visita_tecnica_realizada: "Visita Técnica Realizada",
  projeto_aprovado: "Projeto Aprovado",
  contrato_assinado: "Contrato Assinado",
  matricula_efetivada: "Matrícula Efetivada",
  pacote_fechado: "Pacote Fechado",
  apolice_emitida: "Apólice Emitida",
  contrato_franquia: "Contrato de Franquia",
  locacao_assinada: "Locação Assinada",
};
