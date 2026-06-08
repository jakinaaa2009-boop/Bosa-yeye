import Link from "next/link";
import Button from "./Button";
import SiteImage from "./SiteImage";
import CarModelText from "./CarModelText";
import ParticipationRules from "./ParticipationRules";
import { PRIZE_POOL_TOTAL } from "@/lib/prize-pool";
import { SUPER_PRIZE } from "@/lib/site-content";
import { SITE_IMAGES } from "@/lib/site-images";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.06] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-deep-red/[0.08] rounded-full blur-3xl" />
      <div className="absolute top-[18%] right-[12%] w-24 h-48 bg-cream/[0.03] rounded-full blur-2xl rotate-12" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-cream">YE YE кофе худалдан авч,</span>
              <br />
              <span className="text-gold-light inline-flex flex-wrap items-baseline gap-x-2">
                <CarModelText className="text-4xl sm:text-5xl lg:text-6xl text-gold-light" />
                <span className="whitespace-normal">автомашины эзэн болоорой!</span>
              </span>
            </h1>

            <p className="text-cream/70 text-lg leading-relaxed max-w-lg">
              {SUPER_PRIZE.subtext}. Мөн нийт{" "}
              {PRIZE_POOL_TOTAL.totalWinners} азтаны нэг болох боломжтой.
            </p>

            <ParticipationRules className="max-w-2xl" />

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/upload-receipt">
                <Button size="lg" className="w-full sm:w-auto">
                  Баримт бүртгүүлэх
                </Button>
              </Link>
              <Link href="/prizes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Шагналын сан харах
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative space-y-4">
            <div className="relative bg-card-gradient rounded-2xl border border-gold/35 shadow-gold-lg p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
              <div className="relative aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-coffee-brown/30">
                <SiteImage
                  src={SITE_IMAGES.products.coffee2}
                  alt="YE YE 3 in 1 Instant Coffee Mix"
                  fill
                  className="object-contain p-4"
                  priority
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-wine-red/90 to-deep-red/90 rounded-2xl border border-gold/40 shadow-gold p-5 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold mb-3">
                {SUPER_PRIZE.badge}
              </span>
              <p className="text-gold text-sm font-bold tracking-widest uppercase">
                {SUPER_PRIZE.title}
              </p>
              <p className="mt-2">
                <CarModelText className="text-2xl sm:text-3xl text-cream" />
              </p>
              <p className="text-cream/75 text-sm mt-2 leading-relaxed">
                {SUPER_PRIZE.subtext}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
