"use client";

import { useCallback, useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import Input from "./Input";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import { ENTRY_PRESETS, parsePositiveEntryCount } from "@/lib/lottery-entries";

interface EntryRow {
  _id: string;
  receiptNumber: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  assignedEntries: number;
  usedEntries: number;
  remainingEntries: number;
  createdAt: string;
  userId: { phone: string; email: string };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TabStats {
  count: number;
  totalAssigned: number;
  totalUsed: number;
  totalRemaining: number;
}

type TabKey = "all" | "approved" | "pending" | "rejected";

const EMPTY_TAB: TabStats = {
  count: 0,
  totalAssigned: 0,
  totalUsed: 0,
  totalRemaining: 0,
};

const PAGE_SIZE = 20;

const filters: { value: TabKey; label: string }[] = [
  { value: "all", label: "Бүгд" },
  { value: "approved", label: "Баталгаажсан" },
  { value: "pending", label: "Хүлээгдэж буй" },
  { value: "rejected", label: "Татгалзсан" },
];

export default function AdminEntriesTable() {
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [summary, setSummary] = useState({
    totalAssigned: 0,
    totalUsed: 0,
    totalRemaining: 0,
  });
  const [tabs, setTabs] = useState<Record<TabKey, TabStats>>({
    all: { ...EMPTY_TAB },
    approved: { ...EMPTY_TAB },
    pending: { ...EMPTY_TAB },
    rejected: { ...EMPTY_TAB },
  });
  const [filter, setFilter] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftEntries, setDraftEntries] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const buildUrl = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (filter !== "all") params.set("status", filter);
      return `/api/admin/entries?${params.toString()}`;
    },
    [filter]
  );

  const mergeDrafts = (rows: EntryRow[], append: boolean) => {
    setDraftEntries((current) => {
      const next = append ? { ...current } : {};
      rows.forEach((row) => {
        next[row._id] = String(row.assignedEntries);
      });
      return next;
    });
  };

  const fetchEntries = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      setError("");

      try {
        const res = await fetch(buildUrl(pageNum), { credentials: "include" });
        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Эрх ачааллахад алдаа гарлаа");
          if (!append) {
            setEntries([]);
            setPagination(null);
            setSummary({ totalAssigned: 0, totalUsed: 0, totalRemaining: 0 });
            setTabs({
              all: { ...EMPTY_TAB },
              approved: { ...EMPTY_TAB },
              pending: { ...EMPTY_TAB },
              rejected: { ...EMPTY_TAB },
            });
          }
          return;
        }

        setPagination(data.pagination);
        setPage(pageNum);
        setSummary(data.summary);
        if (data.tabs) setTabs(data.tabs);
        setEntries((current) =>
          append ? [...current, ...data.entries] : data.entries
        );
        mergeDrafts(data.entries, append);
      } catch {
        setError("Эрх ачааллахад алдаа гарлаа");
        if (!append) {
          setEntries([]);
          setPagination(null);
          setSummary({ totalAssigned: 0, totalUsed: 0, totalRemaining: 0 });
          setTabs({
            all: { ...EMPTY_TAB },
            approved: { ...EMPTY_TAB },
            pending: { ...EMPTY_TAB },
            rejected: { ...EMPTY_TAB },
          });
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    fetchEntries(1, false);
  }, [fetchEntries]);

  const total = pagination?.total ?? 0;
  const hasMore = entries.length < total;

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchEntries(page + 1, true);
  };

  const handleSave = async (row: EntryRow) => {
    const parsed = parsePositiveEntryCount(draftEntries[row._id]);
    if (!parsed.valid) {
      setError(parsed.message);
      return;
    }

    if (parsed.value < row.usedEntries) {
      setError(
        `Олгосон эрх ашигласан эрхээс (${row.usedEntries}) бага байж болохгүй`
      );
      return;
    }

    const assignedEntries = parsed.value;

    setError("");
    setSavingId(row._id);

    try {
      const res = await fetch(`/api/admin/receipts/${row._id}/entries`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedEntries }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Эрх хадгалахад алдаа гарлаа");
        return;
      }

      await fetchEntries(1, false);
    } catch {
      setError("Эрх хадгалахад алдаа гарлаа");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card-gradient rounded-2xl border border-gold/25 p-4">
          <p className="text-cream/50 text-xs">Нийт олгосон эрх</p>
          <p className="text-gold text-2xl font-bold mt-1">
            {summary.totalAssigned}
          </p>
        </div>
        <div className="bg-card-gradient rounded-2xl border border-gold/25 p-4">
          <p className="text-cream/50 text-xs">Ашигласан эрх</p>
          <p className="text-cream text-2xl font-bold mt-1">
            {summary.totalUsed}
          </p>
        </div>
        <div className="bg-card-gradient rounded-2xl border border-gold/25 p-4">
          <p className="text-cream/50 text-xs">Үлдсэн эрх</p>
          <p className="text-gold-light text-2xl font-bold mt-1">
            {summary.totalRemaining}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-gold/20 bg-coffee-dark/40 p-2">
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-2"
          role="tablist"
          aria-label="Баримтын төлөв"
        >
          {filters.map((f) => {
            const stats = tabs[f.value];
            const active = filter === f.value;

            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-xl px-3 py-3 text-left transition-colors border",
                  active
                    ? "bg-gold-gradient text-coffee-dark border-transparent"
                    : "bg-coffee-brown/50 text-cream/70 border-gold/15 hover:border-gold/35 hover:text-cream"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{f.label}</span>
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums px-2 py-0.5 rounded-md",
                      active ? "bg-coffee-dark/15" : "bg-gold/10 text-gold"
                    )}
                  >
                    {stats.count}
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-2 grid grid-cols-3 gap-1 text-[11px] leading-tight",
                    active ? "text-coffee-dark/75" : "text-cream/45"
                  )}
                >
                  <div>
                    <p>Олгосон</p>
                    <p className="font-semibold tabular-nums">
                      {stats.totalAssigned}
                    </p>
                  </div>
                  <div>
                    <p>Ашигласан</p>
                    <p className="font-semibold tabular-nums">
                      {stats.totalUsed}
                    </p>
                  </div>
                  <div>
                    <p>Үлдсэн</p>
                    <p className="font-semibold tabular-nums">
                      {stats.totalRemaining}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!loading && total > 0 && (
        <p className="mb-4 text-cream/50 text-sm text-right">
          Харуулж буй: {entries.length} / {total}
        </p>
      )}

      {error && <p className="mb-4 text-danger text-sm">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-gold/20">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-coffee-brown/80 border-b border-gold/20">
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Утас</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Email</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Баримт
              </th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Дүн</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Төлөв
              </th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Олгосон
              </th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Ашигласан
              </th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Үлдсэн
              </th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Огноо
              </th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">
                Эрх олгох
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-cream/50">
                  Ачааллаж байна...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-cream/50">
                  Баримт олдсонгүй
                </td>
              </tr>
            ) : (
              entries.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-gold/10 hover:bg-gold/5"
                >
                  <td className="px-4 py-3 text-cream text-sm">
                    {row.userId.phone}
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-sm">
                    {row.userId.email}
                  </td>
                  <td className="px-4 py-3 text-cream text-sm">
                    {row.receiptNumber}
                  </td>
                  <td className="px-4 py-3 text-gold text-sm">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-cream text-sm">
                    {row.assignedEntries}
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-sm">
                    {row.usedEntries}
                  </td>
                  <td className="px-4 py-3 text-gold font-semibold text-sm">
                    {row.remainingEntries}
                  </td>
                  <td className="px-4 py-3 text-cream/50 text-sm">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "approved" ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-[240px]">
                        <Input
                          type="number"
                          min={Math.max(1, row.usedEntries)}
                          step={1}
                          value={draftEntries[row._id] ?? "0"}
                          onChange={(e) =>
                            setDraftEntries((current) => ({
                              ...current,
                              [row._id]: e.target.value,
                            }))
                          }
                          className="w-full sm:w-28 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraftEntries((current) => ({
                              ...current,
                              [row._id]: String(ENTRY_PRESETS.sachet),
                            }))
                          }
                          className="px-2 py-1 rounded-lg text-xs bg-gold/10 text-gold border border-gold/20"
                        >
                          1
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDraftEntries((current) => ({
                              ...current,
                              [row._id]: String(ENTRY_PRESETS.bag),
                            }))
                          }
                          className="px-2 py-1 rounded-lg text-xs bg-gold/10 text-gold border border-gold/20"
                        >
                          10
                        </button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(row)}
                          loading={savingId === row._id}
                        >
                          Хадгалах
                        </Button>
                      </div>
                    ) : (
                      <span className="text-cream/40 text-xs">
                        Эхлээд баримт батална
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            loading={loadingMore}
          >
            Цааш үзэх
          </Button>
        </div>
      )}

      <p className="mt-4 text-cream/45 text-xs flex items-center gap-2">
        <Ticket className="w-4 h-4 text-gold/60" />
        5 ширхэг кофе = 1 эрх, 1 уут кофе = 10 эрх. Админ дурын эерэг тооны
        эрх олгож болно. Ялсан хэрэглэгчийн эрх 1-ээр хасагдана.
      </p>
    </div>
  );
}
