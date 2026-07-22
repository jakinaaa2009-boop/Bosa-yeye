"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Trash2, Ticket, Search, X, Calendar } from "lucide-react";
import StatusBadge from "./StatusBadge";
import ReceiptPreviewModal from "./ReceiptPreviewModal";
import EditEntriesModal from "./EditEntriesModal";
import Input from "./Input";
import Pagination from "./Pagination";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";

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

interface ExactReceiptMatch {
  receiptNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user: { phone: string; email: string } | null;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

const filters = [
  { value: "all", label: "Бүгд" },
  { value: "pending", label: "Хүлээгдэж буй" },
  { value: "approved", label: "Баталгаажсан" },
  { value: "rejected", label: "Татгалзсан" },
];

export default function AdminReceiptsTable() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exactReceiptMatch, setExactReceiptMatch] =
    useState<ExactReceiptMatch | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [editingEntriesReceipt, setEditingEntriesReceipt] =
    useState<Receipt | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const hasInvalidDateRange =
    !!dateFrom && !!dateTo && dateFrom > dateTo;

  const buildUrl = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (filter !== "all") params.set("status", filter);
      if (searchQuery) params.set("search", searchQuery);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      return `/api/admin/receipts?${params.toString()}`;
    },
    [filter, searchQuery, dateFrom, dateTo]
  );

  const fetchReceipts = useCallback(
    async (pageNum: number) => {
      if (hasInvalidDateRange) {
        setError("Эхлэх огноо дуусах огнооноос хойш байж болохгүй");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const res = await fetch(buildUrl(pageNum), { credentials: "include" });
        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Баримт ачааллахад алдаа гарлаа");
          setReceipts([]);
          setPagination(null);
          setExactReceiptMatch(null);
          return;
        }

        setPagination(data.pagination);
        setPage(pageNum);
        setExactReceiptMatch(data.exactReceiptMatch ?? null);
        setReceipts(data.receipts);
      } catch {
        setError("Баримт ачааллахад алдаа гарлаа");
        setReceipts([]);
        setPagination(null);
        setExactReceiptMatch(null);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, hasInvalidDateRange]
  );

  useEffect(() => {
    fetchReceipts(1);
  }, [fetchReceipts]);

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    fetchReceipts(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const refreshList = async (targetPage = page) => {
    await fetchReceipts(targetPage);
  };

  const handleApprove = async (id: string, assignedEntries = 1) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/receipts/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedEntries }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Батлахад алдаа гарлаа");
        return;
      }
      setSuccess("Баримт амжилттай баталгаажлаа");
      setSelectedReceipt(null);
      setRejectMode(false);
      await refreshList(1);
    } catch {
      setError("Батлахад алдаа гарлаа");
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
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/receipts/${id}/reject`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Татгалзахад алдаа гарлаа");
        return;
      }
      setSuccess("Баримт амжилттай татгалзлаа");
      setSelectedReceipt(null);
      setRejectMode(false);
      await refreshList(1);
    } catch {
      setError("Татгалзахад алдаа гарлаа");
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
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40 pointer-events-none" />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="И-Баримтын дугаар, утас, email-ээр хайх..."
            className="pl-11 pr-11"
            aria-label="Баримт хайх"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-cream/50 hover:text-cream hover:bg-white/5 transition-colors"
              aria-label="Хайлт цэвэрлэх"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-cream/45 text-xs">
          Давхардсан и-баримт шалгахын тулд баримтын дугаарыг яг оруулж хайна уу.
        </p>

        <div className="mt-4 rounded-2xl border border-gold/20 bg-coffee-dark/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gold/70" />
            <p className="text-cream/70 text-sm font-medium">
              Огноо, цагаар шүүх
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Эхлэх огноо"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              label="Дуусах огноо"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {(dateFrom || dateTo) && (
            <div className="mt-3 flex items-center justify-between gap-3">
              {hasInvalidDateRange && (
                <p className="text-danger text-xs">
                  Эхлэх огноо дуусах огнооноос хойш байж болохгүй
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="ml-auto text-sm text-cream/60 hover:text-gold transition-colors"
              >
                Огнооны шүүлт цэвэрлэх
              </button>
            </div>
          )}
        </div>
      </div>

      {exactReceiptMatch && (
        <div className="mb-4 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3">
          <p className="text-warning text-sm font-semibold">
            Энэ и-баримт аль хэдийн бүртгэгдсэн байна
          </p>
          <p className="text-cream/80 text-sm mt-1">
            <span className="text-gold font-medium">
              {exactReceiptMatch.receiptNumber}
            </span>
            {" · "}
            {exactReceiptMatch.user?.phone ?? "-"}
            {" · "}
            {exactReceiptMatch.user?.email ?? "-"}
            {" · "}
            <StatusBadge status={exactReceiptMatch.status} />
            {" · "}
            {formatDateTime(exactReceiptMatch.createdAt)}
          </p>
        </div>
      )}

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
          </p>
        )}
      </div>

      {success && (
        <p className="mb-4 text-success text-sm">{success}</p>
      )}

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
                  {searchQuery
                    ? "Хайлтад тохирох баримт олдсонгүй"
                    : "Баримт олдсонгүй"}
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => {
                const isExactMatch =
                  !!exactReceiptMatch &&
                  receipt.receiptNumber.toLowerCase() ===
                    exactReceiptMatch.receiptNumber.toLowerCase();

                return (
                <tr
                  key={receipt._id}
                  className={cn(
                    "border-b border-gold/10 hover:bg-gold/5",
                    isExactMatch && "bg-warning/10 hover:bg-warning/15"
                  )}
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
                    <span className={cn(isExactMatch && "text-warning font-semibold")}>
                      {receipt.receiptNumber}
                    </span>
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
                            onClick={() => handleApprove(String(receipt._id))}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        loading={loading}
      />

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
            handleApprove(String(selectedReceipt._id), assignedEntries)
          }
          onReject={(reason) => handleReject(String(selectedReceipt._id), reason)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
