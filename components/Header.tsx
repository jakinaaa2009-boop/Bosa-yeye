"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import Button from "./Button";
import SiteLogo from "./SiteLogo";
import { useAuth, type AuthUser } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

const publicLinks: NavLink[] = [
  { href: "/", label: "Нүүр" },
  { href: "/#how-to-join", label: "Хэрхэн оролцох вэ?" },
  { href: "/#prizes", label: "Шагналын сан" },
  { href: "/winners", label: "Ялагчид" },
];

const userOnlyLinks: NavLink[] = [
  { href: "/upload-receipt", label: "Баримт бүртгүүлэх" },
  { href: "/my-receipts", label: "Миний баримтууд" },
];

function getNavLinks(user: AuthUser | null): NavLink[] {
  if (!user) return publicLinks;

  if (user.role === "admin") {
    return [
      { href: "/", label: "Нүүр" },
      { href: "/#prizes", label: "Шагналын сан" },
      { href: "/winners", label: "Ялагчид" },
      { href: "/admin/dashboard", label: "Admin Panel" },
    ];
  }

  return [...publicLinks, ...userOnlyLinks];
}

function isLinkActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href;
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = getNavLinks(user);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-coffee-dark/80 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0"
          >
            <SiteLogo
              variant="yeye"
              priority
              className="h-10 sm:h-11 w-auto max-w-[80px] shrink-0"
            />
            <span
              className="hidden sm:block h-7 w-px bg-gold/25 shrink-0"
              aria-hidden
            />
            <span className="hidden sm:flex items-center h-8 px-2 rounded-md bg-white/95 shrink-0">
              <SiteLogo
                variant="bosa"
                className="h-[18px] w-auto max-w-[96px]"
              />
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isLinkActive(pathname, link.href)
                    ? "text-gold bg-gold/10"
                    : "text-cream/70 hover:text-gold hover:bg-gold/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Гарах
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Нэвтрэх
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Бүртгүүлэх</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-cream hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Цэс нээх"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-coffee-brown/98 border-t border-gold/20">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-cream/80 hover:text-gold hover:bg-gold/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gold/20 space-y-2">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Гарах
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Нэвтрэх
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Бүртгүүлэх</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
