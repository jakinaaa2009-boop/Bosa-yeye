import Link from "next/link";
import Button from "./Button";
import SiteImage from "./SiteImage";
import { PRIZE_POOL_TOTAL } from "@/lib/prize-pool";
import { SITE_IMAGES } from "@/lib/site-images";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-coffee-dark" />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 coffee-texture opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-deep-red/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-cream">YE YE кофе худалдан авч,</span>
              <br />
              <span className="text-gold-light">
                {PRIZE_POOL_TOTAL.carModel} автомашины эзэн болоорой!
              </span>
            </h1>

            <p className="text-cream/70 text-lg leading-relaxed max-w-lg">
              Баримтаа бүртгүүлээд супер азтан болон мөнгөн шагналын{" "}
              {PRIZE_POOL_TOTAL.totalWinners} азтаны нэг болох боломжтой.
            </p>

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

          <div className="relative">
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
          </div>
        </div>
      </div>
    </section>
  );
}
