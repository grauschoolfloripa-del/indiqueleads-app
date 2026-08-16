export type Category =
  | "imovel"
  | "carro"
  | "moto"
  | "barco"
  | "jetski"
  | "saude"
  | "energia_solar"
  | "educacao"
  | "turismo"
  | "seguros"
  | "franquias"
  | "veiculos_pesados"
  | "imoveis_comerciais_locacao";

export type ProductStatus = "rascunho" | "ativo" | "reservado" | "vendido" | "pausado";

export interface LocationInfo {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface Product {
  id: string;
  category: Category;
  advertiserId: string;
  advertiserName: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: ProductStatus;
  location: LocationInfo;
  coverImage: string;
  gallery: string[];
  createdAt: string;
  updatedAt: string;
  commissionDigitalPct?: number;
  commissionDigitalValue?: number;
  commissionPresencialPct?: number;
  commissionPresencialValue?: number;
  /** Quanto o anunciante paga por lead qualificado (visita confirmada). */
  commissionLeadValue: number;
  allowPresencialTier: boolean;
  allowNegotiateTier: boolean;
  attributes: Record<string, any>;
}

export type LeadStatus =
  | "lead_recebido"
  | "contato_feito"
  | "visita_agendada"
  | "visita_confirmada"
  | "proposta"
  | "venda_concluida"
  | "triagem"
  | "avaliacao_agendada"
  | "avaliacao_confirmada"
  | "orcamento_emitido"
  | "tratamento_iniciado"
  | "visita_tecnica_agendada"
  | "visita_tecnica_realizada"
  | "projeto_aprovado"
  | "contrato_assinado"
  | "matricula_efetivada"
  | "pacote_fechado"
  | "apolice_emitida"
  | "contrato_franquia"
  | "locacao_assinada";

export interface Lead {
  id: string;
  productId: string;
  productTitle: string;
  productCategory: Category;
  indicatorId: string;
  indicatorName: string;
  advertiserId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  commissionPaid: boolean;
  commissionValue: number;
  commissionType: "digital" | "presencial";
  notes?: string;
  contractUrl?: string; // NF or contract proof
  visitDate?: string;
  referralChannel?: string;
  checkInRequested?: boolean;
}

/**
 * Ledger de comissões — um evento por linha. Substitui as colunas
 * `commission_value`/`commission_paid` como fonte de verdade de pagamento:
 * um lead pode gerar até dois eventos independentes (lead + venda).
 * Escrito só pelos triggers do banco — nenhuma tela cria/edita isso direto.
 */
export interface Commission {
  id: string;
  /**
   * Origem da comissão — exatamente uma das duas é preenchida:
   * o lead que gerou o evento, ou a simulação de financiamento cuja venda
   * foi concluída pelo anunciante.
   */
  leadId: string | null;
  simulationId: string | null;
  indicatorId: string;
  kind: "lead" | "venda";
  amount: number;
  status: "pending" | "available" | "paid";
  createdAt: string;
  /** Preenchidos quando o anunciante registra a quitação. */
  paidAt?: string | null;
  paymentReference?: string | null;
}

/** Aviso persistente para um usuário (hoje: comissão paga). */
export interface AppNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  amount: number | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface Indicator {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  pixKey: string;
  pixType: "cpf" | "email" | "phone" | "random";
  league: "bronze" | "prata" | "ouro";
  score: number; // reputation score 0-100
  clicks: number;
  hasAcceptedTerms: boolean;
  termsAcceptedAt?: string;
  balanceAvailable: number;
  balancePending: number;
  city?: string;
  state?: string;
}

export interface Advertiser {
  id: string;
  name: string;
  cnpjOrCpf: string;
  type: "PF" | "PJ";
  phone: string;
  email: string;
  hasAcceptedTerms: boolean;
  termsAcceptedAt?: string;
  plan: "gratuito" | "starter" | "premium" | "pro";
  categoriesSelected: Category[];
  city?: string;
  state?: string;
}

export interface PlatformConfig {
  feePercent: number; // platform fee on indicator payout
  feePerLead: number; // platform charge per lead generated
  minCommissionValue: Record<Category, number>;
  /** Teto mensal de comissão por lead, por indicador (freio antifraude). null = sem teto. */
  maxLeadCommissionPerIndicatorMonth: number | null;
}

export type FinancingStatus =
  "pendente" | "analise_bancos" | "aprovado" | "rejeitado" | "concluido";

export interface BankSimulationResponse {
  bankName: string;
  approvedAmount: number;
  interestRate: number; // e.g., 1.89% p.m.
  installmentValue: number;
  installmentsCount: number;
  approvedStatus: "aprovado" | "recusado" | "revisar_entrada";
  notes?: string;
}

export interface ApprovedContract {
  bankName: string;
  approvedAmount: number;
  installmentsCount: number;
  installmentValue: number;
  downPaymentRequired: number;
  interestRate: number;
  additionalNotes?: string;
}

export interface FinancingSimulation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  indicatorId: string;
  indicatorName: string;
  advertiserId: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  clientBirthDate: string;
  clientIncome: number;
  downPayment: number;
  desiredInstallments: number;
  status: FinancingStatus;
  bankResponses?: BankSimulationResponse[];
  approvedContract?: ApprovedContract;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  senderId: string; // 'client' (buyer) or advertiserId (store)
  senderName: string;
  senderRole: "client" | "advertiser" | "system";
  text: string;
  originalText?: string;
  isSystem?: boolean;
  isBlockedBySecurity?: boolean;
  createdAt: string;
}

// ---------------- Academy / credenciamento ----------------

export type ApplicationStatus = "rascunho" | "em_analise" | "aprovado" | "rejeitado";

/** Cadastro completo do candidato a indicador, avaliado por um admin. */
export interface IndicatorApplication {
  id: string;
  userId: string;
  fullName: string;
  cpf: string;
  birthDate: string | null;
  phone: string;
  email: string;
  addressCity: string | null;
  addressState: string | null;
  occupation: string | null;
  experience: string | null;
  motivation: string | null;
  socialLinks: string | null;
  referralSource: string | null;
  interestCategories: Category[];
  acceptedTerms: boolean;
  status: ApplicationStatus;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface Course {
  id: string;
  slug: string;
  /** null = módulo geral (Fundamentos), pré-requisito dos nichos. */
  category: Category | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  emoji: string | null;
  position: number;
  passScore: number;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  position: number;
  title: string;
  summary: string | null;
  content: string;
  durationMin: number;
}

/** Questão como o cliente a recebe — sem o gabarito. */
export interface CourseQuestion {
  id: string;
  courseId: string;
  position: number;
  question: string;
  options: string[];
}

export interface Certification {
  id: string;
  courseId: string;
  category: Category | null;
  score: number;
  grantedAt: string;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
}

/** Público de uma campanha de push. */
export type PushAudience = "todos" | "indicadores" | "anunciantes" | "especificos";

/** Mensagem que o admin envia para a base. */
export interface PushCampaign {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  targetUrl: string;
  actionLabel: string | null;
  audience: PushAudience;
  /** Pessoas que receberam a notificação in-app. */
  recipients: number;
  /** Aparelhos que aceitaram a entrega. Nulo enquanto o disparo não terminou. */
  devicesSent: number | null;
  devicesFailed: number | null;
  dispatchedAt: string | null;
  createdAt: string;
}

export interface PushReach {
  pessoas: number;
  aparelhos: number;
}
