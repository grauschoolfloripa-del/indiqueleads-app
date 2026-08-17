import type { ComponentType } from "react";
import { ExternalLink, Sparkles } from "lucide-react";

/**
 * Topo da tela no celular: espaço de patrocínio seguido dos números que
 * importam.
 *
 * A ordem é deliberada. O patrocínio vem primeiro porque é o único conteúdo
 * que precisa ser visto sem rolagem para valer o que foi vendido — enterrado
 * no meio da página, como estava, ele não entrega audiência a ninguém.
 * Os números vêm logo abaixo porque respondem a pergunta que traz o indicador
 * ao app: quanto eu tenho.
 */

interface HeroProps {
  /** Chamada do patrocinador. Sem patrocinador ativo, vira convite. */
  sponsor?: { titulo: string; descricao: string; imagem?: string; url?: string };
  contatoEmail?: string;
}

export function SponsorHero({ sponsor, contatoEmail = "contato@midiaeco.com" }: HeroProps) {
  if (sponsor) {
    return (
      <a
        href={sponsor.url ?? "#"}
        target={sponsor.url ? "_blank" : undefined}
        rel={sponsor.url ? "noopener noreferrer" : undefined}
        className="relative block overflow-hidden rounded-3xl bg-sea-700 shadow-lg shadow-sea-700/20"
      >
        {sponsor.imagem && (
          <img
            src={sponsor.imagem}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="relative bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-5 pt-16">
          <span className="inline-block rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            Patrocínio
          </span>
          <h2 className="mt-2 font-display text-lg font-black leading-tight text-white">
            {sponsor.titulo}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-white/80">{sponsor.descricao}</p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={`mailto:${contatoEmail}?subject=Quero%20patrocinar%20a%20IndiqueLeads`}
      className="block overflow-hidden rounded-3xl border border-dashed border-sea-700/25 bg-sea-700/[0.04] p-5"
    >
      <span className="inline-flex items-center gap-1.5 rounded-md bg-sea-700/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-sea-700">
        <Sparkles className="h-3 w-3" />
        Patrocínio
      </span>
      <h2 className="mt-2 font-display text-base font-black leading-tight text-slate-900">
        Sua marca aqui, no primeiro olhar
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        Este é o espaço mais visto do aplicativo — aparece antes de tudo, toda vez que alguém abre.
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sea-700">
        Quero patrocinar <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------------- */

export interface StatItem {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
  /** Verde para dinheiro que já é seu; âmbar para o que ainda depende de alguém. */
  tone?: "neutro" | "positivo" | "espera";
}

/**
 * Faixa de números. Substitui o cartão que trazia nome, e-mail, reputação e
 * chave PIX — informação que a pessoa já sabe e não consulta.
 */
export function StatStrip({ items }: { items: StatItem[] }) {
  const cor = (t?: StatItem["tone"]) =>
    t === "positivo" ? "text-brand-600" : t === "espera" ? "text-amber-600" : "text-slate-900";

  return (
    <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-3xl border border-slate-100 bg-white shadow-sm">
      {items.map((s) => (
        <div key={s.label} className="px-3 py-4 text-center">
          <span className="block text-[9px] font-bold uppercase leading-tight tracking-wider text-slate-400">
            {s.label}
          </span>
          <span
            className={`mt-1 block font-mono text-[15px] font-black leading-none ${cor(s.tone)}`}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
