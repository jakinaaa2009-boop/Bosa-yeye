"use client";

import { Trophy } from "lucide-react";
import Button from "./Button";
import { maskPhone } from "@/lib/utils";
import { getPrizeTypeLabel, getWinnerPrizeValue } from "@/lib/prize-pool";

interface WinnerData {
  receiptNumber: string;
  prizeName: string;
  prizeType: "car" | "cash";
  prizeAmount?: number;
  carModel?: string;
  user: {
    phone: string;
    email: string;
  };
}

interface WinnerPopupProps {
  winner: WinnerData;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WinnerPopup({
  winner,
  onClose,
  onConfirm,
}: WinnerPopupProps) {
  const prizeValue = getWinnerPrizeValue(winner);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-gradient-to-br from-wine-red via-deep-red to-coffee-brown rounded-2xl border-2 border-gold/50 shadow-gold-lg p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,79,0.3),transparent_60%)] rounded-2xl" />

        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-6 shadow-gold-lg">
            <Trophy className="w-10 h-10 text-coffee-dark" />
          </div>

          <h2 className="font-display text-3xl text-gold-light font-bold mb-2">
            БАЯР ХҮРГЭЕ!
          </h2>
          <p className="text-cream/80 text-lg mb-8">Азтан тодорлоо</p>

          <div className="bg-coffee-dark/50 rounded-xl border border-gold/30 p-6 mb-8 space-y-3 text-left">
            <div>
              <p className="text-cream/50 text-xs">Баримтын дугаар</p>
              <p className="text-cream font-bold text-lg">
                {winner.receiptNumber}
              </p>
            </div>
            <div>
              <p className="text-cream/50 text-xs">Хэрэглэгчийн утас</p>
              <p className="text-cream">{maskPhone(winner.user.phone)}</p>
            </div>
            <div>
              <p className="text-cream/50 text-xs">Шагналын нэр</p>
              <p className="text-gold-light font-bold text-xl">
                {winner.prizeName}
              </p>
            </div>
            <div>
              <p className="text-cream/50 text-xs">Шагналын төрөл</p>
              <p className="text-cream">{getPrizeTypeLabel(winner.prizeType)}</p>
            </div>
            <div>
              <p className="text-cream/50 text-xs">
                {winner.prizeType === "car" ? "Машины загвар" : "Шагналын дүн"}
              </p>
              <p className="text-gold font-bold text-lg">{prizeValue}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onConfirm} className="flex-1">
              Баталгаажуулах
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Хаах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
