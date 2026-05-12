import Link from "next/link";

const featuredCategories = [
  {
    name: "Celulares",
    href: "/celulares",
    description:
      "Equipos seleccionados para consultar precio contado y financiación.",
  },
  {
    name: "Electrodomésticos",
    href: "/electrodomesticos",
    description: "Productos para el hogar con atención personalizada.",
  },
  {
    name: "Parlantes",
    href: "/parlantes",
    description: "Audio, música y entretenimiento para todos los días.",
  },
  {
    name: "Herramientas",
    href: "/herramientas",
    description:
      "Herramientas y artículos prácticos para trabajo o uso doméstico.",
  },
];

const steps = [
  {
    number: "01",
    title: "Elegí productos",
    text: "Navegá el catálogo, revisá precios contado y agregá al carrito lo que querés consultar.",
  },
  {
    number: "02",
    title: "Armá tu consulta",
    text: "El carrito sirve para ordenar los productos antes de hablar con un vendedor.",
  },
  {
    number: "03",
    title: "Enviá por WhatsApp",
    text: "Se genera un mensaje automático con productos, cantidades y links.",
  },
  {
    number: "04",
    title: "Coordiná la compra",
    text: "El vendedor termina de confirmar cuotas, entrega, requisitos y disponibilidad.",
  },
];

const benefits = [
  "Precio contado visible",
  "Consulta rápida por WhatsApp",
  "Financiación coordinada con vendedor",
  "Categorías simples para compartir",
  "Atención personalizada",
  "Productos ordenados por secciones",
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,196,48,0.18),transparent_28rem)]" />

        <div className="container-page relative grid min-h-[620px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-[rgba(2,100,169,0.18)] bg-[var(--brand-blue-soft)] px-4 py-2 text-sm font-bold text-[var(--brand-blue-dark)]">
              Catálogo online Credifer
            </p>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              Elegí tus productos y consultá financiación por WhatsApp.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              Navegá la tienda, armá tu carrito y enviá la consulta directamente
              a Credifer. Las cuotas, promociones, entrega y condiciones se
              coordinan con un vendedor.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex justify-center rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_32px_rgba(2,100,169,0.25)] transition hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Ver productos
              </Link>

              <Link
                href="/como-comprar"
                className="inline-flex justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Cómo comprar
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <p className="text-2xl font-black text-[var(--brand-blue)]">
                  $
                </p>
                <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                  Precio contado
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  Los productos muestran precio final contado.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <p className="text-2xl font-black text-[var(--brand-yellow)]">
                  %
                </p>
                <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                  Cuotas a consultar
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  La financiación se confirma por WhatsApp.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <p className="text-2xl font-black text-[var(--whatsapp)]">✓</p>
                <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                  Atención directa
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  Un vendedor continúa la operación.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[rgba(216,33,40,0.12)] blur-2xl" />
            <div className="absolute -bottom-10 right-4 h-40 w-40 rounded-full bg-[rgba(2,100,169,0.16)] blur-3xl" />

            <div className="relative rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[#0a8bca] p-6 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">
                  Compra asistida
                </p>

                <h2 className="mt-5 text-3xl font-black leading-tight">
                  Carrito pensado para vender por WhatsApp.
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/80">
                  El cliente no paga dentro de la web. Elige productos, confirma
                  su interés y el vendedor recibe una consulta ordenada.
                </p>

                <div className="mt-8 rounded-2xl bg-white p-5 text-[var(--text-primary)]">
                  <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
                    <div>
                      <p className="text-sm font-black">Consulta generada</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Mensaje automático para WhatsApp
                      </p>
                    </div>
                    <span className="rounded-full bg-[rgba(37,211,102,0.12)] px-3 py-1 text-xs font-black text-[var(--whatsapp-dark)]">
                      WhatsApp
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                    <p>Hola Credifer, quiero consultar por estos productos:</p>
                    <p className="rounded-xl bg-[var(--surface-muted)] p-3">
                      1. Producto seleccionado
                      <br />
                      Cantidad: 1
                      <br />
                      Precio contado: $...
                    </p>
                    <p>Quisiera saber opciones de cuotas y entrega.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Secciones
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Categorías destacadas
            </h2>
          </div>

          <Link
            href="/categorias"
            className="text-sm font-black text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)] focus-ring rounded-md"
          >
            Ver todas las categorías
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[rgba(2,100,169,0.28)] hover:shadow-[var(--shadow-card)] focus-ring"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-blue-soft)] text-xl font-black text-[var(--brand-blue)] transition group-hover:bg-[var(--brand-blue)] group-hover:text-white">
                {category.name.charAt(0)}
              </div>

              <h3 className="text-lg font-black text-[var(--text-primary)]">
                {category.name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {category.description}
              </p>

              <p className="mt-6 text-sm font-black text-[var(--brand-blue)]">
                Entrar a la sección →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Proceso simple
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Cómo funciona la tienda
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
              La web está pensada para mostrar productos y acelerar la consulta.
              La venta final se gestiona de forma personalizada.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
              >
                <p className="text-sm font-black text-[var(--brand-red)]">
                  {step.number}
                </p>
                <h3 className="mt-4 text-lg font-black text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-8 rounded-[2rem] border border-[var(--border)] bg-[var(--brand-blue-dark)] p-8 text-white shadow-[var(--shadow-soft)] lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white/70">
              Credifer
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Productos, cuotas y atención personalizada.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              El catálogo permite mostrar productos de forma ordenada, compartir
              links rápidos por categoría y recibir consultas listas para
              gestionar desde WhatsApp.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-bold text-white"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
