// src/app/productos/page.tsx
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { CatalogFilters } from "@/components/products/CatalogFilters";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos | Credifer",
  description:
    "Explorá el catálogo online de Credifer. Buscá productos por categoría, marca o modelo y consultá precio contado, cuotas, financiación, disponibilidad y entrega.",
  alternates: {
    canonical: `${siteConfig.url}/productos`,
  },
  openGraph: {
    title: "Productos | Credifer",
    description:
      "Catálogo online de Credifer con productos, precios publicados y consultas por financiación.",
    type: "website",
    url: `${siteConfig.url}/productos`,
    siteName: "Credifer",
    locale: "es_AR",
    images: [
      {
        url: `${siteConfig.url}/brand/logo-square.png`,
        width: 512,
        height: 512,
        alt: "Credifer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Productos | Credifer",
    description:
      "Explorá productos de Credifer y consultá precio contado, cuotas y disponibilidad.",
    images: [`${siteConfig.url}/brand/logo-square.png`],
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

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    subcategoria?: string;
    marca?: string;
    orden?: string;
    page?: string;
    estado?: string;
  }>;
};

const PAGE_SIZE = 24;

const orderOptions = [
  { label: "Más recientes", value: "recientes" },
  { label: "Destacados", value: "destacados" },
  { label: "Nombre A-Z", value: "nombre-asc" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
];

const statusOptions = [
  { label: "Ofertas", value: "ofertas" },
  { label: "Destacados", value: "destacados" },
];

const featuredQuickSubcategorySlugs = ["celulares", "parlantes"];

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const delta = 1;
  const range: number[] = [];
  const items: Array<number | "ellipsis"> = [];

  for (
    let page = Math.max(2, currentPage - delta);
    page <= Math.min(totalPages - 1, currentPage + delta);
    page += 1
  ) {
    range.push(page);
  }

  items.push(1);

  if (currentPage - delta > 2) {
    items.push("ellipsis");
  }

  items.push(...range);

  if (currentPage + delta < totalPages - 1) {
    items.push("ellipsis");
  }

  if (totalPages > 1) {
    items.push(totalPages);
  }

  return items;
}

function createProductsPageHref({
  page,
  query,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  selectedOrder,
  selectedStatus,
}: {
  page: number;
  query: string;
  selectedCategory: string;
  selectedSubcategory: string;
  selectedBrand: string;
  selectedOrder: string;
  selectedStatus: string;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (selectedCategory) {
    params.set("categoria", selectedCategory);
  }

  if (selectedSubcategory) {
    params.set("subcategoria", selectedSubcategory);
  }

  if (selectedBrand) {
    params.set("marca", selectedBrand);
  }

  if (selectedStatus) {
    params.set("estado", selectedStatus);
  }

  if (selectedOrder && selectedOrder !== "recientes") {
    params.set("orden", selectedOrder);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString
    ? `/productos?${queryString}#catalogo`
    : "/productos#catalogo";
}

function getOrderBy(order: string): Prisma.ProductOrderByWithRelationInput[] {
  if (order === "nombre-asc") {
    return [{ name: "asc" }];
  }

  if (order === "precio-asc") {
    return [{ price: "asc" }, { name: "asc" }];
  }

  if (order === "precio-desc") {
    return [{ price: "desc" }, { name: "asc" }];
  }

  if (order === "destacados") {
    return [{ isFeatured: "desc" }, { isOffer: "desc" }, { createdAt: "desc" }];
  }

  return [{ createdAt: "desc" }];
}

function buildProductsUrl(params: {
  q?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  orden?: string;
  estado?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.categoria) searchParams.set("categoria", params.categoria);

  if (params.subcategoria) {
    searchParams.set("subcategoria", params.subcategoria);
  }

  if (params.marca) searchParams.set("marca", params.marca);

  if (params.estado) {
    searchParams.set("estado", params.estado);
  }

  if (params.orden && params.orden !== "recientes") {
    searchParams.set("orden", params.orden);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return queryString
    ? `/productos?${queryString}#catalogo`
    : "/productos#catalogo";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const selectedCategory = params.categoria?.trim() ?? "";
  const selectedSubcategory = params.subcategoria?.trim() ?? "";
  const selectedBrand = params.marca?.trim() ?? "";
  const selectedOrder = params.orden?.trim() ?? "recientes";

  const selectedStatus =
    params.estado === "ofertas" || params.estado === "destacados"
      ? params.estado
      : "";
  const selectedStatusData =
    statusOptions.find((option) => option.value === selectedStatus) ?? null;

  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [categories, brands, subcategories, featuredQuickSubcategories] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
        },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: {
                  isActive: true,
                  deletedAt: null,
                },
              },
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

      prisma.subcategory.findMany({
        where: {
          isActive: true,
          ...(selectedCategory
            ? {
                category: {
                  slug: selectedCategory,
                },
              }
            : {}),
          products: {
            some: {
              isActive: true,
              deletedAt: null,
            },
          },
        },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),

      prisma.subcategory.findMany({
        where: {
          isActive: true,
          slug: {
            in: featuredQuickSubcategorySlugs,
          },
          products: {
            some: {
              isActive: true,
              deletedAt: null,
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: {
                  isActive: true,
                  deletedAt: null,
                },
              },
            },
          },
        },
      }),
    ]);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,

    ...(selectedStatus === "ofertas"
      ? {
          isOffer: true,
        }
      : {}),

    ...(selectedStatus === "destacados"
      ? {
          isFeatured: true,
        }
      : {}),

    ...(selectedCategory
      ? {
          category: {
            slug: selectedCategory,
          },
        }
      : {}),

    ...(selectedSubcategory
      ? {
          subcategory: {
            slug: selectedSubcategory,
          },
        }
      : {}),

    ...(selectedBrand
      ? {
          brand: {
            slug: selectedBrand,
          },
        }
      : {}),

    ...(query
      ? {
          OR: [
            {
              name: {
                contains: query,
              },
            },
            {
              descriptionShort: {
                contains: query,
              },
            },
            {
              brand: {
                name: {
                  contains: query,
                },
              },
            },
            {
              category: {
                name: {
                  contains: query,
                },
              },
            },
            {
              subcategory: {
                name: {
                  contains: query,
                },
              },
            },
          ],
        }
      : {}),
  };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: getOrderBy(selectedOrder),
      skip,
      take: PAGE_SIZE,
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

    prisma.product.count({
      where,
    }),
  ]);

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const paginationItems = getPaginationItems(currentPage, totalPages);

  const previousUrl =
    currentPage > 1
      ? buildProductsUrl({
          q: query,
          categoria: selectedCategory,
          subcategoria: selectedSubcategory,
          marca: selectedBrand,
          orden: selectedOrder,
          estado: selectedStatus,
          page: currentPage - 1,
        })
      : null;

  const nextUrl =
    currentPage < totalPages
      ? buildProductsUrl({
          q: query,
          categoria: selectedCategory,
          subcategoria: selectedSubcategory,
          marca: selectedBrand,
          orden: selectedOrder,
          estado: selectedStatus,
          page: currentPage + 1,
        })
      : null;

  const selectedCategoryData = categories.find(
    (category) => category.slug === selectedCategory,
  );

  const selectedSubcategoryData = subcategories.find(
    (subcategory) => subcategory.slug === selectedSubcategory,
  );

  const sortedSubcategories = [...subcategories].sort((a, b) => {
    const aIndex = featuredQuickSubcategorySlugs.indexOf(a.slug);
    const bIndex = featuredQuickSubcategorySlugs.indexOf(b.slug);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.name.localeCompare(b.name);
  });

  const sortedFeaturedQuickSubcategories = [...featuredQuickSubcategories].sort(
    (a, b) => {
      const aIndex = featuredQuickSubcategorySlugs.indexOf(a.slug);
      const bIndex = featuredQuickSubcategorySlugs.indexOf(b.slug);

      return aIndex - bIndex;
    },
  );

  const selectedBrandData = brands.find(
    (brand) => brand.slug === selectedBrand,
  );

  const selectedOrderData =
    orderOptions.find((option) => option.value === selectedOrder) ??
    orderOptions[0];

  const hasFilters =
    query ||
    selectedCategory ||
    selectedSubcategory ||
    selectedBrand ||
    selectedStatus ||
    selectedOrder !== "recientes";

  const activeFiltersCount = [
    query,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    selectedStatus,
    selectedOrder !== "recientes" ? selectedOrder : "",
  ].filter(Boolean).length;

  const firstProductNumber =
    totalProducts > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;

  const lastProductNumber =
    totalProducts > 0 ? firstProductNumber + serializedProducts.length - 1 : 0;

  const catalogUrl = `${siteConfig.url}/productos`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Productos",
        item: catalogUrl,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Productos | Credifer",
    description:
      "Catálogo online de Credifer con productos disponibles para consultar precio contado, cuotas, financiación, disponibilidad y entrega.",
    url: catalogUrl,
    inLanguage: "es-AR",
    isPartOf: {
      "@type": "WebSite",
      name: "Credifer",
      url: siteConfig.url,
    },
    breadcrumb: breadcrumbJsonLd,
    mainEntity: {
      "@type": "ItemList",
      name: "Catálogo de productos Credifer",
      numberOfItems: totalProducts,
      itemListElement: serializedProducts.map((product, index) => ({
        "@type": "ListItem",
        position: firstProductNumber + index,
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
      <div className="relative overflow-hidden border-b border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_42%,#FFF7D8_76%,#EAF8EF_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(2,100,169,0.18),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(123,170,53,0.14),transparent_28%),radial-gradient(circle_at_58%_88%,rgba(244,196,48,0.20),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[42%] top-[44%] hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.1] lg:block">
            <Image
              src="/brand/logo-square.png"
              alt=""
              fill
              aria-hidden="true"
              sizes="520px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="container-page relative py-4 lg:py-14">
          <div className="hidden gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-[1.35rem] border border-[#B7CADA] bg-white/86 px-4 py-3 shadow-[0_12px_26px_rgba(15,23,42,0.08)] backdrop-blur">
                <span className="h-3 w-3 rounded-full bg-[var(--brand-blue)]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-blue-dark)]">
                  Catálogo Credifer
                </p>
              </div>

              <h1 className="mt-5 max-w-4xl text-[2rem] font-black leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)] sm:text-5xl lg:text-[3.65rem] lg:leading-[0.98]">
                Buscá productos y consultá cuotas.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                Encontrá productos por nombre, marca, categoría o modelo.
                Después armás tu consulta para coordinar cuotas, disponibilidad
                y entrega con Credifer.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#C9D6E4] bg-white/84 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
                  <span className="mb-4 block h-1.5 w-12 rounded-full bg-[var(--brand-yellow)]" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Financiación
                  </p>
                  <p className="mt-2 text-sm font-extrabold leading-5 text-[var(--text-primary)]">
                    Cuotas a consultar
                  </p>
                </div>

                <div className="rounded-2xl border border-[#C9D6E4] bg-white/84 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
                  <span className="mb-4 block h-1.5 w-12 rounded-full bg-[var(--brand-green)]" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Pagos
                  </p>
                  <p className="mt-2 text-sm font-extrabold leading-5 text-[var(--text-primary)]">
                    Tarjetas, efectivo o transferencia
                  </p>
                </div>

                <div className="rounded-2xl border border-[#C9D6E4] bg-white/84 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
                  <span className="mb-4 block h-1.5 w-12 rounded-full bg-[var(--brand-red)]" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Entrega
                  </p>
                  <p className="mt-2 text-sm font-extrabold leading-5 text-[var(--text-primary)]">
                    Coordinación con asesor
                  </p>
                </div>
              </div>

              <form
                action="/productos#catalogo"
                className="mt-5 hidden rounded-[1.75rem] border border-[#B7CADA] bg-white/92 p-3 shadow-[0_18px_42px_rgba(15,23,42,0.10)] backdrop-blur lg:block"
              >
                {selectedCategory ? (
                  <input
                    type="hidden"
                    name="categoria"
                    value={selectedCategory}
                  />
                ) : null}

                {selectedSubcategory ? (
                  <input
                    type="hidden"
                    name="subcategoria"
                    value={selectedSubcategory}
                  />
                ) : null}

                {selectedBrand ? (
                  <input type="hidden" name="marca" value={selectedBrand} />
                ) : null}

                {selectedOrder !== "recientes" ? (
                  <input type="hidden" name="orden" value={selectedOrder} />
                ) : null}

                {selectedStatus ? (
                  <input type="hidden" name="estado" value={selectedStatus} />
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Buscar celular, parlante, marca, modelo..."
                    className="min-h-[52px] flex-1 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
                  />

                  <button
                    type="submit"
                    className="min-h-[52px] rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#082F49]/20 bg-[linear-gradient(160deg,#0B3558_0%,#0D4A73_100%)] p-6 text-white shadow-[0_26px_65px_rgba(8,47,73,0.25)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(37,211,102,0.14)] blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[rgba(244,196,48,0.14)] blur-2xl" />

              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/58">
                  Catálogo online
                </p>

                <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.035em]">
                  Elegí, filtrá y consultá sin vueltas.
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/74">
                  Usá categorías, marcas y búsqueda para llegar rápido al
                  producto que necesitás.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.10] p-4">
                    <p className="text-sm font-black text-white">
                      {totalProducts} productos disponibles
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/68">
                      Catálogo actualizado con precios publicados al contado.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.10] p-4">
                      <p className="text-sm font-black text-white">
                        {categories.length} categorías
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/68">
                        Accesos rápidos por rubro.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.10] p-4">
                      <p className="text-sm font-black text-white">
                        {brands.length} marcas
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/68">
                        Filtrá por fabricante.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/como-comprar"
                    className="relative z-10 mt-1 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-[0_14px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-soft)] focus-ring"
                  >
                    <span className="text-slate-950">Ver cómo comprar</span>
                    <span
                      aria-hidden="true"
                      className="text-base leading-none text-slate-950"
                    ></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <form
            action="/productos#catalogo"
            className="rounded-[1.5rem] border border-[#B7CADA] bg-white/94 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden"
          >
            {selectedCategory ? (
              <input type="hidden" name="categoria" value={selectedCategory} />
            ) : null}

            {selectedSubcategory ? (
              <input
                type="hidden"
                name="subcategoria"
                value={selectedSubcategory}
              />
            ) : null}

            {selectedBrand ? (
              <input type="hidden" name="marca" value={selectedBrand} />
            ) : null}

            {selectedOrder !== "recientes" ? (
              <input type="hidden" name="orden" value={selectedOrder} />
            ) : null}

            {selectedStatus ? (
              <input type="hidden" name="estado" value={selectedStatus} />
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Buscar celular, parlante, marca, modelo..."
                className="min-h-[52px] flex-1 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
              />

              <button
                type="submit"
                className="min-h-[52px] rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Buscar
              </button>
            </div>
          </form>

          {sortedFeaturedQuickSubcategories.length > 0 ? (
            <div className="mt-4 rounded-[1.5rem] border border-[#B7CADA] bg-white/86 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)] backdrop-blur lg:hidden">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                  Accesos rápidos
                </p>

                <Link
                  href="/categorias"
                  className="text-xs font-black text-[var(--brand-blue-dark)] transition hover:text-[var(--brand-blue)] focus-ring"
                >
                  Ver más
                </Link>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <Link
                  href={buildProductsUrl({
                    q: query,
                    marca: selectedBrand,
                    orden: selectedOrder,
                    estado: selectedStatus,
                  })}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-black transition focus-ring ${
                    !selectedCategory && !selectedSubcategory
                      ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(2,100,169,0.20)]"
                      : "border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)]"
                  }`}
                >
                  Todos
                </Link>

                {sortedFeaturedQuickSubcategories.map((subcategory) => (
                  <Link
                    key={`mobile-quick-subcategory-${subcategory.id}`}
                    href={buildProductsUrl({
                      q: query,
                      subcategoria: subcategory.slug,
                      marca: selectedBrand,
                      orden: selectedOrder,
                      estado: selectedStatus,
                    })}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-black transition focus-ring ${
                      selectedSubcategory === subcategory.slug
                        ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(2,100,169,0.20)]"
                        : "border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)]"
                    }`}
                  >
                    {subcategory.name}
                    <span className="ml-1.5 text-[10px] opacity-70">
                      {subcategory._count.products}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {categories.length > 0 ? (
            <div className="mt-8 hidden rounded-[2rem] border border-[#C9D6E4] bg-white/78 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur lg:block">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Accesos rápidos
                </h2>

                <Link
                  href="/categorias"
                  className="rounded-md text-sm font-black text-[var(--brand-blue-dark)] transition hover:text-[var(--brand-blue)] focus-ring"
                >
                  Ver todas
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
                <Link
                  href={buildProductsUrl({
                    q: query,
                    marca: selectedBrand,
                    orden: selectedOrder,
                    estado: selectedStatus,
                  })}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition focus-ring ${
                    !selectedCategory && !selectedSubcategory
                      ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(2,100,169,0.20)]"
                      : "border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)]"
                  }`}
                >
                  Todos
                </Link>
                {sortedFeaturedQuickSubcategories.map((subcategory) => (
                  <Link
                    key={`quick-subcategory-${subcategory.id}`}
                    href={buildProductsUrl({
                      q: query,
                      subcategoria: subcategory.slug,
                      marca: selectedBrand,
                      orden: selectedOrder,
                      estado: selectedStatus,
                    })}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition focus-ring ${
                      selectedSubcategory === subcategory.slug
                        ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(2,100,169,0.20)]"
                        : "border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)]"
                    }`}
                  >
                    {subcategory.name}
                    <span className="ml-2 text-xs opacity-70">
                      {subcategory._count.products}
                    </span>
                  </Link>
                ))}
                {categories.slice(0, 12).map((category) => (
                  <Link
                    key={category.id}
                    href={buildProductsUrl({
                      q: query,
                      categoria: category.slug,
                      marca: selectedBrand,
                      orden: selectedOrder,
                      estado: selectedStatus,
                    })}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition focus-ring ${
                      selectedCategory === category.slug
                        ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(2,100,169,0.20)]"
                        : "border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)]"
                    }`}
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-70">
                      {category._count.products}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        id="catalogo"
        className="container-page scroll-mt-24 py-4 lg:scroll-mt-32 lg:py-9"
      >
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <CatalogFilters
            categories={categories}
            subcategories={sortedSubcategories}
            brands={brands}
            orderOptions={orderOptions}
            statusOptions={statusOptions}
            query={query}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedBrand={selectedBrand}
            selectedOrder={selectedOrder}
            selectedStatus={selectedStatus}
            activeFiltersCount={activeFiltersCount}
            hasFilters={Boolean(hasFilters)}
          />

          <div>
            <div className="rounded-[1.5rem] border border-[var(--catalog-border)] bg-white p-4 shadow-sm lg:rounded-[2rem] lg:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                    Resultados
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                    {hasFilters ? "Productos filtrados" : "Todos los productos"}
                  </h2>

                  <p className="mt-2 text-sm font-bold text-[var(--text-secondary)]">
                    Mostrando{" "}
                    <span className="font-black text-[var(--text-primary)]">
                      {firstProductNumber}
                    </span>{" "}
                    -{" "}
                    <span className="font-black text-[var(--text-primary)]">
                      {lastProductNumber}
                    </span>{" "}
                    de{" "}
                    <span className="font-black text-[var(--text-primary)]">
                      {totalProducts}
                    </span>{" "}
                    productos.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {query ? (
                    <span className="rounded-full border border-[#C9D6E4] bg-[var(--brand-blue-soft)] px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                      Búsqueda: {query}
                    </span>
                  ) : null}

                  {selectedCategoryData ? (
                    <span className="rounded-full border border-[#C9D6E4] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                      {selectedCategoryData.name}
                    </span>
                  ) : null}

                  {selectedSubcategoryData ? (
                    <span className="rounded-full border border-[#C9D6E4] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                      {selectedSubcategoryData.name}
                    </span>
                  ) : null}

                  {selectedBrandData ? (
                    <span className="rounded-full border border-[#C9D6E4] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                      {selectedBrandData.name}
                    </span>
                  ) : null}

                  {selectedStatusData ? (
                    <span className="rounded-full border border-[#C9D6E4] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                      {selectedStatusData.label}
                    </span>
                  ) : null}

                  {selectedOrder !== "recientes" ? (
                    <span className="rounded-full border border-[#C9D6E4] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                      Orden: {selectedOrderData.label}
                    </span>
                  ) : null}

                  {selectedStatus ? (
                    <input type="hidden" name="estado" value={selectedStatus} />
                  ) : null}

                  {hasFilters ? (
                    <Link
                      href="/productos"
                      className="rounded-full border border-[var(--brand-blue)] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue)] transition hover:bg-[var(--brand-blue)] hover:text-white focus-ring"
                    >
                      Limpiar filtros
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            {serializedProducts.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-5 2xl:grid-cols-4">
                {serializedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-[var(--border)] bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-black text-[var(--text-primary)]">
                  No encontramos productos
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  Probá con otra búsqueda, cambiá los filtros o volvé al
                  catálogo completo.
                </p>

                <Link
                  href="/productos"
                  className="mt-6 inline-flex rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
                >
                  Ver catálogo completo
                </Link>
              </div>
            )}

            {totalPages > 1 ? (
              <div className="mt-8 rounded-[1.75rem] border border-[#B7CADA] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:rounded-[2rem] lg:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <p className="text-sm font-black text-[var(--text-secondary)]">
                    Página{" "}
                    <span className="text-[var(--text-primary)]">
                      {currentPage}
                    </span>{" "}
                    de{" "}
                    <span className="text-[var(--text-primary)]">
                      {totalPages}
                    </span>
                  </p>

                  <nav
                    aria-label="Paginación de productos"
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end"
                  >
                    {currentPage > 1 ? (
                      <Link
                        href={createProductsPageHref({
                          page: currentPage - 1,
                          query,
                          selectedCategory,
                          selectedSubcategory,
                          selectedBrand,
                          selectedOrder,
                          selectedStatus,
                        })}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#C9D6E4] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                      >
                        Anterior
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-black text-slate-400">
                        Anterior
                      </span>
                    )}

                    <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-full bg-[#F1F6FA] p-1.5">
                      {paginationItems.map((item, index) => {
                        if (item === "ellipsis") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm font-black text-[var(--text-muted)]"
                            >
                              …
                            </span>
                          );
                        }

                        const isCurrent = item === currentPage;

                        return (
                          <Link
                            key={item}
                            href={createProductsPageHref({
                              page: item,
                              query,
                              selectedCategory,
                              selectedSubcategory,
                              selectedBrand,
                              selectedOrder,
                              selectedStatus,
                            })}
                            aria-current={isCurrent ? "page" : undefined}
                            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-black transition focus-ring ${
                              isCurrent
                                ? "bg-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(2,100,169,0.22)]"
                                : "bg-white text-[var(--brand-blue-dark)] shadow-sm hover:text-[var(--brand-blue)]"
                            }`}
                          >
                            {item}
                          </Link>
                        );
                      })}
                    </div>

                    {currentPage < totalPages ? (
                      <Link
                        href={createProductsPageHref({
                          page: currentPage + 1,
                          query,
                          selectedCategory,
                          selectedSubcategory,
                          selectedBrand,
                          selectedOrder,
                          selectedStatus,
                        })}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:bg-[var(--brand-blue-dark)] focus-ring"
                      >
                        Siguiente
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-black text-slate-400">
                        Siguiente
                      </span>
                    )}
                  </nav>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
