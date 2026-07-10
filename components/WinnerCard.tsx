import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WinnerCardData {
  id: string;
  displayName: string;
  phone: string;
  prizeTitle: string;
  prizeSubtitle?: string;
  prizeType: "car" | "cash";
  drawDate: string;
}

export function getWinnerGridClass(count: number): string {
  if (count <= 1) {
    return "grid grid-cols-1 max-w-sm mx-auto";
  }
  if (count === 2) {
    return "grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
  }
  if (count === 3) {
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto";
  }
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

interface WinnerCardProps {
  winner: WinnerCardData;
  compact?: boolean;
}

export default function WinnerCard({ winner, compact = false }: WinnerCardProps) {
  return (
    <article
      className={cn(
        "bg-card-gradient rounded-2xl border border-gold/30 shadow-card",
        "hover:shadow-gold hover:border-gold/50 transition-all duration-300",
        "flex flex-col items-center text-center",
        compact ? "p-5" : "p-6 sm:p-7"
      )}
    >
      <div
        className={cn(
          "rounded-full bg-gold-gradient flex items-center justify-center shadow-gold mb-4",
          compact ? "w-12 h-12" : "w-14 h-14"
        )}
      >
        <Trophy
          className={cn("text-coffee-dark", compact ? "w-6 h-6" : "w-7 h-7")}
        />
      </div>

      <h3 className="text-cream font-semibold text-lg leading-tight">
        {winner.displayName}
      </h3>
      <p className="text-cream/55 text-sm mt-1">{winner.phone}</p>
      <p className="text-cream/40 text-xs mt-1">{winner.drawDate}</p>

      <div className="w-full mt-5 pt-4 border-t border-gold/15">
        <p
          className={cn(
            "font-semibold",
            winner.prizeType === "car"
              ? "car-model-text text-gold-light text-lg"
              : "text-gold-light text-base"
          )}
        >
          {winner.prizeTitle}
        </p>
        {winner.prizeSubtitle && (
          <p className="text-gold/80 text-sm mt-1">{winner.prizeSubtitle}</p>
        )}
      </div>
    </article>
  );
}
