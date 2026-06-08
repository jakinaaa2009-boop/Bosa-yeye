import Link from "next/link";
import { Trophy } from "lucide-react";
import { connectDB } from "@/lib/db";
import Winner from "@/models/Winner";
import {
  maskPhone,
  formatDate,
} from "@/lib/utils";
import { getWinnerPrizeValue } from "@/lib/prize-pool";
import Button from "./Button";

async function getLatestWinners() {
  try {
    await connectDB();
    const winners = await Winner.find()
      .populate("userId", "phone email")
      .sort({ drawDate: -1 })
      .limit(4);

    return winners.map((w) => {
      const user = w.userId as unknown as { phone: string; email: string };
      return {
        id: w._id.toString(),
        phone: maskPhone(user?.phone || ""),
        prizeName: w.prizeName,
        prizeType: w.prizeType as "car" | "cash",
        prizeValue: getWinnerPrizeValue({
          prizeType: w.prizeType as "car" | "cash",
          prizeAmount: w.prizeAmount,
          carModel: w.carModel,
        }),
        drawDate: formatDate(w.drawDate),
      };
    });
  } catch {
    return [];
  }
}

export default async function WinnersSection() {
  const winners = await getLatestWinners();

  return (
    <section className="py-20 lg:py-28 relative section-tint">
      <div className="absolute inset-0 bg-wine-red/15" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-light">
            СҮҮЛИЙН АЗТАНУУД
          </h2>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className="text-cream/50 text-lg">
              Одоогоор ялагч тодорхойлогдоогүй байна
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="bg-card-gradient rounded-2xl border border-gold/30 p-6 shadow-card hover:shadow-gold transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-coffee-dark" />
                  </div>
                  <div>
                    <p className="text-cream font-semibold">{winner.phone}</p>
                    <p className="text-cream/40 text-xs mt-0.5">{winner.drawDate}</p>
                  </div>
                </div>
                <p className="text-gold font-medium text-sm">{winner.prizeName}</p>
                <p
                  className={
                    winner.prizeType === "car"
                      ? "car-model-text text-gold-light text-sm mt-1"
                      : "text-gold-light text-sm font-semibold mt-1"
                  }
                >
                  {winner.prizeValue}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/winners">
            <Button variant="outline">Бүх ялагчдыг харах</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
