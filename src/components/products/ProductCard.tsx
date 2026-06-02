import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatCurrency } from "@/lib/formatters";

export type ProductCardProduct = {
  id: number;
  name: string;
  slug: string;
  price: string | null;
  descriptionShort: string | null;
  isFeatured: boolean;
  isOffer: boolean;
  category: {
    name: string;
    slug: string;
  } | null;
  subcategory?: {
    name: string;
    slug: string;
  } | null;
  brand: {
    name: string;
  } | null;
  images: {
    url: string;
    alt: string | null;
  }[];
};

type ProductCardProps = {
  product: ProductCardProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0] ?? null;
  const priceLabel = formatCurrency(product.price);

  const categoryLabel =
    product.subcategory?.name ?? product.category?.name ?? "Producto";

  const categoryHref = product.subcategory
    ? `/${product.subcategory.slug}`
    : product.category
      ? `/${product.category.slug}`
      : "/productos";

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    imageUrl: primaryImage?.url ?? null,
    brandName: product.brand?.name ?? null,
    categoryName: product.subcategory?.name ?? product.category?.name ?? null,
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.05rem] border border-[var(--catalog-border)] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--catalog-shadow)] sm:rounded-[1.65rem] sm:shadow-[0_10px_24px_rgba(15,23,42,0.065)]">
      <Link
        href={`/producto/${product.slug}`}
        className="block focus-ring"
        aria-label={`Ver producto ${product.name}`}
      >
        <div className="relative h-[126px] overflow-hidden border-b border-[var(--catalog-border)] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)] sm:h-[220px]">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              className="h-full w-full object-contain p-2.5 transition duration-300 group-hover:scale-[1.035] sm:p-5"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-2.5 sm:p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgba(2,100,169,0.10)] blur-2xl sm:h-36 sm:w-36" />
              <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-[rgba(244,196,48,0.14)] blur-2xl sm:h-36 sm:w-36" />

              <div className="relative flex h-full w-full flex-col items-center justify-center rounded-[0.95rem] border border-[#D6E3EF] bg-white/70 text-center sm:rounded-[1.25rem]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-blue-soft)] text-lg font-black text-[var(--brand-blue)] shadow-sm sm:h-16 sm:w-16 sm:rounded-2xl sm:text-2xl">
                  {product.name.charAt(0).toUpperCase()}
                </div>

                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--brand-blue)] sm:mt-4 sm:text-xs sm:tracking-[0.16em]">
                  Imagen a confirmar
                </p>

                <p className="mt-1 hidden max-w-[150px] text-xs font-bold leading-5 text-[var(--text-muted)] sm:block">
                  Producto disponible para consultar.
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
            {product.isOffer ? (
              <span className="rounded-full bg-[var(--brand-red)] px-2 py-0.5 text-[9px] font-black text-white shadow-sm sm:px-3 sm:py-1 sm:text-[11px]">
                Oferta
              </span>
            ) : null}

            {product.isFeatured ? (
              <span className="rounded-full bg-[var(--brand-yellow)] px-2 py-0.5 text-[9px] font-black text-[var(--brand-blue-dark)] shadow-sm sm:px-3 sm:py-1 sm:text-[11px]">
                Destacado
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col bg-[#F8FBFE] p-2.5 sm:p-4">
        <div className="mb-2 flex min-h-6 flex-wrap gap-1.5 sm:mb-3 sm:min-h-7 sm:gap-2">
          <Link
            href={categoryHref}
            className="line-clamp-1 rounded-full bg-[var(--brand-blue-soft)] px-2 py-0.5 text-[9px] font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue)] hover:text-white focus-ring sm:px-3 sm:py-1 sm:text-[11px]"
          >
            {categoryLabel}
          </Link>

          {product.brand ? (
            <span className="line-clamp-1 rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-[var(--text-secondary)] shadow-sm sm:px-3 sm:py-1 sm:text-[11px]">
              {product.brand.name}
            </span>
          ) : null}
        </div>

        <Link
          href={`/producto/${product.slug}`}
          className="focus-ring rounded-xl"
        >
          <h3 className="line-clamp-2 min-h-[40px] text-[12.5px] font-black leading-5 text-[var(--text-primary)] transition group-hover:text-[var(--brand-blue)] sm:min-h-12 sm:text-[15px] sm:leading-6">
            {product.name}
          </h3>
        </Link>

        {product.descriptionShort ? (
          <p className="mt-2 hidden text-sm leading-6 text-[var(--text-secondary)] sm:line-clamp-2 sm:block sm:min-h-11">
            {product.descriptionShort}
          </p>
        ) : (
          <p className="mt-2 hidden text-sm leading-6 text-[var(--text-secondary)] sm:line-clamp-2 sm:block sm:min-h-11">
            Producto disponible para consultar precio, cuotas y disponibilidad.
          </p>
        )}

        <div className="mt-auto pt-2.5 sm:pt-4">
          <div className="rounded-xl border border-[#C9D6E4] bg-white px-2.5 py-2 shadow-sm sm:rounded-2xl sm:px-4 sm:py-3">
            <p className="hidden text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)] sm:block">
              Precio contado
            </p>

            <p className="text-[15px] font-black tracking-tight text-[var(--brand-blue-dark)] sm:mt-1 sm:text-2xl">
              {priceLabel}
            </p>
          </div>

          <div className="mt-2 grid gap-2 sm:mt-3">
            <AddToCartButton product={cartProduct} variant="compact" />

            <Link
              href={`/producto/${product.slug}`}
              className="hidden min-h-11 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-4 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring sm:inline-flex"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
