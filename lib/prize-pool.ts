export const PRIZE_POOL_TOTAL = {
  totalWinners: 100,
  cashWinners: 99,
  cashPoolAmount: 15_000_000,
  carModel: "BAIC X55",
} as const;

export const PRIZE_POOL_DISPLAY = [
  {
    title: "СУПЕР АЗТАН",
    prize: "BAIC X55",
    description: "69,800,000₮ үнэтэй цоо шинэ автомашины 1 азтан",
    badge: "Супер шагнал",
    type: "car" as const,
    winnerCount: 1,
  },
  {
    title: "1,000,000₮",
    prize: "3 азтан",
    description: "Тэргүүн мөнгөн шагнал",
    type: "cash" as const,
    winnerCount: 3,
    amount: 1_000_000,
    imageKey: "oneMillion" as const,
  },
  {
    title: "500,000₮",
    prize: "6 азтан",
    description: "Дэд мөнгөн шагнал",
    type: "cash" as const,
    winnerCount: 6,
    amount: 500_000,
    imageKey: "fiveHundredThousand" as const,
  },
  {
    title: "100,000₮",
    prize: "90 азтан",
    description: "Урамшууллын мөнгөн шагнал",
    type: "cash" as const,
    winnerCount: 90,
    amount: 100_000,
    imageKey: "oneHundredThousand" as const,
  },
] as const;

export const PRIZE_TABLE_ROWS = [
  {
    name: "Супер азтан",
    winners: "1 азтан",
    perWinner: "BAIC X55",
    total: "1 автомашин",
  },
  {
    name: "1,000,000₮ шагнал",
    winners: "3 азтан",
    perWinner: "1,000,000₮",
    total: "3,000,000₮",
  },
  {
    name: "500,000₮ шагнал",
    winners: "6 азтан",
    perWinner: "500,000₮",
    total: "3,000,000₮",
  },
  {
    name: "100,000₮ шагнал",
    winners: "90 азтан",
    perWinner: "100,000₮",
    total: "9,000,000₮",
  },
] as const;

export const SEED_PRIZES = [
  {
    name: "Супер азтан",
    type: "car" as const,
    carModel: "BAIC X55",
    quantity: 1,
    remainingQuantity: 1,
    description: "69,800,000₮ үнэтэй цоо шинэ автомашины 1 азтан",
    order: 1,
    isActive: true,
  },
  {
    name: "1,000,000₮ шагнал",
    type: "cash" as const,
    amount: 1_000_000,
    quantity: 3,
    remainingQuantity: 3,
    description: "1,000,000₮-ийн мөнгөн шагнал",
    order: 2,
    isActive: true,
  },
  {
    name: "500,000₮ шагнал",
    type: "cash" as const,
    amount: 500_000,
    quantity: 6,
    remainingQuantity: 6,
    description: "500,000₮-ийн мөнгөн шагнал",
    order: 3,
    isActive: true,
  },
  {
    name: "100,000₮ шагнал",
    type: "cash" as const,
    amount: 100_000,
    quantity: 90,
    remainingQuantity: 90,
    description: "100,000₮-ийн мөнгөн шагнал",
    order: 4,
    isActive: true,
  },
];

export function getPrizeTypeLabel(type: "car" | "cash"): string {
  return type === "car" ? "Автомашин" : "Мөнгөн шагнал";
}

export function getWinnerPrizeValue(winner: {
  prizeType: "car" | "cash";
  prizeAmount?: number;
  carModel?: string;
}): string {
  if (winner.prizeType === "car") {
    return winner.carModel || "BAIC X55";
  }
  if (winner.prizeAmount) {
    return new Intl.NumberFormat("mn-MN").format(winner.prizeAmount) + "₮";
  }
  return "";
}

export function getWinnerPrizeDisplay(winner: {
  prizeName: string;
  prizeType: "car" | "cash";
  prizeAmount?: number;
  carModel?: string;
}): { title: string; subtitle?: string } {
  const prizeValue = getWinnerPrizeValue(winner);

  if (winner.prizeType === "car") {
    return { title: prizeValue, subtitle: winner.prizeName };
  }

  return { title: winner.prizeName };
}
