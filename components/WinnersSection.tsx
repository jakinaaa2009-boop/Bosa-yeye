"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { maskPhone, formatWinnerDate, getWinnerDisplayName } from "@/lib/utils";
import { getWinnerPrizeDisplay } from "@/lib/prize-pool";
import Button from "./Button";
import WinnerCard, {
  getWinnerGridClass,
  type WinnerCardData,
} from "./WinnerCard";

export default function WinnersSection() {
  const [winners, setWinners] = useState<WinnerCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/winners", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;

        const cards = (data.winners || []).slice(0, 4).map(
          (w: {
            _id: string;
            phone?: string;
            email?: string;
            prizeName: string;
            prizeType: "car" | "cash";
            prizeAmount?: number;
            carModel?: string;
            drawDate: string;
          }) => {
            const prize = getWinnerPrizeDisplay(w);
            return {
              id: w._id,
              displayName: getWinnerDisplayName(w.phone || "", w.email),
              phone: maskPhone(w.phone || ""),
              prizeTitle: prize.title,
              prizeSubtitle: prize.subtitle,
              prizeType: w.prizeType,
              drawDate: formatWinnerDate(w.drawDate),
            };
          }
        );

        setWinners(cards);
      })
      .catch(() => setWinners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 lg:py-28 relative section-tint">
      <div className="absolute inset-0 bg-wine-red/15" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-light">
            СҮҮЛИЙН АЗТАНУУД
          </h2>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
        </div>

        {loading ? (
          <div className={`${getWinnerGridClass(4)} gap-6 mb-10`}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card-gradient rounded-2xl border border-gold/20 p-6 animate-pulse h-52"
              />
            ))}
          </div>
        ) : winners.length === 0 ? (
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
