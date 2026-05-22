//src/components/admin/AdminProductSearchInput.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/formatters";

type ProductSuggestion = {
  id: number;
  code: string | null;
  name: string;
  slug: string;
  price: string | null;
  isActive: boolean;
  categoryName: string | null;
  brandName: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

type AdminProductSearchInputProps = {
  defaultValue: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedOrder: string;
};

function buildAdminProductsUrl(params: {
  q?: string;
  categoria?: string;
  estado?: string;
  orden?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);

  if (params.categoria) {
    searchParams.set("categoria", params.categoria);
  }

  if (params.estado && params.estado !== "todos") {
    searchParams.set("estado", params.estado);
  }

  if (params.orden && params.orden !== "recientes") {
    searchParams.set("orden", params.orden);
  }

  const queryString = searchParams.toString();

  return queryString ? `/admin/productos?${queryString}` : "/admin/productos";
}

export function AdminProductSearchInput({
  defaultValue,
  selectedCategory,
  selectedStatus,
  selectedOrder,
}: AdminProductSearchInputProps) {
  const router = useRouter();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    const cleanQuery = query.trim();

    if (cleanQuery.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/products/suggestions?q=${encodeURIComponent(cleanQuery)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          setSuggestions([]);
          setIsOpen(false);
          return;
        }

        const data = (await response.json()) as {
          suggestions?: ProductSuggestion[];
        };

        const nextSuggestions = data.suggestions ?? [];

        setSuggestions(nextSuggestions);
        setIsOpen(nextSuggestions.length > 0);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  function goToSearch(nextQuery = query) {
    const cleanQuery = nextQuery.trim();

    const nextUrl = buildAdminProductsUrl({
      q: cleanQuery,
      categoria: selectedCategory,
      estado: selectedStatus,
      orden: selectedOrder,
    });

    setQuery(cleanQuery);
    setIsOpen(false);
    router.push(nextUrl);
  }

  function handleSuggestionClick(suggestion: ProductSuggestion) {
    const cleanQuery = query.trim() || suggestion.name;

    goToSearch(cleanQuery);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            goToSearch();
          }
        }}
        onFocus={() => {
          if (suggestions.length > 0 && query.trim().length >= 3) {
            setIsOpen(true);
          }
        }}
        placeholder="Buscar por nombre, código, marca..."
        autoComplete="off"
        className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 pr-11 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
      />

      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--brand-blue)]" />
        ) : (
          <span className="text-sm font-black text-[var(--text-muted)]">⌕</span>
        )}
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Recomendaciones
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="grid w-full grid-cols-[52px_1fr] gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition last:border-b-0 hover:bg-[var(--brand-blue-soft)] focus-ring"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface-muted)]">
                  {suggestion.imageUrl ? (
                    <img
                      src={suggestion.imageUrl}
                      alt={suggestion.imageAlt ?? suggestion.name}
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-lg font-black text-[var(--brand-blue)]">
                      {suggestion.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {suggestion.code ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[var(--text-muted)]">
                        {suggestion.code}
                      </span>
                    ) : null}

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        suggestion.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {suggestion.isActive ? "Activo" : "Oculto"}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm font-black leading-5 text-[var(--text-primary)]">
                    {suggestion.name}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-1 text-xs font-bold text-[var(--text-muted)]">
                    {suggestion.brandName ? (
                      <span>{suggestion.brandName}</span>
                    ) : null}

                    {suggestion.categoryName ? (
                      <span>
                        {suggestion.brandName ? "• " : ""}
                        {suggestion.categoryName}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm font-black text-[var(--brand-blue-dark)]">
                    {formatCurrency(suggestion.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {query.trim().length > 0 && query.trim().length < 3 ? (
        <p className="absolute left-1 top-[calc(100%+0.35rem)] text-xs font-bold text-[var(--text-muted)]">
          Escribí al menos 3 letras para ver recomendaciones.
        </p>
      ) : null}
    </div>
  );
}
