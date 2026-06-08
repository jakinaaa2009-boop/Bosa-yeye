import SiteImage from "./SiteImage";
import { SITE_IMAGES } from "@/lib/site-images";
import { cn } from "@/lib/utils";

type LogoVariant = "yeye" | "bosa";

const LOGO_META: Record<
  LogoVariant,
  { src: string; alt: string; width: number; height: number }
> = {
  yeye: {
    src: SITE_IMAGES.logos.yeye,
    alt: "YE YE Coffee",
    width: 140,
    height: 110,
  },
  bosa: {
    src: SITE_IMAGES.logos.bosa,
    alt: "BOSA IMPEX",
    width: 180,
    height: 48,
  },
};

interface SiteLogoProps {
  variant: LogoVariant;
  className?: string;
  priority?: boolean;
}

export default function SiteLogo({
  variant,
  className,
  priority = false,
}: SiteLogoProps) {
  const { src, alt, width, height } = LOGO_META[variant];

  return (
    <SiteImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
