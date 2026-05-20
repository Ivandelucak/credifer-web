"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/products/ProductCard";
import { formatCurrency } from "@/lib/formatters";

type RelatedProductsCarouselProps = {
  products: ProductCardProduct[];
};

function chunkProducts(products: ProductCardProduct[], size: number) {
  const chunks: ProductCardProduct[][] = [];

  for (let index = 0; index < products.length; index += size) {
    chunks.push(products.slice(index, index + size));
  }

  return chunks;
}

function RelatedProductCompactCard({
  product,
}: {
  product: ProductCardProduct;
}) {
  const primaryImage = product.images[0] ?? null;
  const categoryLabel =
    product.subcategory?.name ?? product.category?.name ?? "Producto";

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex h-full w-[46vw] min-w-[168px] max-w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-[#C9D6E4] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition active:scale-[0.99] focus-ring"
    >
      <div className="relative h-32 border-b border-[#C9D6E4] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)]">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-blue-soft)] text-xl font-black text-[var(--brand-blue)] shadow-sm">
              {product.name.charAt(0).toUpperCase()}
            </div>

            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--brand-blue)]">
              Imagen a confirmar
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--brand-blue-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--brand-blue-dark)]">
            {categoryLabel}
          </span>

          {product.brand ? (
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[var(--text-secondary)] shadow-sm">
              {product.brand.name}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-[var(--text-primary)] group-hover:text-[var(--brand-blue)]">
          {product.name}
        </h3>

        <div className="mt-auto pt-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Precio contado
          </p>

          <p className="mt-1 text-lg font-black tracking-tight text-[var(--brand-blue-dark)]">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function RelatedProductsCarousel({
  products,
}: RelatedProductsCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = useMemo(() => chunkProducts(products, 3), [products]);

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
    <section className="mt-9">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            También puede interesarte
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
            Productos relacionados
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Otros productos similares para seguir comparando y consultar juntos.
          </p>
        </div>

        <Link
          href="/productos"
          className="hidden rounded-full border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring sm:inline-flex"
        >
          Ver más productos
        </Link>
      </div>

      {/* Mobile / tablet: scroll táctil con cards compactas */}
      <div className="lg:hidden">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <RelatedProductCompactCard key={product.id} product={product} />
          ))}
        </div>

        {products.length > 2 ? (
          <p className="text-xs font-bold text-[var(--text-muted)]">
            Deslizá para ver más productos.
          </p>
        ) : null}
      </div>

      {/* Desktop: carrusel por páginas con animación de bloque completo */}
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
          aria-label="Ver más productos relacionados"
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
                key={`related-page-${pageIndex}`}
                className="grid shrink-0 grid-cols-3 gap-5"
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
