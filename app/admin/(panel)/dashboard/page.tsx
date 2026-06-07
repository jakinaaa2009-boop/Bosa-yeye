"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminStatsCards from "@/components/AdminStatsCards";
import AdminPrizePoolSummary from "@/components/AdminPrizePoolSummary";

interface PrizeSummary {
  _id: string;
  name: string;
  type: "car" | "cash";
  carModel?: string;
  amount?: number;
  quantity: number;
  remainingQuantity: number;
}

interface StatsData {
  stats: {
    totalUsers: number;
    totalReceipts: number;
    pendingReceipts: number;
    approvedReceipts: number;
    rejectedReceipts: number;
    totalWinners: number;
  };
  prizePool: {
    totalWinnersCap: number;
    totalRemaining: number;
    prizes: PrizeSummary[];
  };
  receiptsByDay: { date: string; count: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-cream/50">Өгөгдөл ачааллахад алдаа гарлаа</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-gold-light font-bold">
          Dashboard
        </h1>
        <p className="text-cream/50 text-sm mt-1">
          YE YE кампанит ажлын ерөнхий статистик
        </p>
      </div>

      <AdminStatsCards stats={data.stats} />

      {data.prizePool && (
        <AdminPrizePoolSummary
          prizes={data.prizePool.prizes}
          totalWinners={data.stats.totalWinners}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card-gradient rounded-2xl border border-gold/20 p-6">
          <h3 className="text-gold font-semibold mb-4">
            Баримтын бүртгэл (30 хоног)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.receiptsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D6A84F20" />
              <XAxis
                dataKey="date"
                stroke="#FFF4D660"
                fontSize={12}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis stroke="#FFF4D660" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A0E0A",
                  border: "1px solid #D6A84F40",
                  borderRadius: "12px",
                  color: "#FFF4D6",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#D6A84F"
                strokeWidth={2}
                dot={{ fill: "#F7D978", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-gradient rounded-2xl border border-gold/20 p-6">
          <h3 className="text-gold font-semibold mb-4">Баримтын төлөв</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.statusBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.statusBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A0E0A",
                  border: "1px solid #D6A84F40",
                  borderRadius: "12px",
                  color: "#FFF4D6",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
