import { useState, FormEvent } from 'react';
import { 
  ShieldAlert, Settings, TrendingUp, AlertTriangle, ListFilter, Play, Sparkles,
  Layers, Plus, Trash2, CheckCircle2, DollarSign, Users, FileText
} from 'lucide-react';
import { Product, Advertiser, Indicator, Lead, Category, PlatformConfig } from '../types';

interface AdminPanelProps {
  products: Product[];
  onUpdateProductStatus: (productId: string, status: any) => void;
  advertisers: Advertiser[];
  indicators: Indicator[];
  leads: Lead[];
  platformConfig: PlatformConfig;
  onUpdatePlatformConfig: (config: PlatformConfig) => void;
  categories: Array<{ id: Category | string; name: string; icon: string; fields: string[] }>;
  onAddCategory: (cat: { id: string; name: string; icon: string; fields: string[] }) => void;
  onAddNotification: (msg: string, type: 'success' | 'info') => void;
}

export default function AdminPanel({
  products,
  onUpdateProductStatus,
  advertisers,
  indicators,
  leads,
  platformConfig,
  onUpdatePlatformConfig,
  categories,
  onAddCategory,
  onAddNotification
}: AdminPanelProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'geral' | 'categorias' | 'fraudes' | 'taxas'>('geral');
  
  // Dynamic Category Form
  const [newCatId, setNewCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatFields, setNewCatFields] = useState('');

  // Local config edits
  const [configEdit, setConfigEdit] = useState({ ...platformConfig });

  // Calculate platform financial stats
  const totalVolume = products.filter(p => p.status === 'vendido').reduce((acc, p) => acc + p.price, 0) 
    || leads.filter(l => l.status === 'venda_concluida').reduce((acc, l) => acc + (l.commissionValue * 20), 0); // fallback simulation
  const platformAccruedFees = leads.filter(l => l.status === 'venda_concluida').reduce((acc, l) => acc + (l.commissionValue * (platformConfig.feePercent / 100)), 0);
  const totalLeadsChargedFee = leads.length * platformConfig.feePerLead;
  const planIncomes = advertisers.length * 199.00; // premium average
  const totalRevenue = platformAccruedFees + totalLeadsChargedFee + planIncomes;

  const handleSaveConfig = (e: FormEvent) => {
    e.preventDefault();
    onUpdatePlatformConfig(configEdit);
    onAddNotification('Configurações de taxas e comissões atualizadas!', 'success');
  };

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) {
      onAddNotification('Insira um ID e Nome válidos para a categoria.', 'info');
      return;
    }

    const fieldsArr = newCatFields.split(',').map(f => f.trim()).filter(Boolean);
    onAddCategory({
      id: newCatId.toLowerCase(),
      name: newCatName,
      icon: newCatIcon,
      fields: fieldsArr.length > 0 ? fieldsArr : ['Ano', 'Modelo', 'Observações']
    });

    onAddNotification(`Nova vertical "${newCatName}" criada com sucesso no sistema dinâmico!`, 'success');
    setNewCatId('');
    setNewCatName('');
    setNewCatIcon('📦');
    setNewCatFields('');
  };

  // Mock Fraud & Auditing center alerts
  const mockFraudAlerts = [
    {
      id: 'alert-1',
      indicatorName: 'Gabriel Martins',
      type: 'Anomalia de Cliques',
      severity: 'alta',
      time: 'Há 5 minutos',
      description: 'Acúmulo de 340 cliques em intervalo de 3 segundos no link Cobertura Duplex. Padrão de script ou robot de indexação de redes sociais detectado.'
    },
    {
      id: 'alert-2',
      indicatorName: 'Juliana Silva',
      type: 'Check-In GPS Suspeito',
      severity: 'media',
      time: 'Há 25 minutos',
      description: 'Coordenadas do dispositivo divergem do endereço da Porsche GTS por mais de 800 metros. Proximidade de geofencing rejeitada, check-in forçado com fallback de foto.'
    },
    {
      id: 'alert-3',
      indicatorName: 'Roberto Alencar',
      type: 'Múltiplos Clones de IP',
      severity: 'baixa',
      time: 'Há 2 horas',
      description: 'Mesmo IP simulando geração de 3 leads em menos de 10 minutos para o anúncio Sea-Doo.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white mb-8 shadow-xl border border-orange-900/20">
        <div className="flex items-center gap-4">
          <div className="bg-red-600/20 text-red-400 p-3 rounded-2xl border border-red-500/30">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Central Administrativa</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Controle global de regras comerciais, fraudes e novas categorias.</p>
          </div>
        </div>
      </div>

      {/* Tabs Submenu */}
      <div className="flex border-b border-slate-200 mb-6 font-display font-medium text-sm">
        <button
          onClick={() => setActiveTab('geral')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'geral' ? 'border-orange-600 text-orange-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Visão Geral & Métricas
        </button>
        <button
          onClick={() => setActiveTab('categorias')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'categorias' ? 'border-orange-600 text-orange-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Campos Dinâmicos (Verticais)
        </button>
        <button
          onClick={() => setActiveTab('fraudes')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'fraudes' ? 'border-orange-600 text-orange-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Auditoria de Fraudes ({mockFraudAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('taxas')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'taxas' ? 'border-orange-600 text-orange-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Taxas & Comissões
        </button>
      </div>

      {/* VIEW: CONSOLIDATED METRICS */}
      {activeTab === 'geral' && (
        <div className="space-y-6">
          {/* Key metrics blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume de Vendas (GMV)</span>
              <span className="text-xl font-mono font-bold text-slate-900 mt-1 block">R$ {totalVolume.toLocaleString('pt-BR')}</span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Volume total negociado na rede</p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receita da Plataforma</span>
              <span className="text-xl font-mono font-bold text-emerald-600 mt-1 block">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Spread de comissão + taxas lead + mensalidades</p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Anunciantes Cadastrados</span>
              <span className="text-xl font-mono font-bold text-orange-600 mt-1 block">{advertisers.length} Contas</span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Imobiliárias, lojas e concessionárias PJ</p>
            </div>

            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Indicadores Autônomos</span>
              <span className="text-xl font-mono font-bold text-orange-600 mt-1 block">{indicators.filter(i=>i.name).length} Contas</span>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">Parceiros com termos vigentes</p>
            </div>
          </div>

          {/* Pending catalog moderation queue */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-red-600" />
              Moderação de Anúncios de Bens
            </h3>
            <p className="text-xs text-slate-500">Aprovação comercial ou suspensão preventiva de novos carros/imóveis cadastrados por anunciantes.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[9px] bg-slate-50 tracking-wider">
                    <th className="py-2.5 px-4">Anunciante</th>
                    <th className="py-2.5 px-4">Anúncio</th>
                    <th className="py-2.5 px-4">Valor</th>
                    <th className="py-2.5 px-4">Localização</th>
                    <th className="py-2.5 px-4">Status Moderação</th>
                    <th className="py-2.5 px-4 text-right">Ações de Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{prod.advertiserName}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold block text-slate-900">{prod.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono capitalize">{prod.category}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">R$ {prod.price.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-4">{prod.location.city} - {prod.location.state}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          prod.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            onUpdateProductStatus(prod.id, 'ativo');
                            onAddNotification('Anúncio auditado e aprovado com sucesso!', 'success');
                          }}
                          className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => {
                            onUpdateProductStatus(prod.id, 'pausado');
                            onAddNotification('Anúncio pausado preventivamente para verificação.', 'info');
                          }}
                          className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
                        >
                          Suspender
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DYNAMIC CATEGORIES CREATOR */}
      {activeTab === 'categorias' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-1 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-red-600" />
              Adicionar Nova Vertical
            </h3>
            <p className="text-xs text-slate-500">Insira as configurações básicas para criar uma nova vertical de dados que os anunciantes podem usar no catálogo sem deploy.</p>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">ID (Slug do Banco)</label>
                <input 
                  type="text" required
                  value={newCatId}
                  onChange={e => setNewCatId(e.target.value)}
                  placeholder="ex: aeronave ou caminhao"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome Exibição</label>
                <input 
                  type="text" required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="ex: Aeronaves Privadas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emoji / Ícone</label>
                  <input 
                    type="text" required
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    placeholder="🛩️"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Taxa Mínima Padronizada</label>
                  <div className="bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-700 rounded-xl">
                    R$ 1.500
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Atributos JSONB Dinâmicos (Vírgulas)</label>
                <textarea 
                  rows={2} required
                  value={newCatFields}
                  onChange={e => setNewCatFields(e.target.value)}
                  placeholder="ex: fabricante, horas_voo, turbinas, autonomia_km"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 leading-tight block mt-1">
                  ✓ O formulário de novos produtos gerará estes campos de dados dinamicamente no onboarding.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Registrar Vertical Dinâmica
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm">Estruturas de Atributos de Verticais Ativas</h3>
            <p className="text-xs text-slate-500">Estas são as verticais ativas gerenciadas pelo core de comissionamento.</p>

            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span>{cat.name} <span className="text-slate-400 text-xs font-normal">({cat.id})</span></span>
                    </span>
                    <span className="text-[9px] bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">
                      {cat.fields.length} Campos
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.fields.map((f, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 font-mono">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SUSPICIOUS FRAUDS */}
      {activeTab === 'fraudes' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Auditoria de Fraudes & Logs de Geofencing
              </h3>
              <p className="text-xs text-slate-500">Alertas em tempo real gerados pelo sistema de cookies de atribuição e do geofencing de check-ins.</p>
            </div>
          </div>

          <div className="space-y-4">
            {mockFraudAlerts.map(alert => (
              <div key={alert.id} className="border border-slate-150 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-all flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                      alert.severity === 'alta' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'media' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Risco {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-display">{alert.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">• {alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{alert.description}</p>
                  <p className="text-[10px] text-orange-600 font-semibold font-mono">Indicador Envolvido: {alert.indicatorName}</p>
                </div>

                <div className="flex gap-1.5 sm:self-center">
                  <button
                    onClick={() => {
                      onAddNotification(`Investigação aberta para o log de ${alert.indicatorName}.`, 'info');
                    }}
                    className="bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-[10px] font-bold hover:bg-slate-100"
                  >
                    Investigar
                  </button>
                  <button
                    onClick={() => {
                      onAddNotification(`Indicador ${alert.indicatorName} foi suspenso temporariamente por fraude flagrante.`, 'success');
                    }}
                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white py-1.5 px-3 rounded-lg text-[10px] font-bold"
                  >
                    Bloquear Conta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PARAMETERS AND FEES */}
      {activeTab === 'taxas' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm max-w-xl">
          <h3 className="font-display font-bold text-slate-900 text-sm mb-4">Parâmetros Gerais de Rentabilidade</h3>

          <form onSubmit={handleSaveConfig} className="space-y-4 font-sans text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Spread de Comissão (%)</label>
                <input 
                  type="number" step="0.1" required
                  value={configEdit.feePercent}
                  onChange={e => setConfigEdit({...configEdit, feePercent: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Taxa cobrada da comissão do indicador no saque.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Custo por Lead Ativo (R$)</label>
                <input 
                  type="number" required
                  value={configEdit.feePerLead}
                  onChange={e => setConfigEdit({...configEdit, feePerLead: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Valor fixo faturado do anunciante por lead de interesse gerado.</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow"
            >
              Gravar Alterações de Parâmetros
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
