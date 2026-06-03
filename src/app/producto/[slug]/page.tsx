import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import { RelatedProductsCarousel } from "@/components/products/RelatedProductsCarousel";
import { BackButton } from "@/components/layout/BackButton";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const purchaseHighlights = [
  {
    label: "Cuotas",
    value: "Opciones a consultar",
    accent: "bg-[var(--brand-yellow)]",
  },
  {
    label: "Entrega",
    value: "Coordinada",
    accent: "bg-[var(--brand-green)]",
  },
  {
    label: "Atención",
    value: "Personalizada",
    accent: "bg-[var(--brand-red)]",
  },
];

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      deletedAt: null,
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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productUrl = `${siteConfig.url}/producto/${product.slug}`;
  const imageUrl = product.images[0]?.url;
  const description =
    product.metaDescription ??
    product.descriptionShort ??
    `Consultá por ${product.name} en Credifer. Precio contado y opciones de financiación por WhatsApp.`;

  return {
    title: product.metaTitle ?? product.name,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: product.metaTitle ?? product.name,
      description,
      type: "website",
      url: productUrl,
      siteName: "Credifer",
      locale: "es_AR",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle ?? product.name,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const priceLabel = formatCurrency(
    product.price ? product.price.toString() : null,
  );

  const primaryImage = product.images[0] ?? null;
  const productUrl = `${siteConfig.url}/producto/${product.slug}`;

  const productDescription =
    product.descriptionLong ??
    product.descriptionShort ??
    "Producto disponible para consultar precio contado, cuotas, financiación y disponibilidad.";

  const productImageUrls =
    product.images.length > 0
      ? product.images.map((image) => image.url)
      : [`${siteConfig.url}/brand/logo-square.png`];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription,
    image: productImageUrls,
    url: productUrl,
    sku: String(product.id),
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : {
          "@type": "Brand",
          name: "Credifer",
        },
    category: product.subcategory?.name ?? product.category?.name ?? "Producto",
    offers: product.price
      ? {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "ARS",
          price: product.price.toString(),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "Credifer",
            url: siteConfig.url,
          },
        }
      : undefined,
  };

  const breadcrumbItems = [
    {
      name: "Inicio",
      url: siteConfig.url,
    },
    {
      name: "Productos",
      url: `${siteConfig.url}/productos`,
    },
    ...(product.category
      ? [
          {
            name: product.category.name,
            url: `${siteConfig.url}/${product.category.slug}`,
          },
        ]
      : []),
    ...(product.subcategory
      ? [
          {
            name: product.subcategory.name,
            url: `${siteConfig.url}/${product.subcategory.slug}`,
          },
        ]
      : []),
    {
      name: product.name,
      url: productUrl,
    },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const whatsappText = [
    "Hola Credifer, quiero consultar por este producto:",
    "",
    product.name,
    `Precio contado: ${priceLabel}`,
    `Link: ${productUrl}`,
    "",
    "Quisiera saber opciones de cuotas, disponibilidad y entrega.",
  ].join("\n");

  const whatsappUrl = `https://wa.me/${
    siteConfig.whatsappNumber
  }?text=${encodeURIComponent(whatsappText)}`;

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price ? product.price.toString() : null,
    imageUrl: primaryImage?.url ?? null,
    brandName: product.brand?.name ?? null,
    categoryName: product.subcategory?.name ?? product.category?.name ?? null,
  };

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: {
        not: product.id,
      },
      isActive: true,
      deletedAt: null,
      ...(product.subcategoryId
        ? {
            subcategoryId: product.subcategoryId,
          }
        : product.categoryId
          ? {
              categoryId: product.categoryId,
            }
          : {}),
    },
    orderBy: [
      { isFeatured: "desc" },
      { isOffer: "desc" },
      { createdAt: "desc" },
    ],
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      descriptionShort: true,
      isFeatured: true,
      isOffer: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      subcategory: {
        select: {
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 1,
        select: {
          url: true,
          alt: true,
        },
      },
    },
  });

  const serializedRelatedProducts = relatedProducts.map((relatedProduct) => ({
    ...relatedProduct,
    price: relatedProduct.price ? relatedProduct.price.toString() : null,
  }));

  return (
    <section className="bg-[var(--catalog-bg)]">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <div className="relative overflow-hidden border-b border-[#C9D6E4] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_42%,#FFF7D8_76%,#EAF8EF_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(2,100,169,0.16),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(123,170,53,0.12),transparent_28%),radial-gradient(circle_at_58%_88%,rgba(244,196,48,0.20),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="container-page relative py-8 lg:py-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <BackButton fallbackHref="/productos" label="Volver" />

            <div className="flex flex-wrap items-center gap-2 text-sm font-black text-[var(--text-secondary)]">
              <Link
                href="/productos"
                className="rounded-md transition hover:text-[var(--brand-blue)] focus-ring"
              >
                Productos
              </Link>

              {product.category ? (
                <>
                  <span className="text-[var(--text-muted)]">/</span>
                  <Link
                    href={`/${product.category.slug}`}
                    className="rounded-md transition hover:text-[var(--brand-blue)] focus-ring"
                  >
                    {product.category.name}
                  </Link>
                </>
              ) : null}

              {product.subcategory ? (
                <>
                  <span className="text-[var(--text-muted)]">/</span>
                  <Link
                    href={`/${product.subcategory.slug}`}
                    className="rounded-md transition hover:text-[var(--brand-blue)] focus-ring"
                  >
                    {product.subcategory.name}
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <ProductGallery
              productName={product.name}
              images={product.images}
            />

            <div className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-7">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(2,100,169,0.08)] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[rgba(244,196,48,0.12)] blur-3xl" />

              <div className="relative">
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
                    <Link
                      href={`/${product.subcategory.slug}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--text-secondary)] shadow-sm transition hover:text-[var(--brand-blue)] focus-ring"
                    >
                      {product.subcategory.name}
                    </Link>
                  ) : null}

                  {product.brand ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--text-secondary)] shadow-sm">
                      {product.brand.name}
                    </span>
                  ) : null}

                  {product.isOffer ? (
                    <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-black text-white shadow-sm">
                      Oferta
                    </span>
                  ) : null}

                  {product.isFeatured ? (
                    <span className="rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)] shadow-sm">
                      Destacado
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.045em] text-[var(--text-primary)] lg:text-5xl">
                  {product.name}
                </h1>

                <div className="mt-5 rounded-[1.75rem] border border-[#C9D6E4] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)] p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Precio contado publicado
                  </p>

                  <p className="mt-2 text-4xl font-black tracking-tight text-[var(--brand-blue-dark)]">
                    {priceLabel}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    Las cuotas, promociones, condiciones de financiación,
                    disponibilidad y entrega se coordinan con un asesor de
                    Credifer.
                  </p>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-[#C9D6E4] bg-white/90 p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                    Coordinación Credifer
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {purchaseHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 rounded-2xl bg-[var(--catalog-surface-soft)] px-3 py-2"
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.accent}`}
                        />

                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {item.label}
                          </p>
                          <p className="text-sm font-black text-[var(--text-primary)]">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <AddToCartButton product={cartProduct} />

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--whatsapp)] px-6 py-3 text-sm font-black text-slate-950 shadow-[0_14px_30px_rgba(37,211,102,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white focus-ring"
                  >
                    Consultar por WhatsApp
                  </a>

                  <Link
                    href="/productos"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring sm:col-span-2"
                  >
                    Seguir viendo productos
                  </Link>
                </div>

                <div className="mt-7">
                  <h2 className="text-lg font-black text-[var(--text-primary)]">
                    Descripción
                  </h2>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
                    {productDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <RelatedProductsCarousel products={serializedRelatedProducts} />
        </div>
      </div>
    </section>
  );
}
