"use client";

import { X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import Input from "./Input";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PARTICIPATION_RULES } from "@/lib/site-content";
import { ENTRY_PRESETS } from "@/lib/lottery-entries";
import { useState } from "react";

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
  createdAt: string;
  userId: ReceiptUser;
}

interface ReceiptPreviewModalProps {
  receipt: Receipt;
  onClose: () => void;
  onApprove: (assignedEntries: number) => void;
  onReject: (reason?: string) => void;
  loading?: boolean;
}

export default function ReceiptPreviewModal({
  receipt,
  onClose,
  onApprove,
  onReject,
  loading,
}: ReceiptPreviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [assignedEntries, setAssignedEntries] = useState(
    String(ENTRY_PRESETS.sachet)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card-gradient rounded-2xl border border-gold/35 shadow-gold-lg">
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h2 className="font-display text-xl text-gold-light font-bold">
            Баримтын дэлгэрэнгүй
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-cream/60 hover:text-cream hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-xl overflow-hidden border border-gold/20 bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receipt.imageUrl}
              alt="Receipt"
              className="w-full max-h-[70vh] object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-cream/50 text-xs mb-1">Баримтын дугаар</p>
              <p className="text-cream font-medium">{receipt.receiptNumber}</p>
            </div>
            <div>
              <p className="text-cream/50 text-xs mb-1">Үнийн дүн</p>
              <p className="text-gold font-medium">
                {formatCurrency(receipt.amount)}
              </p>
            </div>
            <div>
              <p className="text-cream/50 text-xs mb-1">Утас</p>
              <p className="text-cream">{receipt.userId?.phone}</p>
            </div>
            <div>
              <p className="text-cream/50 text-xs mb-1">Email</p>
              <p className="text-cream">{receipt.userId?.email}</p>
            </div>
            <div>
              <p className="text-cream/50 text-xs mb-1">Огноо</p>
              <p className="text-cream/70 text-sm">
                {formatDateTime(receipt.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-cream/50 text-xs mb-1">Төлөв</p>
              <StatusBadge status={receipt.status} />
            </div>
          </div>

          {receipt.status === "pending" && (
            <div className="space-y-4 pt-4 border-t border-gold/20">
              <p className="text-cream/50 text-xs leading-relaxed">
                {PARTICIPATION_RULES.adminNote}
              </p>
              <div>
                <p className="text-cream/50 text-xs mb-2">
                  Сугалааны эрх олгох
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={assignedEntries}
                    onChange={(e) => setAssignedEntries(e.target.value)}
                    className="w-28"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAssignedEntries(String(ENTRY_PRESETS.sachet))
                    }
                    className="px-3 py-2 rounded-xl text-sm bg-gold/10 text-gold border border-gold/20"
                  >
                    1 эрх (5 ширхэг)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAssignedEntries(String(ENTRY_PRESETS.bag))
                    }
                    className="px-3 py-2 rounded-xl text-sm bg-gold/10 text-gold border border-gold/20"
                  >
                    10 эрх (1 уут)
                  </button>
                </div>
              </div>
              {showRejectInput && (
                <Input
                  label="Татгалзах шалтгаан (заавал биш)"
                  placeholder="Шалтгаан..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => onApprove(Number(assignedEntries) || 1)}
                  loading={loading}
                  className="flex-1"
                >
                  Батлах
                </Button>
                {!showRejectInput ? (
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectInput(true)}
                    className="flex-1"
                  >
                    Татгалзах
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => onReject(rejectReason)}
                    loading={loading}
                    className="flex-1"
                  >
                    Татгалзах батлах
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
