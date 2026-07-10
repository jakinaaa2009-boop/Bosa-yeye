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

const filters = [
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
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftEntries, setDraftEntries] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const fetchEntries = useCallback(() => {
    setLoading(true);
    const url =
      filter === "all"
        ? "/api/admin/entries"
        : `/api/admin/entries?status=${filter}`;

    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEntries(data.entries);
          setSummary(data.summary);
          const drafts: Record<string, string> = {};
          data.entries.forEach((row: EntryRow) => {
            drafts[row._id] = String(row.assignedEntries);
          });
          setDraftEntries(drafts);
        }
      })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

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

      fetchEntries();
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

      <p className="mt-4 text-cream/45 text-xs flex items-center gap-2">
        <Ticket className="w-4 h-4 text-gold/60" />
        5 ширхэг кофе = 1 эрх, 1 уут кофе = 10 эрх. Админ дурын эерэг тооны
        эрх олгож болно. Ялсан хэрэглэгчийн эрх 1-ээр хасагдана.
      </p>
    </div>
  );
}
