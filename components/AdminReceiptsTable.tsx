"use client";

import { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import ReceiptPreviewModal from "./ReceiptPreviewModal";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import Button from "./Button";

interface ReceiptUser {
  phone: string;
  email: string;
}

interface Receipt {
  _id: string;
  receiptNumber: string;
  amount: number;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  userId: ReceiptUser;
}

const filters = [
  { value: "all", label: "Бүгд" },
  { value: "pending", label: "Хүлээгдэж буй" },
  { value: "approved", label: "Баталгаажсан" },
  { value: "rejected", label: "Татгалзсан" },
];

export default function AdminReceiptsTable() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReceipts = () => {
    setLoading(true);
    const url =
      filter === "all"
        ? "/api/admin/receipts?limit=50"
        : `/api/admin/receipts?status=${filter}&limit=50`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setReceipts(data.receipts);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/receipts/${id}/approve`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        fetchReceipts();
        setSelectedReceipt(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/receipts/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReceipts();
        setSelectedReceipt(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

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
                : "bg-coffee-dark/60 text-cream/60 border border-gold/20"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gold/20">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-coffee-brown/80 border-b border-gold/20">
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Зураг</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Дугаар</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Утас</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Email</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Дүн</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Төлөв</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Огноо</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-cream/50">
                  Ачааллаж байна...
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-cream/50">
                  Баримт олдсонгүй
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr
                  key={receipt._id}
                  className="border-b border-gold/10 hover:bg-gold/5"
                >
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={receipt.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream text-sm">
                    {receipt.receiptNumber}
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-sm">
                    {receipt.userId?.phone}
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-sm">
                    {receipt.userId?.email}
                  </td>
                  <td className="px-4 py-3 text-gold text-sm">
                    {formatCurrency(receipt.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={receipt.status} />
                  </td>
                  <td className="px-4 py-3 text-cream/50 text-sm">
                    {formatDateTime(receipt.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedReceipt(receipt)}
                        className="p-2 rounded-lg text-gold hover:bg-gold/10 transition-colors"
                        title="Харах"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {receipt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(receipt._id)}
                            className="p-2 rounded-lg text-success hover:bg-success/10 transition-colors"
                            title="Батлах"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(receipt._id)}
                            className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                            title="Татгалзах"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedReceipt && (
        <ReceiptPreviewModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onApprove={() => handleApprove(selectedReceipt._id)}
          onReject={(reason) => handleReject(selectedReceipt._id, reason)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
