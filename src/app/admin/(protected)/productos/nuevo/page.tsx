//src/app/admin/(protected)/productos/nuevo/page.tsx
import Link from "next/link";
import { BackButton } from "@/components/layout/BackButton";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: [{ position: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <div className="space-y-7">
      <div>
        <BackButton
          fallbackHref="/admin/productos"
          label="Volver a productos"
        />
      </div>

      <section className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_48%,#FFF7D8_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/86 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                Nuevo producto
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-primary)] lg:text-5xl">
              Crear producto.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base lg:leading-7">
              Cargá la información principal del producto. Después de crearlo,
              vas a poder subir imágenes desde la pantalla de edición.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                Activo por defecto
              </span>

              <span className="rounded-full border border-[#B7CADA] bg-white/86 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                {categories.length} categorías disponibles
              </span>

              <span className="rounded-full border border-[#B7CADA] bg-white/86 px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]">
                {brands.length} marcas cargadas
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/admin/productos"
              className="tap-feedback inline-flex min-h-12 min-w-[150px] items-center justify-center whitespace-nowrap rounded-2xl border border-[#B7CADA] bg-white px-5 py-3 text-center text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      <ProductCreateForm categories={categories} brands={brands} />
    </div>
  );
}
