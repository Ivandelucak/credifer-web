// src/app/como-comprar/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo comprar",
  description:
    "Conocé cómo comprar en Credifer: elegí productos, armá tu carrito y coordiná precio, cuotas, financiación y entrega con atención personalizada.",
};

const steps = [
  {
    number: "01",
    title: "Elegí productos",
    description:
      "Navegá el catálogo, buscá por categoría, marca o modelo y revisá el precio contado publicado.",
  },
  {
    number: "02",
    title: "Armá tu carrito",
    description:
      "Agregá uno o más productos para preparar una consulta ordenada, sin compromiso de compra inmediata.",
  },
  {
    number: "03",
    title: "Enviá la consulta",
    description:
      "El sistema genera un mensaje con los productos seleccionados para que un asesor pueda revisarlo.",
  },
  {
    number: "04",
    title: "Coordiná la operación",
    description:
      "Credifer confirma disponibilidad, condiciones, cuotas, requisitos y forma de entrega según cada caso.",
  },
];

const highlights = [
  {
    label: "Precios publicados",
    text: "Los valores visibles corresponden al precio contado disponible en el catálogo.",
    color: "bg-[var(--brand-blue)]",
  },
  {
    label: "Financiación a consultar",
    text: "Las cuotas y condiciones se coordinan con un asesor según producto y operación.",
    color: "bg-[var(--brand-yellow)]",
  },
  {
    label: "Atención personalizada",
    text: "La compra se termina de gestionar con acompañamiento comercial de Credifer.",
    color: "bg-[var(--brand-green)]",
  },
];

const faqs = [
  {
    question: "¿El precio publicado es el precio final?",
    answer:
      "El precio publicado sirve como referencia de contado. La confirmación final se realiza al momento de la consulta, junto con disponibilidad, cuotas y entrega.",
  },
  {
    question: "¿Puedo consultar varios productos juntos?",
    answer:
      "Sí. Podés agregar varios productos al carrito y enviar una sola consulta con todo el detalle.",
  },
  {
    question: "¿La compra se paga directamente en la web?",
    answer:
      "No. La tienda funciona como catálogo con carrito de consulta. La operación se coordina luego con Credifer.",
  },
  {
    question: "¿Puedo consultar financiación?",
    answer:
      "Sí. Al enviar la consulta, un asesor puede informarte alternativas de pago y financiación disponibles.",
  },
];

export default function HowToBuyPage() {
  return (
    <section className="bg-[var(--catalog-bg)]">
      <div className="container-page py-6 lg:py-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_48%,#FFF7D8_82%,#EAF8EF_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:rounded-[2.5rem] lg:p-9">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.16)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-[rgba(2,100,169,0.12)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-[rgba(244,196,48,0.18)] blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/88 px-4 py-2 shadow-sm backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                  Guía de compra
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)] lg:text-6xl">
                Comprar en Credifer es simple y asistido.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] lg:text-lg lg:leading-8">
                Elegí productos del catálogo, armá tu carrito y enviá una
                consulta para coordinar precio, cuotas, disponibilidad y entrega
                con atención personalizada.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/productos"
                  className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
                >
                  Ver catálogo
                </Link>

                <Link
                  href="/contacto"
                  className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                >
                  Consultar ahora
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#B7CADA] bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Resumen
              </p>

              <div className="mt-4 space-y-3">
                {[
                  "Elegís productos",
                  "Los agregás al carrito",
                  "Enviás la consulta",
                  "Coordinás con Credifer",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-[#D6E3EF] bg-[#F8FBFE] p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue)] text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-black text-[var(--text-primary)]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                La web no realiza cobro online: funciona como catálogo y carrito
                de consulta.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <article
              key={highlight.label}
              className="rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
            >
              <span
                className={`block h-1.5 w-12 rounded-full ${highlight.color}`}
              />

              <h2 className="mt-4 text-xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                {highlight.label}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {highlight.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-7">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Paso a paso
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[var(--text-primary)]">
                Cómo se gestiona la compra
              </h2>
            </div>

            <Link
              href="/productos"
              className="hidden w-fit rounded-full border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring lg:inline-flex"
            >
              Empezar por el catálogo
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="relative overflow-hidden rounded-[1.5rem] border border-[#D6E3EF] bg-[#F8FBFE] p-5"
              >
                <span className="text-sm font-black tracking-[0.16em] text-[var(--brand-blue)]">
                  {step.number}
                </span>

                <h3 className="mt-4 text-xl font-black leading-tight text-[var(--text-primary)]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Preguntas frecuentes
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[var(--text-primary)]">
              Antes de consultar
            </h2>

            <div className="mt-6 divide-y divide-[#D6E3EF]">
              {faqs.map((faq) => (
                <article key={faq.question} className="py-5 first:pt-0">
                  <h3 className="text-base font-black text-[var(--text-primary)]">
                    {faq.question}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[#B7CADA] bg-[linear-gradient(160deg,var(--brand-blue-dark)_0%,#0B5F92_58%,var(--brand-blue)_100%)] p-6 text-white shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
              Recomendación
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
              Usá el carrito para enviar una consulta clara.
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/78">
              Agregar productos al carrito ayuda a que el asesor reciba el
              detalle completo y pueda responder más rápido.
            </p>

            <div className="mt-6 space-y-3">
              {["Producto elegido", "Cantidad", "Precio publicado"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-black"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>

            <Link
              href="/productos"
              className="tap-feedback relative z-10 mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/80 bg-white px-5 py-3 text-sm font-black !text-[#0B3558] shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#F8FBFE] focus-ring"
            >
              <span className="relative z-10 !text-[#0B3558]">
                Ir al catálogo
              </span>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
