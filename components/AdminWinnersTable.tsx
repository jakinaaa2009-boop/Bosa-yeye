"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { formatDateTime, maskPhone, formatCurrency } from "@/lib/utils";
import { getPrizeTypeLabel, getWinnerPrizeValue } from "@/lib/prize-pool";

interface WinnerRow {
  _id: string;
  receiptNumber: string;
  prizeName: string;
  prizeType: "car" | "cash";
  prizeAmount?: number;
  carModel?: string;
  drawDate: string;
  userId: { phone: string; email: string };
}

export default function AdminWinnersTable() {
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/winners")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWinners(data.winners);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="text-center py-16 bg-card-gradient rounded-2xl border border-gold/20">
        <Trophy className="w-12 h-12 text-gold/30 mx-auto mb-4" />
        <p className="text-cream/50">Ялагч олдсонгүй</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gold/20">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-coffee-brown/80 border-b border-gold/20">
            <th className="px-4 py-3 text-left text-cream/70 text-sm">
              Азтаны утас
            </th>
            <th className="px-4 py-3 text-left text-cream/70 text-sm">
              Баримтын дугаар
            </th>
            <th className="px-4 py-3 text-left text-cream/70 text-sm">
              Шагналын нэр
            </th>
            <th className="px-4 py-3 text-left text-cream/70 text-sm">
              Шагналын төрөл
            </th>
            <th className="px-4 py-3 text-left text-cream/70 text-sm">
              Шагналын дүн / Машины загвар
            </th>
            <th className="px-4 py-3 text-left text-cream/70 text-sm">
              Сугалааны огноо
            </th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner) => (
            <tr
              key={winner._id}
              className="border-b border-gold/10 hover:bg-gold/5"
            >
              <td className="px-4 py-3 text-cream/70 text-sm">
                {maskPhone(winner.userId?.phone || "")}
              </td>
              <td className="px-4 py-3 text-cream text-sm">
                {winner.receiptNumber}
              </td>
              <td className="px-4 py-3 text-gold text-sm font-medium">
                {winner.prizeName}
              </td>
              <td className="px-4 py-3 text-cream/60 text-sm">
                {getPrizeTypeLabel(winner.prizeType)}
              </td>
              <td className="px-4 py-3 text-cream text-sm">
                {winner.prizeType === "car"
                  ? winner.carModel || "BAIC X55"
                  : winner.prizeAmount
                    ? formatCurrency(winner.prizeAmount)
                    : getWinnerPrizeValue(winner)}
              </td>
              <td className="px-4 py-3 text-cream/50 text-sm">
                {formatDateTime(winner.drawDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
