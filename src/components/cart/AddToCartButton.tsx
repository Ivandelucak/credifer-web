"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { CartProduct } from "@/types/cart";

type AddToCartButtonProps = {
  product: CartProduct;
  variant?: "primary" | "secondary" | "compact";
  className?: string;
};

export function AddToCartButton({
  product,
  variant = "primary",
  className = "",
}: AddToCartButtonProps) {
  const { addItem, isInCart } = useCart();
  const [wasAdded, setWasAdded] = useState(false);

  const alreadyInCart = isInCart(product.id);

  function handleAddToCart() {
    addItem(product);
    setWasAdded(true);

    window.setTimeout(() => {
      setWasAdded(false);
    }, 1600);
  }

  const label = wasAdded
    ? "Agregado"
    : alreadyInCart
      ? "Agregar otro"
      : "Agregar al carrito";

  const baseClass =
    "inline-flex items-center justify-center rounded-full text-sm font-black transition focus-ring";

  const variantClass =
    variant === "compact"
      ? "bg-[var(--brand-blue)] px-4 py-2.5 text-white hover:bg-[var(--brand-blue-dark)]"
      : variant === "secondary"
        ? "border border-[var(--border-strong)] bg-white px-6 py-3 text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
        : "bg-[var(--brand-blue)] px-6 py-3 text-white shadow-[0_14px_32px_rgba(2,100,169,0.18)] hover:bg-[var(--brand-blue-dark)]";

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {label}
    </button>
  );
}
