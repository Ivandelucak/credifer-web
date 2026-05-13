import Link from "next/link";
import { updateBrand } from "@/app/admin/(protected)/marcas/actions";
import { prisma } from "@/lib/prisma";
import { BrandCreateForm } from "@/components/admin/BrandCreateForm";

export const dynamic = "force-dynamic";

type AdminBrandsPageProps = {
  searchParams: Promise<{
    q?: string;
    success?: string;
    error?: string;
  }>;
};

function buildBrandsUrl(params: { q?: string }) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  const queryString = searchParams.toString();

  return queryString ? `/admin/marcas?${queryString}` : "/admin/marcas";
}

export default async function AdminBrandsPage({
  searchParams,
}: AdminBrandsPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";

  const where = query
    ? {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            slug: {
              contains: query,
            },
          },
        ],
      }
    : {};

  const [brands, totalBrands, brandsWithProducts, brandsWithoutProducts] =
    await Promise.all([
      prisma.brand.findMany({
        where,
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      }),
      prisma.brand.count(),
      prisma.brand.count({
        where: {
          products: {
            some: {
              deletedAt: null,
            },
          },
        },
      }),
      prisma.brand.count({
        where: {
          products: {
            none: {
              deletedAt: null,
            },
          },
        },
      }),
    ]);

  return (
    <div>
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Marcas
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Gestión de marcas
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Administrá las marcas usadas en los productos. Al editar una
              marca, el cambio se refleja automáticamente en todos los productos
              asociados.
            </p>
          </div>

          <Link
            href="/admin/productos"
            className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            Volver a productos
          </Link>
        </div>
      </div>

      {params.success ? (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {params.success}
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {params.error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Marcas totales
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-blue-dark)]">
            {totalBrands}
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Con productos
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-green)]">
            {brandsWithProducts}
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Sin productos
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-red)]">
            {brandsWithoutProducts}
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Resultados visibles
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-blue-dark)]">
            {brands.length}
          </p>
        </div>
      </div>

      <BrandCreateForm />

      <section className="mt-6 rounded-[2rem] border border-[var(--border)] bg-white p-4 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">
              Listado de marcas
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Usá el buscador para encontrar marcas duplicadas o corregir
              nombres importados desde el Excel.
            </p>
          </div>

          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar marca..."
              className="h-12 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)]"
            />

            <button
              type="submit"
              className="h-12 rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Buscar
            </button>
          </form>
        </div>

        {query ? (
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Búsqueda actual:{" "}
              <span className="font-black text-[var(--text-primary)]">
                {query}
              </span>
            </p>

            <Link
              href={buildBrandsUrl({})}
              className="font-black text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)] focus-ring rounded-md"
            >
              Limpiar búsqueda
            </Link>
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border)]">
          <div className="hidden grid-cols-[1fr_1fr_160px_220px] gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)] lg:grid">
            <div>Marca</div>
            <div>Slug</div>
            <div>Productos</div>
            <div className="text-right">Acciones</div>
          </div>

          {brands.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {brands.map((brand) => (
                <article
                  key={brand.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1fr_160px_220px] lg:items-center"
                >
                  <div>
                    <p className="lg:hidden text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Marca
                    </p>

                    <p className="mt-1 text-base font-black text-[var(--text-primary)]">
                      {brand.name}
                    </p>
                  </div>

                  <div>
                    <p className="lg:hidden text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Slug
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">
                      {brand.slug}
                    </p>
                  </div>

                  <div>
                    <p className="lg:hidden text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Productos
                    </p>

                    <Link
                      href={`/admin/productos?q=${encodeURIComponent(
                        brand.name,
                      )}`}
                      className="mt-1 inline-flex rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)] transition hover:bg-[var(--brand-blue)] hover:text-white focus-ring"
                    >
                      {brand._count.products} productos
                    </Link>
                  </div>

                  <form
                    action={updateBrand}
                    className="grid gap-3 lg:col-span-4 lg:grid-cols-[1fr_1fr_auto]"
                  >
                    <input type="hidden" name="brandId" value={brand.id} />

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Nombre
                      </label>

                      <input
                        name="name"
                        type="text"
                        required
                        defaultValue={brand.name}
                        className="h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Slug
                      </label>

                      <input
                        name="slug"
                        type="text"
                        defaultValue={brand.slug}
                        className="h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-5 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring lg:w-auto"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                No encontramos marcas
              </h3>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Probá con otra búsqueda o creá una marca nueva.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
