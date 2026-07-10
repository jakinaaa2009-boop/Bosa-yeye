import Link from "next/link";
import { Trophy } from "lucide-react";
import { connectDB } from "@/lib/db";
import Winner from "@/models/Winner";
import { maskPhone, formatWinnerDate, getWinnerDisplayName } from "@/lib/utils";
import { getWinnerPrizeDisplay } from "@/lib/prize-pool";
import Button from "./Button";
import WinnerCard, { getWinnerGridClass } from "./WinnerCard";

async function getLatestWinners() {
  try {
    await connectDB();
    const winners = await Winner.find()
      .populate("userId", "phone email")
      .sort({ drawDate: -1 })
      .limit(4);

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
    console.error("Winners section load error:", error);
    return [];
  }
}

export default async function WinnersSection() {
  const winners = await getLatestWinners();

  return (
    <section className="home-section py-20 lg:py-28 relative section-tint">
      <div className="absolute inset-0 bg-wine-red/15" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
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
          <div className={`${getWinnerGridClass(winners.length)} gap-6 mb-10`}>
            {winners.map((winner) => (
              <WinnerCard key={winner.id} winner={winner} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/winners">
            <Button variant="outline">Бүх ялагчдыг харах</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
