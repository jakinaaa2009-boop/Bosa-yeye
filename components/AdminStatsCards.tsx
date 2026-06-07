"use client";

import {
  Users,
  ReceiptText,
  CheckCircle,
  Clock,
  XCircle,
  Trophy,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalReceipts: number;
  pendingReceipts: number;
  approvedReceipts: number;
  rejectedReceipts: number;
  totalWinners: number;
}

interface AdminStatsCardsProps {
  stats: Stats;
}

const statCards = [
  { key: "totalUsers" as const, label: "Нийт хэрэглэгч", icon: Users, color: "text-gold" },
  { key: "totalReceipts" as const, label: "Нийт баримт", icon: ReceiptText, color: "text-cream" },
  { key: "approvedReceipts" as const, label: "Баталгаажсан", icon: CheckCircle, color: "text-success" },
  { key: "pendingReceipts" as const, label: "Хүлээгдэж буй", icon: Clock, color: "text-warning" },
  { key: "rejectedReceipts" as const, label: "Татгалзсан", icon: XCircle, color: "text-danger" },
  { key: "totalWinners" as const, label: "Нийт азтан", icon: Trophy, color: "text-gold-light" },
];

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="bg-card-gradient rounded-2xl border border-gold/20 p-4 shadow-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <card.icon className={`w-5 h-5 ${card.color}`} />
            <span className="text-cream/60 text-xs">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-cream">{stats[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
