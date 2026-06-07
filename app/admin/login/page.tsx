"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { normalizeAuthUser, useAuth } from "@/lib/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser, refreshUser } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: identifier,
          password,
          scope: "admin",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      setUser(normalizeAuthUser(data.user));
      await refreshUser();
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Админ нэвтрэх" subtitle="YE YE удирдлагын систем">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-danger/20 border border-danger/40 text-danger text-sm">
              {error}
            </div>
          )}

          <Input
            label="Хэрэглэгчийн нэр"
            placeholder="admin"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Нэвтрэх
          </Button>
        </form>
      </AuthCard>
  );
}
