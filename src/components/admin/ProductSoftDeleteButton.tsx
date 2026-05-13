"use client";

import { softDeleteProduct } from "@/app/admin/(protected)/productos/actions";

type ProductSoftDeleteButtonProps = {
  productId: number;
  returnTo: string;
  label?: string;
  className?: string;
};

export function ProductSoftDeleteButton({
  productId,
  returnTo,
  label = "Eliminar",
  className = "",
}: ProductSoftDeleteButtonProps) {
  return (
    <form
      action={softDeleteProduct}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "¿Seguro que querés eliminar este producto? No se borra de la base, pero dejará de aparecer en la tienda.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <button
        type="submit"
        className={
          className ||
          "rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:border-red-300 focus-ring"
        }
      >
        {label}
      </button>
    </form>
  );
}
