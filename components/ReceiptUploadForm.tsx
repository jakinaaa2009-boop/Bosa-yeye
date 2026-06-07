"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./Input";
import UploadBox from "./UploadBox";
import Button from "./Button";

export default function ReceiptUploadForm() {
  const router = useRouter();
  const [receiptNumber, setReceiptNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Баримтын зураг оруулна уу");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("receiptNumber", receiptNumber);
      formData.append("amount", amount);
      formData.append("image", file);

      const res = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess(data.message);
      setReceiptNumber("");
      setAmount("");
      setFile(null);
      setTimeout(() => router.push("/my-receipts"), 2000);
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-danger/20 border border-danger/40 text-danger text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-success/20 border border-success/40 text-success text-sm">
          {success}
        </div>
      )}

      <Input
        label="Баримтын дугаар"
        placeholder="Баримтын дугаараа оруулна уу"
        value={receiptNumber}
        onChange={(e) => setReceiptNumber(e.target.value)}
        required
      />

      <Input
        label="Үнийн дүн"
        type="number"
        placeholder="0"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <div>
        <label className="block text-cream/90 text-sm font-medium mb-2">
          Баримтын зураг
        </label>
        <UploadBox onFileSelect={setFile} />
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Баримт бүртгүүлэх
      </Button>
    </form>
  );
}
