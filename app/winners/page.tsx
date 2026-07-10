import { connectDB } from "@/lib/db";
import Winner from "@/models/Winner";
import { Trophy } from "lucide-react";
import { maskPhone, formatWinnerDate, getWinnerDisplayName } from "@/lib/utils";
import { getWinnerPrizeDisplay } from "@/lib/prize-pool";
import WinnerCard, { getWinnerGridClass } from "@/components/WinnerCard";

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
      const prize = getWinnerPrizeDisplay({
        prizeName: w.prizeName,
        prizeType: w.prizeType as "car" | "cash",
        prizeAmount: w.prizeAmount,
        carModel: w.carModel,
      });

      return {
        id: w._id.toString(),
        displayName: getWinnerDisplayName(phone, email),
        phone: maskPhone(phone),
        prizeTitle: prize.title,
        prizeSubtitle: prize.subtitle,
        prizeType: w.prizeType as "car" | "cash",
        drawDate: formatWinnerDate(w.drawDate),
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
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl sm:text-4xl text-gold-light font-bold">
            ЯЛАГЧИД
          </h1>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
        </div>

        {winners.length === 0 ? (
          <div className="text-center py-20 bg-card-gradient rounded-2xl border border-gold/20 max-w-lg mx-auto">
            <Trophy className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className="text-cream/50 text-lg">
              Одоогоор ялагч тодорхойлогдоогүй байна
            </p>
          </div>
        ) : (
          <div className={`${getWinnerGridClass(winners.length)} gap-6`}>
            {winners.map((winner) => (
              <WinnerCard key={winner.id} winner={winner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
