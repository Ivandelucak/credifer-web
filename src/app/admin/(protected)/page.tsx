import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const quickActions = [
  {
    title: "Gestionar productos",
    text: "Editar precios, nombres, categorías, estado, imágenes y descripciones.",
    href: "/admin/productos",
    label: "Ir a productos",
  },
  {
    title: "Nuevo producto",
    text: "Crear un producto manualmente y dejarlo listo para mostrar en la tienda.",
    href: "/admin/productos/nuevo",
    label: "Crear producto",
  },
  {
    title: "Importar Excel",
    text: "Cargar o actualizar productos desde archivo cuando sea necesario.",
    href: "/admin/importar",
    label: "Importar",
  },
  {
    title: "Categorías",
    text: "Ordenar secciones, subcategorías y accesos del catálogo público.",
    href: "/admin/categorias",
    label: "Administrar",
  },
  {
    title: "Marcas",
    text: "Revisar fabricantes y mantener el catálogo consistente.",
    href: "/admin/marcas",
    label: "Ver marcas",
  },
  {
    title: "Configuración",
    text: "Ajustar opciones generales de la tienda y datos visibles.",
    href: "/admin/configuracion",
    label: "Configurar",
  },
];

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    activeProducts,
    inactiveProducts,
    productsWithoutPrice,
    productsWithoutImage,
    totalCategories,
    totalBrands,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        isActive: false,
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        price: null,
        deletedAt: null,
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        deletedAt: null,
        images: {
          none: {},
        },
      },
    }),
    prisma.category.count({
      where: {
        isActive: true,
      },
    }),
    prisma.brand.count(),
  ]);

  const stats = [
    {
      label: "Productos activos",
      value: activeProducts,
      help: "Visibles en la tienda pública.",
      href: "/admin/productos",
      accent: "bg-[var(--brand-blue)]",
    },
    {
      label: "Sin precio",
      value: productsWithoutPrice,
      help: "Conviene revisar antes de publicar.",
      href: "/admin/productos?estado=sin-precio",
      accent: "bg-[var(--brand-yellow)]",
    },
    {
      label: "Sin imagen",
      value: productsWithoutImage,
      help: "Productos activos sin imagen cargada.",
      href: "/admin/productos",
      accent: "bg-[var(--brand-red)]",
    },
    {
      label: "Categorías",
      value: totalCategories,
      help: "Secciones activas del catálogo.",
      href: "/admin/categorias",
      accent: "bg-[var(--brand-green)]",
    },
    {
      label: "Marcas",
      value: totalBrands,
      help: "Fabricantes cargados.",
      href: "/admin/marcas",
      accent: "bg-[var(--brand-blue)]",
    },
    {
      label: "Total productos",
      value: totalProducts,
      help: "Incluye activos, inactivos y registros históricos.",
      href: "/admin/productos",
      accent: "bg-slate-400",
    },
  ];

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_48%,#FFF7D8_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/86 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                Credifer Admin
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--text-primary)] lg:text-5xl">
              Resumen del catálogo.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base lg:leading-7">
              Gestioná productos, precios, imágenes, categorías, marcas e
              importaciones del catálogo online de Credifer.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/productos"
                className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Gestionar productos
              </Link>

              <Link
                href="/admin/productos/nuevo"
                className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Nuevo producto
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#B7CADA] bg-white/88 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Estado general
            </p>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] p-4">
                <p className="text-3xl font-black text-[var(--brand-blue-dark)]">
                  {activeProducts}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--text-secondary)]">
                  productos activos
                </p>
              </div>

              <div className="rounded-2xl border border-[#C9D6E4] bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-[var(--text-secondary)]">
                    Inactivos
                  </span>
                  <span className="text-lg font-black text-[var(--text-primary)]">
                    {inactiveProducts}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-[var(--text-secondary)]">
                    A revisar
                  </span>
                  <span className="text-lg font-black text-[var(--brand-red)]">
                    {productsWithoutPrice + productsWithoutImage}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(productsWithoutPrice > 0 || productsWithoutImage > 0) && (
        <section className="rounded-[1.75rem] border border-[#F4C430]/45 bg-[#FFF8DB] p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8A6400]">
                Atención
              </p>

              <h2 className="mt-2 text-xl font-black text-[var(--text-primary)]">
                Hay productos que conviene revisar.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Detectamos {productsWithoutPrice} producto
                {productsWithoutPrice === 1 ? "" : "s"} sin precio y{" "}
                {productsWithoutImage} producto
                {productsWithoutImage === 1 ? "" : "s"} activo
                {productsWithoutImage === 1 ? "" : "s"} sin imagen.
              </p>
            </div>

            <Link
              href="/admin/productos"
              className="tap-feedback inline-flex min-h-11 w-fit items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Revisar productos
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--catalog-shadow)] focus-ring"
          >
            <span className={`block h-1.5 w-10 rounded-full ${card.accent}`} />

            <p className="mt-4 text-sm font-black text-[var(--text-secondary)]">
              {card.label}
            </p>

            <p className="mt-2 text-4xl font-black tracking-tight text-[var(--brand-blue-dark)]">
              {card.value}
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
              {card.help}
            </p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Acciones rápidas
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
              Administrar tienda.
            </h2>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-fit rounded-full border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            Ver tienda pública
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-[2rem] border border-[#B7CADA] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--catalog-shadow)] focus-ring"
            >
              <h3 className="text-xl font-black text-[var(--text-primary)] transition group-hover:text-[var(--brand-blue)]">
                {action.title}
              </h3>

              <p className="mt-3 min-h-12 text-sm leading-6 text-[var(--text-secondary)]">
                {action.text}
              </p>

              <span className="mt-5 inline-flex rounded-full bg-[var(--brand-blue-soft)] px-4 py-2 text-sm font-black text-[var(--brand-blue-dark)] transition group-hover:bg-[var(--brand-blue)] group-hover:text-white">
                {action.label} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
