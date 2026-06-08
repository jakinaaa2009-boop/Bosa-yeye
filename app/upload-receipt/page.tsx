"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ReceiptUploadForm from "@/components/ReceiptUploadForm";
import ParticipationRules from "@/components/ParticipationRules";
import { useAuth } from "@/lib/auth-context";

export default function UploadReceiptPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/upload-receipt");
    } else if (!loading && user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role === "admin") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="relative max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-gold-light font-bold">
            Баримт бүртгүүлэх
          </h1>
          <p className="text-cream/60 mt-2">
            Худалдан авалтын баримтаа оруулна уу
          </p>
        </div>

        <div className="bg-card-gradient rounded-2xl border border-gold/35 shadow-gold p-8 space-y-6">
          <ParticipationRules variant="note" />
          <ReceiptUploadForm />
        </div>
      </div>
    </div>
  );
}
