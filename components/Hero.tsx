import Link from "next/link";
import Button from "./Button";
import SiteImage from "./SiteImage";
import { SITE_IMAGES } from "@/lib/site-images";

const HERO_PRIZES = [
  { amount: "1,000,000₮", winners: "3 АЗТАН" },
  { amount: "500,000₮", winners: "6 АЗТАН" },
  { amount: "100,000₮", winners: "90 АЗТАН" },
] as const;

export default function Hero() {
  return (
    <section className="hero-banner relative min-h-[720px] overflow-x-clip overflow-y-visible pt-20 pb-4 lg:pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,11,8,0.55)_72%,#120B08_100%)] pointer-events-none z-[1]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,#F8EBC8_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none z-[1]" />

      <div className="relative z-[2] max-w-7xl mx-auto px-6 lg:px-10 pb-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center min-h-[560px] lg:min-h-[620px]">
          {/* Left content */}
          <div className="flex flex-col justify-center space-y-8 lg:pr-6 z-40">
            <h1 className="hero-headline">
              Танил YeYe,
              <br />
              Танд машин
              <br />
              бэлэглэнэ
            </h1>

            <p className="text-[#B8AEA3] text-lg leading-[1.6] max-w-[520px]">
              Баримтаа бүртгүүлээд супер азтан болон мөнгөн шагналын 100
              азтаны нэг болох боломжтой.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/upload-receipt" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-[18px] rounded-xl hover:shadow-[0_0_30px_rgba(214,168,79,0.45)] transition-shadow duration-300"
                >
                  Баримт бүртгүүлэх
                </Button>
              </Link>
              <Link href="/#prizes" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-[18px] rounded-xl bg-white/5 border-[#F8EBC8]/25 text-[#F8EBC8] hover:border-[#E5C76B] hover:bg-white/[0.08] transition-[border-color,background-color] duration-300"
                >
                  Шагналын сан харах
                </Button>
              </Link>
            </div>
          </div>

          {/* Right visual — car + coffee composite */}
          <div className="hero-showcase z-40">
            <div className="hero-showcase-stage">
              <SiteImage
                src={SITE_IMAGES.hero.showcase}
                alt="BAIC X55 болон YE YE 3 in 1 Instant Coffee Mix"
                fill
                priority
                className="hero-showcase-img"
                sizes="(max-width: 1024px) 90vw, 560px"
              />
            </div>
          </div>
        </div>

        {/* Cash prize summary — full-width strip below hero visual */}
        <div className="relative z-50 mt-10 lg:mt-0 lg:absolute lg:bottom-6 lg:left-1/2 lg:right-0 lg:px-10">
          <div className="hero-prize-strip">
            {HERO_PRIZES.map((prize) => (
              <div key={prize.amount} className="hero-prize-item">
                <p className="hero-prize-amount">{prize.amount}</p>
                <p className="hero-prize-winners">{prize.winners}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
