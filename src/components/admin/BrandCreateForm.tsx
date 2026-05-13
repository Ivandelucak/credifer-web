"use client";

import { useEffect, useRef, useState } from "react";
import { createBrand } from "@/app/admin/(protected)/marcas/actions";

type BrandSuggestion = {
  id: number;
  name: string;
  slug: string;
  productsCount: number;
};

export function BrandCreateForm() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState<BrandSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/brands/suggestions?q=${encodeURIComponent(cleanName)}`,
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
          suggestions?: BrandSuggestion[];
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
    }, 250);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [name]);

  const hasSuggestions = suggestions.length > 0;

  return (
    <section className="mt-6 rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
      <h3 className="text-xl font-black text-[var(--text-primary)]">
        Crear nueva marca
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Al escribir el nombre, el sistema busca marcas parecidas para evitar
        cargar duplicados.
      </p>

      <form
        action={createBrand}
        className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
      >
        <div ref={wrapperRef} className="relative">
          <label
            htmlFor="new-brand-name"
            className="mb-2 block text-sm font-black text-[var(--text-primary)]"
          >
            Nombre
          </label>

          <input
            id="new-brand-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            onFocus={() => {
              if (suggestions.length > 0 && name.trim().length >= 2) {
                setIsOpen(true);
              }
            }}
            placeholder="Ej: Samsung"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 pr-11 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
          />

          <div className="pointer-events-none absolute right-4 top-[43px]">
            {isLoading ? (
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--brand-blue)]" />
            ) : null}
          </div>

          {isOpen && hasSuggestions ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]">
              <div className="border-b border-[var(--border)] px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Marcas parecidas encontradas
                </p>
              </div>

              <div className="max-h-[280px] overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => {
                      setName(suggestion.name);
                      setIsOpen(false);
                    }}
                    className="block w-full border-b border-[var(--border)] px-4 py-3 text-left transition last:border-b-0 hover:bg-[var(--brand-blue-soft)] focus-ring"
                  >
                    <p className="text-sm font-black text-[var(--text-primary)]">
                      {suggestion.name}
                    </p>

                    <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                      Slug: {suggestion.slug} · {suggestion.productsCount}{" "}
                      productos asociados
                    </p>

                    <p className="mt-2 text-xs font-black text-[var(--brand-red)]">
                      Marca existente
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="new-brand-slug"
            className="mb-2 block text-sm font-black text-[var(--text-primary)]"
          >
            Slug (Para el link)
          </label>

          <input
            id="new-brand-slug"
            name="slug"
            type="text"
            placeholder="Opcional. Si queda vacío, se genera solo."
            className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-[var(--brand-blue)] px-6 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring lg:w-auto"
          >
            Crear marca
          </button>
        </div>
      </form>

      {name.trim().length > 0 && name.trim().length < 2 ? (
        <p className="mt-3 text-xs font-bold text-[var(--text-muted)]">
          Escribí al menos 2 letras para buscar coincidencias.
        </p>
      ) : null}
    </section>
  );
}
