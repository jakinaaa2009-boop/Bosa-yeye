import SiteImage from "./SiteImage";
import { PRODUCT_GALLERY } from "@/lib/site-images";

export default function ProductShowcase() {
  return (
    <section className="py-16 lg:py-20 relative bg-coffee-brown/30">
      <div className="absolute inset-0 coffee-texture opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl text-gold-light font-bold">
            YE YE БҮТЭЭГДЭХҮҮН
          </h2>
          <p className="text-cream/60 mt-2 max-w-xl mx-auto">
            3 in 1 Instant Coffee Mix — Original болон Rich сонголтууд
          </p>
          <div className="w-20 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {PRODUCT_GALLERY.map((product) => (
            <div
              key={product.src}
              className="group bg-card-gradient rounded-2xl border border-gold/25 p-4 shadow-card hover:shadow-gold hover:border-gold/40 transition-all duration-300"
            >
              <div className="aspect-square relative rounded-xl overflow-hidden bg-coffee-dark/40 mb-3">
                <SiteImage
                  src={product.src}
                  alt={product.alt}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <p className="text-cream/70 text-xs sm:text-sm text-center font-medium">
                {product.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
