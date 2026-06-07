"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import { ReceiptText } from "lucide-react";

interface Receipt {
  _id: string;
  receiptNumber: string;
  amount: number;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
}

const filters = [
  { value: "all", label: "Бүгд" },
  { value: "pending", label: "Хүлээгдэж буй" },
  { value: "approved", label: "Баталгаажсан" },
  { value: "rejected", label: "Татгалзсан" },
];

export default function MyReceiptsTable() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url =
      filter === "all"
        ? "/api/receipts/my"
        : `/api/receipts/my?status=${filter}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setReceipts(data.receipts);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              filter === f.value
                ? "bg-gold-gradient text-coffee-dark"
                : "bg-coffee-dark/60 text-cream/60 border border-gold/20 hover:border-gold/40"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-16 bg-card-gradient rounded-2xl border border-gold/20">
          <ReceiptText className="w-12 h-12 text-gold/30 mx-auto mb-4" />
          <p className="text-cream/50">Баримт олдсонгүй</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gold/20">
            <table className="w-full">
              <thead>
                <tr className="bg-coffee-brown/80 border-b border-gold/20">
                  <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                    Зураг
                  </th>
                  <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                    Баримтын дугаар
                  </th>
                  <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                    Үнийн дүн
                  </th>
                  <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                    Огноо
                  </th>
                  <th className="px-4 py-3 text-left text-cream/70 text-sm font-medium">
                    Төлөв
                  </th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr
                    key={receipt._id}
                    className="border-b border-gold/10 hover:bg-gold/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-coffee-dark">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={receipt.imageUrl}
                          alt="Receipt"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-cream text-sm">
                      {receipt.receiptNumber}
                    </td>
                    <td className="px-4 py-3 text-gold text-sm font-medium">
                      {formatCurrency(receipt.amount)}
                    </td>
                    <td className="px-4 py-3 text-cream/60 text-sm">
                      {formatDateTime(receipt.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={receipt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {receipts.map((receipt) => (
              <div
                key={receipt._id}
                className="bg-card-gradient rounded-2xl border border-gold/20 p-4"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={receipt.imageUrl}
                      alt="Receipt"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream font-medium truncate">
                      {receipt.receiptNumber}
                    </p>
                    <p className="text-gold text-sm mt-1">
                      {formatCurrency(receipt.amount)}
                    </p>
                    <p className="text-cream/40 text-xs mt-1">
                      {formatDateTime(receipt.createdAt)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={receipt.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
