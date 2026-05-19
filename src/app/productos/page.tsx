//src/app/productos/page.tsx

import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    subcategoria?: string;
    marca?: string;
    orden?: string;
    page?: string;
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
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.categoria) searchParams.set("categoria", params.categoria);
  if (params.subcategoria)
    searchParams.set("subcategoria", params.subcategoria);
  if (params.marca) searchParams.set("marca", params.marca);

  if (params.orden && params.orden !== "recientes") {
    searchParams.set("orden", params.orden);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/productos?${queryString}` : "/productos";
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

  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [categories, brands, subcategories] = await Promise.all([
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
  ]);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,

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

  const previousUrl =
    currentPage > 1
      ? buildProductsUrl({
          q: query,
          categoria: selectedCategory,
          subcategoria: selectedSubcategory,
          marca: selectedBrand,
          orden: selectedOrder,
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
          page: currentPage + 1,
        })
      : null;

  const hasFilters =
    query ||
    selectedCategory ||
    selectedSubcategory ||
    selectedBrand ||
    selectedOrder !== "recientes";

  return (
    <section className="bg-[var(--catalog-bg)]">
      <div className="relative overflow-hidden border-b-2 border-[#B7CADA] bg-[linear-gradient(135deg,#E4F1FA_0%,#F7FBFF_44%,#DCEEF8_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(2,100,169,0.22),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(37,211,102,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_60%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(226,238,248,0.92))]" />

        <div className="container-page relative py-9 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--brand-blue)]">
                Catálogo Credifer
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.045em] text-[var(--text-primary)] sm:text-5xl lg:text-[3.75rem] lg:leading-[0.98]">
                Encontrá el producto que necesitás y consultá tu financiación.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                Explorá el catálogo de Credifer, filtrá por categoría o marca y
                enviá tu consulta para coordinar cuotas, disponibilidad y
                entrega.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#C9D6E4] bg-white/80 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Precios claros
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-[var(--text-secondary)]">
                    Valores publicados al contado
                  </p>
                </div>

                <div className="rounded-2xl border border-[#C9D6E4] bg-white/80 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Financiación
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-[var(--text-secondary)]">
                    Consultá cuotas según producto
                  </p>
                </div>

                <div className="rounded-2xl border border-[#C9D6E4] bg-white/80 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Entrega
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-[var(--text-secondary)]">
                    Coordinación con vendedor
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#082F49]/20 bg-[#0B3A5C] p-6 text-white shadow-[0_26px_65px_rgba(8,47,73,0.28)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(37,211,102,0.14)] blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[rgba(255,255,255,0.10)] blur-2xl" />

              <div className="relative">
                <p className="text-sm font-black uppercase tracking-[0.28em] text-white/60">
                  Cómo funciona
                </p>

                <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.035em]">
                  Compra asistida, simple y segura.
                </h2>

                <div className="mt-6 space-y-3">
                  <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#0B3A5C]">
                      1
                    </span>
                    <p className="text-sm leading-6 text-white/82">
                      Agregás uno o varios productos al carrito.
                    </p>
                  </div>

                  <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#0B3A5C]">
                      2
                    </span>
                    <p className="text-sm leading-6 text-white/82">
                      Enviás tu consulta con los productos elegidos.
                    </p>
                  </div>

                  <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#0B3A5C]">
                      3
                    </span>
                    <p className="text-sm leading-6 text-white/82">
                      Credifer confirma precio final, cuotas y entrega.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="mt-10 rounded-[2rem] border border-[#C9D6E4] bg-white/72 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Categorías rápidas
                </h2>

                <Link
                  href="/categorias"
                  className="rounded-md text-sm font-black text-[var(--brand-blue-dark)] transition hover:text-[var(--brand-blue)] focus-ring"
                >
                  Ver todas
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                <Link
                  href="/productos"
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition focus-ring ${
                    !selectedCategory
                      ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_10px_22px_rgba(2,100,169,0.20)]"
                      : "border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)]"
                  }`}
                >
                  Todos
                </Link>

                {categories.slice(0, 12).map((category) => (
                  <Link
                    key={category.id}
                    href={buildProductsUrl({
                      q: query,
                      categoria: category.slug,
                      marca: selectedBrand,
                      orden: selectedOrder,
                    })}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition focus-ring ${
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

      <div className="container-page py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-[var(--catalog-border-strong)] bg-white p-5 shadow-[var(--catalog-shadow)] lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                  Filtros
                </p>

                <h2 className="mt-1 text-xl font-black text-[var(--text-primary)]">
                  Refinar búsqueda
                </h2>
              </div>

              {hasFilters ? (
                <Link
                  href="/productos"
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                >
                  Limpiar
                </Link>
              ) : null}
            </div>

            <form className="mt-5 grid gap-4">
              <div>
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-black text-[var(--text-primary)]"
                >
                  Buscar
                </label>

                <input
                  id="q"
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Producto, marca..."
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
                />
              </div>

              <div>
                <label
                  htmlFor="categoria"
                  className="mb-2 block text-sm font-black text-[var(--text-primary)]"
                >
                  Categoría
                </label>

                <select
                  id="categoria"
                  name="categoria"
                  defaultValue={selectedCategory}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                >
                  <option value="">Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="subcategoria"
                  className="mb-2 block text-sm font-black text-[var(--text-primary)]"
                >
                  Subcategoría
                </label>

                <select
                  id="subcategoria"
                  name="subcategoria"
                  defaultValue={selectedSubcategory}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                >
                  <option value="">Todas</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.slug}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="marca"
                  className="mb-2 block text-sm font-black text-[var(--text-primary)]"
                >
                  Marca
                </label>

                <select
                  id="marca"
                  name="marca"
                  defaultValue={selectedBrand}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                >
                  <option value="">Todas</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="orden"
                  className="mb-2 block text-sm font-black text-[var(--text-primary)]"
                >
                  Orden
                </label>

                <select
                  id="orden"
                  name="orden"
                  defaultValue={selectedOrder}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                >
                  {orderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="h-12 rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Aplicar filtros
              </button>
            </form>
          </aside>

          <div>
            <div className="rounded-[2rem] border border-[var(--catalog-border)] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">
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

                  <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                    Página {currentPage} de {totalPages}
                  </p>
                </div>

                {hasFilters ? (
                  <Link
                    href="/productos"
                    className="inline-flex justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                  >
                    Limpiar filtros
                  </Link>
                ) : null}
              </div>
            </div>

            {serializedProducts.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
              <div className="mt-8 flex flex-col gap-3 rounded-[2rem] border border-[var(--catalog-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-[var(--text-secondary)]">
                  Página{" "}
                  <span className="font-black text-[var(--text-primary)]">
                    {currentPage}
                  </span>{" "}
                  de{" "}
                  <span className="font-black text-[var(--text-primary)]">
                    {totalPages}
                  </span>
                </p>

                <div className="flex gap-3">
                  {previousUrl ? (
                    <Link
                      href={previousUrl}
                      className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <span className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-black text-[var(--text-muted)] opacity-50">
                      Anterior
                    </span>
                  )}

                  {nextUrl ? (
                    <Link
                      href={nextUrl}
                      className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                    >
                      Siguiente
                    </Link>
                  ) : (
                    <span className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-black text-[var(--text-muted)] opacity-50">
                      Siguiente
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
