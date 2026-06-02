//src/components/products/CatalogFilters.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

type SubcategoryOption = {
  id: number;
  name: string;
  slug: string;
};

type BrandOption = {
  id: number;
  name: string;
  slug: string;
};

type OrderOption = {
  label: string;
  value: string;
};

type CatalogFiltersProps = {
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  brands: BrandOption[];
  orderOptions: OrderOption[];
  query: string;
  selectedCategory: string;
  selectedSubcategory: string;
  selectedBrand: string;
  selectedOrder: string;
  activeFiltersCount: number;
  hasFilters: boolean;
};

type FilterFormProps = CatalogFiltersProps & {
  idPrefix: string;
};

function FilterForm({
  categories,
  subcategories,
  brands,
  orderOptions,
  query,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  selectedOrder,
  idPrefix,
}: FilterFormProps) {
  return (
    <form className="mt-5 grid gap-4" action="/productos#catalogo" method="GET">
      {query ? <input type="hidden" name="q" value={query} /> : null}

      <div>
        <label
          htmlFor={`${idPrefix}-categoria`}
          className="mb-2 block text-sm font-black text-[var(--text-primary)]"
        >
          Categoría
        </label>

        <select
          id={`${idPrefix}-categoria`}
          name="categoria"
          defaultValue={selectedCategory}
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-subcategoria`}
          className="mb-2 block text-sm font-black text-[var(--text-primary)]"
        >
          Subcategoría
        </label>

        <select
          id={`${idPrefix}-subcategoria`}
          name="subcategoria"
          defaultValue={selectedSubcategory}
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
        >
          <option value="">Todas</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.slug}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-marca`}
          className="mb-2 block text-sm font-black text-[var(--text-primary)]"
        >
          Marca
        </label>

        <select
          id={`${idPrefix}-marca`}
          name="marca"
          defaultValue={selectedBrand}
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
        >
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-orden`}
          className="mb-2 block text-sm font-black text-[var(--text-primary)]"
        >
          Orden
        </label>

        <select
          id={`${idPrefix}-orden`}
          name="orden"
          defaultValue={selectedOrder}
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
        >
          {orderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="h-12 rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
      >
        Aplicar filtros
      </button>
    </form>
  );
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div className="lg:hidden">
        <div className="rounded-[1.75rem] border border-[var(--catalog-border)] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                Filtros
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">
                Refiná productos por categoría, marca y orden.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="shrink-0 rounded-2xl bg-[var(--brand-blue)] px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition active:scale-[0.98] focus-ring"
            >
              Filtrar
              {props.activeFiltersCount > 0 ? (
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-[var(--brand-blue-dark)]">
                  {props.activeFiltersCount}
                </span>
              ) : null}
            </button>
          </div>

          {props.hasFilters ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/productos#catalogo"
                className="rounded-full border border-[#B7CADA] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Limpiar filtros
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="hidden h-fit rounded-[2rem] border border-[var(--catalog-border-strong)] bg-white p-5 shadow-[var(--catalog-shadow)] lg:sticky lg:top-28 lg:block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
              Filtros
            </p>

            <h2 className="mt-1 text-xl font-black text-[var(--text-primary)]">
              Refinar catálogo
            </h2>

            {props.activeFiltersCount > 0 ? (
              <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                {props.activeFiltersCount} filtro
                {props.activeFiltersCount === 1 ? "" : "s"} activo
                {props.activeFiltersCount === 1 ? "" : "s"}.
              </p>
            ) : null}
          </div>

          {props.hasFilters ? (
            <Link
              href="/productos#catalogo"
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Limpiar
            </Link>
          ) : null}
        </div>

        <FilterForm {...props} idPrefix="desktop-filter" />
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />

          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,390px)] flex-col overflow-hidden rounded-r-[2rem] border-r border-[#B7CADA] bg-[var(--catalog-bg)] shadow-[18px_0_55px_rgba(15,23,42,0.22)]">
            <div className="border-b border-[#C9D6E4] bg-white/90 px-5 py-4 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Filtros
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[var(--text-primary)]">
                    Refinar catálogo
                  </h2>

                  {props.activeFiltersCount > 0 ? (
                    <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                      {props.activeFiltersCount} filtro
                      {props.activeFiltersCount === 1 ? "" : "s"} activo
                      {props.activeFiltersCount === 1 ? "" : "s"}.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar filtros"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-xl font-black text-[var(--brand-blue-dark)] shadow-sm focus-ring"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {props.hasFilters ? (
                <Link
                  href="/productos#catalogo"
                  className="mb-4 inline-flex rounded-full border border-[#B7CADA] bg-white px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                >
                  Limpiar filtros
                </Link>
              ) : null}

              <div className="rounded-[1.75rem] border border-[#C9D6E4] bg-white p-4 shadow-sm">
                <FilterForm {...props} idPrefix="mobile-filter" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
