import { restoreProduct } from "@/app/admin/(protected)/productos/actions";

type ProductRestoreButtonProps = {
  productId: number;
  returnTo: string;
};

export function ProductRestoreButton({
  productId,
  returnTo,
}: ProductRestoreButtonProps) {
  return (
    <form action={restoreProduct}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <button
        type="submit"
        className="rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-black text-green-700 transition hover:border-green-300 focus-ring"
      >
        Restaurar
      </button>
    </form>
  );
}
