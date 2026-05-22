"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { softDeleteProduct } from "@/app/admin/(protected)/productos/actions";

type ProductSoftDeleteButtonProps = {
  productId: number;
  returnTo: string;
  productName?: string;
  label?: string;
  className?: string;
  variant?: "pill" | "menu";
};

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function ProductSoftDeleteButton({
  productId,
  returnTo,
  productName,
  label = "Eliminar",
  className = "",
  variant = "pill",
}: ProductSoftDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const triggerClassName =
    className ||
    (variant === "menu"
      ? "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-black text-red-700 transition hover:bg-red-50 focus-ring"
      : "rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:border-red-300 focus-ring");

  const modal = isOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`delete-product-title-${productId}`}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-red-100 bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_100%)] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <WarningIcon />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">
                Confirmar eliminación
              </p>

              <h2
                id={`delete-product-title-${productId}`}
                className="mt-2 text-2xl font-black leading-tight tracking-[-0.025em] text-[var(--text-primary)]"
              >
                ¿Eliminar este producto?
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            El producto dejará de aparecer en la tienda pública, pero no se
            borra definitivamente de la base de datos.
          </p>

          {productName ? (
            <div className="mt-4 rounded-2xl border border-[#D6E3EF] bg-[var(--catalog-surface-soft)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Producto
              </p>
              <p className="mt-1 text-sm font-black text-[var(--text-primary)]">
                {productName}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Cancelar
            </button>

            <form action={softDeleteProduct}>
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="returnTo" value={returnTo} />

              <button
                type="submit"
                className="tap-feedback inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(220,38,38,0.22)] transition hover:-translate-y-0.5 hover:bg-red-700 focus-ring"
              >
                <TrashIcon />
                Eliminar producto
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        {variant === "menu" ? <TrashIcon /> : null}
        <span>{label}</span>
      </button>

      {isMounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
