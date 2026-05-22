//src/components/admin/ProductEditForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  type ProductEditFormState,
  updateProduct,
} from "@/app/admin/(protected)/productos/[id]/editar/actions";
import { AdminSearchableSelect } from "@/components/admin/AdminSearchableSelect";

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
  returnHref: string;
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
  returnHref,
}: ProductEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProduct,
    initialState,
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product.categoryId ? String(product.categoryId) : "",
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    product.subcategoryId ? String(product.subcategoryId) : "",
  );

  const [selectedBrandId, setSelectedBrandId] = useState(
    product.brandId ? String(product.brandId) : "",
  );

  const availableSubcategories = useMemo(() => {
    const categoryId = Number(selectedCategoryId);

    if (!categoryId) return [];

    const category = categories.find((item) => item.id === categoryId);

    return category?.subcategories ?? [];
  }, [categories, selectedCategoryId]);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Sin categoría" },
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    ],
    [categories],
  );

  const subcategoryOptions = useMemo(
    () => [
      { value: "", label: "Sin subcategoría" },
      ...availableSubcategories.map((subcategory) => ({
        value: String(subcategory.id),
        label: subcategory.name,
      })),
    ],
    [availableSubcategories],
  );

  const brandOptions = useMemo(
    () => [
      { value: "", label: "Sin marca" },
      ...brands.map((brand) => ({
        value: String(brand.id),
        label: brand.name,
      })),
    ],
    [brands],
  );

  return (
    <form action={formAction} className="mt-6 space-y-6 pb-28">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="returnTo" value={returnHref} />

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

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Principal
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                Información básica
              </h3>
            </div>
          </div>

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
                className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
                className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />

              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                Si queda vacío, el producto se mostrará como “Consultar precio”.
              </p>
            </div>

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
                rows={4}
                defaultValue={product.descriptionShort ?? ""}
                placeholder="Texto breve que se muestra en cards y ficha del producto."
                className="w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:self-start lg:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Publicación
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
            Estado comercial
          </h3>

          <div className="mt-5 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] p-4 transition hover:border-[var(--brand-blue)]">
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

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#C9D6E4] bg-white p-4 transition hover:border-[#F4C430]">
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
                  Sirve para resaltar productos importantes.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#C9D6E4] bg-white p-4 transition hover:border-[var(--brand-red)]">
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

      <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
          Orden del catálogo
        </p>

        <h3 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
          Organización
        </h3>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <AdminSearchableSelect
            name="categoryId"
            label="Categoría"
            value={selectedCategoryId}
            onChange={(nextValue) => {
              setSelectedCategoryId(nextValue);
              setSelectedSubcategoryId("");
            }}
            options={categoryOptions}
            placeholder="Sin categoría"
            emptyMessage="No encontramos categorías."
            minSearchLength={1}
          />

          <AdminSearchableSelect
            name="subcategoryId"
            label="Subcategoría"
            value={selectedSubcategoryId}
            onChange={setSelectedSubcategoryId}
            options={subcategoryOptions}
            placeholder={
              selectedCategoryId
                ? "Sin subcategoría"
                : "Primero elegí una categoría"
            }
            disabled={!selectedCategoryId}
            emptyMessage="No encontramos subcategorías."
            minSearchLength={1}
          />

          <AdminSearchableSelect
            name="brandId"
            label="Marca"
            value={selectedBrandId}
            onChange={setSelectedBrandId}
            options={brandOptions}
            placeholder="Sin marca"
            emptyMessage="No encontramos marcas."
            minSearchLength={1}
          />
        </div>
      </section>

      <details className="group rounded-[2rem] border border-[#B7CADA] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 lg:p-6 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Opciones avanzadas
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
              Configuración avanzada
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Usá esta sección solo si necesitás ajustar datos técnicos o textos
              más específicos.
            </p>
          </div>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-xl font-black text-[var(--brand-blue-dark)] transition group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-[#D6E3EF] p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
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
                className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />
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
                className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />

              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                Ruta pública actual: /producto/{product.slug}
              </p>
            </div>
          </div>

          <div className="mt-5">
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
              className="w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
            />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#D6E3EF] bg-[var(--catalog-surface-soft)] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              SEO básico
            </p>

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
                  className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
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
                  className="w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                />
              </div>
            </div>
          </div>
        </div>
      </details>

      <div className="sticky bottom-4 z-30 rounded-[2rem] border border-[#B7CADA] bg-white/95 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.13)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Guardá los cambios para actualizar la tienda pública.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={returnHref}
              className="tap-feedback inline-flex justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Volver
            </Link>

            <Link
              href={`/producto/${product.slug}`}
              target="_blank"
              className="tap-feedback inline-flex justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Ver en tienda
            </Link>

            <button
              type="submit"
              disabled={pending}
              className="tap-feedback inline-flex justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-70 focus-ring"
            >
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
