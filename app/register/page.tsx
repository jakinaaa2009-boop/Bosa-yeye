"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { normalizeAuthUser, useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, age: Number(age), password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      setUser(normalizeAuthUser(data.user));
      router.push("/upload-receipt");
      router.refresh();
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Бүртгүүлэх" subtitle="YE YE азын сугалаанд оролцоорой">
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
          label="Email хаяг"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Нас"
          type="number"
          placeholder="18"
          min="18"
          max="120"
          value={age}
          onChange={(e) => setAge(e.target.value)}
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
          Бүртгүүлэх
        </Button>

        <p className="text-center text-cream/60 text-sm">
          Бүртгэлтэй юу?{" "}
          <Link href="/login" className="text-gold hover:underline">
            Нэвтрэх
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
