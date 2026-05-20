// src/app/productos/page.tsx

import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

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
  if (params.subcategoria) {
    searchParams.set("subcategoria", params.subcategoria);
  }

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

  const selectedCategoryData = categories.find(
    (category) => category.slug === selectedCategory,
  );

  const selectedSubcategoryData = subcategories.find(
    (subcategory) => subcategory.slug === selectedSubcategory,
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
    selectedOrder !== "recientes";

  const activeFiltersCount = [
    query,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    selectedOrder !== "recientes" ? selectedOrder : "",
  ].filter(Boolean).length;

  const firstProductNumber =
    totalProducts > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;

  const lastProductNumber =
    totalProducts > 0 ? firstProductNumber + serializedProducts.length - 1 : 0;

  return (
    <section className="bg-[var(--catalog-bg)]">
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

        <div className="container-page relative py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">
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
                action="/productos"
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
            action="/productos"
            className="mt-5 rounded-[1.75rem] border border-[#B7CADA] bg-white/92 p-3 shadow-[0_18px_42px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden"
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

          {categories.length > 0 ? (
            <div className="mt-8 rounded-[2rem] border border-[#C9D6E4] bg-white/78 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
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
                  href="/productos"
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition focus-ring ${
                    !selectedCategory && !selectedSubcategory
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

      <div className="container-page py-7 lg:py-9">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-[var(--catalog-border-strong)] bg-white p-5 shadow-[var(--catalog-shadow)] lg:sticky lg:top-28">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                  Filtros
                </p>

                <h2 className="mt-1 text-xl font-black text-[var(--text-primary)]">
                  Refinar catálogo
                </h2>

                {activeFiltersCount > 0 ? (
                  <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                    {activeFiltersCount} filtro
                    {activeFiltersCount === 1 ? "" : "s"} activo
                    {activeFiltersCount === 1 ? "" : "s"}.
                  </p>
                ) : null}
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

            <form className="mt-5 grid gap-4" action="/productos">
              {query ? <input type="hidden" name="q" value={query} /> : null}

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
                className="h-12 rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Aplicar filtros
              </button>
            </form>
          </aside>

          <div>
            <div className="rounded-[2rem] border border-[var(--catalog-border)] bg-white p-5 shadow-sm">
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

                  {selectedOrder !== "recientes" ? (
                    <span className="rounded-full border border-[#C9D6E4] bg-white px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                      Orden: {selectedOrderData.label}
                    </span>
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
