import { Sparkles } from "lucide-react";
import SiteImage from "./SiteImage";
import CarModelText from "./CarModelText";
import { PRIZE_POOL_DISPLAY, PRIZE_POOL_TOTAL } from "@/lib/prize-pool";
import { SITE_IMAGES } from "@/lib/site-images";
import { formatCurrency } from "@/lib/utils";

export default function PrizeSection() {
  const [superPrize, ...cashPrizes] = PRIZE_POOL_DISPLAY;

  return (
    <section id="prizes" className="home-section py-20 lg:py-28 relative section-tint">
      <div className="absolute inset-0 bg-hero-gradient opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-light">
            ШАГНАЛЫН САН
          </h2>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
          <p className="text-cream/70 text-base sm:text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
            YE YE кофе худалдан авч баримтаа бүртгүүлээд{" "}
            <CarModelText className="text-gold-light text-base sm:text-lg" />{" "}
            болон {formatCurrency(PRIZE_POOL_TOTAL.cashPoolAmount)}-ийн
            мөнгөн шагналын эзэн болоорой.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-wine-red via-deep-red to-coffee-brown rounded-2xl border-2 border-gold/50 shadow-gold-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full" />
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
              <h3 className="mt-1">
                <CarModelText className="text-2xl text-cream" />
              </h3>
              <p className="text-cream/70 text-sm mt-2 leading-relaxed">
                {superPrize.description}
              </p>
            </div>
          </div>

          {cashPrizes.map((prize) => {
            const imageSrc =
              "imageKey" in prize
                ? SITE_IMAGES.cashPrizes[
                    prize.imageKey as keyof typeof SITE_IMAGES.cashPrizes
                  ]
                : null;

            return (
              <div
                key={prize.title}
                className="bg-card-gradient rounded-2xl border border-gold/30 shadow-card hover:shadow-gold transition-shadow duration-300 overflow-hidden"
              >
                {imageSrc && (
                  <div className="relative aspect-[4/3] w-full bg-coffee-dark/40">
                    <SiteImage
                      src={imageSrc}
                      alt={`${prize.title} шагнал`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 50vw, 280px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark/80 via-transparent to-transparent" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-gold-light text-2xl font-bold">
                    {prize.title}
                  </p>
                  <p className="text-cream font-semibold mt-2">{prize.prize}</p>
                  <p className="text-cream/50 text-sm mt-2">
                    {prize.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
