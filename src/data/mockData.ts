import { Product, Indicator, Advertiser, Lead, PlatformConfig, FinancingSimulation, ChatMessage } from '../types';

export const INITIAL_PLATFORM_CONFIG: PlatformConfig = {
  feePercent: 2, // 2% platform fee
  feePerLead: 10, // R$ 10 flat charge per active lead
  minCommissionValue: {
    imovel: 5000,
    carro: 1000,
    moto: 400,
    barco: 3000,
    jetski: 800
  }
};

export const INITIAL_ADVERTISERS: Advertiser[] = [
  {
    id: 'adv-1',
    name: 'Vanguard Imóveis de Luxo',
    cnpjOrCpf: '12.345.678/0001-90',
    type: 'PJ',
    phone: '(11) 98765-4321',
    email: 'contato@vanguardluxo.com.br',
    hasAcceptedTerms: true,
    termsAcceptedAt: '2026-05-15T10:00:00Z',
    plan: 'premium',
    categoriesSelected: ['imovel'],
    city: 'São Paulo',
    state: 'SP'
  },
  {
    id: 'adv-2',
    name: 'Motorsport São Paulo',
    cnpjOrCpf: '98.765.432/0001-10',
    type: 'PJ',
    phone: '(11) 99988-7766',
    email: 'comercial@motorsportsp.com.br',
    hasAcceptedTerms: true,
    termsAcceptedAt: '2026-06-01T14:30:00Z',
    plan: 'pro',
    categoriesSelected: ['carro', 'moto'],
    city: 'São Paulo',
    state: 'SP'
  },
  {
    id: 'adv-3',
    name: 'Náutica Blue Ocean',
    cnpjOrCpf: '45.678.123/0001-44',
    type: 'PJ',
    phone: '(21) 97766-5544',
    email: 'contato@blueoceannautica.com.br',
    hasAcceptedTerms: true,
    termsAcceptedAt: '2026-06-10T11:15:00Z',
    plan: 'starter',
    categoriesSelected: ['barco', 'jetski'],
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  {
    id: 'adv-4',
    name: 'Roberto Alencar (Particular)',
    cnpjOrCpf: '123.456.789-00',
    type: 'PF',
    phone: '(11) 91122-3344',
    email: 'roberto.alencar@gmail.com',
    hasAcceptedTerms: true,
    termsAcceptedAt: '2026-06-20T09:00:00Z',
    plan: 'gratuito',
    categoriesSelected: ['carro'],
    city: 'São Paulo',
    state: 'SP'
  }
];

export const INITIAL_INDICATORS: Indicator[] = [
  {
    id: 'ind-1',
    name: 'Gabriel Martins',
    cpf: '234.567.890-11',
    phone: '(11) 95544-3322',
    email: 'gabriel.martins@indica.com',
    pixKey: 'gabriel.martins@indica.com',
    pixType: 'email',
    league: 'ouro',
    score: 98,
    clicks: 1450,
    hasAcceptedTerms: true,
    termsAcceptedAt: '2026-01-10T08:00:00Z',
    balanceAvailable: 7400.00,
    balancePending: 3500.00,
    city: 'São Paulo',
    state: 'SP'
  },
  {
    id: 'ind-2',
    name: 'Juliana Silva',
    cpf: '345.678.901-22',
    phone: '(21) 98877-6655',
    email: 'juliana.silva@digital.com',
    pixKey: '34567890122',
    pixType: 'cpf',
    league: 'prata',
    score: 92,
    clicks: 680,
    hasAcceptedTerms: true,
    termsAcceptedAt: '2026-03-22T16:45:00Z',
    balanceAvailable: 1200.00,
    balancePending: 1800.00,
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  {
    id: 'ind-3',
    name: 'Lucas Nogueira',
    cpf: '456.789.012-33',
    phone: '(31) 96655-4433',
    email: 'lucas.nogueira@vendas.com',
    pixKey: 'lucas.nogueira@vendas.com',
    pixType: 'email',
    league: 'bronze',
    score: 85,
    clicks: 120,
    hasAcceptedTerms: true,
    termsAcceptedAt: '2026-06-15T13:10:00Z',
    balanceAvailable: 0.00,
    balancePending: 400.00,
    city: 'Belo Horizonte',
    state: 'MG'
  },
  {
    id: 'ind-unregistered',
    name: '',
    cpf: '',
    phone: '',
    email: '',
    pixKey: '',
    pixType: 'cpf',
    league: 'bronze',
    score: 100,
    clicks: 0,
    hasAcceptedTerms: false,
    balanceAvailable: 0,
    balancePending: 0,
    city: '',
    state: ''
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category: 'imovel',
    advertiserId: 'adv-1',
    advertiserName: 'Vanguard Imóveis de Luxo',
    title: 'Cobertura Duplex Jardim Europa',
    description: 'Espetacular cobertura duplex totalmente reformada com vista 360° definida para os Jardins. Acabamentos em mármore travertino, automação de som, luz e cortinas. Ar-condicionado VRF central. Cozinha gourmet Kitchens, área externa espaçosa com piscina aquecida por borda infinita e deck de madeira nobre. Prédio de alto padrão com segurança armada tripla, quadra de tênis oficial de saibro e spa integrado.',
    price: 12500000,
    currency: 'BRL',
    status: 'ativo',
    location: {
      lat: -23.5753,
      lng: -46.6775,
      city: 'São Paulo',
      state: 'SP'
    },
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
    commissionDigitalPct: 0.5, // 0.5% (R$ 62.500)
    commissionDigitalValue: 62500,
    commissionPresencialPct: 1.5, // 1.5% (R$ 187.500)
    commissionPresencialValue: 187500,
    allowPresencialTier: true,
    allowNegotiateTier: true,
    attributes: {
      type: 'Cobertura',
      purpose: 'Venda',
      areaUseful: 450,
      areaTotal: 620,
      rooms: 4,
      suites: 4,
      parkingSpaces: 6,
      condoFee: 3200,
      iptu: 1800,
      yearBuilt: 2018,
      furnished: true,
      acceptsExchange: false,
      acceptsFinancing: true,
      registryId: 'MT-44910-SP'
    }
  },
  {
    id: 'prod-2',
    category: 'carro',
    advertiserId: 'adv-2',
    advertiserName: 'Motorsport São Paulo',
    title: 'Porsche 911 Carrera GTS 2022',
    description: 'Único dono, faturado na concessionária oficial Porsche Eurobike SP. Cor customizada Crayon Grey com interior completo em Alcântara preta e costuras vermelhas contrastantes. Teto solar panorâmico em vidro, escapamento esportivo original de fábrica acionável por botão, som de altíssima fidelidade Burmester Surround, eixo traseiro direcional e freios de cerâmica PCCB. Laudo cautelar 100% aprovado pela Dekra, sem nenhum retoque ou sinistro. IPVA pago integral.',
    price: 940000,
    currency: 'BRL',
    status: 'ativo',
    location: {
      lat: -23.5684,
      lng: -46.6791,
      city: 'São Paulo',
      state: 'SP'
    },
    coverImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: '2026-06-12T14:00:00Z',
    updatedAt: '2026-06-12T14:00:00Z',
    commissionDigitalPct: 1, // 1% (R$ 9.400)
    commissionDigitalValue: 9400,
    commissionPresencialPct: 2.5, // 2.5% (R$ 23.500)
    commissionPresencialValue: 23500,
    allowPresencialTier: true,
    allowNegotiateTier: false,
    attributes: {
      brand: 'Porsche',
      model: '911 Carrera GTS',
      version: '3.0 Bi-Turbo PDK',
      yearBuilt: 2022,
      yearModel: 2022,
      km: 8400,
      transmission: 'PDK Automatizado de 8 marchas',
      fuel: 'Gasolina',
      color: 'Cinza Giz (Crayon)',
      plate: 'P**-9E11',
      singleOwner: true,
      cautionaryReport: true,
      acceptsExchange: true,
      condition: 'Seminovo'
    }
  },
  {
    id: 'prod-3',
    category: 'moto',
    advertiserId: 'adv-2',
    advertiserName: 'Motorsport São Paulo',
    title: 'Ducati Panigale V4 S 2023',
    description: 'Estado de zero quilômetro. Equipada com kit de escape completo Akrapovič em titânio (original instalado na autorizada Ducati, acompanha o escape original). Mapas de injeção atualizados, suspensão eletrônica Öhlins Smart EC 2.0 recalibrada, protetor de manete Rizoma, sliders de motor e balança CNC Racing. Todas as revisões feitas em concessionária por tempo. Manual, chave presencial reserva e nota fiscal de compra.',
    price: 159000,
    currency: 'BRL',
    status: 'ativo',
    location: {
      lat: -23.5956,
      lng: -46.6853,
      city: 'São Paulo',
      state: 'SP'
    },
    coverImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: '2026-06-18T16:00:00Z',
    updatedAt: '2026-06-18T16:00:00Z',
    commissionDigitalPct: 2, // R$ 3.180
    commissionDigitalValue: 3180,
    commissionPresencialPct: 4, // R$ 6.360
    commissionPresencialValue: 6360,
    allowPresencialTier: true,
    allowNegotiateTier: false,
    attributes: {
      brand: 'Ducati',
      model: 'Panigale V4 S',
      cc: 1103,
      year: 2023,
      km: 1200,
      type: 'Superesportiva',
      docOk: true
    }
  },
  {
    id: 'prod-4',
    category: 'barco',
    advertiserId: 'adv-3',
    advertiserName: 'Náutica Blue Ocean',
    title: 'Lancha NX Boats 360 Sport Coupé',
    description: 'Design esportivo com cabine espetacular. Equipada com 2 Motores Volvo Penta V8 de 300HP cada (apenas 140 horas de uso originais, todas as manutenções documentadas pela concessionária autorizada Volvo). Ar-condicionado náutico de 16.000 BTUs, gerador de energia silencioso Cummins Onan de 5KVA, churrasqueira elétrica embutida no espaço gourmet da popa, GPS Raymarine de 9 polegadas com sonar de alta precisão, estofamento náutico premium anti-mofo e sistema de som JBL marítimo de alta potência com subwoofer.',
    price: 1150000,
    currency: 'BRL',
    status: 'ativo',
    location: {
      lat: -22.9213,
      lng: -43.1691,
      city: 'Rio de Janeiro',
      state: 'RJ'
    },
    coverImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: '2026-06-22T09:00:00Z',
    updatedAt: '2026-06-22T09:00:00Z',
    commissionDigitalPct: 1, // R$ 11.500
    commissionDigitalValue: 11500,
    commissionPresencialPct: 3, // R$ 34.500
    commissionPresencialValue: 34500,
    allowPresencialTier: true,
    allowNegotiateTier: true,
    attributes: {
      builder: 'NX Boats',
      model: '360 Sport Coupé',
      lengthFeet: 36,
      year: 2021,
      hullMaterial: 'Fibra de Vidro',
      engine: 'Volvo Penta V8 300HP (Duplo)',
      engineHours: 140,
      passengerCapacity: 16,
      marinaSpaceIncluded: false
    }
  },
  {
    id: 'prod-5',
    category: 'jetski',
    advertiserId: 'adv-3',
    advertiserName: 'Náutica Blue Ocean',
    title: 'Sea-Doo RXT-X RS 300 Audio',
    description: 'O jet ski mais rápido e estável do mercado mundial. Motor de 300 cavalos Rotax 1630 ACE supercharged. Apenas 32 horas de uso em água doce (represa). Sistema de som premium de fábrica Bluetooth totalmente integrado e selado. Casco ST3 de alta estabilidade e navegabilidade. Sistema inteligente de freio e ré (iBR) de terceira geração. Equipado com escada de embarque e suporte de celular impermeável. Revisões anuais completas feitas na concessionária Sea-Doo SP.',
    price: 139000,
    currency: 'BRL',
    status: 'reservado',
    location: {
      lat: -23.9935,
      lng: -46.2561,
      city: 'Guarujá',
      state: 'SP'
    },
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80'
    ],
    createdAt: '2026-06-25T11:00:00Z',
    updatedAt: '2026-06-25T11:00:00Z',
    commissionDigitalPct: 1.5, // R$ 2.085
    commissionDigitalValue: 2085,
    commissionPresencialPct: 3.5, // R$ 4.865
    commissionPresencialValue: 4865,
    allowPresencialTier: true,
    allowNegotiateTier: false,
    attributes: {
      brand: 'Sea-Doo',
      model: 'RXT-X RS 300 Audio',
      year: 2022,
      hours: 32,
      cc: 1630,
      passengerCapacity: 3,
      includesTrailer: true
    }
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    productId: 'prod-1',
    productTitle: 'Cobertura Duplex Jardim Europa',
    productCategory: 'imovel',
    indicatorId: 'ind-1',
    indicatorName: 'Gabriel Martins',
    advertiserId: 'adv-1',
    clientName: 'Fernando de Abreu',
    clientPhone: '(11) 98111-2233',
    clientEmail: 'fernando.abreu@gmail.com',
    status: 'venda_concluida',
    createdAt: '2026-06-03T11:30:00Z',
    updatedAt: '2026-06-28T18:00:00Z',
    commissionPaid: true,
    commissionValue: 187500, // Presencial tier comission
    commissionType: 'presencial',
    notes: 'Venda de R$ 12.500.000 efetuada. Cliente pagou à vista. Comprovante anexado no fechamento.',
    contractUrl: 'https://cdn.pixabay.com/photo/2016/09/20/11/27/document-1682317_1280.png',
    referralChannel: 'Post no Instagram'
  },
  {
    id: 'lead-2',
    productId: 'prod-2',
    productTitle: 'Porsche 911 Carrera GTS 2022',
    productCategory: 'carro',
    indicatorId: 'ind-1',
    indicatorName: 'Gabriel Martins',
    advertiserId: 'adv-2',
    clientName: 'Mariana Vasconcelos',
    clientPhone: '(11) 99122-3344',
    clientEmail: 'mari.vasco@outlook.com',
    status: 'visita_agendada',
    createdAt: '2026-06-15T15:20:00Z',
    updatedAt: '2026-06-29T10:00:00Z',
    commissionPaid: false,
    commissionValue: 23500,
    commissionType: 'presencial',
    visitDate: '2026-07-03T15:00:00',
    notes: 'Agendado test-drive na Av. Europa. Gabriel confirmou que irá acompanhar a cliente.',
    referralChannel: 'Link Direto / WhatsApp'
  },
  {
    id: 'lead-3',
    productId: 'prod-3',
    productTitle: 'Ducati Panigale V4 S 2023',
    productCategory: 'moto',
    indicatorId: 'ind-2',
    indicatorName: 'Juliana Silva',
    advertiserId: 'adv-2',
    clientName: 'Arthur Menezes',
    clientPhone: '(11) 97722-1100',
    clientEmail: 'arthur.menezes@bol.com.br',
    status: 'contato_feito',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-21T11:30:00Z',
    commissionPaid: false,
    commissionValue: 3180,
    commissionType: 'digital',
    notes: 'Cliente demonstrou interesse no escape Akrapovic.',
    referralChannel: 'Facebook Grupo / Feed'
  }
];

export const INITIAL_SIMULATIONS: FinancingSimulation[] = [
  {
    id: 'sim-1',
    productId: 'prod-2',
    productTitle: 'Porsche 911 Carrera GTS 2022',
    productPrice: 940000,
    productImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    indicatorId: 'ind-1',
    indicatorName: 'Gabriel Martins',
    advertiserId: 'adv-2',
    clientName: 'Roberto Alencar',
    clientCpf: '123.456.789-00',
    clientPhone: '(11) 98222-1234',
    clientBirthDate: '1985-04-12',
    clientIncome: 45000,
    downPayment: 300000,
    desiredInstallments: 48,
    status: 'aprovado',
    bankResponses: [
      {
        bankName: 'Itaú Uniclass Veículos',
        approvedAmount: 640000,
        interestRate: 1.65,
        installmentValue: 19450,
        installmentsCount: 48,
        approvedStatus: 'aprovado',
        notes: 'Taxa especial para clientes com renda comprovada acima de R$ 30mil.'
      },
      {
        bankName: 'Santander Financiamentos',
        approvedAmount: 640000,
        interestRate: 1.72,
        installmentValue: 19780,
        installmentsCount: 48,
        approvedStatus: 'aprovado',
        notes: 'Aprovação automática baseada em score interno.'
      },
      {
        bankName: 'Bradesco Financiamentos',
        approvedAmount: 600000,
        interestRate: 1.82,
        installmentValue: 19100,
        installmentsCount: 48,
        approvedStatus: 'revisar_entrada',
        notes: 'Necessário aportar R$ 40.000 adicionais na entrada.'
      }
    ],
    approvedContract: {
      bankName: 'Itaú Uniclass Veículos',
      approvedAmount: 640000,
      installmentsCount: 48,
      installmentValue: 19450,
      downPaymentRequired: 300000,
      interestRate: 1.65,
      additionalNotes: 'Contrato pré-aprovado disponível para assinatura. Comissão do indicador garantida em caso de assinatura física.'
    },
    createdAt: '2026-06-25T14:30:00Z',
    updatedAt: '2026-06-26T10:15:00Z'
  },
  {
    id: 'sim-2',
    productId: 'prod-3',
    productTitle: 'Ducati Panigale V4 S 2023',
    productPrice: 159000,
    productImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    indicatorId: 'ind-1',
    indicatorName: 'Gabriel Martins',
    advertiserId: 'adv-2',
    clientName: 'Carla Souza Mendes',
    clientCpf: '987.654.321-11',
    clientPhone: '(21) 97111-9988',
    clientBirthDate: '1992-08-23',
    clientIncome: 18000,
    downPayment: 50000,
    desiredInstallments: 36,
    status: 'pendente',
    createdAt: '2026-07-02T09:00:00Z',
    updatedAt: '2026-07-02T09:00:00Z'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    leadId: 'lead-2',
    senderId: 'system',
    senderName: 'Sistema',
    senderRole: 'system',
    text: '🚀 Lead gerado e atribuído com sucesso ao indicador Gabriel Martins.',
    createdAt: '2026-06-15T15:20:00Z'
  },
  {
    id: 'msg-2',
    leadId: 'lead-2',
    senderId: 'client',
    senderName: 'Mariana Vasconcelos',
    senderRole: 'client',
    text: 'Olá! Tenho muito interesse no Porsche 911 Carrera GTS 2022. Ele ainda está disponível para visitas no showroom?',
    createdAt: '2026-06-15T15:30:00Z'
  },
  {
    id: 'msg-3',
    leadId: 'lead-2',
    senderId: 'adv-2',
    senderName: 'Motorsport São Paulo',
    senderRole: 'advertiser',
    text: 'Olá, Mariana! Tudo bem? Sim, o carro está impecável e exposto no nosso showroom principal na Avenida Europa. Gostaria de agendar um horário para vê-lo e fazer um test-drive?',
    createdAt: '2026-06-15T15:45:00Z'
  },
  {
    id: 'msg-4',
    leadId: 'lead-2',
    senderId: 'client',
    senderName: 'Mariana Vasconcelos',
    senderRole: 'client',
    text: 'Sim, por favor! Pode ser no sábado de tarde, por volta das 15h?',
    createdAt: '2026-06-16T09:00:00Z'
  },
  {
    id: 'msg-5',
    leadId: 'lead-2',
    senderId: 'adv-2',
    senderName: 'Motorsport São Paulo',
    senderRole: 'advertiser',
    text: 'Excelente, sábado às 15h está reservado para você! O indicador Gabriel Martins também foi notificado no painel dele e poderá te acompanhar durante a visita.',
    createdAt: '2026-06-16T09:15:00Z'
  },
  {
    id: 'msg-6',
    leadId: 'lead-2',
    senderId: 'system',
    senderName: 'Sistema',
    senderRole: 'system',
    text: '🕒 Visita agendada pelo anunciante para 03/07/2026 às 15:00.',
    createdAt: '2026-06-29T10:00:00Z'
  },
  {
    id: 'msg-7',
    leadId: 'lead-2',
    senderId: 'adv-2',
    senderName: 'Motorsport São Paulo',
    senderRole: 'advertiser',
    text: 'Mariana, me passa seu telefone de whatsapp para eu te mandar a localização exata e conversarmos direto por lá, ok?',
    originalText: 'Mariana, me passa seu telefone de whatsapp para eu te mandar a localização exata e conversarmos direto por lá, ok?',
    createdAt: '2026-07-01T10:30:00Z'
  },
  {
    id: 'msg-8',
    leadId: 'lead-2',
    senderId: 'system',
    senderName: 'Sistema (Segurança)',
    senderRole: 'system',
    text: '⚠️ AVISO DE SEGURANÇA: Uma tentativa de solicitar ou compartilhar contatos externos (como WhatsApp, telefone ou e-mail) foi interceptada. Para garantir a segurança das comissões do indicador e a rastreabilidade do atendimento, toda a negociação deve ocorrer dentro do chat da plataforma.',
    isSystem: true,
    isBlockedBySecurity: true,
    createdAt: '2026-07-01T10:30:05Z'
  }
];


