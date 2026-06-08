"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MyReceiptsTable from "@/components/MyReceiptsTable";
import { useAuth } from "@/lib/auth-context";

export default function MyReceiptsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/my-receipts");
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
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-gold-light font-bold">
            Миний баримтууд
          </h1>
          <p className="text-cream/60 mt-2">
            Таны бүртгүүлсэн баримтуудын жагсаалт
          </p>
        </div>

        <MyReceiptsTable />
      </div>
    </div>
  );
}
