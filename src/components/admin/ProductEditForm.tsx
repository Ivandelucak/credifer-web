"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  type ProductEditFormState,
  updateProduct,
} from "@/app/admin/(protected)/productos/[id]/editar/actions";

type ProductEditFormProduct = {
  id: number;
  code: string | null;
  name: string;
  slug: string;
  price: string | null;
  descriptionShort: string | null;
  descriptionLong: string | null;
  categoryId: number | null;
  subcategoryId: number | null;
  brandId: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isOffer: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

type ProductEditFormCategory = {
  id: number;
  name: string;
  subcategories: {
    id: number;
    name: string;
  }[];
};

type ProductEditFormBrand = {
  id: number;
  name: string;
};

type ProductEditFormProps = {
  product: ProductEditFormProduct;
  categories: ProductEditFormCategory[];
  brands: ProductEditFormBrand[];
};

const initialState: ProductEditFormState = {
  success: false,
  error: null,
};

function formatPriceInput(price: string | null) {
  if (!price) return "";

  const value = Number(price);

  if (!Number.isFinite(value)) return "";

  return String(Math.round(value));
}

export function ProductEditForm({
  product,
  categories,
  brands,
}: ProductEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProduct,
    initialState,
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product.categoryId ? String(product.categoryId) : "",
  );

  const availableSubcategories = useMemo(() => {
    const categoryId = Number(selectedCategoryId);

    if (!categoryId) return [];

    const category = categories.find((item) => item.id === categoryId);

    return category?.subcategories ?? [];
  }, [categories, selectedCategoryId]);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <input type="hidden" name="productId" value={product.id} />

      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          Producto actualizado correctamente.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Información principal
          </h3>

          <div className="mt-5 grid gap-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-black text-[var(--text-primary)]"
              >
                Nombre del producto
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={product.name}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-black text-[var(--text-primary)]"
                >
                  Código
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  defaultValue={product.code ?? ""}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-black text-[var(--text-primary)]"
                >
                  Precio contado
                </label>

                <input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  defaultValue={formatPriceInput(product.price)}
                  placeholder="Ej: 250000"
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                />

                <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                  Si queda vacío, el producto se mostrará como “Consultar
                  precio”.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-black text-[var(--text-primary)]"
              >
                Slug / URL
              </label>

              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={product.slug}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />

              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                Ruta pública actual: /producto/{product.slug}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Estado comercial
          </h3>

          <div className="mt-5 space-y-4">
            <label className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={product.isActive}
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-black text-[var(--text-primary)]">
                  Producto activo
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                  Si está desactivado, no se muestra en la tienda pública.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product.isFeatured}
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-black text-[var(--text-primary)]">
                  Destacado
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                  Sirve para ordenar y resaltar productos importantes.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--border)] p-4">
              <input
                type="checkbox"
                name="isOffer"
                defaultChecked={product.isOffer}
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-black text-[var(--text-primary)]">
                  Oferta
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                  Aparece en la sección de ofertas.
                </span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm lg:p-6">
        <h3 className="text-xl font-black text-[var(--text-primary)]">
          Organización
        </h3>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Categoría
            </label>

            <select
              id="categoryId"
              name="categoryId"
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="subcategoryId"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Subcategoría
            </label>

            <select
              id="subcategoryId"
              name="subcategoryId"
              defaultValue={product.subcategoryId ?? ""}
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            >
              <option value="">Sin subcategoría</option>
              {availableSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="brandId"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Marca
            </label>

            <select
              id="brandId"
              name="brandId"
              defaultValue={product.brandId ?? ""}
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            >
              <option value="">Sin marca</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm lg:p-6">
        <h3 className="text-xl font-black text-[var(--text-primary)]">
          Descripciones
        </h3>

        <div className="mt-5 grid gap-5">
          <div>
            <label
              htmlFor="descriptionShort"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Descripción corta
            </label>

            <textarea
              id="descriptionShort"
              name="descriptionShort"
              rows={3}
              defaultValue={product.descriptionShort ?? ""}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <div>
            <label
              htmlFor="descriptionLong"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Descripción larga
            </label>

            <textarea
              id="descriptionLong"
              name="descriptionLong"
              rows={7}
              defaultValue={product.descriptionLong ?? ""}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-sm lg:p-6">
        <h3 className="text-xl font-black text-[var(--text-primary)]">
          SEO básico
        </h3>

        <div className="mt-5 grid gap-5">
          <div>
            <label
              htmlFor="metaTitle"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Meta title
            </label>

            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              defaultValue={product.metaTitle ?? ""}
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <div>
            <label
              htmlFor="metaDescription"
              className="mb-2 block text-sm font-black text-[var(--text-primary)]"
            >
              Meta description
            </label>

            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={3}
              defaultValue={product.metaDescription ?? ""}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-30 rounded-[2rem] border border-[var(--border)] bg-white/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Guardá los cambios para actualizar la tienda pública.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/productos"
              className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Volver
            </Link>

            <Link
              href={`/producto/${product.slug}`}
              target="_blank"
              className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Ver público
            </Link>

            <button
              type="submit"
              disabled={pending}
              className="inline-flex justify-center rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-70 focus-ring"
            >
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
