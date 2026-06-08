"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SiteLogo from "./SiteLogo";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  className,
}: AuthCardProps) {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center px-4 pt-16 pb-10 lg:pt-20 lg:pb-14 min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-5rem)]">
      <div className="absolute inset-0 bg-hero-gradient opacity-35" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(100%,28rem)] h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div
        className={cn(
          "relative w-full max-w-[420px] rounded-2xl border border-gold/30 overflow-hidden",
          "bg-gradient-to-b from-coffee-brown/95 via-coffee-dark/98 to-wine-red/40",
          "shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(214,168,79,0.08)]",
          className
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,244,214,0.04)_0%,transparent_45%)] pointer-events-none" />

        <div className="relative p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-5">
              <SiteLogo variant="yeye" className="h-20 w-auto drop-shadow-[0_4px_20px_rgba(214,168,79,0.25)]" />
            </div>
            <h1 className="font-display text-2xl sm:text-[1.65rem] text-gold-light font-bold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-cream/55 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
