import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          products: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
          Secciones
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)] lg:text-5xl">
          Categorías
        </h1>

        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Accedé rápido a cada sección del catálogo. Estos links están pensados
          para compartir fácilmente por WhatsApp.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${category.slug}`}
            className="group rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[rgba(2,100,169,0.28)] hover:shadow-[var(--shadow-card)] focus-ring"
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-blue-soft)] text-2xl font-black text-[var(--brand-blue)] transition group-hover:bg-[var(--brand-blue)] group-hover:text-white">
              {category.name.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-xl font-black text-[var(--text-primary)]">
              {category.name}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {category.description ??
                "Productos disponibles para consultar precio contado y financiación por WhatsApp."}
            </p>

            <p className="mt-6 text-sm font-black text-[var(--brand-blue)]">
              {category._count.products} productos →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
