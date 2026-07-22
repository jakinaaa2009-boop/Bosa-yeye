"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationPages } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  loading = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPaginationPages(page, totalPages);
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "mt-6 flex flex-col sm:flex-row items-center justify-between gap-4",
        className
      )}
    >
      <p className="text-cream/50 text-sm">
        {rangeStart}–{rangeEnd} / {totalItems}
      </p>

      <nav
        className="flex items-center gap-1"
        aria-label="Хуудас солих"
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="p-2 rounded-lg border border-gold/20 text-cream/70 hover:text-gold hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Өмнөх хуудас"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-cream/40 text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={loading}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "min-w-[40px] h-10 px-3 rounded-xl text-sm font-semibold border transition-colors",
                item === page
                  ? "bg-gold-gradient text-coffee-dark border-transparent"
                  : "bg-coffee-dark/60 text-cream/70 border-gold/20 hover:border-gold/40 hover:text-gold"
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="p-2 rounded-lg border border-gold/20 text-cream/70 hover:text-gold hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Дараах хуудас"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
