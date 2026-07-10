"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import Input from "./Input";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import { PARTICIPATION_RULES } from "@/lib/site-content";
import { ENTRY_PRESETS, parsePositiveEntryCount } from "@/lib/lottery-entries";

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
  rejectionReason?: string;
  createdAt: string;
  userId: ReceiptUser;
}

interface ReceiptPreviewModalProps {
  receipt: Receipt;
  onClose: () => void;
  onApprove: (assignedEntries: number) => void;
  onReject: (reason: string) => void;
  loading?: boolean;
  initialRejectMode?: boolean;
}

export default function ReceiptPreviewModal({
  receipt,
  onClose,
  onApprove,
  onReject,
  loading,
  initialRejectMode = false,
}: ReceiptPreviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(initialRejectMode);
  const [rejectError, setRejectError] = useState("");
  const [assignedEntries, setAssignedEntries] = useState(
    String(ENTRY_PRESETS.sachet)
  );
  const [approveError, setApproveError] = useState("");

  useEffect(() => {
    setShowRejectInput(initialRejectMode);
    setRejectReason("");
    setRejectError("");
  }, [receipt._id, initialRejectMode]);

  const handleReject = () => {
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("Татгалзсан шалтгаан заавал оруулна уу");
      return;
    }
    if (trimmed.length > 500) {
      setRejectError("Татгалзах шалтгаан хэт урт байна");
      return;
    }
    setRejectError("");
    onReject(trimmed);
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-cream/50 text-xs mb-1">И-Баримтын дугаар</p>
              <p className="text-cream font-medium">{receipt.receiptNumber}</p>
            </div>
            <div>
              <p className="text-cream/50 text-xs mb-1">Үнийн дүн</p>
              <p className="text-gold font-medium">
                {formatCurrency(receipt.amount)}
              </p>
            </div>
            <div>
              <p className="text-cream/50 text-xs mb-1">Бүтээгдэхүүний тоо</p>
              <p className="text-cream font-medium">
                {receipt.productCount ?? "—"}
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

          {receipt.status === "rejected" && receipt.rejectionReason && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
              <p className="text-cream/60 text-xs mb-1">Татгалзсан шалтгаан:</p>
              <p className="text-cream text-sm">{receipt.rejectionReason}</p>
            </div>
          )}

          {receipt.status === "pending" && (
            <div className="space-y-4 pt-4 border-t border-gold/20">
              <p className="text-cream/50 text-xs leading-relaxed">
                {PARTICIPATION_RULES.adminNote}
              </p>
              {!showRejectInput ? (
                <>
                  <div>
                    <p className="text-cream/50 text-xs mb-2">
                      Сугалааны эрх олгох
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={assignedEntries}
                        onChange={(e) => {
                          setAssignedEntries(e.target.value);
                          if (approveError) setApproveError("");
                        }}
                        className="w-full sm:w-36"
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
                    <p className="text-cream/45 text-xs mt-2">
                      Дурын эерэг бүхэл тоо оруулж болно (жишээ: 15, 50, 100).
                    </p>
                    {approveError && (
                      <p className="text-danger text-sm mt-1">{approveError}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => {
                        const parsed = parsePositiveEntryCount(assignedEntries);
                        if (!parsed.valid) {
                          setApproveError(parsed.message);
                          return;
                        }
                        setApproveError("");
                        onApprove(parsed.value);
                      }}
                      loading={loading}
                      className="flex-1"
                    >
                      Батлах
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setShowRejectInput(true)}
                      className="flex-1"
                    >
                      Татгалзах
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="rejection-reason"
                      className="block text-gold-light/90 text-sm font-medium mb-2"
                    >
                      Татгалзсан шалтгаан: <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="rejection-reason"
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        if (rejectError) setRejectError("");
                      }}
                      placeholder="Татгалзсан шалтгаанаа бичнэ үү..."
                      rows={4}
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-coffee-dark/80 border border-gold/25",
                        "text-cream placeholder:text-cream/40 resize-y min-h-[100px]",
                        "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50",
                        "transition-all duration-300",
                        rejectError &&
                          "border-danger focus:border-danger focus:ring-danger/50"
                      )}
                    />
                    {rejectError && (
                      <p className="mt-1.5 text-sm text-danger">{rejectError}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectInput(false);
                        setRejectReason("");
                        setRejectError("");
                      }}
                      className="flex-1"
                    >
                      Буцах
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleReject}
                      loading={loading}
                      className="flex-1"
                    >
                      Татгалзах батлах
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
