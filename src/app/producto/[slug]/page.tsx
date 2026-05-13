import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductGallery } from "@/components/products/ProductGallery";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: true,
      subcategory: true,
      brand: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
      },
    },
  });
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Producto no encontrado",
    };
  }

  return {
    title: product.metaTitle ?? product.name,
    description:
      product.metaDescription ??
      `Consultá por ${product.name} en Credifer. Precio contado y opciones de financiación por WhatsApp.`,
    openGraph: {
      title: product.metaTitle ?? product.name,
      description:
        product.metaDescription ?? `Consultá por ${product.name} en Credifer.`,
      type: "website",
      url: `${siteConfig.url}/producto/${product.slug}`,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const priceLabel = formatCurrency(product.price?.toString() ?? null);

  const whatsappText = [
    "Hola Credifer, quiero consultar por este producto:",
    "",
    product.name,
    `Precio contado: ${priceLabel}`,
    `Link: ${siteConfig.url}/producto/${product.slug}`,
    "",
    "Quisiera saber opciones de cuotas, disponibilidad y entrega.",
  ].join("\n");

  const whatsappUrl = `https://wa.me/${
    siteConfig.whatsappNumber
  }?text=${encodeURIComponent(whatsappText)}`;

  const primaryImage = product.images[0] ?? null;

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price ? product.price.toString() : null,
    imageUrl: primaryImage?.url ?? null,
    brandName: product.brand?.name ?? null,
    categoryName: product.category?.name ?? null,
  };

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--text-secondary)]">
        <Link
          href="/productos"
          className="transition hover:text-[var(--brand-blue)] focus-ring rounded-md"
        >
          Productos
        </Link>

        {product.category ? (
          <>
            <span>/</span>
            <Link
              href={`/${product.category.slug}`}
              className="transition hover:text-[var(--brand-blue)] focus-ring rounded-md"
            >
              {product.category.name}
            </Link>
          </>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <ProductGallery productName={product.name} images={product.images} />

        <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-wrap gap-2">
            {product.category ? (
              <Link
                href={`/${product.category.slug}`}
                className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue)] hover:text-white focus-ring"
              >
                {product.category.name}
              </Link>
            ) : null}

            {product.subcategory ? (
              <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
                {product.subcategory.name}
              </span>
            ) : null}

            {product.brand ? (
              <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-black text-[var(--text-secondary)]">
                {product.brand.name}
              </span>
            ) : null}

            {product.isOffer ? (
              <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-black text-white">
                Oferta
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
            {product.name}
          </h1>

          <div className="mt-6 rounded-3xl bg-[var(--surface-muted)] p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Precio contado
            </p>

            <p className="mt-2 text-4xl font-black text-[var(--brand-blue-dark)]">
              {priceLabel}
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Las cuotas, promociones, condiciones de financiación y entrega se
              coordinan directamente por WhatsApp.
            </p>
          </div>

          {product.descriptionLong ? (
            <div className="mt-6">
              <h2 className="text-lg font-black text-[var(--text-primary)]">
                Descripción
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
                {product.descriptionLong}
              </p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <AddToCartButton product={cartProduct} />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-full bg-[var(--whatsapp)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--whatsapp-dark)] focus-ring"
            >
              Consultar por WhatsApp
            </a>

            <Link
              href="/productos"
              className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring sm:col-span-2"
            >
              Seguir viendo productos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
