import { useEffect, useState, type ComponentType } from "react";
import { LogOut, Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";

/**
 * Moldura do aplicativo no celular: barra superior, menu lateral e navegação
 * inferior. Só existe abaixo de `lg` — no computador os painéis continuam com
 * o cabeçalho e as abas horizontais, que funcionam bem em tela larga.
 *
 * Decisões que vieram das regras de UI para app:
 *
 *  * **Navegação embaixo, no alcance do polegar.** Aba horizontal no topo
 *    obriga a esticar a mão em telas grandes. Limite de 5 itens — acima disso
 *    os alvos ficam pequenos demais para acertar.
 *  * **Alvos de 44px.** Todo botão desta moldura respeita o mínimo, inclusive
 *    os que parecem menores: o ícone é pequeno, a área de toque não.
 *  * **Área segura.** A barra de cima encosta no entalhe e a de baixo no
 *    indicador de home; sem `env(safe-area-inset-*)` o último item fica
 *    embaixo do gesto do sistema e não dá para tocar.
 *  * **Identidade sai da tela, vai para o menu.** Nome, e-mail e chave PIX
 *    ocupavam o topo de toda tela sem serem consultados quase nunca.
 */

export interface ChromeTab {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Contador discreto — leads pendentes, por exemplo. */
  badge?: number;
}

export interface ChromeAction {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  /** Destaca em verde: ação que leva a ganhar mais. */
  highlight?: boolean;
}

interface Props {
  /** Título da tela atual, na barra de cima. */
  title: string;
  tabs: ChromeTab[];
  activeTab: string;
  onTab: (id: string) => void;
  /** Itens extras do menu lateral, abaixo da navegação. */
  actions?: ChromeAction[];
  profile: { name: string; subtitle?: string };
  onLogout: () => void;
}

export default function MobileChrome({
  title,
  tabs,
  activeTab,
  onTab,
  actions = [],
  profile,
  onLogout,
}: Props) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Menu aberto trava a rolagem do fundo; sem isso o conteúdo desliza atrás do
  // painel e a pessoa perde o lugar onde estava.
  useEffect(() => {
    if (!menuAberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [menuAberto]);

  // Voltar fecha o menu antes de sair da tela — comportamento esperado no
  // Android, onde o gesto de voltar é o principal meio de navegação.
  useEffect(() => {
    if (!menuAberto) return;
    const fechar = () => setMenuAberto(false);
    window.addEventListener("popstate", fechar);
    return () => window.removeEventListener("popstate", fechar);
  }, [menuAberto]);

  const iniciais = profile.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="lg:hidden">
      {/* ------------------------------------------------ barra superior --- */}
      <header
        className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex h-14 items-center gap-2 px-2">
          <button
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-700 transition-colors active:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="min-w-0 flex-1 truncate font-display text-base font-bold text-slate-900">
            {title}
          </span>

          <BrandLogo className="mr-2 h-6 w-auto shrink-0" />
        </div>
      </header>

      {/* --------------------------------------------------- menu lateral --- */}
      {menuAberto && (
        <>
          {/* Véu forte o bastante para isolar o painel do conteúdo atrás. */}
          <div
            onClick={() => setMenuAberto(false)}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in"
            aria-hidden="true"
          />

          <nav
            className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col bg-white shadow-2xl"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            aria-label="Menu principal"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sea-700 font-display text-sm font-bold text-white">
                  {iniciais}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-bold text-slate-900">
                    {profile.name}
                  </span>
                  {profile.subtitle && (
                    <span className="block truncate text-[11px] text-slate-500">
                      {profile.subtitle}
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors active:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {tabs.map((t) => {
                const ativo = t.id === activeTab;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onTab(t.id);
                      setMenuAberto(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                      ativo ? "bg-sea-700/8 text-sea-700" : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    <t.icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="flex-1">{t.label}</span>
                    {t.badge ? (
                      <span className="rounded-full bg-brand-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        {t.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {actions.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                  {actions.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        a.onClick();
                        setMenuAberto(false);
                      }}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                        a.highlight
                          ? "text-brand-600 active:bg-brand-500/10"
                          : "text-slate-700 active:bg-slate-50"
                      }`}
                    >
                      <a.icon className="h-4.5 w-4.5 shrink-0" />
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-2">
              <button
                onClick={onLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-500 transition-colors active:bg-slate-50"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                Sair da conta
              </button>
            </div>
          </nav>
        </>
      )}

      {/* ---------------------------------------------- navegação inferior --- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navegação"
      >
        <div className="flex items-stretch">
          {tabs.slice(0, 5).map((t) => {
            const ativo = t.id === activeTab;
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                aria-current={ativo ? "page" : undefined}
                className={`relative flex min-h-[56px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${
                  ativo ? "text-sea-700" : "text-slate-400 active:text-slate-600"
                }`}
              >
                {/* Marca do item ativo. Fica no topo para não competir com o
                    indicador de home do aparelho, logo abaixo. */}
                <span
                  className={`absolute inset-x-3 top-0 h-0.5 rounded-full transition-opacity ${
                    ativo ? "bg-sea-700 opacity-100" : "opacity-0"
                  }`}
                />
                <span className="relative">
                  <t.icon className="h-5 w-5" />
                  {t.badge ? (
                    <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 font-mono text-[9px] font-bold text-white">
                      {t.badge > 99 ? "99+" : t.badge}
                    </span>
                  ) : null}
                </span>
                <span className="text-[10px] font-bold leading-none">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
