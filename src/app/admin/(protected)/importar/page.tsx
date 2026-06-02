// src/app/admin/(protected)/importar/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const exportOptions = [
  {
    title: "Catálogo completo",
    description:
      "Descargá todos los productos actuales con precio, marca, categoría, subcategoría, estado e imágenes asociadas.",
    href: "/admin/exportar/catalogo?tipo=completo",
    accent: "bg-[var(--brand-blue)]",
    label: "Exportación general",
  },
  {
    title: "Productos sin imagen",
    description:
      "Listado útil para detectar productos que todavía necesitan carga de foto o imagen ilustrativa.",
    href: "/admin/exportar/catalogo?tipo=sin-imagen",
    accent: "bg-[var(--brand-yellow)]",
    label: "Control visual",
  },
  {
    title: "Productos sin precio",
    description:
      "Exportá productos que no tienen precio contado cargado para revisarlos antes de publicar o actualizar.",
    href: "/admin/exportar/catalogo?tipo=sin-precio",
    accent: "bg-[var(--brand-red)]",
    label: "Control comercial",
  },
];

export default async function AdminImportPage() {
  const [totalProducts, productsWithoutImages, productsWithoutPrice] =
    await Promise.all([
      prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.product.count({
        where: {
          deletedAt: null,
          images: {
            none: {},
          },
        },
      }),
      prisma.product.count({
        where: {
          deletedAt: null,
          price: null,
        },
      }),
    ]);

  const stats = [
    {
      label: "Productos actuales",
      value: totalProducts,
      color: "text-[var(--brand-blue-dark)]",
    },
    {
      label: "Sin imagen",
      value: productsWithoutImages,
      color: "text-[var(--brand-yellow)]",
    },
    {
      label: "Sin precio",
      value: productsWithoutPrice,
      color: "text-[var(--brand-red)]",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#8FA2B8] bg-[linear-gradient(135deg,#F8FBFE_0%,#EAF4FB_58%,#FFF7D8_100%)] p-6 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[rgba(2,100,169,0.14)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-[rgba(244,196,48,0.16)] blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Excel del catálogo
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)] lg:text-4xl">
            Exportar información del catálogo
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Descargá archivos Excel para revisar productos, precios, marcas,
            categorías, subcategorías e imágenes cargadas. La carga y edición de
            productos se realiza desde el panel administrativo.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-[#A9B8C9] bg-white/72 p-4 backdrop-blur">
            <p className="text-sm font-black text-[var(--brand-blue-dark)]">
              Carga de productos
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Para el uso diario, los productos se crean y editan manualmente
              desde el panel. Las cargas masivas excepcionales quedan reservadas
              para procesos técnicos internos.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.75rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          >
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              {stat.label}
            </p>

            <p className={`mt-3 text-4xl font-black ${stat.color}`}>
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {exportOptions.map((option) => (
          <article
            key={option.title}
            className="rounded-[1.75rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          >
            <span
              className={`block h-1.5 w-12 rounded-full ${option.accent}`}
            />

            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
              {option.label}
            </p>

            <h3 className="mt-2 text-xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
              {option.title}
            </h3>

            <p className="mt-3 min-h-[96px] text-sm leading-6 text-[var(--text-secondary)]">
              {option.description}
            </p>

            <a
              href={option.href}
              className="tap-feedback mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Descargar Excel
            </a>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-[#8FA2B8] bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.10)] lg:p-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Edición manual
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
              Alta y actualización de productos
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Para agregar pocos productos o corregir datos puntuales, usá el
              CRUD del panel. Es más seguro que una importación masiva desde
              Excel.
            </p>
          </div>

          <Link
            href="/admin/productos"
            className="tap-feedback inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#8FA2B8] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
          >
            Ir a productos
          </Link>
        </div>
      </section>
    </div>
  );
}
