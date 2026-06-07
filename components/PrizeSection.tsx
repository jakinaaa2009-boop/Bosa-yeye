import { DollarSign, Sparkles } from "lucide-react";
import SiteImage from "./SiteImage";
import { PRIZE_POOL_DISPLAY, PRIZE_POOL_TOTAL } from "@/lib/prize-pool";
import { SITE_IMAGES } from "@/lib/site-images";
import { formatCurrency } from "@/lib/utils";

export default function PrizeSection() {
  const [superPrize, ...cashPrizes] = PRIZE_POOL_DISPLAY;

  return (
    <section id="prizes" className="py-20 lg:py-28 relative bg-coffee-dark">
      <div className="absolute inset-0 coffee-texture opacity-30" />
      <div className="absolute inset-0 bg-hero-gradient opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-light">
            ШАГНАЛЫН САН
          </h2>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
          <p className="text-cream/70 text-base sm:text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
            YE YE кофе худалдан авч баримтаа бүртгүүлээд BAIC X55 автомашин
            болон нийт {formatCurrency(PRIZE_POOL_TOTAL.cashPoolAmount)}-ийн
            мөнгөн шагналын эзэн болоорой.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-wine-red via-deep-red to-coffee-brown rounded-2xl border-2 border-gold/50 shadow-gold-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
            <div className="relative aspect-[4/3] w-full">
              <SiteImage
                src={SITE_IMAGES.car.alternate}
                alt={`${superPrize.prize} супер шагнал`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 50vw, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark via-coffee-dark/40 to-transparent" />
            </div>
            <div className="relative p-6 -mt-8">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold mb-3">
                <Sparkles className="w-3 h-3" />
                {superPrize.badge}
              </span>
              <p className="text-gold text-sm font-bold tracking-wider uppercase">
                {superPrize.title}
              </p>
              <h3 className="font-display text-2xl text-cream font-bold mt-1">
                {superPrize.prize}
              </h3>
              <p className="text-cream/60 text-sm mt-2">{superPrize.description}</p>
            </div>
          </div>

          {cashPrizes.map((prize) => (
            <div
              key={prize.title}
              className="bg-card-gradient rounded-2xl border border-gold/30 p-6 shadow-card hover:shadow-gold transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mb-4">
                <DollarSign className="w-7 h-7 text-gold" />
              </div>
              <p className="text-gold-light text-2xl font-bold">{prize.title}</p>
              <p className="text-cream font-semibold mt-2">{prize.prize}</p>
              <p className="text-cream/50 text-sm mt-2">{prize.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
