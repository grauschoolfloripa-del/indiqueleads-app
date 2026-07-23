import { useState, FormEvent } from 'react';
import { 
  MapPin, Phone, Send, CheckCircle2, Star, ShieldCheck, Tag, Info, 
  ChevronRight, ArrowLeft, Grid, HelpCircle, Eye, Calendar, MessageSquare, Lock, AlertCircle
} from 'lucide-react';
import { Product, Lead, Category, ChatMessage } from '../types';

interface VisitorViewProps {
  product: Product;
  products: Product[];
  referralId: string | null;
  referralIndicatorName?: string;
  onGoBack?: () => void;
  onSubmitLead: (leadData: { clientName: string; clientPhone: string; clientEmail: string; notes?: string }) => void;
  onAddNotification: (msg: string, type: 'success' | 'info') => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (leadId: string, senderId: string, senderName: string, senderRole: 'client' | 'advertiser', text: string) => void;
  leads: Lead[];
}

export default function VisitorView({
  product,
  products,
  referralId,
  referralIndicatorName,
  onGoBack,
  onSubmitLead,
  onAddNotification,
  chatMessages,
  onSendChatMessage,
  leads
}: VisitorViewProps) {
  // Gallery selection
  const [activeImage, setActiveImage] = useState<string>(product.coverImage);
  const [prevProductId, setPrevProductId] = useState<string>(product.id);

  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setActiveImage(product.coverImage);
  }
  
  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [chatText, setChatText] = useState('');

  const [activeTab, setActiveTab] = useState<'product' | 'portal'>('product');
  
  // Local storage retrieval on initial load
  const [portalLookupPhoneOrEmail, setPortalLookupPhoneOrEmail] = useState(() => {
    return localStorage.getItem('indica_client_lookup_key') || '';
  });
  const [activeClientLeadId, setActiveClientLeadId] = useState<string | null>(null);
  const [portalChatText, setPortalChatText] = useState('');

  const activeLead = leads.find(l => 
    l.productId === product.id && 
    l.clientEmail.toLowerCase().trim() === clientEmail.toLowerCase().trim() && 
    l.clientName.toLowerCase().trim() === clientName.toLowerCase().trim()
  );
  
  // Statuses
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !clientEmail) {
      onAddNotification('Por favor, preencha todos os campos obrigatórios.', 'info');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onSubmitLead({
        clientName,
        clientPhone,
        clientEmail,
        notes: formNotes
      });
      // Save lookup info to local storage for seamless recovery!
      localStorage.setItem('indica_client_lookup_key', clientPhone || clientEmail);
      setPortalLookupPhoneOrEmail(clientPhone || clientEmail);
      setSubmitting(false);
      setSubmitted(true);
      onAddNotification('Sua solicitação foi enviada! O anunciante entrará em contato.', 'success');
    }, 1200);
  };

  // Humanized names for attributes key mapping
  const attributeLabels: Record<string, string> = {
    type: 'Tipo',
    purpose: 'Finalidade',
    areaUseful: 'Área Útil (m²)',
    areaTotal: 'Área Total (m²)',
    rooms: 'Quartos',
    suites: 'Suítes',
    parkingSpaces: 'Vagas de Garagem',
    condoFee: 'Condomínio (R$)',
    iptu: 'IPTU (R$)',
    yearBuilt: 'Ano de Construção',
    furnished: 'Mobiliado',
    acceptsExchange: 'Aceita Permuta/Troca',
    acceptsFinancing: 'Aceita Financiamento',
    registryId: 'Matrícula de Registro',
    brand: 'Marca',
    model: 'Modelo',
    version: 'Versão',
    yearModel: 'Ano do Modelo',
    km: 'KM Rodados',
    transmission: 'Câmbio',
    fuel: 'Combustível',
    color: 'Cor Externa',
    plate: 'Placa',
    singleOwner: 'Único Dono',
    cautionaryReport: 'Laudo Cautelar Dekra',
    condition: 'Condição',
    cc: 'Cilindradas (cc)',
    year: 'Ano',
    docOk: 'Documentação Ok',
    builder: 'Estaleiro',
    lengthFeet: 'Comprimento (Pés)',
    hullMaterial: 'Casco',
    engine: 'Motorização',
    engineHours: 'Horas de Motor',
    passengerCapacity: 'Capacidade de Pessoas',
    marinaSpaceIncluded: 'Vaga de Marina Incluída',
    hours: 'Horas de Uso',
    includesTrailer: 'Acompanha Carretinha'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      
      {/* Referral context notice bar */}
      {referralId && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-500/20 text-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">Atribuição Ativa</span>
            </div>
            <h4 className="font-display font-bold text-sm mt-0.5">Indicado Especial</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Você foi direcionado a esta oferta exclusiva pelo parceiro comercial <strong>{referralIndicatorName || 'Gabriel Martins'}</strong>.
            </p>
          </div>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg py-1 px-3 font-semibold font-mono self-start sm:self-auto">
            Cookie ID: {referralId}
          </span>
        </div>
      )}

      {/* Navigation and Title Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para a Vitrine
            </button>
          )}
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 shadow-sm">
            <button
              onClick={() => setActiveTab('product')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'product'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4 text-blue-700" />
              Visualizar Oferta
            </button>
            <button
              onClick={() => {
                setActiveTab('portal');
                // if they didn't manually search yet but we have their lookup key, use it
                const key = portalLookupPhoneOrEmail || localStorage.getItem('indica_client_lookup_key') || '';
                if (key) {
                  setPortalLookupPhoneOrEmail(key);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold relative transition-all ${
                activeTab === 'portal'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-700 animate-pulse" />
              Acompanhar Atendimento
              {(() => {
                const key = (portalLookupPhoneOrEmail || localStorage.getItem('indica_client_lookup_key') || '').toLowerCase().trim();
                const matchedCount = key ? leads.filter(l => 
                  l.clientEmail.toLowerCase().includes(key) || 
                  l.clientPhone.replace(/\D/g, '').includes(key.replace(/\D/g, ''))
                ).length : 0;
                if (matchedCount > 0) {
                  return (
                    <span className="bg-blue-700 text-white font-mono font-bold text-[9px] rounded-full h-4 min-w-4 px-1.5 flex items-center justify-center animate-bounce">
                      {matchedCount}
                    </span>
                  );
                }
                return null;
              })()}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded-full font-mono">
            {product.category.toUpperCase()}
          </span>
          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
            product.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {product.status === 'ativo' ? 'Disponível' : 'Reservado'}
          </span>
        </div>
      </div>

      {activeTab === 'product' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns (Col Span 2): Title, Gallery, Description and Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider font-mono">{product.advertiserName}</span>
            <h1 className="font-display font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight">{product.title}</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{product.location.city} - {product.location.state}</span>
            </div>
          </div>

          {/* Media gallery */}
          <div className="space-y-3">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-100 shadow-sm">
              <img 
                src={activeImage} 
                alt={product.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {product.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.gallery.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer w-24 aspect-video border-2 transition-all ${
                      activeImage === img ? 'border-blue-700 scale-[1.03]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Value Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Valor Comercial Solicitado</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-950">
                R$ {product.price.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Garantias</span>
              <span className="text-xs text-slate-600 font-semibold block">Laudo e Titulação Auditados</span>
            </div>
          </div>

          {/* Long commercial description */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-slate-900 text-base">Descrição da Oportunidade</h3>
            <p className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-line bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              {product.description}
            </p>
          </div>

          {/* Attributes and dynamic features grid (JSONB schema representation) */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-slate-900 text-base">Especificações Técnicas (Ficha Técnica)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(product.attributes).map(([key, val]) => (
                <div key={key} className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block truncate tracking-wide">
                    {attributeLabels[key] || key}
                  </span>
                  <span className="text-xs font-bold text-slate-950 block mt-1 font-sans">
                    {typeof val === 'boolean' 
                      ? (val ? '✓ Sim' : '✗ Não') 
                      : (typeof val === 'number' && key.toLowerCase().includes('condo') 
                        ? `R$ ${val.toLocaleString('pt-BR')}` 
                        : val.toString())
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Col Span 1): Secure Lead Capture Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sticky top-28 space-y-5">
            <div className="text-center border-b border-slate-100 pb-4">
              <h3 className="font-display font-bold text-slate-950 text-base">Tenho Interesse / Contatar</h3>
              <p className="text-xs text-slate-500 mt-1">Preencha os dados abaixo. O Anunciante entrará em contato em instantes.</p>
            </div>

            {submitted && activeLead ? (() => {
              const activeLeadMessages = chatMessages.filter(msg => msg.leadId === activeLead.id);
              
              const handleChatSubmit = (e: FormEvent) => {
                e.preventDefault();
                if (!chatText.trim()) return;
                onSendChatMessage(activeLead.id, 'client', clientName || 'Comprador', 'client', chatText.trim());
                setChatText('');
              };

              return (
                <div className="space-y-4 animate-fade-in text-left">
                  {/* Small Success Badge */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-full flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Ficha Registrada com Sucesso!</h4>
                      <p className="text-[10px] text-slate-500">
                        Atendimento garantido com atribuição ao indicador <strong>{activeLead.indicatorName}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Chat Box Wrapper */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 shadow-inner flex flex-col h-[350px]">
                    {/* Chat Header */}
                    <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <div>
                          <h4 className="font-bold text-xs">{product.advertiserName}</h4>
                          <span className="text-[9px] text-slate-400 block">Atendimento Oficial pelo Portal</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase tracking-wide">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                        Seguro
                      </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                      {activeLeadMessages.map(msg => {
                        if (msg.senderRole === 'system') {
                          return (
                            <div key={msg.id} className="mx-auto max-w-[85%] text-center">
                              <div className={`p-2 rounded-xl text-[9px] leading-relaxed inline-block font-medium ${
                                msg.isBlockedBySecurity 
                                  ? 'bg-red-50 border border-red-200 text-red-700' 
                                  : 'bg-slate-200/60 text-slate-600'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        }

                        const isMe = msg.senderRole === 'client';
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                              isMe 
                                ? 'bg-blue-700 text-white rounded-br-none' 
                                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                            }`}>
                              <span className="font-bold text-[9px] block opacity-85 mb-0.5">
                                {isMe ? 'Você' : msg.senderName}
                              </span>
                              <p className="leading-normal">{msg.text}</p>
                              <span className="block text-[8px] opacity-60 text-right mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Security warning tiny label */}
                    <div className="bg-slate-100 border-t border-slate-200/60 px-3 py-1.5 flex items-center gap-1.5 text-[9px] text-slate-500">
                      <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>Mensagens monitoradas. Proibido compartilhar WhatsApp ou links externos.</span>
                    </div>

                    {/* Chat Footer Form */}
                    <form onSubmit={handleChatSubmit} className="p-2 bg-white border-t border-slate-100 flex gap-1.5">
                      <input
                        type="text"
                        value={chatText}
                        onChange={e => setChatText(e.target.value)}
                        placeholder="Digite sua dúvida ou mensagem..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold transition-all underline block text-center mx-auto"
                  >
                    Voltar para o formulário
                  </button>
                </div>
              );
            })() : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Seu Nome Completo</label>
                  <input 
                    type="text" required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="ex: Fernando de Abreu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp / Telefone</label>
                    <input 
                      type="text" required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Seu E-mail</label>
                    <input 
                      type="email" required
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      placeholder="fernando@exemplo.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Dúvida / Observação (Opcional)</label>
                  <textarea 
                    rows={2}
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="Gostaria de agendar uma visita ou simular financiamento..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Enviando...' : 'Solicitar Atendimento'}
                </button>
              </form>
            )}

            {/* Security badge and data protection trust message */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-blue-950 uppercase block tracking-wider font-mono">Plataforma Segura</span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Seus dados serão compartilhados de forma totalmente confidencial e protegida de acordo com as leis de privacidade. Atendimento prioritário e acompanhamento integral.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Client Portal Tab content */}
      {activeTab === 'portal' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6 text-left animate-fade-in">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <div className="inline-flex bg-blue-50 text-blue-700 rounded-2xl p-2.5 mb-2">
              <MessageSquare className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="font-display font-bold text-slate-950 text-xl sm:text-2xl tracking-tight">Portal de Acompanhamento do Cliente</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consulte o status das suas propostas, acesse a ficha técnica e converse diretamente com as lojas parceiras em nosso chat seguro e monitorado.
            </p>
          </div>

          {/* Lookup Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Digite seu E-mail ou Telefone cadastrado</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={portalLookupPhoneOrEmail}
                  onChange={(e) => {
                    setPortalLookupPhoneOrEmail(e.target.value);
                    localStorage.setItem('indica_client_lookup_key', e.target.value);
                  }}
                  placeholder="ex: fernando@exemplo.com ou (11) 99999-9999"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>
            <div className="flex items-start gap-2 text-[10px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
              <span>
                Seus dados são confidenciais. Para abrir seus atendimentos ativos, digite exatamente o mesmo telefone ou e-mail que você utilizou ao preencher o formulário de interesse de qualquer produto.
              </span>
            </div>
          </div>

          {/* Results / List of Leads */}
          {!portalLookupPhoneOrEmail.trim() ? (
            <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-xs text-slate-400">
              Por favor, digite seu e-mail ou telefone acima para pesquisar seus atendimentos ativos.
            </div>
          ) : (() => {
            const normalizedKey = portalLookupPhoneOrEmail.toLowerCase().trim();
            const digitsOnlyKey = normalizedKey.replace(/\D/g, '');
            const matchingLeads = leads.filter(lead => {
              const emailMatch = lead.clientEmail.toLowerCase().includes(normalizedKey);
              const phoneDigits = lead.clientPhone.replace(/\D/g, '');
              const phoneMatch = digitsOnlyKey && phoneDigits.includes(digitsOnlyKey);
              return emailMatch || phoneMatch;
            });

            if (matchingLeads.length === 0) {
              return (
                <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-400 font-medium">Nenhum atendimento em andamento para "{portalLookupPhoneOrEmail}"</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                    Verifique se digitou o e-mail ou telefone corretamente ou envie uma nova proposta na aba <strong>"Visualizar Oferta"</strong>.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Seus Atendimentos Ativos ({matchingLeads.length})
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {matchingLeads.map(lead => {
                    const isChatOpen = activeClientLeadId === lead.id;
                    const leadMessages = chatMessages.filter(msg => msg.leadId === lead.id);
                    const leadProd = products.find(p => p.id === lead.productId);
                    const advertiserName = leadProd?.advertiserName || 'Loja Credenciada';

                    return (
                      <div 
                        key={lead.id} 
                        className={`border rounded-2xl p-5 transition-all bg-white shadow-sm text-left ${
                          isChatOpen ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/5' : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 text-left">
                            <span className="text-[9px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 border border-blue-100/60 px-2 py-0.5 rounded-md">
                              {lead.productCategory}
                            </span>
                            <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base mt-1">{lead.productTitle}</h4>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 mt-1">
                              <span>Anunciante: <strong className="text-slate-600">{advertiserName}</strong></span>
                              <span>•</span>
                              <span>Enviado em: <strong>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</strong></span>
                              <span>•</span>
                              <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                                Indicação de: {lead.indicatorName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-start sm:self-auto">
                            {/* Status pill */}
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              lead.status === 'venda_concluida' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                              lead.status === 'visita_confirmada' ? 'bg-cyan-100 border-cyan-200 text-cyan-800' :
                              lead.status === 'visita_agendada' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                              lead.status === 'proposta' ? 'bg-blue-100 border-blue-200 text-blue-900' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              {lead.status === 'lead_recebido' && 'Lead Recebido'}
                              {lead.status === 'contato_feito' && 'Contato Comercial'}
                              {lead.status === 'visita_agendada' && 'Visita Agendada'}
                              {lead.status === 'visita_confirmada' && 'Visita Confirmada'}
                              {lead.status === 'proposta' && 'Proposta'}
                              {lead.status === 'venda_concluida' && 'Venda Concluída 🎉'}
                            </span>

                            <button
                              onClick={() => setActiveClientLeadId(isChatOpen ? null : lead.id)}
                              className={`font-bold py-1.5 px-3.5 rounded-xl transition-all text-xs flex items-center gap-1.5 border shadow-sm ${
                                isChatOpen 
                                  ? 'bg-slate-950 text-white border-slate-900' 
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                              {isChatOpen ? 'Fechar Chat' : 'Acompanhar Chat'}
                              {leadMessages.length > 0 && (
                                <span className="bg-blue-700 text-white text-[9px] font-bold rounded-full px-1.5 py-0.2">
                                  {leadMessages.length}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Visit info if visitation scheduled */}
                        {lead.status === 'visita_agendada' && lead.visitDate && (
                          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-[11px] text-amber-950 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>
                              Sua visita à loja física está agendada para o dia <strong>{new Date(lead.visitDate).toLocaleDateString('pt-BR')}</strong> às <strong>{lead.visitDate.substring(11, 16)}h</strong>. Não se esqueça de sinalizar a sua chegada!
                            </span>
                          </div>
                        )}

                        {/* Expanded Chat inside lead list */}
                        {isChatOpen && (
                          <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in text-left">
                            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col h-[320px]">
                              {/* Chat Header */}
                              <div className="bg-slate-950 text-white px-4 py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                                  <div className="text-left">
                                    <h5 className="font-bold text-xs text-slate-100">Atendimento Oficial • {advertiserName}</h5>
                                    <p className="text-[9px] text-slate-400">Atribuído à comissão de indicação de {lead.indicatorName}</p>
                                  </div>
                                </div>
                                <div className="bg-slate-800 border border-slate-700 text-blue-400 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase font-bold">
                                  Criptografia Ativa
                                </div>
                              </div>

                              {/* Chat messages body */}
                              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                {leadMessages.length === 0 ? (
                                  <p className="text-center text-xs text-slate-400 py-10">Inicie a conversa digitando uma mensagem abaixo!</p>
                                ) : (
                                  leadMessages.map(msg => {
                                    if (msg.senderRole === 'system') {
                                      return (
                                        <div key={msg.id} className="mx-auto max-w-[85%] text-center my-1">
                                          <div className={`p-2 rounded-xl text-[9px] leading-relaxed inline-block font-medium ${
                                            msg.isBlockedBySecurity 
                                              ? 'bg-red-50 border border-red-200 text-red-700 font-bold' 
                                              : 'bg-slate-200/60 text-slate-600'
                                          }`}>
                                            {msg.text}
                                          </div>
                                        </div>
                                      );
                                    }

                                    const isMe = msg.senderRole === 'client';
                                    return (
                                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                                          isMe 
                                            ? 'bg-blue-700 text-white rounded-br-none' 
                                            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                                        }`}>
                                          <span className="font-bold text-[9px] block opacity-85 mb-0.5">
                                            {isMe ? 'Você' : `Anunciante / Loja`}
                                          </span>
                                          
                                          {msg.originalText && msg.originalText !== msg.text ? (
                                            <div className="space-y-1">
                                              <p className="line-through text-slate-400 text-[10px] italic">{msg.originalText}</p>
                                              <div className="bg-red-50 text-red-800 text-[10px] p-1.5 rounded border border-red-100 font-medium">
                                                🚫 Contato ocultado por segurança: {msg.text}
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="leading-relaxed font-sans">{msg.text}</p>
                                          )}

                                          <span className="block text-[8px] opacity-60 text-right mt-1">
                                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Security Warning */}
                              <div className="bg-slate-100 border-t border-slate-200/60 px-4 py-2 flex items-center gap-1.5 text-[9px] text-slate-500">
                                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span>Mantenha as negociações aqui para garantir as condições especiais do portal.</span>
                              </div>

                              {/* Send form */}
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!portalChatText.trim()) return;
                                  onSendChatMessage(lead.id, 'client', lead.clientName, 'client', portalChatText.trim());
                                  setPortalChatText('');
                                }}
                                className="p-2 bg-white border-t border-slate-200 flex gap-2"
                              >
                                <input
                                  type="text"
                                  value={portalChatText}
                                  onChange={e => setPortalChatText(e.target.value)}
                                  placeholder="Escreva sua mensagem com segurança aqui..."
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent font-medium"
                                />
                                <button
                                  type="submit"
                                  className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-xl transition-all shadow active:scale-95 flex items-center justify-center"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
