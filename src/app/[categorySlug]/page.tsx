// src/app/[categorySlug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/layout/BackButton";
import { ProductCard } from "@/components/products/ProductCard";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    marca?: string;
    orden?: string;
  }>;
};

const sectionOrderOptions = [
  { label: "Más recientes", value: "recientes" },
  { label: "Nombre A-Z", value: "nombre-asc" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "Marca A-Z", value: "marca-asc" },
];

type CatalogSection =
  | {
      type: "category";
      id: number;
      name: string;
      slug: string;
      description: string | null;
      parentCategory: null;
    }
  | {
      type: "subcategory";
      id: number;
      name: string;
      slug: string;
      description: string | null;
      parentCategory: {
        name: string;
        slug: string;
      } | null;
    };

const sectionVisuals: Record<
  string,
  {
    image?: string;
    alt: string;
    accent: string;
  }
> = {
  celulares: {
    image: "/categories/celulares.jpg",
    alt: "Celulares y smartphones",
    accent: "bg-[var(--brand-blue)]",
  },
  audio: {
    image: "/categories/audio.jpg",
    alt: "Productos de audio",
    accent: "bg-[var(--brand-blue)]",
  },
  bicicletas: {
    image: "/categories/bicicletas.jpg",
    alt: "Bicicletas",
    accent: "bg-[var(--brand-green)]",
  },
  climatizacion: {
    image: "/categories/climatizacion.jpg",
    alt: "Productos de climatización",
    accent: "bg-[var(--brand-yellow)]",
  },
  "cuidado-personal": {
    image: "/categories/cuidado-personal.jpg",
    alt: "Productos de cuidado personal",
    accent: "bg-[var(--brand-red)]",
  },
  electrodomesticos: {
    image: "/categories/electrodomesticos.jpg",
    alt: "Electrodomésticos para el hogar",
    accent: "bg-[var(--brand-yellow)]",
  },
  herramientas: {
    image: "/categories/herramientas.jpg",
    alt: "Herramientas de trabajo",
    accent: "bg-[var(--brand-red)]",
  },
  hogar: {
    image: "/categories/hogar.jpg",
    alt: "Productos para el hogar",
    accent: "bg-[var(--brand-blue)]",
  },
  "muebles-y-colchones": {
    image: "/categories/muebles-y-colchones.jpg",
    alt: "Muebles y colchones",
    accent: "bg-[var(--brand-green)]",
  },
  "pequenos-electrodomesticos": {
    image: "/categories/pequenos-electrodomesticos.jpg",
    alt: "Pequeños electrodomésticos para el hogar",
    accent: "bg-[var(--brand-blue)]",
  },
  tecnologia: {
    image: "/categories/tecnologia.jpg",
    alt: "Productos de tecnología",
    accent: "bg-[var(--brand-blue)]",
  },
  "tv-y-video": {
    image: "/categories/tv-y-video.jpg",
    alt: "TV y video",
    accent: "bg-[var(--brand-yellow)]",
  },
  parlantes: {
    image: "/categories/parlantes.jpg",
    alt: "Parlantes y audio",
    accent: "bg-[var(--brand-green)]",
  },
};

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function normalizeSearchText(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textMatchesSearch(value: string, tokens: string[]) {
  const normalizedValue = normalizeSearchText(value);

  return tokens.every((token) => normalizedValue.includes(token));
}

async function getCatalogSection(slug: string): Promise<CatalogSection | null> {
  const category = await prisma.category.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  if (category) {
    return {
      type: "category",
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentCategory: null,
    };
  }

  const subcategory = await prisma.subcategory.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!subcategory) {
    return null;
  }

  return {
    type: "subcategory",
    id: subcategory.id,
    name: subcategory.name,
    slug: subcategory.slug,
    description: subcategory.description,
    parentCategory: subcategory.category
      ? {
          name: subcategory.category.name,
          slug: subcategory.category.slug,
        }
      : null,
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const section = await getCatalogSection(categorySlug);

  if (!section) {
    return {
      title: "Categoría no encontrada",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const sectionUrl = `${siteConfig.url}/${section.slug}`;
  const visual = sectionVisuals[section.slug];

  const description =
    section.description ??
    (section.type === "category"
      ? `Conocé productos de ${section.name} en Credifer. Precio contado publicado, cuotas y financiación a consultar.`
      : `Conocé productos de ${section.name} en Credifer. Precio contado publicado, cuotas, financiación, disponibilidad y entrega a consultar.`);

  const imageUrl = visual?.image
    ? `${siteConfig.url}${visual.image}`
    : `${siteConfig.url}/brand/logo-square.png`;

  return {
    title: `${section.name} | Credifer`,
    description,
    alternates: {
      canonical: sectionUrl,
    },
    openGraph: {
      title: `${section.name} | Credifer`,
      description,
      type: "website",
      url: sectionUrl,
      siteName: "Credifer",
      locale: "es_AR",
      images: [
        {
          url: imageUrl,
          alt: visual?.alt ?? section.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${section.name} | Credifer`,
      description,
      images: [imageUrl],
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const { q, marca, orden } = await searchParams;

  const query = (q ?? "").trim();
  const selectedBrand = (marca ?? "").trim();

  const selectedOrder = sectionOrderOptions.some(
    (option) => option.value === orden,
  )
    ? String(orden)
    : "recientes";

  const hasSectionFilters = Boolean(
    query || selectedBrand || selectedOrder !== "recientes",
  );

  const section = await getCatalogSection(categorySlug);

  if (!section) {
    notFound();
  }

  const sectionProductFilter =
    section.type === "category"
      ? { categoryId: section.id }
      : { subcategoryId: section.id };

  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const matchingProductIds =
    queryTokens.length > 0
      ? (
          await prisma.product.findMany({
            where: {
              isActive: true,
              deletedAt: null,
              ...sectionProductFilter,
              ...(selectedBrand
                ? {
                    brand: {
                      slug: selectedBrand,
                    },
                  }
                : {}),
            },
            select: {
              id: true,
              name: true,
              descriptionShort: true,
              brand: {
                select: {
                  name: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
              subcategory: {
                select: {
                  name: true,
                },
              },
            },
          })
        )
          .filter((product) =>
            textMatchesSearch(
              [
                product.name,
                product.descriptionShort,
                product.brand?.name,
                product.category?.name,
                product.subcategory?.name,
              ]
                .filter(Boolean)
                .join(" "),
              queryTokens,
            ),
          )
          .map((product) => product.id)
      : [];

  const productWhere = {
    isActive: true,
    deletedAt: null,
    ...sectionProductFilter,

    ...(queryTokens.length > 0
      ? {
          id: {
            in: matchingProductIds.length > 0 ? matchingProductIds : [-1],
          },
        }
      : {}),

    ...(selectedBrand
      ? {
          brand: {
            is: {
              slug: selectedBrand,
            },
          },
        }
      : {}),
  };

  const productOrderBy =
    selectedOrder === "nombre-asc"
      ? [{ name: "asc" as const }]
      : selectedOrder === "precio-asc"
        ? [{ price: "asc" as const }, { name: "asc" as const }]
        : selectedOrder === "precio-desc"
          ? [{ price: "desc" as const }, { name: "asc" as const }]
          : selectedOrder === "marca-asc"
            ? [{ brand: { name: "asc" as const } }, { name: "asc" as const }]
            : [
                { isFeatured: "desc" as const },
                { isOffer: "desc" as const },
                { createdAt: "desc" as const },
              ];

  const [products, availableBrands] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      orderBy: productOrderBy,
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
    }),
    prisma.brand.findMany({
      where: {
        products: {
          some: {
            isActive: true,
            deletedAt: null,
            ...sectionProductFilter,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  const serializedProducts = products.map(
    (product: (typeof products)[number]) => ({
      ...product,
      price: product.price ? product.price.toString() : null,
    }),
  );

  const sectionDescription =
    section.description ??
    (section.type === "subcategory"
      ? section.parentCategory
        ? `Productos de ${section.name} disponibles dentro de ${section.parentCategory.name}. Consultá precio contado, cuotas, financiación, disponibilidad y entrega.`
        : `Productos de ${section.name} disponibles para consultar precio contado, cuotas, financiación, disponibilidad y entrega.`
      : `Productos de ${section.name} disponibles para consultar precio contado, cuotas, financiación, disponibilidad y entrega.`);

  const visual = sectionVisuals[section.slug];
  const fallbackHref =
    section.type === "subcategory" && section.parentCategory
      ? `/${section.parentCategory.slug}`
      : "/categorias";
  const sectionUrl = `${siteConfig.url}/${section.slug}`;

  const breadcrumbItems = [
    {
      name: "Inicio",
      url: siteConfig.url,
    },
    {
      name: "Categorías",
      url: `${siteConfig.url}/categorias`,
    },
    ...(section.type === "subcategory" && section.parentCategory
      ? [
          {
            name: section.parentCategory.name,
            url: `${siteConfig.url}/${section.parentCategory.slug}`,
          },
        ]
      : []),
    {
      name: section.name,
      url: sectionUrl,
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

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${section.name} | Credifer`,
    description: sectionDescription,
    url: sectionUrl,
    inLanguage: "es-AR",
    isPartOf: {
      "@type": "WebSite",
      name: "Credifer",
      url: siteConfig.url,
    },
    breadcrumb: breadcrumbJsonLd,
    mainEntity: {
      "@type": "ItemList",
      name: `Productos de ${section.name}`,
      numberOfItems: serializedProducts.length,
      itemListElement: serializedProducts
        .slice(0, 24)
        .map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteConfig.url}/producto/${product.slug}`,
          name: product.name,
          image: product.images[0]?.url,
        })),
    },
  };

  return (
    <section className="bg-[var(--catalog-bg)]">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(collectionJsonLd),
        }}
      />
      <div className="container-page py-8 lg:py-12">
        <div className="mb-5">
          <BackButton fallbackHref={fallbackHref} label="Volver" />
        </div>

        <div className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_45%,#FFF7D8_78%,#EAF8EF_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[42%] top-[44%] hidden h-[520px] w-[520px] -translate-y-1/2 opacity-[0.07] lg:block xl:left-[48%] xl:h-[620px] xl:w-[620px]"
          >
            <div className="relative h-full w-full">
              <Image
                src="/brand/logo-credifer.png"
                alt=""
                fill
                sizes="620px"
                className="object-contain object-center"
              />
            </div>
          </div>

          <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_390px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/86 px-4 py-2 shadow-sm backdrop-blur">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    visual?.accent ?? "bg-[var(--brand-blue)]"
                  }`}
                />
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                  {section.type === "category" ? "Categoría" : "Subcategoría"}
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.04] tracking-[-0.045em] text-[var(--text-primary)] lg:text-6xl">
                {section.name}
              </h1>

              {section.type === "subcategory" && section.parentCategory ? (
                <p className="mt-3 text-sm font-black text-[var(--brand-blue-dark)]">
                  Dentro de{" "}
                  <Link
                    href={`/${section.parentCategory.slug}`}
                    className="rounded-md text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)] focus-ring"
                  >
                    {section.parentCategory.name}
                  </Link>
                </p>
              ) : null}

              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] lg:text-lg lg:leading-8">
                {sectionDescription}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/productos"
                  className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
                >
                  Ver todo el catálogo
                </Link>

                <Link
                  href="/como-comprar"
                  className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                >
                  Cómo comprar
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#B7CADA] bg-white/88 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="relative aspect-[16/10] border-b border-[#C9D6E4] bg-[var(--catalog-surface-soft)]">
                {visual?.image ? (
                  <Image
                    src={visual.image}
                    alt={visual.alt}
                    fill
                    priority
                    sizes="390px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#EAF4FB_0%,#FFFFFF_100%)]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white text-3xl font-black text-[var(--brand-blue)] shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
                      {section.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                <div className="absolute left-4 top-4">
                  <span
                    className={`block h-1.5 w-14 rounded-full ${
                      visual?.accent ?? "bg-[var(--brand-blue)]"
                    }`}
                  />
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  Productos disponibles
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <p className="text-4xl font-black tracking-tight text-[var(--brand-blue-dark)]">
                    {serializedProducts.length}
                  </p>
                  <p className="pb-1 text-sm font-bold text-[var(--text-secondary)]">
                    producto{serializedProducts.length === 1 ? "" : "s"}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Agregá productos al carrito y enviá una consulta ordenada por
                  WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {serializedProducts.length > 0 ? (
          <>
            <div className="mt-8 mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  Resultados
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
                  Productos de {section.name}
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Mostrando {serializedProducts.length} producto
                  {serializedProducts.length === 1 ? "" : "s"} disponible
                  {serializedProducts.length === 1 ? "" : "s"}.
                </p>
              </div>

              <Link
                href="/productos"
                className="hidden w-fit rounded-full border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring sm:inline-flex"
              >
                Ver catálogo completo
              </Link>
            </div>

            <form
              id="section-products"
              action={`/${section.slug}#section-products`}
              method="GET"
              className="mb-5 scroll-mt-24 rounded-[1.5rem] border border-[#B7CADA] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)] lg:scroll-mt-32 lg:rounded-[2rem] lg:p-5"
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
                <div>
                  <label
                    htmlFor="section-search"
                    className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-blue)]"
                  >
                    Buscar en {section.name}
                  </label>

                  <input
                    id="section-search"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Buscar producto, modelo o marca..."
                    className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="section-brand"
                    className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]"
                  >
                    Marca
                  </label>

                  <select
                    id="section-brand"
                    name="marca"
                    defaultValue={selectedBrand}
                    className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                  >
                    <option value="">Todas</option>
                    {availableBrands.map((brand) => (
                      <option key={brand.id} value={brand.slug}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="section-order"
                    className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]"
                  >
                    Orden
                  </label>

                  <select
                    id="section-order"
                    name="orden"
                    defaultValue={selectedOrder}
                    className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                  >
                    {sectionOrderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="tap-feedback inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:bg-[var(--brand-blue-dark)] focus-ring"
                >
                  Filtrar
                </button>
              </div>

              {hasSectionFilters ? (
                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/${section.slug}#section-products`}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#C9D6E4] bg-white px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                  >
                    Limpiar filtros
                  </Link>
                </div>
              ) : null}
            </form>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
              {serializedProducts.map(
                (product: (typeof serializedProducts)[number]) => (
                  <ProductCard key={product.id} product={product} />
                ),
              )}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-[#B7CADA] bg-white p-8 text-center shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Sin productos visibles
            </p>

            <h2 className="mt-3 text-2xl font-black text-[var(--text-primary)]">
              No hay productos visibles en esta{" "}
              {section.type === "category" ? "categoría" : "subcategoría"}.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Podés volver al catálogo completo para ver otras secciones
              disponibles.
            </p>

            <Link
              href="/productos"
              className="tap-feedback mt-6 inline-flex rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Ver productos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
