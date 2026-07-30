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

interface ApiWinner {
  _id: string;
  phone: string;
  email: string;
  prizeName: string;
  prizeType: "car" | "cash";
  prizeAmount?: number;
  carModel?: string;
  drawDate: string;
}

function mapWinner(w: ApiWinner): WinnerCardData {
  const prize = getWinnerPrizeDisplay({
    prizeName: w.prizeName,
    prizeType: w.prizeType,
    prizeAmount: w.prizeAmount,
    carModel: w.carModel,
  });

  return {
    id: w._id,
    displayName: getWinnerDisplayName(w.phone, w.email),
    phone: maskPhone(w.phone),
    prizeTitle: prize.title,
    prizeSubtitle: prize.subtitle,
    prizeType: w.prizeType,
    drawDate: formatWinnerDate(w.drawDate),
  };
}

export default function WinnersSection() {
  const [winners, setWinners] = useState<WinnerCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/winners?limit=4", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        setWinners((data.winners as ApiWinner[]).map(mapWinner));
      })
      .catch((error) => {
        console.error("Winners section load error:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-cream/50 text-lg">Ачааллаж байна...</p>
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
