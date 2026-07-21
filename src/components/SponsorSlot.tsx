import React from "react";
import { Sparkles, ExternalLink } from "lucide-react";

/**
 * Sponsor slot component — visual only, does not affect app logic.
 *
 * Variants:
 *  - "banner": full-width horizontal card, ideal between sections on landing.
 *  - "card":   compact card for dashboards (mobile-first, stacks nicely).
 *  - "strip":  slim inline strip, for tight spaces.
 *
 * Sponsors are read from an optional prop; when empty, a friendly
 * "seja um patrocinador" placeholder is shown that links to a mailto.
 */

export interface Sponsor {
  id: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  url?: string;
  accent?: string; // tailwind color token e.g. "orange"
}

interface SponsorSlotProps {
  variant?: "banner" | "card" | "strip";
  sponsors?: Sponsor[];
  label?: string;
  contactEmail?: string;
  className?: string;
}

const DEFAULT_CONTACT = "contato@midiaeco.com";

function SponsorEmpty({
  variant,
  contactEmail,
}: {
  variant: "banner" | "card" | "strip";
  contactEmail: string;
}) {
  const subject = encodeURIComponent("Quero patrocinar a IndicaAqui");
  const href = `mailto:${contactEmail}?subject=${subject}`;

  if (variant === "strip") {
    return (
      <a
        href={href}
        className="group flex items-center justify-between gap-3 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 px-3 py-2 text-[11px] font-semibold text-orange-800 hover:bg-orange-50 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Espaço disponível para patrocinadores</span>
        </span>
        <span className="shrink-0 text-orange-700 group-hover:underline">Anuncie aqui →</span>
      </a>
    );
  }

  if (variant === "card") {
    return (
      <a
        href={href}
        className="group block rounded-2xl border border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-white p-4 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-orange-700">
          <Sparkles className="w-3.5 h-3.5" /> Patrocínio
        </div>
        <p className="mt-2 font-display font-black text-slate-900 text-base leading-tight">
          Sua marca em destaque aqui.
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Alcance milhares de indicadores e anunciantes ativos na plataforma.
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-700 group-hover:underline">
          Quero patrocinar <ExternalLink className="w-3 h-3" />
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      className="group block overflow-hidden rounded-3xl border border-dashed border-orange-300 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 hover:shadow-lg transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white grid place-items-center shadow-md shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-700">
              Espaço patrocinado
            </div>
            <p className="font-display font-black text-slate-900 text-lg sm:text-xl leading-tight truncate">
              Sua marca em destaque na IndicaAqui
            </p>
          </div>
        </div>
        <div className="sm:ml-auto flex flex-col sm:items-end gap-1">
          <p className="text-xs text-slate-600 max-w-md sm:text-right">
            Conecte-se a uma rede de indicadores e anunciantes de alto valor em 13 verticais.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 group-hover:underline">
            Falar com o time <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
}

function SponsorCardItem({ sponsor }: { sponsor: Sponsor }) {
  const content = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.name}
            className="w-11 h-11 rounded-xl object-contain bg-white border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white grid place-items-center font-display font-black shrink-0">
            {sponsor.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Patrocinador
          </div>
          <p className="font-display font-bold text-slate-900 truncate">{sponsor.name}</p>
          {sponsor.tagline && (
            <p className="text-[11px] text-slate-500 truncate">{sponsor.tagline}</p>
          )}
        </div>
      </div>
    </>
  );

  const className =
    "block rounded-2xl border border-slate-200 bg-white p-3 hover:border-orange-300 hover:shadow-md transition-all";

  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noopener noreferrer sponsored" className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function SponsorSlot({
  variant = "card",
  sponsors,
  label,
  contactEmail = DEFAULT_CONTACT,
  className = "",
}: SponsorSlotProps) {
  const hasSponsors = sponsors && sponsors.length > 0;

  return (
    <section
      aria-label={label ?? "Espaço patrocinado"}
      className={`w-full ${className}`}
    >
      {label && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {label}
          </span>
          <span className="text-[10px] text-slate-400">Publicidade</span>
        </div>
      )}

      {!hasSponsors && <SponsorEmpty variant={variant} contactEmail={contactEmail} />}

      {hasSponsors && variant === "banner" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors!.map((s) => (
            <SponsorCardItem key={s.id} sponsor={s} />
          ))}
        </div>
      )}

      {hasSponsors && variant === "card" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {sponsors!.map((s) => (
            <SponsorCardItem key={s.id} sponsor={s} />
          ))}
        </div>
      )}

      {hasSponsors && variant === "strip" && (
        <div className="flex flex-wrap gap-2">
          {sponsors!.map((s) => (
            <a
              key={s.id}
              href={s.url ?? "#"}
              target={s.url ? "_blank" : undefined}
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-700"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              {s.name}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
