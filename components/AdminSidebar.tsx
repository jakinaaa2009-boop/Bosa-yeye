"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Trophy,
  CircleDot,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SiteLogo from "./SiteLogo";

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: Users },
  { href: "/admin/receipts", label: "Баримтууд", icon: ReceiptText },
  { href: "/admin/winners", label: "Ялагчид", icon: Trophy },
  { href: "/admin/lucky-wheel", label: "Сугалаа", icon: CircleDot },
  { href: "/prizes", label: "Шагналууд", icon: Gift },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gold/20">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <SiteLogo variant="yeye" className="h-10 w-auto shrink-0" />
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/95">
              <SiteLogo variant="bosa" className="h-5 w-auto max-w-[110px]" />
            </span>
            <p className="text-cream/40 text-xs mt-1.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-cream/60 hover:text-gold hover:bg-gold/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gold/20 space-y-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-cream/40 w-full hover:text-cream/60 transition-colors">
          <Settings className="w-5 h-5" />
          Тохиргоо
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-danger/80 w-full hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Гарах
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-coffee-brown border border-gold/30 text-gold"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-coffee-dark border-r border-gold/20 z-50 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 text-cream/60 hover:text-cream"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
