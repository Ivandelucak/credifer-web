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

export const dynamic = "force-dynamic";

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const params = await searchParams;

  const categories = await prisma.category.findMany({
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
  });

  const activeCategories = categories.filter((category) => category.isActive);
  const inactiveCategories = categories.filter(
    (category) => !category.isActive,
  );
  const totalSubcategories = categories.reduce(
    (total, category) => total + category.subcategories.length,
    0,
  );

  return (
    <div>
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Categorías
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Gestión de categorías
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Administrá las secciones del catálogo, sus links públicos y las
              subcategorías usadas para organizar productos.
            </p>
          </div>

          <Link
            href="/categorias"
            target="_blank"
            className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            Ver categorías públicas
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
            Categorías totales
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-blue-dark)]">
            {categories.length}
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Activas
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-green)]">
            {activeCategories.length}
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Ocultas
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-red)]">
            {inactiveCategories.length}
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Subcategorías
          </p>
          <p className="mt-3 text-4xl font-black text-[var(--brand-blue-dark)]">
            {totalSubcategories}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <h3 className="text-xl font-black text-[var(--text-primary)]">
          Crear nueva categoría
        </h3>

        <form
          action={createCategory}
          className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_120px_auto]"
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
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="h-12 w-full rounded-2xl bg-[var(--brand-blue)] px-5 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
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
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3">
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

      <section className="mt-6 space-y-5">
        {categories.map((category) => (
          <article
            key={category.id}
            className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-sm"
          >
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-[var(--text-primary)]">
                      {category.name}
                    </h3>

                    {category.isActive ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                        Activa
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                        Oculta
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-bold text-[var(--text-muted)]">
                    /{category.slug} · {category._count.products} productos ·{" "}
                    {category.subcategories.length} subcategorías
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${category.slug}`}
                    target="_blank"
                    className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
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
                      className={`rounded-full border px-4 py-2 text-xs font-black transition focus-ring ${
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

            <div className="grid gap-6 p-6 xl:grid-cols-[1fr_1fr]">
              <form action={updateCategory} className="space-y-4">
                <input type="hidden" name="categoryId" value={category.id} />

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
                      className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
                      className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
                      className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-[var(--text-primary)]">
                    Descripción
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={category.description ?? ""}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3">
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
                    className="rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
                  >
                    Guardar categoría
                  </button>
                </div>
              </form>

              <div>
                <h4 className="text-lg font-black text-[var(--text-primary)]">
                  Subcategorías
                </h4>

                <form
                  action={createSubcategory}
                  className="mt-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                >
                  <input type="hidden" name="categoryId" value={category.id} />

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_100px]">
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Nueva subcategoría"
                      className="h-11 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />

                    <input
                      name="slug"
                      type="text"
                      placeholder="Slug opcional"
                      className="h-11 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />

                    <input
                      name="position"
                      type="number"
                      defaultValue={0}
                      className="h-11 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                    <textarea
                      name="description"
                      rows={2}
                      placeholder="Descripción opcional"
                      className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                    />

                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-2">
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
                        className="rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
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
                        key={subcategory.id}
                        className="rounded-3xl border border-[var(--border)] bg-white p-4"
                      >
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black text-[var(--text-primary)]">
                                {subcategory.name}
                              </p>

                              {subcategory.isActive ? (
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                                  Activa
                                </span>
                              ) : (
                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                                  Oculta
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
                              {subcategory._count.products} productos · slug:{" "}
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
                              className={`rounded-full border px-4 py-2 text-xs font-black transition focus-ring ${
                                subcategory.isActive
                                  ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
                                  : "border-green-200 bg-green-50 text-green-700 hover:border-green-300"
                              }`}
                            >
                              {subcategory.isActive ? "Ocultar" : "Activar"}
                            </button>
                          </form>
                        </div>

                        <form
                          action={updateSubcategory}
                          className="grid gap-3 md:grid-cols-[1fr_1fr_90px_auto]"
                        >
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

                          <input
                            name="name"
                            type="text"
                            required
                            defaultValue={subcategory.name}
                            className="h-11 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                          />

                          <input
                            name="slug"
                            type="text"
                            defaultValue={subcategory.slug}
                            className="h-11 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                          />

                          <input
                            name="position"
                            type="number"
                            defaultValue={subcategory.position}
                            className="h-11 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                          />

                          <button
                            type="submit"
                            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                          >
                            Guardar
                          </button>

                          <textarea
                            name="description"
                            rows={2}
                            defaultValue={subcategory.description ?? ""}
                            className="md:col-span-4 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                          />

                          <label className="flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2 md:col-span-4">
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
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-[var(--border)] bg-white p-5 text-center">
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
