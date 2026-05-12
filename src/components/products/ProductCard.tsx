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

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    imageUrl: primaryImage?.url ?? null,
    brandName: product.brand?.name ?? null,
    categoryName: product.category?.name ?? null,
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[rgba(2,100,169,0.28)] hover:shadow-[var(--shadow-card)]">
      <Link
        href={`/producto/${product.slug}`}
        className="block focus-ring"
        aria-label={`Ver producto ${product.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-blue-soft)] to-white p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-black text-[var(--brand-blue)] shadow-sm">
                {product.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.isOffer ? (
              <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-black text-white">
                Oferta
              </span>
            ) : null}

            {product.isFeatured ? (
              <span className="rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)]">
                Destacado
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {product.category ? (
            <Link
              href={`/${product.category.slug}`}
              className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue)] hover:text-white focus-ring"
            >
              {product.category.name}
            </Link>
          ) : null}

          {product.brand ? (
            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
              {product.brand.name}
            </span>
          ) : null}
        </div>

        <Link
          href={`/producto/${product.slug}`}
          className="focus-ring rounded-xl"
        >
          <h3 className="line-clamp-2 text-base font-black leading-6 text-[var(--text-primary)] transition group-hover:text-[var(--brand-blue)]">
            {product.name}
          </h3>
        </Link>

        {product.descriptionShort ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
            {product.descriptionShort}
          </p>
        ) : null}

        <div className="mt-auto pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Precio contado
          </p>

          <p className="mt-1 text-2xl font-black text-[var(--brand-blue-dark)]">
            {priceLabel}
          </p>

          <div className="mt-4 grid gap-2">
            <AddToCartButton product={cartProduct} variant="compact" />

            <Link
              href={`/producto/${product.slug}`}
              className="inline-flex w-full justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
