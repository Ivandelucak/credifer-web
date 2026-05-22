import { restoreProduct } from "@/app/admin/(protected)/productos/actions";

type ProductRestoreButtonProps = {
  productId: number;
  returnTo: string;
  label?: string;
  className?: string;
  variant?: "pill" | "menu";
};

function RestoreIcon() {
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
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </svg>
  );
}

export function ProductRestoreButton({
  productId,
  returnTo,
  label = "Restaurar",
  className = "",
  variant = "pill",
}: ProductRestoreButtonProps) {
  const buttonClassName =
    className ||
    (variant === "menu"
      ? "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-black text-green-700 transition hover:bg-green-50 focus-ring"
      : "rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-black text-green-700 transition hover:border-green-300 focus-ring");

  return (
    <form action={restoreProduct}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <button type="submit" className={buttonClassName}>
        {variant === "menu" ? <RestoreIcon /> : null}
        <span>{label}</span>
      </button>
    </form>
  );
}
