//src/components/admin/ProductCreateForm.tsx
"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  createProduct,
  type ProductCreateFormState,
} from "@/app/admin/(protected)/productos/nuevo/actions";
import { AdminSearchableSelect } from "@/components/admin/AdminSearchableSelect";
import { ProductNameDuplicateWarning } from "@/components/admin/ProductNameDuplicateWarning";

type ProductCreateFormCategory = {
  id: number;
  name: string;
  subcategories: {
    id: number;
    name: string;
  }[];
};

type ProductCreateFormBrand = {
  id: number;
  name: string;
};

type ProductCreateFormProps = {
  categories: ProductCreateFormCategory[];
  brands: ProductCreateFormBrand[];
};

const initialState: ProductCreateFormState = {
  error: null,
};

export function ProductCreateForm({
  categories,
  brands,
}: ProductCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createProduct,
    initialState,
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [productName, setProductName] = useState("");

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
      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Principal
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
            Información básica
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
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder="Ej: Parlante Bluetooth..."
                className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />

              <ProductNameDuplicateWarning productName={productName} />
            </div>

            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-black text-[var(--text-primary)]"
              >
                Precio contado
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--brand-blue-dark)]">
                  $
                </span>

                <input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej: 250000"
                  className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white pl-9 pr-4 text-sm font-bold text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                />
              </div>

              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                Si queda vacío, se mostrará como “Consultar precio”.
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
                rows={3}
                placeholder="Resumen breve para cards, listados y ficha del producto."
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
                defaultChecked
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-black text-[var(--text-primary)]">
                  Producto activo
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                  Si está activo, se muestra en la tienda pública.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#C9D6E4] bg-white p-4 transition hover:border-[#F4C430]">
              <input
                type="checkbox"
                name="isFeatured"
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
              <input type="checkbox" name="isOffer" className="mt-1 h-4 w-4" />

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
              Código interno, URL pública, descripción extendida y datos SEO.
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
                Código interno / SKU
              </label>

              <input
                id="code"
                name="code"
                type="text"
                placeholder="Opcional"
                className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />

              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                Sirve para identificar productos internamente.
              </p>
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
                placeholder="Opcional. Si queda vacío, se genera desde el nombre."
                className="h-12 w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
              />

              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">
                Si el slug ya existe, el sistema agrega un número al final.
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
              placeholder="Descripción completa para el detalle del producto."
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
                  placeholder="Opcional. Si queda vacío, se genera automáticamente."
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
                  placeholder="Opcional. Si queda vacío, se genera automáticamente."
                  className="w-full rounded-2xl border border-[#C9D6E4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-blue)]"
                />
              </div>
            </div>
          </div>
        </div>
      </details>

      <div className="sticky bottom-4 z-30 rounded-[2rem] border border-[#B7CADA] bg-white/95 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.13)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            Al crear el producto vas a poder cargar imágenes desde la pantalla
            de edición.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/productos"
              className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={pending}
              className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-70 focus-ring"
            >
              {pending ? "Creando..." : "Crear producto"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
