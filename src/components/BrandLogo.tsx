interface BrandLogoProps {
  className?: string;
  variant?: "default" | "light";
}

/**
 * Logo oficial IndiqueLeads.
 *
 * O arquivo vive em `public/` e é servido pela própria aplicação. Antes ele
 * era carregado de `/__l5e/assets-v1/...` (CDN de assets do Lovable), que
 * passou a responder 404 depois da migração — o logo aparecia quebrado em
 * todas as telas.
 *
 * O PNG é transparente e a marca é navy+verde, então ele fica legível sobre
 * fundos claros. Sobre o canvas escuro use `variant="light"`, que aplica um
 * chip branco atrás para manter o contraste do wordmark navy.
 */
export function BrandLogo({ className = "h-9 w-auto", variant = "default" }: BrandLogoProps) {
  const img = (
    <img
      src="/indiqueleads-logo.png"
      alt="IndiqueLeads"
      className={className}
      draggable={false}
      /* dimensões reais do PNG — reserva o aspect-ratio e evita layout shift */
      width={633}
      height={328}
    />
  );

  if (variant === "light") {
    return (
      <span className="inline-flex items-center rounded-xl bg-white/95 px-2.5 py-1.5 shadow-sm ring-1 ring-white/20">
        {img}
      </span>
    );
  }

  return img;
}

export default BrandLogo;
