"use client";

import { PRIZE_POOL_TOTAL } from "@/lib/prize-pool";
import { SUPER_PRIZE } from "@/lib/site-content";
import CarModelText from "./CarModelText";

interface PrizeSummary {
  _id: string;
  name: string;
  type: "car" | "cash";
  carModel?: string;
  amount?: number;
  quantity: number;
  remainingQuantity: number;
}

interface PrizePoolSummaryProps {
  prizes: PrizeSummary[];
  totalWinners: number;
}

export default function AdminPrizePoolSummary({
  prizes,
  totalWinners,
}: PrizePoolSummaryProps) {
  const totalRemaining = prizes.reduce(
    (sum, p) => sum + p.remainingQuantity,
    0
  );

  return (
    <div className="bg-card-gradient rounded-2xl border border-gold/20 p-6">
      <h3 className="text-gold font-semibold mb-4">Шагналын сан</h3>

      <div className="space-y-3 mb-6">
        {prizes.map((prize) => {
          const exhausted = prize.remainingQuantity === 0;

          return (
            <div
              key={prize._id}
              className="flex items-center justify-between text-sm border-b border-gold/10 pb-2 last:border-0 gap-3"
            >
              <span className="text-cream/70">
                {prize.type === "car" ? (
                  <>
                    <CarModelText className="text-sm" />: {prize.quantity}-ээс{" "}
                    {prize.remainingQuantity} үлдсэн
                    <span className="block text-cream/45 text-xs mt-0.5">
                      {SUPER_PRIZE.subtext}
                    </span>
                  </>
                ) : prize.amount === 1_000_000 ? (
                  `1,000,000₮: ${prize.quantity}-аас ${prize.remainingQuantity} үлдсэн`
                ) : prize.amount === 500_000 ? (
                  `500,000₮: ${prize.quantity}-аас ${prize.remainingQuantity} үлдсэн`
                ) : prize.amount === 100_000 ? (
                  `100,000₮: ${prize.quantity}-ээс ${prize.remainingQuantity} үлдсэн`
                ) : (
                  `${prize.name}: ${prize.quantity}-аас ${prize.remainingQuantity} үлдсэн`
                )}
              </span>
              {exhausted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-danger/20 text-danger border border-danger/30">
                  Дууссан
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gold/20">
        <div>
          <p className="text-cream/50 text-xs">Нийт азтан</p>
          <p className="text-cream font-bold">{PRIZE_POOL_TOTAL.totalWinners}</p>
        </div>
        <div>
          <p className="text-cream/50 text-xs">Олгосон шагнал</p>
          <p className="text-gold font-bold">{totalWinners}</p>
        </div>
        <div>
          <p className="text-cream/50 text-xs">Үлдсэн шагнал</p>
          <p className="text-success font-bold">{totalRemaining}</p>
        </div>
      </div>
    </div>
  );
}
