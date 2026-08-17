import { MapPin, Share2 } from "lucide-react";

import type { Product } from "@/types";
import { verticalBadge } from "@/lib/verticals";

/**
 * Cartão de produto para a grade de dois por linha no celular.
 *
 * Em 375px cada cartão tem cerca de 170px. Isso obriga a escolher: aqui ficam
 * só imagem, título, preço e a comissão. O detalhamento por faixa (digital e
 * presencial) e a descrição saíram para a tela do anúncio — informação
 * espremida em 170px não é lida, só polui.
 *
 * A comissão ganha o maior destaque depois da foto. É o número que faz o
 * indicador escolher um anúncio em vez de outro; o preço do bem interessa ao
 * comprador, não a ele.
 */
export default function ProductCardCompact({
  product,
  onOpen,
  onShare,
}: {
  product: Product;
  onOpen?: () => void;
  onShare: () => void;
}) {
  const comissao = Math.max(
    product.commissionDigitalValue || 0,
    product.allowPresencialTier ? product.commissionPresencialValue || 0 : 0,
    product.commissionLeadValue || 0,
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow active:shadow-md">
      <button
        onClick={onOpen}
        disabled={!onOpen}
        aria-label={`Ver ${product.title}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-900 disabled:cursor-default"
      >
        <img
          src={product.coverImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <span className="absolute left-2 top-2 rounded-lg bg-slate-950/75 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-white backdrop-blur-sm">
          {verticalBadge(product.category)}
        </span>

        {product.status === "reservado" && (
          <span className="absolute inset-0 grid place-items-center bg-slate-950/60">
            <span className="rounded-full bg-amber-600 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-white">
              Reservado
            </span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 font-display text-[13px] font-bold leading-tight text-slate-900">
          {product.title}
        </h3>

        <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
          <MapPin className="h-2.5 w-2.5 shrink-0 text-slate-400" />
          <span className="truncate">
            {product.location.city}/{product.location.state}
          </span>
        </span>

        <span className="mt-2 block font-mono text-[11px] text-slate-500">
          R$ {product.price.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </span>

        <div className="mt-auto pt-2">
          <span className="block rounded-lg bg-brand-500/10 px-2 py-1.5 text-center">
            <span className="block text-[8px] font-bold uppercase leading-none tracking-wider text-brand-600/70">
              Você recebe até
            </span>
            <span className="mt-0.5 block font-mono text-sm font-black leading-none text-brand-600">
              R$ {comissao.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>
          </span>

          <button
            onClick={onShare}
            className="mt-2 flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-sea-700 text-[11px] font-bold text-white transition-colors active:bg-sea-600"
          >
            <Share2 className="h-3.5 w-3.5" />
            Indicar
          </button>
        </div>
      </div>
    </article>
  );
}
