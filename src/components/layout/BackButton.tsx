"use client";

import { useRouter } from "next/navigation";

const HAS_INTERNAL_HISTORY_KEY = "credifer-has-internal-history";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  className?: string;
};

export function BackButton({
  fallbackHref = "/productos",
  label = "Volver",
  className,
}: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    const hasInternalHistory =
      window.sessionStorage.getItem(HAS_INTERNAL_HISTORY_KEY) === "true";

    if (hasInternalHistory && window.history.length > 1) {
      window.history.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={
        className ??
        "inline-flex min-h-10 items-center justify-center rounded-full border border-[#B7CADA] bg-white/90 px-4 py-2 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
      }
    >
      ‹ {label}
    </button>
  );
}
