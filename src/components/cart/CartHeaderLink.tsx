"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function CartHeaderLink() {
  const { itemsCount, isHydrated } = useCart();

  const count = isHydrated ? itemsCount : 0;

  return (
    <Link
      href="/carrito"
      className="group relative inline-flex items-center gap-2 rounded-2xl border border-[#C9D6E4] bg-white px-4 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:border-[var(--brand-blue)] hover:bg-[#EAF4FB] hover:text-[var(--brand-blue)] focus-ring"
      aria-label={`Ir al carrito${count > 0 ? `, ${count} productos` : ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 transition group-hover:scale-105"
        fill="none"
      >
        <path
          d="M6.5 7.5h14l-1.4 7.15a2 2 0 0 1-1.96 1.6H9.3a2 2 0 0 1-1.98-1.72L6.1 5.65A1.5 1.5 0 0 0 4.62 4.4H3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 20.2h.01M17.2 20.2h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <span>Carrito</span>

      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--brand-red)] px-1.5 text-xs font-black text-white shadow-[0_6px_14px_rgba(220,38,38,0.28)]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
