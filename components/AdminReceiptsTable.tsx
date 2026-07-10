"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Trash2, Ticket } from "lucide-react";
import StatusBadge from "./StatusBadge";
import ReceiptPreviewModal from "./ReceiptPreviewModal";
import EditEntriesModal from "./EditEntriesModal";
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
  productCount?: number;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  assignedEntries?: number;
  usedEntries?: number;
  rejectionReason?: string;
  entriesUpdatedAt?: string;
  entriesUpdatedBy?: string;
  createdAt: string;
  userId: ReceiptUser;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

const filters = [
  { value: "all", label: "Бүгд" },
  { value: "pending", label: "Хүлээгдэж буй" },
  { value: "approved", label: "Баталгаажсан" },
  { value: "rejected", label: "Татгалзсан" },
];

export default function AdminReceiptsTable() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [editingEntriesReceipt, setEditingEntriesReceipt] =
    useState<Receipt | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const buildUrl = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (filter !== "all") params.set("status", filter);
      return `/api/admin/receipts?${params.toString()}`;
    },
    [filter]
  );

  const fetchReceipts = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      setError("");

      try {
        const res = await fetch(buildUrl(pageNum), { credentials: "include" });
        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Баримт ачааллахад алдаа гарлаа");
          if (!append) {
            setReceipts([]);
            setPagination(null);
          }
          return;
        }

        setPagination(data.pagination);
        setPage(pageNum);
        setReceipts((current) =>
          append ? [...current, ...data.receipts] : data.receipts
        );
      } catch {
        setError("Баримт ачааллахад алдаа гарлаа");
        if (!append) {
          setReceipts([]);
          setPagination(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    fetchReceipts(1, false);
  }, [fetchReceipts]);

  const total = pagination?.total ?? 0;
  const hasMore = receipts.length < total;

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchReceipts(page + 1, true);
  };

  const refreshList = () => fetchReceipts(1, false);

  const handleApprove = async (id: string, assignedEntries = 1) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/receipts/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedEntries }),
      });
      const data = await res.json();
      if (data.success) {
        refreshList();
        setSelectedReceipt(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (receipt: Receipt) => {
    const confirmed = window.confirm(
      `${receipt.receiptNumber} баримтыг устгах уу? Холбогдсон ялагчийн бүртгэл байвал хамт устгагдана.`
    );
    if (!confirmed) return;

    setError("");
    setDeletingId(receipt._id);

    try {
      const res = await fetch(`/api/admin/receipts/${receipt._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Устгахад алдаа гарлаа");
        return;
      }

      if (selectedReceipt?._id === receipt._id) {
        setSelectedReceipt(null);
      }
      refreshList();
    } catch {
      setError("Устгахад алдаа гарлаа");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/receipts/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Татгалзахад алдаа гарлаа");
        return;
      }
      refreshList();
      setSelectedReceipt(null);
      setRejectMode(false);
    } finally {
      setActionLoading(false);
    }
  };

  const openReceipt = (receipt: Receipt, withRejectMode = false) => {
    setSelectedReceipt(receipt);
    setRejectMode(withRejectMode);
  };

  const closeReceipt = () => {
    setSelectedReceipt(null);
    setRejectMode(false);
  };

  const handleSaveEntries = async (assignedEntries: number) => {
    if (!editingEntriesReceipt) return;

    setEntriesLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/admin/receipts/${editingEntriesReceipt._id}/entries`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedEntries }),
        }
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Эрх хадгалахад алдаа гарлаа");
        return;
      }

      setEditingEntriesReceipt(null);
      refreshList();
    } catch {
      setError("Эрх хадгалахад алдаа гарлаа");
    } finally {
      setEntriesLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
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

        {!loading && pagination && (
          <p className="text-cream/60 text-sm">
            Нийт бүртгэл:{" "}
            <span className="text-gold font-semibold">{total}</span>
            {receipts.length > 0 && (
              <span className="text-cream/40">
                {" "}
                · Харагдаж буй: {receipts.length}
              </span>
            )}
          </p>
        )}
      </div>

      {error && <p className="mb-4 text-danger text-sm">{error}</p>}

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
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Эрх</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Огноо</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-cream/50">
                  Ачааллаж байна...
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-cream/50">
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
                    <button
                      type="button"
                      onClick={() => openReceipt(receipt)}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-gold/20 hover:border-gold/50 hover:ring-2 hover:ring-gold/30 transition-all cursor-zoom-in"
                      title="Зураг томруулж харах"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={receipt.imageUrl}
                        alt="Баримтын зураг"
                        className="w-full h-full object-cover"
                      />
                    </button>
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
                  <td className="px-4 py-3 text-gold text-sm">
                    {receipt.status === "approved"
                      ? `${Math.max(0, (receipt.assignedEntries ?? 0) - (receipt.usedEntries ?? 0))} / ${receipt.assignedEntries ?? 0}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-cream/50 text-sm">
                    {formatDateTime(receipt.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openReceipt(receipt)}
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
                            onClick={() => openReceipt(receipt, true)}
                            className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                            title="Татгалзах"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {receipt.status === "approved" && (
                        <button
                          onClick={() => setEditingEntriesReceipt(receipt)}
                          className="p-2 rounded-lg text-gold hover:bg-gold/10 transition-colors"
                          title="Эрх засах"
                        >
                          <Ticket className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(receipt)}
                        disabled={deletingId === receipt._id}
                        className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                        title="Устгах"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            loading={loadingMore}
            className="min-w-[200px]"
          >
            Цааш үзэх ({receipts.length} / {total})
          </Button>
        </div>
      )}

      {editingEntriesReceipt && (
        <EditEntriesModal
          receipt={editingEntriesReceipt}
          onClose={() => setEditingEntriesReceipt(null)}
          onSave={handleSaveEntries}
          loading={entriesLoading}
        />
      )}

      {selectedReceipt && (
        <ReceiptPreviewModal
          receipt={selectedReceipt}
          onClose={closeReceipt}
          initialRejectMode={rejectMode}
          onApprove={(assignedEntries) =>
            handleApprove(selectedReceipt._id, assignedEntries)
          }
          onReject={(reason) => handleReject(selectedReceipt._id, reason)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
