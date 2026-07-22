import { UserCheck, Building2, ShieldAlert, Eye, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface RoleSwitcherProps {
  currentRole: 'indicador' | 'anunciante' | 'admin' | 'visitante';
  onChangeRole: (role: 'indicador' | 'anunciante' | 'admin' | 'visitante') => void;
  selectedReferralId: string | null;
  selectedProductId: string;
  onSimulateReferral: (refId: string, prodId: string) => void;
  mockIndicators: Array<{ id: string; name: string }>;
  mockProducts: Array<{ id: string; title: string }>;
}

export default function RoleSwitcher({
  currentRole,
  onChangeRole,
  selectedReferralId,
  selectedProductId,
  onSimulateReferral,
  mockIndicators,
  mockProducts
}: RoleSwitcherProps) {
  const [copied, setCopied] = useState(false);
  const [testRefId, setTestRefId] = useState(mockIndicators[0]?.id || 'ind-1');
  const [testProdId, setTestProdId] = useState(mockProducts[0]?.id || 'prod-1');

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const refUrl = `${origin}/?p=${testProdId}&ref=${testRefId}`;
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeRefIndicator = mockIndicators.find(i => i.id === selectedReferralId);

  return (
    <div id="simulation-bar" className="bg-slate-900 border-b border-slate-800 text-white py-3 px-4 z-50 sticky top-0 font-sans shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white rounded-lg p-1.5 flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold tracking-tight text-white text-base">
              IndiqueLeads <span className="text-green-400 text-xs font-mono ml-1 font-normal bg-green-950/40 px-2 py-0.5 rounded border border-green-900/30">SIMULADOR BENTO</span>
            </span>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              {selectedReferralId ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Cookie Ativo: ref={selectedReferralId} ({activeRefIndicator?.name || 'Indicador Demo'})
                </span>
              ) : (
                'Nenhum link de indicação ativo'
              )}
            </p>
          </div>
        </div>

        {/* Center: Role Selectors */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-center">
          <button
            onClick={() => onChangeRole('indicador')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentRole === 'indicador'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Painel do</span> Indicador
          </button>
          
          <button
            onClick={() => onChangeRole('anunciante')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentRole === 'anunciante'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Painel do</span> Anunciante
          </button>

          <button
            onClick={() => onChangeRole('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentRole === 'admin'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin
          </button>

          <button
            onClick={() => onChangeRole('visitante')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentRole === 'visitante'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Vitrine / Cliente
          </button>
        </div>

        {/* Right: Quick Referral Link Generator / Simulator */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-[11px] self-stretch md:self-auto justify-between">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-mono hidden lg:inline">Testar Link:</span>
            <select 
              value={testRefId} 
              onChange={(e) => setTestRefId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-slate-300 focus:outline-none"
            >
              {mockIndicators.filter(i => i.name).map(i => (
                <option key={i.id} value={i.id}>{i.name.split(' ')[0]}</option>
              ))}
            </select>
            <span className="text-slate-600 font-mono">→</span>
            <select 
              value={testProdId} 
              onChange={(e) => setTestProdId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-slate-300 max-w-[100px] focus:outline-none"
            >
              {mockProducts.map(p => (
                <option key={p.id} value={p.id}>{p.title.split(' ')[0]}...</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-2">
            <button
              onClick={() => onSimulateReferral(testRefId, testProdId)}
              className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2 py-1 rounded transition-colors font-semibold"
              title="Acessa a página como cliente final com o cookie de indicação ativo"
            >
              Navegar com Ref
            </button>
            <button
              onClick={handleCopyLink}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded transition-all"
              title="Copiar URL de Indicação do Simulador"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
