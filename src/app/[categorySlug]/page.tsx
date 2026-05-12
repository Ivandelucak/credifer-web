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

async function getCategory(categorySlug: string) {
  return prisma.category.findFirst({
    where: {
      slug: categorySlug,
      isActive: true,
    },
  });
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) {
    return {
      title: "Categoría no encontrada",
    };
  }

  return {
    title: `${category.name} | Credifer`,
    description: `Conocé productos de ${category.name} en Credifer. Precio contado publicado y financiación a consultar por WhatsApp.`,
    openGraph: {
      title: `${category.name} | Credifer`,
      description: `Productos de ${category.name} disponibles en Credifer.`,
      type: "website",
      url: `${siteConfig.url}/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: category.id,
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

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Categoría
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
              {category.name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              {category.description ??
                "Productos disponibles para consultar precio contado y opciones de financiación por WhatsApp."}
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
        productos en esta categoría.
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
            No hay productos visibles en esta categoría
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
