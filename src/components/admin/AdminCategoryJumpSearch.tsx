//src/components/admin/AdminCategoryJumpSearch.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AdminCategoryJumpSearchItem = {
  targetId: string;
  label: string;
  type: "category" | "subcategory";
  subtitle: string;
};

type AdminCategoryJumpSearchProps = {
  items: AdminCategoryJumpSearchItem[];
};

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function smoothScrollToElement(element: HTMLElement) {
  const headerOffset = 170;
  const targetPosition =
    element.getBoundingClientRect().top + window.scrollY - headerOffset;

  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const duration = 850;
  const startTime = performance.now();

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo({
      top: startPosition + distance * easedProgress,
      behavior: "auto",
    });

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function AdminCategoryJumpSearch({
  items,
}: AdminCategoryJumpSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (!wrapperRef.current?.contains(target)) {
        setIsOpen(false);
        setHasTyped(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setHasTyped(false);
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

  const normalizedTerm = normalizeText(searchTerm);

  const visibleItems = useMemo(() => {
    if (!isOpen) return [];

    if (!hasTyped || normalizedTerm.length === 0) {
      return items;
    }

    if (normalizedTerm.length < 3) {
      return [];
    }

    return items.filter((item) => {
      const searchableText = normalizeText(`${item.label} ${item.subtitle}`);

      return searchableText.includes(normalizedTerm);
    });
  }, [hasTyped, isOpen, items, normalizedTerm]);

  const shouldShowMinLengthMessage =
    isOpen &&
    hasTyped &&
    normalizedTerm.length > 0 &&
    normalizedTerm.length < 3;

  function goToItem(item: AdminCategoryJumpSearchItem) {
    const element = document.getElementById(item.targetId);

    if (!element) return;

    setSearchTerm(item.label);
    setIsOpen(false);
    setHasTyped(false);

    smoothScrollToElement(element);

    window.setTimeout(() => {
      element.setAttribute("data-jump-highlight", "true");
      element.focus({ preventScroll: true });
    }, 500);

    window.setTimeout(() => {
      element.removeAttribute("data-jump-highlight");
    }, 2200);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor="admin-category-jump-search"
        className="mb-2 block text-sm font-black text-[var(--text-primary)]"
      >
        Buscar categoría o subcategoría
      </label>

      <div className="relative">
        <input
          id="admin-category-jump-search"
          type="text"
          value={searchTerm}
          placeholder="Escribí una categoría o subcategoría..."
          onFocus={() => {
            setIsOpen(true);
            setHasTyped(false);
          }}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setHasTyped(true);
            setIsOpen(true);
          }}
          className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 pr-11 text-sm font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--text-muted)]">
          ⌕
        </span>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#B7CADA] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
          {shouldShowMinLengthMessage ? (
            <div className="px-4 py-3 text-sm font-bold text-[var(--text-muted)]">
              Escribí al menos 3 letras para buscar.
            </div>
          ) : visibleItems.length > 0 ? (
            <div className="max-h-72 overflow-y-auto p-2">
              {visibleItems.map((item) => (
                <button
                  key={item.targetId}
                  type="button"
                  onClick={() => goToItem(item)}
                  className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--brand-blue-soft)] focus-ring"
                >
                  <span>
                    <span className="block text-sm font-black text-[var(--text-primary)]">
                      {item.label}
                    </span>

                    <span className="mt-0.5 block text-xs font-bold text-[var(--text-muted)]">
                      {item.subtitle}
                    </span>
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${
                      item.type === "category"
                        ? "bg-[var(--brand-blue-soft)] text-[var(--brand-blue-dark)]"
                        : "bg-[#FFF3B8] text-[var(--brand-blue-dark)]"
                    }`}
                  >
                    {item.type === "category" ? "Categoría" : "Sub"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm font-bold text-[var(--text-muted)]">
              No encontramos categorías o subcategorías con ese texto.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
