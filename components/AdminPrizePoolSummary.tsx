"use client";

import { PRIZE_POOL_TOTAL } from "@/lib/prize-pool";

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
          let label = "";
          if (prize.type === "car") {
            label = `${prize.carModel || "BAIC X55"}: ${prize.quantity}-ээс ${prize.remainingQuantity} үлдсэн`;
          } else if (prize.amount === 1_000_000) {
            label = `1,000,000₮: ${prize.quantity}-аас ${prize.remainingQuantity} үлдсэн`;
          } else if (prize.amount === 500_000) {
            label = `500,000₮: ${prize.quantity}-аас ${prize.remainingQuantity} үлдсэн`;
          } else if (prize.amount === 100_000) {
            label = `100,000₮: ${prize.quantity}-ээс ${prize.remainingQuantity} үлдсэн`;
          } else {
            label = `${prize.name}: ${prize.quantity}-аас ${prize.remainingQuantity} үлдсэн`;
          }

          return (
            <div
              key={prize._id}
              className="flex items-center justify-between text-sm border-b border-gold/10 pb-2 last:border-0"
            >
              <span className="text-cream/70">{label}</span>
              {prize.remainingQuantity === 0 && (
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
