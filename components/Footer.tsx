"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import SiteLogo from "./SiteLogo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/login" || pathname === "/register") return null;
  return (
    <footer className="bg-coffee-dark border-t border-gold/20 relative">
      <div className="absolute inset-0 coffee-texture opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <SiteLogo variant="yeye" className="h-10 w-auto max-w-[36px]" />
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/95">
                <SiteLogo variant="bosa" className="h-5 w-auto max-w-[96px]" />
              </span>
            </div>
            <p className="text-cream/50 text-sm leading-relaxed">
              YE YE 3 in 1 Instant Coffee Mix — Азын сугалааны кампанит ажил
            </p>
          </div>

          <div>
            <h3 className="text-gold font-semibold mb-4">Кампани</h3>
            <ul className="space-y-2">
              {[
                { href: "/#how-to-join", label: "Хэрхэн оролцох вэ?" },
                { href: "/prizes", label: "Шагналууд" },
                { href: "/winners", label: "Ялагчид" },
                { href: "/my-receipts", label: "Миний баримтууд" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/60 hover:text-gold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold font-semibold mb-4">Тусламж</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-cream/60 text-sm">Түгээмэл асуулт</span>
              </li>
              <li>
                <span className="text-cream/60 text-sm">Холбоо барих</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gold font-semibold mb-4">Холбоо барих</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-cream/60 text-sm">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                8005-8283
              </li>
              <li className="flex items-center gap-2 text-cream/60 text-sm">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                info@yeyecoffee.mn
              </li>
              <li className="flex items-center gap-2 text-cream/60 text-sm">
                <Globe className="w-4 h-4 text-gold shrink-0" />
                www.yeyecoffee.mn
              </li>
              <li className="flex items-start gap-2 text-cream/60 text-sm">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                Улаанбаатар хот, Монгол Улс
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gold/10 text-center">
          <p className="text-cream/40 text-sm">
            © {new Date().getFullYear()} YE YE Coffee. Бүх эрх хамгаалагдсан.
          </p>
        </div>
      </div>
    </footer>
  );
}
