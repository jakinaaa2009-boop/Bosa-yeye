"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Input from "./Input";
import { formatDateTime } from "@/lib/utils";
import Button from "./Button";

interface UserRow {
  _id: string;
  phone: string;
  email: string;
  age: number;
  receiptCount: number;
  createdAt: string;
}

export default function AdminUsersTable() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=10`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setUsers(data.users);
            setTotalPages(data.pagination.totalPages);
          }
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <div>
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40 z-10" />
        <Input
          placeholder="Утас эсвэл email хайх..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gold/20">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-coffee-brown/80 border-b border-gold/20">
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Утас</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Email</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Нас</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Баримт</th>
              <th className="px-4 py-3 text-left text-cream/70 text-sm">Огноо</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-cream/50">
                  Ачааллаж байна...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-cream/50">
                  Хэрэглэгч олдсонгүй
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gold/10 hover:bg-gold/5"
                >
                  <td className="px-4 py-3 text-cream text-sm">{user.phone}</td>
                  <td className="px-4 py-3 text-cream/70 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-cream/70 text-sm">{user.age}</td>
                  <td className="px-4 py-3 text-gold text-sm">{user.receiptCount}</td>
                  <td className="px-4 py-3 text-cream/50 text-sm">
                    {formatDateTime(user.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-cream/60 text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
