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

      <section className="mt-6 rounded-[2rem] border border-[#8FA2B8] bg-[#F8FBFE] p-4 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-6">
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

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#8FA2B8] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="hidden grid-cols-[1fr_1fr_150px_140px] gap-4 border-b border-[#8FA2B8] bg-[#E2EAF3] px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#41556C] lg:grid">
            <div>Marca</div>
            <div>Slug</div>
            <div>Productos</div>
            <div className="text-right">Acciones</div>
          </div>

          {brands.length > 0 ? (
            <div className="divide-y divide-[#A9B8C9]">
              {brands.map((brand, index) => (
                <article
                  key={brand.id}
                  className={`px-4 py-4 transition hover:bg-[#EEF6FC] lg:px-5 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#FBFDFF]"
                  }`}
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr_150px_140px] lg:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#B7CADA] bg-[#EAF4FB] text-sm font-black text-[var(--brand-blue)] shadow-sm">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)] lg:hidden">
                          Marca
                        </p>

                        <p className="text-base font-black text-[#0B3558]">
                          {brand.name}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)] lg:hidden">
                        Slug
                      </p>

                      <p className="mt-1 w-fit rounded-full border border-[#D6E3EF] bg-[#F8FBFE] px-3 py-1 text-xs font-black text-[var(--text-secondary)] lg:mt-0">
                        /{brand.slug}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)] lg:hidden">
                        Productos
                      </p>

                      <Link
                        href={`/admin/productos?q=${encodeURIComponent(brand.name)}`}
                        className="mt-1 inline-flex rounded-full border border-[#B7CADA] bg-[#DFF1FA] px-3 py-1 text-xs font-black text-[#0B3558] transition hover:bg-[var(--brand-blue)] hover:text-white focus-ring lg:mt-0"
                      >
                        {brand._count.products} producto
                        {brand._count.products === 1 ? "" : "s"}
                      </Link>
                    </div>

                    <div className="hidden justify-end lg:flex">
                      <span className="rounded-full border border-[#D6E3EF] bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        Edición
                      </span>
                    </div>
                  </div>

                  <form
                    action={updateBrand}
                    className="mt-4 grid gap-3 rounded-[1.35rem] border border-[#A9B8C9] bg-[#F4F8FC] p-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
                  >
                    <input type="hidden" name="brandId" value={brand.id} />

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                        Nombre
                      </label>

                      <input
                        name="name"
                        type="text"
                        required
                        defaultValue={brand.name}
                        className="h-11 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#596D84]">
                        Slug
                      </label>

                      <input
                        name="slug"
                        type="text"
                        defaultValue={brand.slug}
                        className="h-11 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="tap-feedback inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring lg:w-auto"
                    >
                      Guardar
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 text-center">
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                No encontramos marcas
              </h3>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Probá con otra búsqueda o creá una marca nueva.
              </p>

              {query ? (
                <Link
                  href={buildBrandsUrl({})}
                  className="tap-feedback mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
                >
                  Limpiar búsqueda
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
