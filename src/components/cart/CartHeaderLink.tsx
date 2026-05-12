"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function CartHeaderLink() {
  const { itemsCount, isHydrated } = useCart();

  const count = isHydrated ? itemsCount : 0;

  return (
    <Link
      href="/carrito"
      className="relative rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
    >
      Carrito
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--brand-red)] px-1.5 text-xs font-black text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
