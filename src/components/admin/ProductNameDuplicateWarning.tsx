//src/components/admin/ProductNameDuplicateWarning.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MatchedProduct = {
  id: number;
  name: string;
  slug: string;
  price: string | null;
  isActive: boolean;
  categoryName: string | null;
  brandName: string | null;
};

type ProductNameDuplicateWarningProps = {
  productName: string;
  excludeProductId?: number;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(price: string | null) {
  if (!price) return "Sin precio";

  const value = Number(price);

  if (!Number.isFinite(value)) return "Sin precio";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductNameDuplicateWarning({
  productName,
  excludeProductId,
}: ProductNameDuplicateWarningProps) {
  const [products, setProducts] = useState<MatchedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const cleanName = productName.trim();

  useEffect(() => {
    if (cleanName.length < 3) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          q: cleanName,
        });

        if (excludeProductId) {
          params.set("excludeId", String(excludeProductId));
        }

        const response = await fetch(
          `/api/admin/products/name-matches?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setProducts([]);
          return;
        }

        const data = (await response.json()) as {
          products: MatchedProduct[];
        };

        setProducts(data.products);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [cleanName, excludeProductId]);

  const hasExactMatch = useMemo(() => {
    const normalizedName = normalizeText(cleanName);

    return products.some(
      (product) => normalizeText(product.name) === normalizedName,
    );
  }, [cleanName, products]);

  if (cleanName.length < 3) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-3 rounded-2xl border border-[#D6E3EF] bg-[var(--catalog-surface-soft)] px-4 py-3 text-xs font-bold text-[var(--text-muted)]">
        Buscando coincidencias...
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-3 rounded-2xl border p-4 ${
        hasExactMatch
          ? "border-red-200 bg-red-50"
          : "border-[#F4C430]/60 bg-[#FFF8DB]"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.16em] ${
          hasExactMatch ? "text-red-700" : "text-[#8A6400]"
        }`}
      >
        {hasExactMatch ? "Nombre ya existente" : "Coincidencias encontradas"}
      </p>

      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Revisá estos productos antes de crear uno nuevo. Puede que ya exista una
        carga similar.
      </p>

      <div className="mt-3 space-y-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/productos/${product.id}/editar`}
            className="block rounded-xl border border-white/70 bg-white px-3 py-2.5 shadow-sm transition hover:border-[var(--brand-blue)] focus-ring"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-[var(--text-primary)]">
                  {product.name}
                </p>

                <p className="mt-0.5 text-xs font-bold text-[var(--text-muted)]">
                  {product.brandName ?? "Sin marca"}
                  {product.categoryName ? ` · ${product.categoryName}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)]">
                  {formatPrice(product.price)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    product.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.isActive ? "Activo" : "Oculto"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
