import type { Prisma } from "@prisma/client";
import { ProductCard } from "@/components/products/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    orden?: string;
  }>;
};

const orderOptions = [
  { label: "Más recientes", value: "recientes" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "Destacados", value: "destacados" },
];

function getOrderBy(order: string): Prisma.ProductOrderByWithRelationInput[] {
  if (order === "precio-asc") {
    return [{ price: "asc" }, { createdAt: "desc" }];
  }

  if (order === "precio-desc") {
    return [{ price: "desc" }, { createdAt: "desc" }];
  }

  if (order === "destacados") {
    return [{ isFeatured: "desc" }, { isOffer: "desc" }, { createdAt: "desc" }];
  }

  return [{ createdAt: "desc" }];
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const selectedCategory = params.categoria?.trim() ?? "";
  const selectedOrder = params.orden?.trim() ?? "recientes";

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(selectedCategory
      ? {
          category: {
            slug: selectedCategory,
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
          ],
        }
      : {}),
  };

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: getOrderBy(selectedOrder),
      take: 48,
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
    }),
    prisma.product.count({ where }),
  ]);

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Catálogo
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
              Productos Credifer
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Consultá productos con precio contado publicado. Las cuotas,
              promociones y condiciones se coordinan directamente por WhatsApp
              con un vendedor.
            </p>
          </div>

          <form className="grid gap-3 rounded-3xl bg-[var(--surface-muted)] p-4 sm:grid-cols-[1fr_220px_180px_auto]">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar producto, marca o categoría..."
              className="h-12 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
            />

            <select
              name="categoria"
              defaultValue={selectedCategory}
              className="h-12 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              name="orden"
              defaultValue={selectedOrder}
              className="h-12 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            >
              {orderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="h-12 rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Filtrar
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mostrando{" "}
          <span className="font-black text-[var(--text-primary)]">
            {serializedProducts.length}
          </span>{" "}
          de{" "}
          <span className="font-black text-[var(--text-primary)]">
            {totalProducts}
          </span>{" "}
          productos.
        </p>

        {query || selectedCategory ? (
          <a
            href="/productos"
            className="font-black text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)]"
          >
            Limpiar filtros
          </a>
        ) : null}
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
            No encontramos productos
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Probá con otra búsqueda o limpiá los filtros aplicados.
          </p>

          <a
            href="/productos"
            className="mt-6 inline-flex rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
          >
            Ver catálogo completo
          </a>
        </div>
      )}
    </section>
  );
}
