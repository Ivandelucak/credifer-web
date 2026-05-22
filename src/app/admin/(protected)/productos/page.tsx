//src/app/admin/(protected)/productos/page.tsx

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
import { AdminProductActionsMenu } from "@/components/admin/AdminProductActionsMenu";

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

function getStatusPillClassName(status: string) {
  switch (status) {
    case "activos":
      return "border-green-200 bg-green-50 text-green-700";

    case "inactivos":
      return "border-red-200 bg-red-50 text-red-700";

    case "sin-precio":
      return "border-[#F4C430]/60 bg-[#FFF8DB] text-[#8A6400]";

    case "eliminados":
      return "border-slate-300 bg-slate-100 text-slate-600";

    case "destacados":
      return "border-[#F4C430]/70 bg-[#FFF3B8] text-[var(--brand-blue-dark)]";

    case "ofertas":
      return "border-red-200 bg-red-50 text-[var(--brand-red)]";

    default:
      return "border-[#B7CADA] bg-[var(--brand-blue-soft)] text-[var(--brand-blue-dark)]";
  }
}

const statusOptions = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activos" },
  { label: "Inactivos", value: "inactivos" },
  { label: "Sin precio", value: "sin-precio" },
  { label: "Destacados", value: "destacados" },
  { label: "Ofertas", value: "ofertas" },
  { label: "Eliminados", value: "eliminados" },
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
    ...(selectedStatus === "eliminados"
      ? {
          deletedAt: {
            not: null,
          },
        }
      : {
          deletedAt: null,
        }),
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
    deletedProducts,
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
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        isActive: false,
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        price: null,
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        deletedAt: {
          not: null,
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const currentUrlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    currentUrlParams.set(key, value);
  });

  const currentUrl = currentUrlParams.toString()
    ? `/admin/productos?${currentUrlParams.toString()}`
    : "/admin/productos";

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

  const hasFilters =
    query ||
    selectedCategory ||
    selectedStatus !== "todos" ||
    selectedOrder !== "recientes";

  const firstProductNumber =
    totalProducts > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;

  const lastProductNumber =
    totalProducts > 0 ? firstProductNumber + serializedProducts.length - 1 : 0;

  const stats = [
    {
      label: "Total filtrado",
      value: totalProducts,
      href: "/admin/productos",
      help: "Resultado según búsqueda y filtros actuales.",
      accent: "bg-[var(--brand-blue)]",
      valueClass: "text-[var(--brand-blue-dark)]",
    },
    {
      label: "Activos",
      value: activeProducts,
      href: "/admin/productos?estado=activos",
      help: "Productos visibles en la tienda pública.",
      accent: "bg-[var(--brand-green)]",
      valueClass: "text-[var(--brand-green)]",
    },
    {
      label: "Inactivos",
      value: inactiveProducts,
      href: "/admin/productos?estado=inactivos",
      help: "Productos ocultos del catálogo público.",
      accent: "bg-[var(--brand-red)]",
      valueClass: "text-[var(--brand-red)]",
    },
    {
      label: "Sin precio",
      value: productsWithoutPrice,
      href: "/admin/productos?estado=sin-precio",
      help: "Productos que conviene revisar.",
      accent: "bg-[var(--brand-yellow)]",
      valueClass: "text-[var(--brand-blue-dark)]",
    },
    {
      label: "Eliminados",
      value: deletedProducts,
      href: "/admin/productos?estado=eliminados",
      help: "Productos borrados de forma lógica.",
      accent: "bg-slate-400",
      valueClass: "text-slate-600",
    },
  ];

  const selectedStatusLabel =
    statusOptions.find((option) => option.value === selectedStatus)?.label ??
    selectedStatus;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_48%,#FFF7D8_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/86 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                Administración
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-primary)] lg:text-5xl">
              Gestión de productos.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base lg:leading-7">
              Buscá productos, revisá su estado, actualizá información
              importante y organizá el catálogo que se muestra en la tienda.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/marcas"
              className="tap-feedback inline-flex min-h-12 justify-center rounded-2xl border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Gestionar marcas
            </Link>

            <Link
              href="/admin/productos/nuevo"
              className="tap-feedback inline-flex min-h-12 justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Nuevo producto
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--catalog-shadow)] focus-ring"
          >
            <span className={`block h-1.5 w-10 rounded-full ${card.accent}`} />

            <p className="mt-4 text-sm font-black text-[var(--text-secondary)]">
              {card.label}
            </p>

            <p
              className={`mt-2 text-4xl font-black tracking-tight ${card.valueClass}`}
            >
              {card.value}
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
              {card.help}
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Filtros
            </p>

            <h2 className="mt-1 text-xl font-black text-[var(--text-primary)]">
              Refinar listado
            </h2>
          </div>

          {hasFilters ? (
            <Link
              href="/admin/productos"
              className="w-fit rounded-full border border-[#B7CADA] bg-white px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Limpiar filtros
            </Link>
          ) : null}
        </div>

        <form className="grid gap-3 lg:grid-cols-[1fr_220px_180px_180px_auto]">
          <AdminProductSearchInput
            defaultValue={query}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            selectedOrder={selectedOrder}
          />

          <select
            name="categoria"
            defaultValue={selectedCategory}
            className="h-12 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
            className="h-12 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
            className="h-12 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
          >
            {orderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="tap-feedback h-12 rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
          >
            Filtrar
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 rounded-[1.75rem] border border-[#B7CADA] bg-white/86 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Resultados
            </p>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Mostrando{" "}
              <span className="font-black text-[var(--text-primary)]">
                {firstProductNumber} - {lastProductNumber}
              </span>{" "}
              de{" "}
              <span className="font-black text-[var(--text-primary)]">
                {totalProducts}
              </span>{" "}
              producto{totalProducts === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedStatus !== "todos" ? (
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-black ${getStatusPillClassName(
                  selectedStatus,
                )}`}
              >
                Estado: {selectedStatusLabel}
              </span>
            ) : null}

            {selectedCategory ? (
              <span className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                Categoría:{" "}
                {categories.find(
                  (category) => category.slug === selectedCategory,
                )?.name ?? selectedCategory}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative rounded-[2rem] border border-[#B7CADA] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="hidden grid-cols-[90px_1.4fr_180px_150px_130px_230px] gap-4 border-b border-[#D6E3EF] bg-[var(--catalog-surface-soft)] px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)] xl:grid">
            <div>Imagen</div>
            <div>Producto</div>
            <div>Categoría</div>
            <div>Precio</div>
            <div>Estado</div>
            <div className="text-right">Acciones</div>
          </div>

          {serializedProducts.length > 0 ? (
            <div className="divide-y divide-[#D6E3EF]">
              {serializedProducts.map((product) => {
                const primaryImage = product.images[0] ?? null;

                const editHref = `/admin/productos/${product.id}/editar?returnTo=${encodeURIComponent(
                  currentUrl,
                )}`;
                return (
                  <article
                    key={product.id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-[#F8FBFE] xl:grid-cols-[90px_1.4fr_180px_150px_130px_230px] xl:items-center"
                  >
                    <Link
                      href={getProductPublicPath(product.slug)}
                      target="_blank"
                      className="flex aspect-square w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#D6E3EF] bg-[var(--catalog-surface-soft)] focus-ring xl:w-full"
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
                          <span className="rounded-full bg-[var(--catalog-surface-soft)] px-3 py-1 text-xs font-black text-[var(--text-muted)]">
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
                        href={editHref}
                        className="mt-3 block rounded-xl focus-ring"
                      >
                        <h3 className="line-clamp-2 text-base font-black leading-6 text-[var(--text-primary)] transition hover:text-[var(--brand-blue)]">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-[var(--text-muted)]">
                        {product.brand ? (
                          <span>{product.brand.name}</span>
                        ) : null}

                        {product.subcategory ? (
                          <span>• {product.subcategory.name}</span>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)] xl:hidden">
                        Categoría
                      </p>

                      <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">
                        {product.category?.name ?? "Sin categoría"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)] xl:hidden">
                        Precio
                      </p>

                      <p className="mt-1 text-sm font-black text-[var(--brand-blue-dark)]">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)] xl:hidden">
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

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
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
                        <input
                          type="hidden"
                          name="returnTo"
                          value={currentUrl}
                        />

                        <button
                          type="submit"
                          className={`tap-feedback rounded-full border px-3 py-2 text-xs font-black transition focus-ring ${
                            product.isFeatured
                              ? "border-[#F4C430] bg-[#FFF3B8] text-[var(--brand-blue-dark)] hover:bg-[#FFE889]"
                              : "border-[#C9D6E4] bg-white text-[var(--text-secondary)] hover:border-[#F4C430] hover:text-[var(--brand-blue-dark)]"
                          }`}
                        >
                          {product.isFeatured ? "Destacado" : "Destacar"}
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
                        <input
                          type="hidden"
                          name="returnTo"
                          value={currentUrl}
                        />

                        <button
                          type="submit"
                          className={`tap-feedback rounded-full border px-3 py-2 text-xs font-black transition focus-ring ${
                            product.isOffer
                              ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)] hover:bg-red-100"
                              : "border-[#C9D6E4] bg-white text-[var(--text-secondary)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                          }`}
                        >
                          {product.isOffer ? "En oferta" : "Oferta"}
                        </button>
                      </form>

                      <AdminProductActionsMenu
                        productId={product.id}
                        productName={product.name}
                        productSlug={product.slug}
                        isActive={product.isActive}
                        publicPath={getProductPublicPath(product.slug)}
                        returnTo={currentUrl}
                        isDeletedView={selectedStatus === "eliminados"}
                      />
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
                className="tap-feedback mt-6 inline-flex rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Ver todos
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              className="rounded-full border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Anterior
            </Link>
          ) : (
            <span className="rounded-full border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--text-muted)] opacity-50">
              Anterior
            </span>
          )}

          {nextUrl ? (
            <Link
              href={nextUrl}
              className="rounded-full border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Siguiente
            </Link>
          ) : (
            <span className="rounded-full border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--text-muted)] opacity-50">
              Siguiente
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
