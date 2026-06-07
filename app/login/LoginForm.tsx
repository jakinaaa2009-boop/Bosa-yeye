"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { normalizeAuthUser, useAuth } from "@/lib/auth-context";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { user, loading, setUser, refreshUser } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }
      router.replace(redirect);
    }
  }, [user, loading, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, scope: "user" }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      setUser(normalizeAuthUser(data.user));
      await refreshUser();
      router.replace(redirect);
      router.refresh();
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[calc(100dvh-5rem)] bg-coffee-dark">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthCard title="Нэвтрэх" subtitle="YE YE азын сугалаанд оролцоорой">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-danger/20 border border-danger/40 text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label="Утасны дугаар"
          placeholder="88888888"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <Input
          label="Нууц үг"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" loading={submitting} className="w-full" size="lg">
          Нэвтрэх
        </Button>

        <p className="text-center text-cream/60 text-sm">
          Бүртгэлгүй юу?{" "}
          <Link href="/register" className="text-gold hover:underline">
            Бүртгүүлэх
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
