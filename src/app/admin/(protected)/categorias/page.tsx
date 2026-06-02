//src/app/admin/(protected)/categorias/page.tsx
import Link from "next/link";
import {
  createCategory,
  createSubcategory,
  toggleCategoryActive,
  toggleSubcategoryActive,
  updateCategory,
  updateSubcategory,
} from "@/app/admin/(protected)/categorias/actions";
import { prisma } from "@/lib/prisma";
import { AdminCategoryJumpSearch } from "@/components/admin/AdminCategoryJumpSearch";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type AdminCategory = Prisma.CategoryGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    position: true;
    isActive: true;
    _count: {
      select: {
        products: true;
      };
    };
    subcategories: {
      select: {
        id: true;
        name: true;
        slug: true;
        description: true;
        position: true;
        isActive: true;
        _count: {
          select: {
            products: true;
          };
        };
      };
    };
  };
}>;

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const params = await searchParams;

  const categories = (await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      position: true,
      _count: {
        select: {
          products: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
      subcategories: {
        orderBy: [{ position: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isActive: true,
          position: true,
          categoryId: true,
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
      },
    },
  })) as AdminCategory[];

  const activeCategories = categories.filter((category) => category.isActive);
  const inactiveCategories = categories.filter(
    (category) => !category.isActive,
  );
  const totalSubcategories = categories.reduce(
    (total, category) => total + category.subcategories.length,
    0,
  );
  const jumpSearchItems = categories.flatMap((category) => [
    {
      targetId: `admin-category-${category.id}`,
      label: category.name,
      type: "category" as const,
      subtitle: `/${category.slug} · ${category._count.products} productos · ${category.subcategories.length} subcategorías`,
    },
    ...category.subcategories.map((subcategory) => ({
      targetId: `admin-subcategory-${subcategory.id}`,
      label: subcategory.name,
      type: "subcategory" as const,
      subtitle: `Dentro de ${category.name} · ${subcategory._count.products} productos · /${subcategory.slug}`,
    })),
  ]);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_48%,#FFF7D8_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/86 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                Administración
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-primary)] lg:text-5xl">
              Gestión de categorías.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base lg:leading-7">
              Organizá las secciones del catálogo, sus subcategorías, links
              públicos y visibilidad dentro de la tienda.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#B7CADA] bg-white/86 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                {categories.length} categorías
              </span>

              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                {activeCategories.length} activas
              </span>

              <span className="rounded-full border border-[#B7CADA] bg-white/86 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                {totalSubcategories} subcategorías
              </span>
            </div>
          </div>

          <Link
            href="/categorias"
            target="_blank"
            className="tap-feedback inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            Ver categorías públicas
          </Link>
        </div>
      </section>

      {params.success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {params.success}
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {params.error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
          <span className="block h-1.5 w-10 rounded-full bg-[var(--brand-blue)]" />
          <p className="mt-4 text-sm font-black text-[var(--text-secondary)]">
            Categorías totales
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--brand-blue-dark)]">
            {categories.length}
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
            Secciones principales del catálogo.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
          <span className="block h-1.5 w-10 rounded-full bg-[var(--brand-green)]" />
          <p className="mt-4 text-sm font-black text-[var(--text-secondary)]">
            Activas
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--brand-green)]">
            {activeCategories.length}
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
            Visibles en la tienda pública.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
          <span className="block h-1.5 w-10 rounded-full bg-[var(--brand-red)]" />
          <p className="mt-4 text-sm font-black text-[var(--text-secondary)]">
            Ocultas
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--brand-red)]">
            {inactiveCategories.length}
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
            No aparecen en el catálogo público.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
          <span className="block h-1.5 w-10 rounded-full bg-[var(--brand-yellow)]" />
          <p className="mt-4 text-sm font-black text-[var(--text-secondary)]">
            Subcategorías
          </p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--brand-blue-dark)]">
            {totalSubcategories}
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
            Ayudan a ordenar los productos.
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Acceso rápido
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
              Ir directo a una sección
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Buscá una categoría o subcategoría. La pantalla no se filtra:
              navega suavemente hasta el recuadro correspondiente.
            </p>
          </div>

          <AdminCategoryJumpSearch items={jumpSearchItems} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:p-6">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Nueva sección
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
            Crear categoría
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Sumá una nueva sección principal para organizar productos dentro del
            catálogo.
          </p>
        </div>

        <form
          action={createCategory}
          className="grid gap-4 lg:grid-cols-[1fr_1fr_120px_auto]"
        >
          <div>
            <label
              htmlFor="new-category-name"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Nombre
            </label>

            <input
              id="new-category-name"
              name="name"
              type="text"
              required
              placeholder="Ej: Parlantes"
              className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <div>
            <label
              htmlFor="new-category-slug"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Slug / URL
            </label>

            <input
              id="new-category-slug"
              name="slug"
              type="text"
              placeholder="Opcional"
              className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <div>
            <label
              htmlFor="new-category-position"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Orden
            </label>

            <input
              id="new-category-position"
              name="position"
              type="number"
              defaultValue={0}
              className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="tap-feedback h-12 w-full rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Crear
            </button>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="new-category-description"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Descripción
            </label>

            <textarea
              id="new-category-description"
              name="description"
              rows={3}
              placeholder="Descripción opcional para mostrar en la página de categoría."
              className="w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] px-4 py-3 transition hover:border-[var(--brand-blue)]">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="h-4 w-4"
            />
            <span className="text-sm font-black text-[var(--text-primary)]">
              Activa
            </span>
          </label>
        </form>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Categorías cargadas
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
            Administrar secciones
          </h2>
        </div>

        {categories.map((category) => (
          <article
            id={`admin-category-${category.id}`}
            key={category.id}
            tabIndex={-1}
            className="scroll-mt-40 overflow-hidden rounded-[2rem] border border-[#B7CADA] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] outline-none transition data-[jump-highlight=true]:ring-4 data-[jump-highlight=true]:ring-[rgba(2,100,169,0.26)]"
          >
            <div className="border-b border-[#D6E3EF] bg-[linear-gradient(135deg,#F8FBFE_0%,#EEF6FC_100%)] px-5 py-5 lg:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-blue-soft)] text-lg font-black text-[var(--brand-blue)]">
                      {category.name.charAt(0).toUpperCase()}
                    </span>

                    <div>
                      <h3 className="text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                        /{category.slug} · {category._count.products} productos
                        · {category.subcategories.length} subcategorías
                      </p>
                    </div>

                    {category.isActive ? (
                      <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                        Activa
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                        Oculta
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${category.slug}`}
                    target="_blank"
                    className="tap-feedback inline-flex min-h-10 items-center justify-center rounded-full border border-[#B7CADA] bg-white px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                  >
                    Ver público
                  </Link>

                  <form action={toggleCategoryActive}>
                    <input
                      type="hidden"
                      name="categoryId"
                      value={category.id}
                    />
                    <input
                      type="hidden"
                      name="nextValue"
                      value={String(!category.isActive)}
                    />

                    <button
                      type="submit"
                      className={`tap-feedback inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-black transition focus-ring ${
                        category.isActive
                          ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                          : "border-green-200 bg-green-50 text-green-700 hover:border-green-300"
                      }`}
                    >
                      {category.isActive ? "Ocultar" : "Activar"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 lg:p-6 xl:grid-cols-[1fr_1fr]">
              <form
                action={updateCategory}
                className="rounded-[1.5rem] border border-[#D6E3EF] bg-white p-4 shadow-sm"
              >
                <input type="hidden" name="categoryId" value={category.id} />

                <div className="mb-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                    Editar categoría
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_1fr_110px]">
                  <div>
                    <label className="mb-2 block text-sm font-black text-[var(--text-primary)]">
                      Nombre
                    </label>

                    <input
                      name="name"
                      type="text"
                      required
                      defaultValue={category.name}
                      className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-[var(--text-primary)]">
                      Slug
                    </label>

                    <input
                      name="slug"
                      type="text"
                      defaultValue={category.slug}
                      className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-[var(--text-primary)]">
                      Orden
                    </label>

                    <input
                      name="position"
                      type="number"
                      defaultValue={category.position}
                      className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-black text-[var(--text-primary)]">
                    Descripción
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={category.description ?? ""}
                    className="w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] px-4 py-3 transition hover:border-[var(--brand-blue)]">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={category.isActive}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-black text-[var(--text-primary)]">
                      Categoría activa
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
                  >
                    Guardar categoría
                  </button>
                </div>
              </form>

              <div className="rounded-[1.5rem] border border-[#D6E3EF] bg-[var(--catalog-surface-soft)] p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                      Subcategorías
                    </p>

                    <h4 className="mt-1 text-xl font-black text-[var(--text-primary)]">
                      Organizar subcategorías
                    </h4>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--brand-blue-dark)] shadow-sm">
                    {category.subcategories.length} cargadas
                  </span>
                </div>

                <form
                  action={createSubcategory}
                  className="mt-4 rounded-3xl border border-[#C9D6E4] bg-white p-4"
                >
                  <input type="hidden" name="categoryId" value={category.id} />

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_100px]">
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Nueva subcategoría"
                      className="h-11 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />

                    <input
                      name="slug"
                      type="text"
                      placeholder="Slug opcional"
                      className="h-11 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />

                    <input
                      name="position"
                      type="number"
                      defaultValue={0}
                      className="h-11 rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Descripción opcional"
                      className="rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />

                    <div className="flex flex-col gap-3">
                      <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#C9D6E4] bg-white px-4 py-2 transition hover:border-[var(--brand-blue)]">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked
                          className="h-4 w-4"
                        />
                        <span className="text-xs font-black text-[var(--text-primary)]">
                          Activa
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="tap-feedback rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
                      >
                        Crear
                      </button>
                    </div>
                  </div>
                </form>

                {category.subcategories.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div
                        id={`admin-subcategory-${subcategory.id}`}
                        key={subcategory.id}
                        tabIndex={-1}
                        className="scroll-mt-40 rounded-3xl border border-[#C9D6E4] bg-white p-4 outline-none transition data-[jump-highlight=true]:ring-4 data-[jump-highlight=true]:ring-[rgba(244,196,48,0.42)]"
                      >
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-black text-[var(--text-primary)]">
                                {subcategory.name}
                              </p>

                              {subcategory.isActive ? (
                                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                                  Activa
                                </span>
                              ) : (
                                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                                  Oculta
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                              {subcategory._count.products} productos · /
                              {subcategory.slug}
                            </p>
                          </div>

                          <form action={toggleSubcategoryActive}>
                            <input
                              type="hidden"
                              name="subcategoryId"
                              value={subcategory.id}
                            />
                            <input
                              type="hidden"
                              name="nextValue"
                              value={String(!subcategory.isActive)}
                            />

                            <button
                              type="submit"
                              className={`tap-feedback inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-black transition focus-ring ${
                                subcategory.isActive
                                  ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                                  : "border-green-200 bg-green-50 text-green-700 hover:border-green-300"
                              }`}
                            >
                              {subcategory.isActive ? "Ocultar" : "Activar"}
                            </button>
                          </form>
                        </div>

                        <form action={updateSubcategory} className="space-y-3">
                          <input
                            type="hidden"
                            name="subcategoryId"
                            value={subcategory.id}
                          />
                          <input
                            type="hidden"
                            name="categoryId"
                            value={category.id}
                          />

                          <div className="grid gap-3 md:grid-cols-[1fr_1fr_96px]">
                            <div>
                              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Nombre
                              </label>

                              <input
                                name="name"
                                type="text"
                                required
                                defaultValue={subcategory.name}
                                className="h-11 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Slug
                              </label>

                              <input
                                name="slug"
                                type="text"
                                defaultValue={subcategory.slug}
                                className="h-11 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Orden
                              </label>

                              <input
                                name="position"
                                type="number"
                                defaultValue={subcategory.position}
                                className="h-11 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[var(--text-muted)]">
                              Descripción
                            </label>

                            <textarea
                              name="description"
                              rows={2}
                              defaultValue={subcategory.description ?? ""}
                              className="w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                            />
                          </div>

                          <div className="flex flex-col gap-3 rounded-2xl border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] p-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl px-1 py-1 transition">
                              <input
                                type="checkbox"
                                name="isActive"
                                defaultChecked={subcategory.isActive}
                                className="h-4 w-4"
                              />
                              <span className="text-xs font-black text-[var(--text-primary)]">
                                Subcategoría activa
                              </span>
                            </label>

                            <button
                              type="submit"
                              className="tap-feedback inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-2.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring sm:w-auto"
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-[#C9D6E4] bg-white p-5 text-center">
                    <p className="text-sm font-black text-[var(--text-primary)]">
                      Esta categoría todavía no tiene subcategorías.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
