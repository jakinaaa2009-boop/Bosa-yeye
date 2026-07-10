"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import { ENTRY_PRESETS, getRemainingEntries, parsePositiveEntryCount } from "@/lib/lottery-entries";
import { formatDateTime } from "@/lib/utils";

interface EditEntriesReceipt {
  _id: string;
  receiptNumber: string;
  assignedEntries?: number;
  usedEntries?: number;
  entriesUpdatedAt?: string;
  entriesUpdatedBy?: string;
}

interface EditEntriesModalProps {
  receipt: EditEntriesReceipt;
  onClose: () => void;
  onSave: (assignedEntries: number) => Promise<void>;
  loading?: boolean;
}

export default function EditEntriesModal({
  receipt,
  onClose,
  onSave,
  loading,
}: EditEntriesModalProps) {
  const assigned = receipt.assignedEntries ?? 0;
  const used = receipt.usedEntries ?? 0;
  const remaining = getRemainingEntries(receipt);
  const minAllowed = Math.max(1, used);

  const [value, setValue] = useState(String(assigned));
  const [error, setError] = useState("");

  useEffect(() => {
    setValue(String(receipt.assignedEntries ?? 0));
    setError("");
  }, [receipt._id, receipt.assignedEntries]);

  const handleSave = async () => {
    const parsed = parsePositiveEntryCount(value);
    if (!parsed.valid) {
      setError(parsed.message);
      return;
    }

    if (parsed.value < used) {
      setError(`Олгосон эрх ашигласан эрхээс (${used}) бага байж болохгүй`);
      return;
    }

    setError("");
    await onSave(parsed.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card-gradient rounded-2xl border border-gold/35 shadow-gold-lg">
        <div className="flex items-center justify-between p-5 border-b border-gold/20">
          <h2 className="font-display text-lg text-gold-light font-bold">
            Эрх засах
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-cream/60 hover:text-cream hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-xl border border-gold/20 bg-coffee-dark/40 p-4 space-y-2 text-sm">
            <p className="text-cream/50 text-xs">И-Баримтын дугаар</p>
            <p className="text-cream font-medium">{receipt.receiptNumber}</p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <p className="text-cream/50 text-xs">Олгосон</p>
                <p className="text-gold font-semibold">{assigned}</p>
              </div>
              <div>
                <p className="text-cream/50 text-xs">Ашигласан</p>
                <p className="text-cream">{used}</p>
              </div>
              <div>
                <p className="text-cream/50 text-xs">Үлдсэн</p>
                <p className="text-gold-light font-semibold">{remaining}</p>
              </div>
            </div>
          </div>

          <div>
            <Input
              label="Шинэ эрхийн тоо"
              type="number"
              min={minAllowed}
              step={1}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              error={error}
              required
              className="w-full"
            />
            <p className="text-cream/45 text-xs mt-2">
              Дурын эерэг бүхэл тоо оруулж болно (жишээ: 15, 50, 100).
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => setValue(String(ENTRY_PRESETS.sachet))}
                className="px-3 py-2 rounded-xl text-sm bg-gold/10 text-gold border border-gold/20"
              >
                1 эрх (5 ширхэг)
              </button>
              <button
                type="button"
                onClick={() => setValue(String(ENTRY_PRESETS.bag))}
                className="px-3 py-2 rounded-xl text-sm bg-gold/10 text-gold border border-gold/20"
              >
                10 эрх (1 уут)
              </button>
            </div>
          </div>

          {receipt.entriesUpdatedAt && (
            <p className="text-cream/40 text-xs">
              Сүүлд зассан: {formatDateTime(receipt.entriesUpdatedAt)}
              {receipt.entriesUpdatedBy
                ? ` · ${receipt.entriesUpdatedBy}`
                : ""}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Болих
            </Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">
              Хадгалах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
