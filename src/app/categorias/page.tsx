//src/app/categorias/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

const categoryHeroBenefits = [
  {
    title: "Catálogo ordenado",
    text: "Accedé por rubro y encontrá más rápido lo que buscás.",
    accent: "bg-[var(--brand-blue)]",
  },
  {
    title: "Consulta simple",
    text: "Entrá a una categoría, elegí productos y armá tu consulta.",
    accent: "bg-[var(--brand-yellow)]",
  },
  {
    title: "Atención Credifer",
    text: "Coordiná financiación, disponibilidad y entrega con un asesor.",
    accent: "bg-[var(--brand-green)]",
  },
];

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorías | Credifer",
  description:
    "Explorá las categorías del catálogo Credifer. Encontrá celulares, electrodomésticos, herramientas, tecnología, muebles, parlantes y más productos para consultar cuotas y disponibilidad.",
  alternates: {
    canonical: `${siteConfig.url}/categorias`,
  },
  openGraph: {
    title: "Categorías | Credifer",
    description:
      "Navegá el catálogo Credifer por categorías y encontrá rápido los productos que necesitás.",
    type: "website",
    url: `${siteConfig.url}/categorias`,
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
    title: "Categorías | Credifer",
    description:
      "Explorá productos por categoría en el catálogo online de Credifer.",
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

const categoryVisuals: Record<
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
  electrodomesticos: {
    image: "/categories/electrodomesticos.jpg",
    alt: "Electrodomésticos para el hogar",
    accent: "bg-[var(--brand-yellow)]",
  },
  parlantes: {
    image: "/categories/parlantes.jpg",
    alt: "Parlantes y audio",
    accent: "bg-[var(--brand-green)]",
  },
  herramientas: {
    image: "/categories/herramientas.jpg",
    alt: "Herramientas de trabajo",
    accent: "bg-[var(--brand-red)]",
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
  "pequenos-electrodomesticos": {
    image: "/categories/pequenos-electrodomesticos.jpg",
    alt: "Pequeños electrodomésticos para el hogar",
    accent: "bg-[var(--brand-blue)]",
  },
  cocinas: {
    image: "/categories/cocinas.jpg",
    alt: "Cocinas y productos de cocina",
    accent: "bg-[var(--brand-yellow)]",
  },
};

const fallbackAccents = [
  "bg-[var(--brand-blue)]",
  "bg-[var(--brand-yellow)]",
  "bg-[var(--brand-green)]",
  "bg-[var(--brand-red)]",
];

function getFallbackAccent(index: number) {
  return fallbackAccents[index % fallbackAccents.length];
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      slug: {
        not: "sin-categorizar",
      },
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
      description: true,
      subcategories: {
        where: {
          isActive: true,
        },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
        },
        take: 4,
      },
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
  });

  const highlightedSubcategories = await prisma.subcategory.findMany({
    where: {
      isActive: true,
      slug: {
        in: ["celulares"],
      },
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
      description: true,
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
  });

  const catalogSections = [
    ...highlightedSubcategories.map((subcategory) => ({
      id: `subcategory-${subcategory.id}`,
      name: subcategory.name,
      slug: subcategory.slug,
      description:
        subcategory.description ??
        "Celulares disponibles para consultar precio contado, cuotas, financiación y disponibilidad.",
      productsCount: subcategory._count.products,
      subcategories: [],
      type: "subcategory" as const,
    })),
    ...categories.map((category) => ({
      id: `category-${category.id}`,
      name: category.name,
      slug: category.slug,
      description:
        category.description ??
        "Productos disponibles para consultar precio contado, cuotas, financiación y disponibilidad.",
      productsCount: category._count.products,
      subcategories: category.subcategories,
      type: "category" as const,
    })),
  ];

  const categoriesUrl = `${siteConfig.url}/categorias`;

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
        name: "Categorías",
        item: categoriesUrl,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Categorías | Credifer",
    description:
      "Secciones del catálogo online de Credifer para explorar productos por categoría.",
    url: categoriesUrl,
    inLanguage: "es-AR",
    isPartOf: {
      "@type": "WebSite",
      name: "Credifer",
      url: siteConfig.url,
    },
    breadcrumb: breadcrumbJsonLd,
    mainEntity: {
      "@type": "ItemList",
      name: "Categorías del catálogo Credifer",
      numberOfItems: catalogSections.length,
      itemListElement: catalogSections.map((section, index) => {
        const visual = categoryVisuals[section.slug];

        return {
          "@type": "ListItem",
          position: index + 1,
          url: `${siteConfig.url}/${section.slug}`,
          name: section.name,
          image: visual?.image ? `${siteConfig.url}${visual.image}` : undefined,
        };
      }),
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
      <div className="relative overflow-hidden border-b border-[#C9D6E4] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_45%,#FFF7D8_78%,#EAF8EF_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[rgba(2,100,169,0.14)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[rgba(244,196,48,0.18)] blur-3xl" />

        <div className="container-page relative py-6 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[38%] top-[45%] hidden h-[620px] w-[620px] -translate-y-1/2 opacity-[0.1] lg:block xl:left-[42%] xl:h-[660px] xl:w-[660px]"
          >
            <div className="relative h-full w-full">
              <Image
                src="/brand/logo-credifer.png"
                alt=""
                fill
                sizes="660px"
                className="object-contain object-center"
              />
            </div>
          </div>
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/86 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                Secciones del catálogo
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.05em] text-[var(--text-primary)] lg:text-6xl">
              Elegí una categoría y encontrá rápido lo que necesitás.
            </h1>

            <p className="mt-5 hidden max-w-3xl text-base leading-7 text-[var(--text-secondary)] lg:block lg:text-lg lg:leading-8">
              Navegá el catálogo Credifer por rubros, revisá productos
              disponibles y armá tu consulta para coordinar precio contado,
              cuotas, financiación y entrega.
            </p>

            <div className="mt-7 hidden flex-wrap gap-3 lg:flex">
              <Link
                href="/productos"
                className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Ver todos los productos
              </Link>

              <Link
                href="/como-comprar"
                className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Cómo comprar
              </Link>
            </div>
          </div>

          <div className="mt-9 hidden gap-4 md:grid-cols-3 lg:grid">
            {categoryHeroBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[1.5rem] border border-[#B7CADA] bg-white/82 p-5 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur"
              >
                <span
                  className={`block h-1.5 w-12 rounded-full ${benefit.accent}`}
                />

                <h2 className="mt-4 text-lg font-black text-[var(--text-primary)]">
                  {benefit.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-5 lg:py-12">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-6">
          <div>
            <p className="hidden text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)] lg:block">
              Categorías
            </p>

            <h2 className="text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)] lg:mt-2 lg:text-3xl">
              Elegí la sección que necesitás.
            </h2>
          </div>

          <Link
            href="/productos"
            className="hidden w-fit rounded-full border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring lg:inline-flex"
          >
            Ver catálogo completo
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {catalogSections.map((category, index) => {
            const visual = categoryVisuals[category.slug];
            const accent = visual?.accent ?? getFallbackAccent(index);

            return (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="group flex overflow-hidden rounded-[2rem] border border-[#B7CADA] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.065)] transition duration-200 hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--catalog-shadow)] focus-ring"
              >
                <div className="flex w-full flex-col">
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-[#D6E3EF] bg-[var(--catalog-surface-soft)] lg:aspect-[16/10]">
                    {visual?.image ? (
                      <Image
                        src={visual.image}
                        alt={visual.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#EAF4FB_0%,#FFFFFF_100%)]">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white text-3xl font-black text-[var(--brand-blue)] shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <span
                        className={`block h-1.5 w-12 rounded-full ${accent}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 lg:p-5">
                    <div>
                      <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)] lg:block">
                        Sección
                      </p>

                      <h3 className="text-xl font-black leading-tight tracking-[-0.025em] text-[var(--text-primary)] transition group-hover:text-[var(--brand-blue)] lg:mt-2 lg:text-2xl sm:text-[1.45rem]">
                        {category.name}
                      </h3>

                      <p className="mt-3 hidden text-sm leading-6 text-[var(--text-secondary)] lg:block">
                        {category.description ??
                          "Productos disponibles para consultar precio contado, cuotas, financiación y disponibilidad."}
                      </p>

                      {category.subcategories.length > 0 ? (
                        <div className="mt-4 hidden flex-wrap gap-2 lg:flex">
                          {category.subcategories.map((subcategory) => (
                            <span
                              key={subcategory.id}
                              className="rounded-full bg-[var(--catalog-surface-soft)] px-3 py-1 text-xs font-black text-[var(--text-secondary)] shadow-sm"
                            >
                              {subcategory.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-auto pt-4 lg:pt-5">
                      <div className="flex items-center justify-between gap-4 border-t border-[#D6E3EF] pt-4">
                        <div>
                          <p className="text-2xl font-black text-[var(--brand-blue-dark)]">
                            {category.productsCount}
                          </p>
                          <p className="text-xs font-bold text-[var(--text-muted)]">
                            productos
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-blue)] px-3 py-2 text-xs font-black text-white transition group-hover:bg-[var(--brand-blue-dark)] lg:px-4 lg:text-sm">
                          Entrar
                          <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
