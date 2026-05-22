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
};

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
    };
  }

  const description =
    section.type === "category"
      ? `Conocé productos de ${section.name} en Credifer. Precio contado publicado y financiación a consultar.`
      : `Conocé productos de ${section.name} en Credifer. Precio contado publicado, cuotas y financiación a consultar.`;

  return {
    title: `${section.name} | Credifer`,
    description,
    openGraph: {
      title: `${section.name} | Credifer`,
      description: `Productos de ${section.name} disponibles en Credifer.`,
      type: "website",
      url: `${siteConfig.url}/${section.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const section = await getCatalogSection(categorySlug);

  if (!section) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      ...(section.type === "category"
        ? { categoryId: section.id }
        : { subcategoryId: section.id }),
    },
    orderBy: [
      { isFeatured: "desc" },
      { isOffer: "desc" },
      { createdAt: "desc" },
    ],
    take: 60,
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

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

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

  return (
    <section className="bg-[var(--catalog-bg)]">
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
                className="w-fit rounded-full border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Ver catálogo completo
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {serializedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
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
