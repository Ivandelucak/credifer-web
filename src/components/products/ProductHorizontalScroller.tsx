"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/products/ProductCard";

type ProductHorizontalScrollerProps = {
  scrollId: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
  products: ProductCardProduct[];
};

function chunkProducts(products: ProductCardProduct[], size: number) {
  const chunks: ProductCardProduct[][] = [];

  for (let index = 0; index < products.length; index += size) {
    chunks.push(products.slice(index, index + size));
  }

  return chunks;
}

export function ProductHorizontalScroller({
  scrollId,
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
  products,
}: ProductHorizontalScrollerProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = useMemo(() => chunkProducts(products, 4), [products]);

  const totalPages = pages.length;
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const safeTotalPages = Math.max(totalPages, 1);
  const desktopTrackWidth = `${safeTotalPages * 100}%`;
  const desktopSlideWidth = `${100 / safeTotalPages}%`;
  const desktopTranslate = `${currentPage * (100 / safeTotalPages)}%`;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages - 1, 0)));
  }, [totalPages]);

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(page - 1, 0));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(page + 1, totalPages - 1));
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-4 lg:py-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base lg:leading-7">
            {description}
          </p>
        </div>

        <Link
          href={href}
          className="hidden rounded-md text-sm font-black text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)] focus-ring sm:inline-flex"
        >
          {hrefLabel}
        </Link>
      </div>

      {/* Mobile / tablet: scroll táctil */}
      <div className="lg:hidden">
        <div
          id={scrollId}
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[210px] shrink-0 snap-start sm:w-[265px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {products.length > 2 ? (
          <p className="text-xs font-bold text-[var(--text-muted)]">
            Deslizá para ver más productos.
          </p>
        ) : null}

        <div className="mt-4 sm:hidden">
          <Link
            href={href}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            {hrefLabel}
          </Link>
        </div>
      </div>

      {/* Desktop: carrusel animado por páginas */}
      <div className="relative hidden lg:block">
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={!canGoPrevious}
          aria-label="Ver productos anteriores"
          className="absolute -left-7 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-2xl font-black text-[var(--brand-blue-dark)] shadow-[0_14px_32px_rgba(15,23,42,0.16)] transition hover:-translate-x-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] disabled:pointer-events-none disabled:opacity-0 focus-ring"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={!canGoNext}
          aria-label="Ver más productos"
          className="absolute -right-7 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-2xl font-black text-[var(--brand-blue-dark)] shadow-[0_14px_32px_rgba(15,23,42,0.16)] transition hover:translate-x-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] disabled:pointer-events-none disabled:opacity-0 focus-ring"
        >
          ›
        </button>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: desktopTrackWidth,
              transform: `translateX(-${desktopTranslate})`,
            }}
          >
            {pages.map((page, pageIndex) => (
              <div
                key={`${scrollId}-page-${pageIndex}`}
                className="grid shrink-0 grid-cols-4 gap-5"
                style={{
                  width: desktopSlideWidth,
                }}
              >
                {page.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
