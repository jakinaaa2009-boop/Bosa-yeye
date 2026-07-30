export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return "****";
  const visible = phone.slice(-4);
  return `****${visible}`;
}

export function maskReceiptNumber(receiptNumber: string): string {
  if (!receiptNumber || receiptNumber.length < 4) return "****";
  const start = receiptNumber.slice(0, 2);
  const end = receiptNumber.slice(-2);
  return `${start}****${end}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("mn-MN").format(amount) + "₮";
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Ulaanbaatar",
  });
}

/** Consistent Mongolian date for winner cards (avoids English locale fallback). */
export function formatWinnerDate(date: Date | string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) return "";
  return `${year} оны ${month} сарын ${day}`;
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseDateFilter(value: string | null): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const ULAANBAATAR_OFFSET_MS = 8 * 60 * 60 * 1000;

function parseDateOnly(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));

  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

/** Start of calendar day in Asia/Ulaanbaatar (UTC+8). */
export function startOfDayUlaanbaatar(value: string | null): Date | null {
  if (!value?.trim()) return null;

  const dateOnly = parseDateOnly(value);
  if (!dateOnly) return parseDateFilter(value);

  const { year, month, day } = dateOnly;
  return new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) - ULAANBAATAR_OFFSET_MS
  );
}

/** End of calendar day in Asia/Ulaanbaatar (UTC+8). */
export function endOfDayUlaanbaatar(value: string | null): Date | null {
  if (!value?.trim()) return null;

  const dateOnly = parseDateOnly(value);
  if (!dateOnly) return parseDateFilter(value);

  const { year, month, day } = dateOnly;
  return new Date(
    Date.UTC(year, month - 1, day, 23, 59, 59, 999) - ULAANBAATAR_OFFSET_MS
  );
}

export function getWinnerDisplayName(phone: string, email?: string): string {
  if (email) {
    const namePart = email.split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  return `Хэрэглэгч ${maskPhone(phone)}`;
}
