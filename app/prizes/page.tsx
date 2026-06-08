import { DollarSign, Trophy, Users } from "lucide-react";
import SiteImage from "@/components/SiteImage";
import ProductShowcase from "@/components/ProductShowcase";
import CarModelText from "@/components/CarModelText";
import ParticipationRules from "@/components/ParticipationRules";
import {
  PRIZE_POOL_TOTAL,
  PRIZE_TABLE_ROWS,
} from "@/lib/prize-pool";
import { SUPER_PRIZE } from "@/lib/site-content";
import { SITE_IMAGES } from "@/lib/site-images";
import { formatCurrency } from "@/lib/utils";

export default function PrizesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl text-gold-light font-bold">
            Шагналын сан
          </h1>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
        </div>

        <div className="mb-10">
          <ParticipationRules />
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-gold/40 shadow-gold-lg mb-10 aspect-[21/9] min-h-[180px]">
          <SiteImage
            src={SITE_IMAGES.car.banner}
            alt={`${SUPER_PRIZE.model} супер шагнал`}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-coffee-dark/90 via-coffee-dark/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
            <p className="text-gold text-sm font-bold tracking-widest uppercase">
              {SUPER_PRIZE.badge}
            </p>
            <p className="text-gold text-sm font-bold tracking-widest uppercase mt-1">
              {SUPER_PRIZE.title}
            </p>
            <h2 className="mt-2">
              <CarModelText className="text-2xl sm:text-4xl text-cream" />
            </h2>
            <p className="text-cream/80 text-sm sm:text-base mt-2 max-w-md leading-relaxed">
              {SUPER_PRIZE.subtext}
            </p>
            <p className="text-gold-light text-base sm:text-lg mt-3">
              + {formatCurrency(PRIZE_POOL_TOTAL.cashPoolAmount)} мөнгөн шагнал
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-card-gradient rounded-2xl border border-gold/30 p-5 flex items-center gap-4">
            <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-gold/30">
              <SiteImage
                src={SITE_IMAGES.car.main}
                alt={SUPER_PRIZE.model}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <p className="text-cream/50 text-xs">{SUPER_PRIZE.badge}</p>
              <CarModelText className="text-cream text-base" />
              <p className="text-cream/55 text-xs mt-1 leading-snug">
                {SUPER_PRIZE.subtext}
              </p>
            </div>
          </div>
          <div className="bg-card-gradient rounded-2xl border border-gold/30 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-cream/50 text-xs">Мөнгөн шагналын сан</p>
              <p className="text-gold-light font-bold">
                {formatCurrency(PRIZE_POOL_TOTAL.cashPoolAmount)}
              </p>
            </div>
          </div>
          <div className="bg-card-gradient rounded-2xl border border-gold/30 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-cream/50 text-xs">Нийт азтан</p>
              <p className="text-cream font-bold">
                {PRIZE_POOL_TOTAL.totalWinners}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gold/20 mb-8">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-coffee-brown/80 border-b border-gold/20">
                <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                  Шагнал
                </th>
                <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                  Азтаны тоо
                </th>
                <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                  Нэг азтанд олгох шагнал
                </th>
                <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                  Нийт
                </th>
              </tr>
            </thead>
            <tbody>
              {PRIZE_TABLE_ROWS.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-gold/10 hover:bg-gold/5 transition-colors"
                >
                  <td className="px-4 py-4 text-cream font-medium text-sm">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-cream/70 text-sm">
                    {row.winners}
                  </td>
                  <td className="px-4 py-4 text-gold text-sm">
                    {row.name === "Супер азтан" ? (
                      <CarModelText />
                    ) : (
                      row.perWinner
                    )}
                  </td>
                  <td className="px-4 py-4 text-gold-light font-semibold text-sm">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-r from-wine-red/40 to-deep-red/40 rounded-2xl border border-gold/40 p-6 text-center mb-16">
          <Trophy className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="text-cream font-display text-lg font-bold flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>Нийт:</span>
            <CarModelText className="text-lg text-cream" />
            <span>автомашин +</span>
            <span>{formatCurrency(PRIZE_POOL_TOTAL.cashPoolAmount)} мөнгөн шагнал</span>
          </p>
        </div>
      </div>

      <ProductShowcase />
    </div>
  );
}
