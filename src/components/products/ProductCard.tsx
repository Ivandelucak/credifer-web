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
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-[var(--catalog-border)] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--catalog-shadow)]">
      <Link
        href={`/producto/${product.slug}`}
        className="block focus-ring"
        aria-label={`Ver producto ${product.name}`}
      >
        <div className="relative h-[220px] overflow-hidden border-b border-[var(--catalog-border)] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)]">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[rgba(2,100,169,0.10)] blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 left-6 h-36 w-36 rounded-full bg-[rgba(244,196,48,0.14)] blur-2xl" />

              <div className="relative flex h-full w-full flex-col items-center justify-center rounded-[1.25rem] border border-[#D6E3EF] bg-white/70 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-blue-soft)] text-2xl font-black text-[var(--brand-blue)] shadow-sm">
                  {product.name.charAt(0).toUpperCase()}
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                  Imagen a confirmar
                </p>

                <p className="mt-1 max-w-[150px] text-xs font-bold leading-5 text-[var(--text-muted)]">
                  Producto disponible para consultar.
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.isOffer ? (
              <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-[11px] font-black text-white shadow-sm">
                Oferta
              </span>
            ) : null}

            {product.isFeatured ? (
              <span className="rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-[11px] font-black text-[var(--brand-blue-dark)] shadow-sm">
                Destacado
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col bg-[#F8FBFE] p-4">
        <div className="mb-3 flex min-h-7 flex-wrap gap-2">
          <Link
            href={categoryHref}
            className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-[11px] font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue)] hover:text-white focus-ring"
          >
            {categoryLabel}
          </Link>

          {product.brand ? (
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[var(--text-secondary)] shadow-sm">
              {product.brand.name}
            </span>
          ) : null}
        </div>

        <Link
          href={`/producto/${product.slug}`}
          className="focus-ring rounded-xl"
        >
          <h3 className="line-clamp-2 min-h-12 text-[15px] font-black leading-6 text-[var(--text-primary)] transition group-hover:text-[var(--brand-blue)]">
            {product.name}
          </h3>
        </Link>

        {product.descriptionShort ? (
          <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-6 text-[var(--text-secondary)]">
            {product.descriptionShort}
          </p>
        ) : (
          <p className="mt-2 min-h-11 text-sm leading-6 text-[var(--text-secondary)]">
            Producto disponible para consultar precio, cuotas y disponibilidad.
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Precio contado
            </p>

            <p className="mt-1 text-2xl font-black tracking-tight text-[var(--brand-blue-dark)]">
              {priceLabel}
            </p>
          </div>

          <div className="mt-3 grid gap-2">
            <AddToCartButton product={cartProduct} variant="compact" />

            <Link
              href={`/producto/${product.slug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-4 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
