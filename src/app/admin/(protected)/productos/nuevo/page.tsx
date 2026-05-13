import Link from "next/link";
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
    <div>
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Nuevo producto
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Crear producto
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Cargá la información comercial del producto. Después de crearlo,
              vas a poder subir imágenes desde la pantalla de edición.
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

      <ProductCreateForm categories={categories} brands={brands} />
    </div>
  );
}
