"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "./Button";
import WinnerPopup from "./WinnerPopup";

const SEGMENT_COLORS = [
  "#5B2428",
  "#3A1717",
  "#7B1E22",
  "#1A0E0A",
  "#5B2428",
  "#3A1717",
  "#7B1E22",
  "#1A0E0A",
];

interface PrizeOption {
  _id: string;
  name: string;
  type: "car" | "cash";
  amount?: number;
  carModel?: string;
  quantity: number;
  remainingQuantity: number;
}

interface WinnerResult {
  receiptNumber: string;
  prizeName: string;
  prizeType: "car" | "cash";
  prizeAmount?: number;
  carModel?: string;
  user: { phone: string; email: string };
  receiptIndex: number;
  totalEligible: number;
  eligibleReceipts: string[];
}

function getPrizeDropdownLabel(prize: PrizeOption): string {
  if (prize.type === "car") {
    return `Супер азтан — ${prize.carModel || "BAIC X55"} — Үлдсэн: ${prize.remainingQuantity}`;
  }
  return `${prize.name} — Үлдсэн: ${prize.remainingQuantity}`;
}

export default function LuckyWheel() {
  const [eligibleCount, setEligibleCount] = useState(0);
  const [segments, setSegments] = useState<string[]>([]);
  const [prizes, setPrizes] = useState<PrizeOption[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState("");
  const [allPrizesExhausted, setAllPrizesExhausted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WinnerResult | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    fetch("/api/admin/lucky-wheel/spin", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEligibleCount(data.count);
          setSegments(
            data.eligibleReceipts.map(
              (r: { receiptNumber: string }) => r.receiptNumber
            )
          );
          setPrizes(data.prizes || []);
          setAllPrizesExhausted(data.allPrizesExhausted || false);

          const available = (data.prizes as PrizeOption[]).filter(
            (p) => p.remainingQuantity > 0
          );
          if (available.length > 0) {
            setSelectedPrizeId((current) => {
              const stillValid = available.some((p) => p._id === current);
              return stillValid ? current : available[0]._id;
            });
          } else {
            setSelectedPrizeId("");
          }
        }
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedPrize = prizes.find((p) => p._id === selectedPrizeId);
  const canSpin =
    !spinning &&
    !allPrizesExhausted &&
    eligibleCount > 0 &&
    selectedPrize &&
    selectedPrize.remainingQuantity > 0;

  const handleSpin = async () => {
    if (!canSpin || !selectedPrizeId) return;

    setError("");
    setSpinning(true);

    try {
      const res = await fetch("/api/admin/lucky-wheel/spin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizeId: selectedPrizeId }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        setSpinning(false);
        fetchData();
        return;
      }

      const result = data.winner as WinnerResult;
      const segmentCount = Math.max(result.eligibleReceipts.length, 1);
      const segmentAngle = 360 / segmentCount;
      const targetIndex = result.receiptIndex;
      const spins = 5;
      const targetRotation =
        rotation +
        spins * 360 +
        (segmentCount - targetIndex) * segmentAngle -
        segmentAngle / 2;

      setRotation(targetRotation);

      setTimeout(() => {
        setWinner(result);
        setShowPopup(true);
        setSpinning(false);
        fetchData();
      }, 5000);
    } catch {
      setError("Алдаа гарлаа");
      setSpinning(false);
    }
  };

  const displaySegments =
    segments.length > 0
      ? segments.slice(0, 12)
      : ["Хоосон", "Хоосон", "Хоосон", "Хоосон"];

  const segmentCount = displaySegments.length;
  const segmentAngle = 360 / segmentCount;

  return (
    <div className="space-y-8">
      {allPrizesExhausted && (
        <div className="p-4 rounded-xl bg-warning/20 border border-warning/40 text-warning text-sm text-center font-medium">
          Бүх шагналын сан дууссан байна.
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-danger/20 border border-danger/40 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-gold drop-shadow-lg" />
            </div>

            <div
              className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-4 border-gold shadow-gold-lg transition-transform duration-[5000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: spinning ? "5000ms" : "0ms",
              }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {displaySegments.map((label, i) => {
                  const startAngle = i * segmentAngle - 90;
                  const endAngle = startAngle + segmentAngle;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  const x1 = 100 + 95 * Math.cos(startRad);
                  const y1 = 100 + 95 * Math.sin(startRad);
                  const x2 = 100 + 95 * Math.cos(endRad);
                  const y2 = 100 + 95 * Math.sin(endRad);
                  const largeArc = segmentAngle > 180 ? 1 : 0;
                  const midAngle = startAngle + segmentAngle / 2;
                  const midRad = (midAngle * Math.PI) / 180;
                  const textX = 100 + 60 * Math.cos(midRad);
                  const textY = 100 + 60 * Math.sin(midRad);

                  return (
                    <g key={i}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                        stroke="#D6A84F"
                        strokeWidth="0.5"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="#FFF4D6"
                        fontSize="6"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      >
                        {label.length > 8 ? label.slice(0, 8) + "…" : label}
                      </text>
                    </g>
                  );
                })}
                <circle
                  cx="100"
                  cy="100"
                  r="30"
                  fill="#1A0E0A"
                  stroke="#D6A84F"
                  strokeWidth="2"
                />
              </svg>

              <button
                onClick={handleSpin}
                disabled={!canSpin}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gold-gradient text-coffee-dark font-bold text-sm shadow-gold-lg hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10 border-2 border-gold-light"
              >
                {spinning ? "..." : "SPIN"}
              </button>
            </div>
          </div>

          <p className="text-cream/60 text-sm">
            Оролцох баримт:{" "}
            <span className="text-gold font-bold">{eligibleCount}</span>
          </p>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-card-gradient rounded-2xl border border-gold/30 p-6">
            <h3 className="text-gold font-semibold mb-4">Шагнал сонгох</h3>
            <select
              value={selectedPrizeId}
              onChange={(e) => setSelectedPrizeId(e.target.value)}
              disabled={spinning || allPrizesExhausted || prizes.length === 0}
              className="w-full px-4 py-3 rounded-xl bg-coffee-dark/60 border border-gold/20 text-cream focus:outline-none focus:border-gold"
            >
              {prizes.length === 0 ? (
                <option value="">Шагнал олдсонгүй</option>
              ) : (
                prizes.map((prize) => {
                  const exhausted = prize.remainingQuantity <= 0;
                  return (
                    <option key={prize._id} value={prize._id} disabled={exhausted}>
                      {getPrizeDropdownLabel(prize)}
                      {exhausted ? " — Дууссан" : ""}
                    </option>
                  );
                })
              )}
            </select>

            {selectedPrize && selectedPrize.remainingQuantity <= 0 && (
              <span className="inline-block mt-2 px-2 py-1 rounded-full bg-danger/20 text-danger text-xs border border-danger/40">
                Дууссан
              </span>
            )}
          </div>

          <div className="bg-card-gradient rounded-2xl border border-gold/30 p-6">
            <h3 className="text-gold font-semibold mb-3">Заавар</h3>
            <ul className="text-cream/60 text-sm space-y-2">
              <li>1. Шагналаа сонгоно уу</li>
              <li>2. SPIN товчийг дарна</li>
              <li>3. Санамсаргүй баталгаажсан баримт сонгогдоно</li>
              <li>4. Ялагч автоматаар бүртгэгдэнэ</li>
            </ul>
          </div>

          <Button
            onClick={handleSpin}
            loading={spinning}
            disabled={!canSpin}
            className="w-full"
            size="lg"
          >
            Сугалаа эхлүүлэх
          </Button>
        </div>
      </div>

      {showPopup && winner && (
        <WinnerPopup
          winner={winner}
          onClose={() => {
            setShowPopup(false);
            setWinner(null);
          }}
          onConfirm={() => {
            setShowPopup(false);
            setWinner(null);
          }}
        />
      )}
    </div>
  );
}
