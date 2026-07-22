import logoAsset from "@/assets/indiqueleads-logo.png.asset.json";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "light";
}

/**
 * Official IndiqueLeads logo. The PNG is transparent, so it works on both
 * light and dark backgrounds. `variant="light"` wraps it in a subtle white
 * chip so the navy wordmark stays readable over dark hero gradients.
 */
export function BrandLogo({ className = "h-9 w-auto", variant = "default" }: BrandLogoProps) {
  const img = (
    <img
      src={logoAsset.url}
      alt="IndiqueLeads"
      className={className}
      draggable={false}
    />
  );

  if (variant === "light") {
    return (
      <span className="inline-flex items-center bg-white/95 rounded-lg px-2 py-1 shadow-sm">
        {img}
      </span>
    );
  }

  return img;
}

export default BrandLogo;
