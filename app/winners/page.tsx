import { connectDB } from "@/lib/db";
import Winner from "@/models/Winner";
import { Trophy } from "lucide-react";
import { maskPhone, formatDate, getWinnerDisplayName } from "@/lib/utils";
import { getWinnerPrizeValue } from "@/lib/prize-pool";

export const dynamic = "force-dynamic";

async function getWinners() {
  try {
    await connectDB();
    const winners = await Winner.find()
      .populate("userId", "phone email")
      .sort({ drawDate: -1 });

    return winners.map((w) => {
      const user = w.userId as unknown as { phone: string; email: string };
      const phone = user?.phone || "";
      const email = user?.email || "";
      return {
        id: w._id.toString(),
        displayName: getWinnerDisplayName(phone, email),
        phone: maskPhone(phone),
        prizeName: w.prizeName,
        prizeType: w.prizeType as "car" | "cash",
        prizeAmount: w.prizeAmount,
        carModel: w.carModel,
        prizeValue: getWinnerPrizeValue({
          prizeType: w.prizeType as "car" | "cash",
          prizeAmount: w.prizeAmount,
          carModel: w.carModel,
        }),
        drawDate: formatDate(w.drawDate),
      };
    });
  } catch (error) {
    console.error("Winners page load error:", error);
    return [];
  }
}

export default async function WinnersPage() {
  const winners = await getWinners();

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl sm:text-4xl text-gold-light font-bold">
            ЯЛАГЧИД
          </h1>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-20 bg-card-gradient rounded-2xl border border-gold/20">
            <Trophy className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className="text-cream/50 text-lg">
              Одоогоор ялагч тодорхойлогдоогүй байна
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="bg-card-gradient rounded-2xl border border-gold/30 p-6 shadow-card hover:shadow-gold transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-coffee-dark" />
                  </div>
                  <div>
                    <p className="text-cream font-semibold">{winner.displayName}</p>
                    <p className="text-cream/50 text-xs">{winner.phone}</p>
                    <p className="text-cream/40 text-xs">{winner.drawDate}</p>
                  </div>
                </div>
                <p className="text-gold font-medium">{winner.prizeName}</p>
                <p
                  className={
                    winner.prizeType === "car"
                      ? "car-model-text text-gold-light font-bold mt-1"
                      : "text-gold-light font-bold mt-1"
                  }
                >
                  {winner.prizeValue}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
