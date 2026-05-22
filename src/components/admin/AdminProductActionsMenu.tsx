"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toggleProductActive } from "@/app/admin/(protected)/productos/actions";
import { ProductRestoreButton } from "@/components/admin/ProductRestoreButton";
import { ProductSoftDeleteButton } from "@/components/admin/ProductSoftDeleteButton";

type AdminProductActionsMenuProps = {
  productId: number;
  productName: string;
  productSlug: string;
  isActive: boolean;
  publicPath: string;
  returnTo: string;
  isDeletedView: boolean;
};

function ExternalLinkIcon() {
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
      <path d="M14 3h7v7" />
      <path d="M21 3 10 14" />
      <path d="M11 5H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5" />
    </svg>
  );
}

function PencilIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function EyeIcon() {
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
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
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
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9 4.5 10 7a12.66 12.66 0 0 1-2.54 3.68" />
      <path d="M6.61 6.61A12.31 12.31 0 0 0 2 12c1 2.5 5 7 10 7a10.8 10.8 0 0 0 4.39-.9" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

export function AdminProductActionsMenu({
  productId,
  productName,
  productSlug,
  isActive,
  publicPath,
  returnTo,
  isDeletedView,
}: AdminProductActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (!wrapperRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const editHref = `/admin/productos/${productId}/editar?returnTo=${encodeURIComponent(
    returnTo,
  )}`;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Abrir acciones del producto"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="tap-feedback flex h-10 w-10 items-center justify-center rounded-full border border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
      >
        <DotsIcon />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-[#B7CADA] bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.18)]"
        >
          <Link
            href={publicPath}
            target="_blank"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-[var(--text-secondary)] transition hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-dark)] focus-ring"
          >
            <ExternalLinkIcon />
            <span>Ver en tienda</span>
          </Link>

          <Link
            href={editHref}
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-[var(--text-secondary)] transition hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-dark)] focus-ring"
          >
            <PencilIcon />
            <span>Editar producto</span>
          </Link>

          <div className="my-2 h-px bg-[#D6E3EF]" />

          <form action={toggleProductActive}>
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="nextValue" value={String(!isActive)} />
            <input type="hidden" name="returnTo" value={returnTo} />

            <button
              type="submit"
              role="menuitem"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-black transition focus-ring ${
                isActive
                  ? "text-amber-700 hover:bg-amber-50"
                  : "text-green-700 hover:bg-green-50"
              }`}
            >
              {isActive ? <EyeOffIcon /> : <EyeIcon />}
              <span>{isActive ? "Ocultar producto" : "Activar producto"}</span>
            </button>
          </form>

          <div className="my-2 h-px bg-[#D6E3EF]" />

          {isDeletedView ? (
            <ProductRestoreButton
              productId={productId}
              returnTo={returnTo}
              variant="menu"
            />
          ) : (
            <ProductSoftDeleteButton
              productId={productId}
              returnTo={returnTo}
              productName={productName}
              variant="menu"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
