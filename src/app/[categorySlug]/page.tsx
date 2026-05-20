//src/app/[categorySlug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
        ? `Productos de ${section.name} disponibles dentro de ${section.parentCategory.name}. Consultá precio contado, cuotas y opciones de financiación.`
        : `Productos de ${section.name} disponibles para consultar precio contado, cuotas y opciones de financiación.`
      : "Productos disponibles para consultar precio contado y opciones de financiación.");

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              {section.type === "category" ? "Categoría" : "Subcategoría"}
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
              {section.name}
            </h1>

            {section.type === "subcategory" && section.parentCategory ? (
              <p className="mt-3 text-sm font-black text-[var(--brand-blue-dark)]">
                Dentro de{" "}
                <Link
                  href={`/${section.parentCategory.slug}`}
                  className="text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)] focus-ring"
                >
                  {section.parentCategory.name}
                </Link>
              </p>
            ) : null}

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              {sectionDescription}
            </p>
          </div>

          <Link
            href="/productos"
            className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            Ver todo el catálogo
          </Link>
        </div>
      </div>

      <div className="mt-6 text-sm text-[var(--text-secondary)]">
        <span className="font-black text-[var(--text-primary)]">
          {serializedProducts.length}
        </span>{" "}
        productos en esta{" "}
        {section.type === "category" ? "categoría" : "subcategoría"}.
      </div>

      {serializedProducts.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-[var(--border)] bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">
            No hay productos visibles en esta{" "}
            {section.type === "category" ? "categoría" : "subcategoría"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Podés volver al catálogo completo para ver otras secciones.
          </p>

          <Link
            href="/productos"
            className="mt-6 inline-flex rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
          >
            Ver productos
          </Link>
        </div>
      )}
    </section>
  );
}
