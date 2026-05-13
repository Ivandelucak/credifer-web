import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    activeProducts,
    productsWithoutPrice,
    totalCategories,
    totalBrands,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: {
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        price: null,
        deletedAt: null,
      },
    }),
    prisma.category.count(),
    prisma.brand.count(),
  ]);

  const cards = [
    {
      label: "Productos totales",
      value: totalProducts,
      href: "/admin/productos",
    },
    {
      label: "Productos activos",
      value: activeProducts,
      href: "/admin/productos",
    },
    {
      label: "Sin precio",
      value: productsWithoutPrice,
      href: "/admin/productos?estado=sin-precio",
    },
    {
      label: "Categorías",
      value: totalCategories,
      href: "/admin/categorias",
    },
    {
      label: "Marcas",
      value: totalBrands,
      href: "/admin/productos",
    },
  ];

  return (
    <div>
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
          Dashboard
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Resumen del catálogo
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          Desde este panel se van a gestionar productos, categorías, precios,
          imágenes e importaciones del catálogo Credifer.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[rgba(2,100,169,0.28)] hover:shadow-[var(--shadow-card)] focus-ring"
          >
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              {card.label}
            </p>
            <p className="mt-3 text-4xl font-black text-[var(--brand-blue-dark)]">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Link
          href="/admin/productos"
          className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Gestionar productos
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Editar precios, nombres, descripciones, categorías, estado e
            imágenes.
          </p>
        </Link>

        <Link
          href="/admin/categorias"
          className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Categorías
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Organizar secciones y links rápidos para compartir por WhatsApp.
          </p>
        </Link>

        <Link
          href="/admin/importar"
          className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)] focus-ring"
        >
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Importar Excel
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Más adelante vamos a permitir importar productos desde el panel.
          </p>
        </Link>
      </div>
    </div>
  );
}
