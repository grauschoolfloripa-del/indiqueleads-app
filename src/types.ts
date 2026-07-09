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

export interface Indicator {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  password?: string;
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
  password?: string;
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
}

export type FinancingStatus =
  | "pendente"
  | "analise_bancos"
  | "aprovado"
  | "rejeitado"
  | "concluido";

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
