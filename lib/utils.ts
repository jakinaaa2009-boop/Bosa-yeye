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

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
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

export function getWinnerDisplayName(phone: string, email?: string): string {
  if (email) {
    const namePart = email.split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  return `Хэрэглэгч ${maskPhone(phone)}`;
}
