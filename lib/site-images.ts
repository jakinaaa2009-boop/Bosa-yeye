export function encodeImagePath(path: string): string {
  const lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return encodeURIComponent(path);
  return path.slice(0, lastSlash + 1) + encodeURIComponent(path.slice(lastSlash + 1));
}

export const SITE_IMAGES = {
  logos: {
    yeye: "/images/logo3.png",
    bosa: "/images/logo4.png",
    yeyeProduct: "/images/logo2.png",
    bosaLegacy: "/images/logo1.png",
  },
  car: {
    main: "/images/baic.png",
    alternate: "/images/baic 1.png",
    banner: "/images/b2.png",
  },
  products: {
    coffee1: "/images/Coffee1.png",
    coffee2: "/images/Coffee2.png",
    coffee3: "/images/Coffee3.png",
  },
  cashPrizes: {
    oneMillion: "/images/1,000,000.jpg",
    fiveHundredThousand: "/images/500,000.jpg",
    oneHundredThousand: "/images/100,000.jpg",
  },
  hero: {
    product: "/images/Coffee2.png",
    car: "/images/baic.png",
  },
} as const;

export const PRODUCT_GALLERY = [
  {
    src: SITE_IMAGES.products.coffee3,
    alt: "YE YE Original Sachet — урд тал",
    label: "YE YE Original Sachet",
  },
  {
    src: SITE_IMAGES.products.coffee1,
    alt: "YE YE Rich 45s Sachet — урд тал",
    label: "YE YE Rich 45s",
  },
  {
    src: SITE_IMAGES.products.coffee2,
    alt: "YE YE Original 50s — урд тал",
    label: "YE YE Original 50s",
  },
] as const;
