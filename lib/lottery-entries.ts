import type { IReceipt } from "@/models/Receipt";

export const ENTRY_PRESETS = {
  sachet: 1,
  bag: 10,
} as const;

/** Quick-fill values only — admins may assign any positive whole number. */
export function parsePositiveEntryCount(
  value: string | number | undefined | null
): { valid: true; value: number } | { valid: false; message: string } {
  const raw = typeof value === "string" ? value.trim() : value;
  const num = Number(raw);

  if (
    raw === "" ||
    raw === undefined ||
    raw === null ||
    !Number.isFinite(num) ||
    !Number.isInteger(num) ||
    num < 1
  ) {
    return {
      valid: false,
      message: "Эрхийн тоо 1-ээс их бүхэл тоо байх ёстой",
    };
  }

  return { valid: true, value: num };
}

export interface LotteryTicket {
  receiptId: string;
  receiptNumber: string;
  userId: string;
  phone: string;
  email: string;
}

export type ReceiptWithUser = IReceipt & {
  userId: { _id: { toString(): string }; phone: string; email: string };
};

function isPopulatedUser(
  userId: ReceiptWithUser["userId"] | unknown
): userId is ReceiptWithUser["userId"] {
  return (
    typeof userId === "object" &&
    userId !== null &&
    "phone" in userId &&
    "email" in userId
  );
}

export function getRemainingEntries(receipt: {
  assignedEntries?: number;
  usedEntries?: number;
}): number {
  const assigned = receipt.assignedEntries ?? 0;
  const used = receipt.usedEntries ?? 0;
  return Math.max(0, assigned - used);
}

export function buildLotteryTickets(
  receipts: Array<IReceipt & { userId: unknown }>
): LotteryTicket[] {
  const tickets: LotteryTicket[] = [];

  for (const receipt of receipts) {
    if (!isPopulatedUser(receipt.userId)) continue;

    const remaining = getRemainingEntries(receipt);
    const user = receipt.userId;

    for (let i = 0; i < remaining; i++) {
      tickets.push({
        receiptId: receipt._id.toString(),
        receiptNumber: receipt.receiptNumber,
        userId: user._id.toString(),
        phone: user.phone,
        email: user.email,
      });
    }
  }

  return tickets;
}

export function validateAssignedEntries(
  assignedEntries: number,
  usedEntries = 0,
  options?: { requirePositive?: boolean }
): { valid: boolean; message?: string } {
  if (!Number.isInteger(assignedEntries)) {
    return { valid: false, message: "Эрхийн тоо бүхэл тоо байх ёстой" };
  }

  const minAllowed = options?.requirePositive
    ? Math.max(1, usedEntries)
    : usedEntries;

  if (options?.requirePositive && assignedEntries < 1) {
    return { valid: false, message: "Эрхийн тоо 1-ээс их бүхэл тоо байх ёстой" };
  }

  if (assignedEntries < minAllowed) {
    return {
      valid: false,
      message:
        usedEntries > 0
          ? `Олгосон эрх ашигласан эрхээс (${usedEntries}) бага байж болохгүй`
          : "Эрхийн тоо 1-ээс их бүхэл тоо байх ёстой",
    };
  }

  return { valid: true };
}
