"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy, Trash2 } from "lucide-react";
import Button from "./Button";
import { formatDateTime, maskPhone, formatCurrency } from "@/lib/utils";
import { getPrizeTypeLabel, getWinnerPrizeValue } from "@/lib/prize-pool";
import CarModelText from "./CarModelText";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchWinners = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/winners", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWinners(data.winners);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const handleDelete = async (winner: WinnerRow) => {
    const confirmed = window.confirm(
      `${winner.receiptNumber} баримтын ялагчийг устгах уу? Шагналын үлдэгдэл сэргээгдэнэ.`
    );
    if (!confirmed) return;

    setError("");
    setDeletingId(winner._id);

    try {
      const res = await fetch(`/api/admin/winners/${winner._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Устгахад алдаа гарлаа");
        return;
      }

      setWinners((current) => current.filter((w) => w._id !== winner._id));
    } catch {
      setError("Устгахад алдаа гарлаа");
    } finally {
      setDeletingId(null);
    }
  };

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
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-danger/20 border border-danger/40 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gold/20">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="bg-coffee-brown/80 border-b border-gold/20">
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Азтаны утас
              </th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                И-Баримтын дугаар
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
              <th className="px-4 py-3 text-right text-cream/70 text-sm">
                Үйлдэл
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
                  {winner.prizeType === "car" ? (
                    <CarModelText className="text-sm text-cream" />
                  ) : winner.prizeAmount ? (
                    formatCurrency(winner.prizeAmount)
                  ) : (
                    getWinnerPrizeValue(winner)
                  )}
                </td>
                <td className="px-4 py-3 text-cream/50 text-sm">
                  {formatDateTime(winner.drawDate)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deletingId === winner._id}
                    disabled={deletingId !== null && deletingId !== winner._id}
                    onClick={() => handleDelete(winner)}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Устгах
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
