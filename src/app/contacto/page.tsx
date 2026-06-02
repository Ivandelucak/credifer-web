// src/app/contacto/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contactá a Credifer por WhatsApp para consultar productos, cuotas, disponibilidad, financiación y entrega.",
};

const contactReasons = [
  {
    title: "Productos y disponibilidad",
    description:
      "Consultá si el producto que viste en el catálogo está disponible y confirmá el precio publicado.",
    accent: "bg-[var(--brand-blue)]",
  },
  {
    title: "Cuotas y financiación",
    description:
      "Coordiná opciones de pago, requisitos y condiciones según el producto que necesitás.",
    accent: "bg-[var(--brand-yellow)]",
  },
  {
    title: "Entrega y coordinación",
    description:
      "Acordá los detalles de la operación y la forma de entrega con atención personalizada.",
    accent: "bg-[var(--brand-green)]",
  },
];

const quickMessages = [
  "Quiero consultar por un producto del catálogo.",
  "Quiero saber opciones de cuotas y financiación.",
  "Quiero consultar disponibilidad y entrega.",
];

function buildWhatsappUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;
}

export default function ContactPage() {
  const whatsappUrl = buildWhatsappUrl(
    "Hola Credifer, quiero hacer una consulta desde la tienda online.",
  );

  return (
    <section className="bg-[var(--catalog-bg)]">
      <div className="container-page py-6 lg:py-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_46%,#FFF7D8_82%,#EAF8EF_100%)] p-6 shadow-[0_22px_50px_rgba(15,23,42,0.10)] lg:rounded-[2.5rem] lg:p-9">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.16)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-[rgba(37,211,102,0.16)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-[rgba(244,196,48,0.18)] blur-3xl" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-90px] top-[-30px] hidden h-[360px] w-[360px] opacity-[0.055] mix-blend-multiply lg:block"
          >
            <img
              src="/brand/logo-credifer.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/88 px-4 py-2 shadow-sm backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--whatsapp)]" />
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                  Contacto Credifer
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)] lg:text-[3.85rem]">
                Hablá con Credifer por WhatsApp.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] lg:text-lg lg:leading-8">
                Enviá tu consulta para confirmar productos, precio contado,
                cuotas, financiación, disponibilidad y entrega con atención
                personalizada.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-feedback inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--whatsapp)] px-6 py-3 text-sm font-black text-white shadow-[0_16px_32px_rgba(37,211,102,0.26)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] focus-ring"
                >
                  <span className="text-lg">↗</span>
                  Consultar por WhatsApp
                </a>

                <Link
                  href="/productos"
                  className="tap-feedback inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-6 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                >
                  Ver catálogo
                </Link>
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-[2rem] border border-[#0FAF5D] bg-[linear-gradient(160deg,#128C7E_0%,#18B867_58%,#25D366_100%)] p-6 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/16 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-white/12 blur-3xl" />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/78">
                  Canal principal
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
                  Consulta rápida, clara y directa.
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/82">
                  Para una respuesta más precisa, podés enviar el producto que
                  viste, el modelo o directamente armar un carrito desde la web.
                </p>

                <div className="mt-5 space-y-3">
                  {["Producto", "Cuotas", "Disponibilidad"].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/18 bg-white/12 px-4 py-3 text-sm font-black"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-feedback relative z-10 mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/80 bg-white px-5 py-3 text-sm font-black !text-[#0B3558] shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#F8FBFE] focus-ring"
                >
                  <span className="relative z-10 !text-[#0B3558]">
                    Abrir WhatsApp
                  </span>
                </a>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {contactReasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-[1.75rem] border border-[#B7CADA] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
            >
              <span
                className={`block h-1.5 w-12 rounded-full ${reason.accent}`}
              />

              <h2 className="mt-4 text-xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                {reason.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {reason.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Mensajes rápidos
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[var(--text-primary)]">
              Elegí una consulta para enviar.
            </h2>

            <div className="mt-6 grid gap-3">
              {quickMessages.map((message) => (
                <a
                  key={message}
                  href={buildWhatsappUrl(`Hola Credifer, ${message}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-feedback flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-[#D6E3EF] bg-[#F8FBFE] px-4 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:bg-white hover:text-[var(--brand-blue)] focus-ring"
                >
                  <span>{message}</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Consejo
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
              Usá el carrito para enviar varios productos.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Si querés consultar más de un producto, agregalos al carrito y
              enviá una sola consulta ordenada por WhatsApp.
            </p>

            <Link
              href="/carrito"
              className="tap-feedback mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
            >
              Ir al carrito
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
