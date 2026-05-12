import type { Prisma } from "@prisma/client";
import Link from "next/link";
import {
  toggleProductActive,
  toggleProductFeatured,
  toggleProductOffer,
} from "@/app/admin/(protected)/productos/actions";
import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { AdminProductSearchInput } from "@/components/admin/AdminProductSearchInput";

export const dynamic = "force-dynamic";

type AdminProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    estado?: string;
    orden?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 30;

const statusOptions = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activos" },
  { label: "Inactivos", value: "inactivos" },
  { label: "Sin precio", value: "sin-precio" },
  { label: "Destacados", value: "destacados" },
  { label: "Ofertas", value: "ofertas" },
];

const orderOptions = [
  { label: "Más recientes", value: "recientes" },
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

  return [{ updatedAt: "desc" }, { createdAt: "desc" }];
}

function buildAdminProductsUrl(params: {
  q?: string;
  categoria?: string;
  estado?: string;
  orden?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.categoria) searchParams.set("categoria", params.categoria);
  if (params.estado && params.estado !== "todos") {
    searchParams.set("estado", params.estado);
  }
  if (params.orden && params.orden !== "recientes") {
    searchParams.set("orden", params.orden);
  }
  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/admin/productos?${queryString}` : "/admin/productos";
}

function getProductPublicPath(slug: string) {
  return `/producto/${slug}`;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const selectedCategory = params.categoria?.trim() ?? "";
  const selectedStatus = params.estado?.trim() ?? "todos";
  const selectedOrder = params.orden?.trim() ?? "recientes";

  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const where: Prisma.ProductWhereInput = {
    ...(query
      ? {
          OR: [
            {
              name: {
                contains: query,
              },
            },
            {
              code: {
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
    ...(selectedCategory
      ? {
          category: {
            slug: selectedCategory,
          },
        }
      : {}),
    ...(selectedStatus === "activos"
      ? {
          isActive: true,
        }
      : {}),
    ...(selectedStatus === "inactivos"
      ? {
          isActive: false,
        }
      : {}),
    ...(selectedStatus === "sin-precio"
      ? {
          price: null,
        }
      : {}),
    ...(selectedStatus === "destacados"
      ? {
          isFeatured: true,
        }
      : {}),
    ...(selectedStatus === "ofertas"
      ? {
          isOffer: true,
        }
      : {}),
  };

  const [
    products,
    totalProducts,
    activeProducts,
    inactiveProducts,
    productsWithoutPrice,
  ] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: getOrderBy(selectedOrder),
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        price: true,
        isActive: true,
        isFeatured: true,
        isOffer: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        subcategory: {
          select: {
            name: true,
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
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),
    prisma.product.count({
      where: {
        isActive: false,
      },
    }),
    prisma.product.count({
      where: {
        price: null,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const currentUrl = buildAdminProductsUrl({
    q: query,
    categoria: selectedCategory,
    estado: selectedStatus,
    orden: selectedOrder,
    page: currentPage,
  });

  const previousUrl =
    currentPage > 1
      ? buildAdminProductsUrl({
          q: query,
          categoria: selectedCategory,
          estado: selectedStatus,
          orden: selectedOrder,
          page: currentPage - 1,
        })
      : null;

  const nextUrl =
    currentPage < totalPages
      ? buildAdminProductsUrl({
          q: query,
          categoria: selectedCategory,
          estado: selectedStatus,
          orden: selectedOrder,
          page: currentPage + 1,
        })
      : null;

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

  return (
    <div>
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Productos
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Gestión de productos
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Revisá el catálogo importado, buscá productos, filtrá por estado y
              aplicá acciones rápidas sin entrar a MySQL.
            </p>
          </div>

          <Link
            href="/admin/productos/nuevo"
            className="inline-flex justify-center rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/productos"
          className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Total filtrado
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-blue-dark)]">
            {totalProducts}
          </p>
        </Link>

        <Link
          href="/admin/productos?estado=activos"
          className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Activos
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-green)]">
            {activeProducts}
          </p>
        </Link>

        <Link
          href="/admin/productos?estado=inactivos"
          className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Inactivos
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-red)]">
            {inactiveProducts}
          </p>
        </Link>

        <Link
          href="/admin/productos?estado=sin-precio"
          className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Sin precio
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-yellow)]">
            {productsWithoutPrice}
          </p>
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-[2rem] border border-[var(--border)] bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px_180px_180px_auto]">
        <AdminProductSearchInput
          defaultValue={query}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          selectedOrder={selectedOrder}
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
          name="estado"
          defaultValue={selectedStatus}
          className="h-12 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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

      <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mostrando{" "}
          <span className="font-black text-[var(--text-primary)]">
            {serializedProducts.length}
          </span>{" "}
          productos de{" "}
          <span className="font-black text-[var(--text-primary)]">
            {totalProducts}
          </span>{" "}
          resultados.
        </p>

        {query ||
        selectedCategory ||
        selectedStatus !== "todos" ||
        selectedOrder !== "recientes" ? (
          <Link
            href="/admin/productos"
            className="font-black text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)] focus-ring rounded-md"
          >
            Limpiar filtros
          </Link>
        ) : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-sm">
        <div className="hidden grid-cols-[90px_1.4fr_180px_150px_130px_220px] gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)] xl:grid">
          <div>Imagen</div>
          <div>Producto</div>
          <div>Categoría</div>
          <div>Precio</div>
          <div>Estado</div>
          <div className="text-right">Acciones</div>
        </div>

        {serializedProducts.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {serializedProducts.map((product) => {
              const primaryImage = product.images[0] ?? null;

              return (
                <article
                  key={product.id}
                  className="grid gap-4 px-5 py-5 xl:grid-cols-[90px_1.4fr_180px_150px_130px_220px] xl:items-center"
                >
                  <Link
                    href={getProductPublicPath(product.slug)}
                    target="_blank"
                    className="flex aspect-square w-24 items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface-muted)] focus-ring xl:w-full"
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={primaryImage.alt ?? product.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-3xl font-black text-[var(--brand-blue)]">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {product.code ? (
                        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-black text-[var(--text-muted)]">
                          {product.code}
                        </span>
                      ) : null}

                      {product.isFeatured ? (
                        <span className="rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)]">
                          Destacado
                        </span>
                      ) : null}

                      {product.isOffer ? (
                        <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-black text-white">
                          Oferta
                        </span>
                      ) : null}
                    </div>

                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="mt-3 block rounded-xl focus-ring"
                    >
                      <h3 className="line-clamp-2 text-base font-black leading-6 text-[var(--text-primary)] transition hover:text-[var(--brand-blue)]">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-[var(--text-muted)]">
                      {product.brand ? <span>{product.brand.name}</span> : null}
                      {product.subcategory ? (
                        <span>• {product.subcategory.name}</span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="xl:hidden text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Categoría
                    </p>
                    <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">
                      {product.category?.name ?? "Sin categoría"}
                    </p>
                  </div>

                  <div>
                    <p className="xl:hidden text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Precio
                    </p>
                    <p className="mt-1 text-sm font-black text-[var(--brand-blue-dark)]">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <div>
                    <p className="xl:hidden text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Estado
                    </p>

                    {product.isActive ? (
                      <span className="mt-1 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                        Activo
                      </span>
                    ) : (
                      <span className="mt-1 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                        Oculto
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Link
                      href={getProductPublicPath(product.slug)}
                      target="_blank"
                      className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-black text-[var(--text-secondary)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                    >
                      Ver
                    </Link>

                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                    >
                      Editar
                    </Link>

                    <form action={toggleProductActive}>
                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />
                      <input
                        type="hidden"
                        name="nextValue"
                        value={String(!product.isActive)}
                      />
                      <input type="hidden" name="returnTo" value={currentUrl} />

                      <button
                        type="submit"
                        className={`rounded-full border px-3 py-2 text-xs font-black transition focus-ring ${
                          product.isActive
                            ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                            : "border-green-200 bg-green-50 text-green-700 hover:border-green-300"
                        }`}
                      >
                        {product.isActive ? "Ocultar" : "Activar"}
                      </button>
                    </form>

                    <form action={toggleProductFeatured}>
                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />
                      <input
                        type="hidden"
                        name="nextValue"
                        value={String(!product.isFeatured)}
                      />
                      <input type="hidden" name="returnTo" value={currentUrl} />

                      <button
                        type="submit"
                        className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-black text-[var(--text-secondary)] transition hover:border-[var(--brand-yellow)] hover:text-[var(--brand-blue-dark)] focus-ring"
                      >
                        {product.isFeatured ? "Quitar destacado" : "Destacar"}
                      </button>
                    </form>

                    <form action={toggleProductOffer}>
                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />
                      <input
                        type="hidden"
                        name="nextValue"
                        value={String(!product.isOffer)}
                      />
                      <input type="hidden" name="returnTo" value={currentUrl} />

                      <button
                        type="submit"
                        className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-black text-[var(--text-secondary)] transition hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-ring"
                      >
                        {product.isOffer ? "Quitar oferta" : "Oferta"}
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-black text-[var(--text-primary)]">
              No encontramos productos
            </h3>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Probá con otra búsqueda o limpiá los filtros.
            </p>

            <Link
              href="/admin/productos"
              className="mt-6 inline-flex rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Ver todos
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
    </div>
  );
}
