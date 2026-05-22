//src/components/admin/AdminSearchableSelect.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AdminSearchableSelectOption = {
  value: string;
  label: string;
};

type AdminSearchableSelectProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: AdminSearchableSelectOption[];
  placeholder: string;
  disabled?: boolean;
  emptyMessage?: string;
  minSearchLength?: number;
};

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function AdminSearchableSelect({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  emptyMessage = "No encontramos resultados.",
  minSearchLength = 3,
}: AdminSearchableSelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);

    if (selectedOption && selectedOption.value) {
      setSearchTerm(selectedOption.label);
      return;
    }

    setSearchTerm("");
  }, [options, value]);

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

  const visibleOptions = useMemo(() => {
    if (!isOpen) return [];

    const normalizedTerm = normalizeSearch(searchTerm);

    if (!hasTyped || normalizedTerm.length === 0) {
      return options;
    }
    if (normalizedTerm.length < minSearchLength) {
      return [];
    }

    return options.filter((option) =>
      normalizeSearch(option.label).includes(normalizedTerm),
    );
  }, [hasTyped, isOpen, options, searchTerm]);

  const shouldShowMinLengthMessage =
    isOpen &&
    hasTyped &&
    normalizeSearch(searchTerm).length > 0 &&
    normalizeSearch(searchTerm).length < minSearchLength;

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <label className="mb-2 block text-sm font-black text-[var(--text-primary)]">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => {
            if (disabled) return;
            setIsOpen(true);
            setHasTyped(false);
          }}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setHasTyped(true);
            setIsOpen(true);

            if (value) {
              onChange("");
            }
          }}
          className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 pr-10 text-sm font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[var(--text-muted)]"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--text-muted)]">
          ⌄
        </span>
      </div>

      {isOpen && !disabled ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#B7CADA] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
          {shouldShowMinLengthMessage ? (
            <div className="px-4 py-3 text-sm font-bold text-[var(--text-muted)]">
              Escribí al menos {minSearchLength} letra
              {minSearchLength === 1 ? "" : "s"} para filtrar.
            </div>
          ) : visibleOptions.length > 0 ? (
            <div className="max-h-64 overflow-y-auto p-2">
              {visibleOptions.map((option) => (
                <button
                  key={`${name}-${option.value || "empty"}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearchTerm(option.value ? option.label : "");
                    setIsOpen(false);
                    setHasTyped(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-black transition focus-ring ${
                    value === option.value
                      ? "bg-[var(--brand-blue)] text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-dark)]"
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm font-bold text-[var(--text-muted)]">
              {emptyMessage}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
