// src/app/legal/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Información legal",
  description:
    "Términos de uso, política de privacidad, condiciones comerciales y revocación de operaciones de Credifer.",
};

const lastUpdate = "Junio 2026";

const legalSections = [
  {
    title: "Uso del sitio",
    text: "La tienda online de Credifer funciona como catálogo digital de productos. La navegación, búsqueda, selección de productos y uso del carrito tienen como finalidad facilitar una consulta comercial ordenada.",
  },
  {
    title: "Catálogo y disponibilidad",
    text: "Los productos publicados pueden estar sujetos a disponibilidad, actualización de stock, cambios de modelo, variaciones de proveedor o confirmación comercial. Agregar un producto al carrito no implica reserva ni compra automática.",
  },
  {
    title: "Precios publicados",
    text: "Los precios visibles en el sitio corresponden al precio contado informado para el catálogo. La confirmación final de precio, disponibilidad, financiación, cuotas y entrega se realiza con un asesor de Credifer.",
  },
  {
    title: "Financiación y cuotas",
    text: "Las condiciones de financiación, cantidad de cuotas, requisitos y medios de pago disponibles se informan de manera personalizada según producto, operación y evaluación comercial.",
  },
  {
    title: "Zonas de atención",
    text: "Credifer coordina consultas y entregas principalmente en zonas cercanas a El Pato, Berazategui y La Plata. Algunas localidades pueden evaluarse según producto, disponibilidad y recorrido.",
  },
];

const privacyItems = [
  "Datos de contacto enviados voluntariamente por WhatsApp o formularios.",
  "Información incluida en consultas comerciales, como productos seleccionados, cantidades o comentarios.",
  "Datos técnicos básicos necesarios para el funcionamiento del sitio.",
];

const userRights = [
  "Solicitar información sobre los datos enviados.",
  "Pedir rectificación o actualización de información incorrecta.",
  "Solicitar eliminación de datos cuando corresponda.",
  "Realizar consultas vinculadas al uso de sus datos personales.",
];

function buildWhatsappUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;
}

export default function LegalPage() {
  const contactUrl = buildWhatsappUrl(
    "Hola Credifer, quiero hacer una consulta sobre información legal, privacidad o condiciones comerciales.",
  );

  const arrepentimientoUrl = buildWhatsappUrl(
    "Hola Credifer, quiero consultar sobre la revocación/arrepentimiento de una operación realizada por canales digitales.",
  );

  return (
    <section className="bg-[var(--catalog-bg)]">
      <div className="container-page py-6 lg:py-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_46%,#FFF7D8_82%,#EAF8EF_100%)] p-6 shadow-[0_22px_50px_rgba(15,23,42,0.10)] lg:rounded-[2.5rem] lg:p-9">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(2,100,169,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.16)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-[rgba(2,100,169,0.16)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-[rgba(244,196,48,0.16)] blur-3xl" />

          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CADA] bg-white/88 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
                Información legal
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)] lg:text-[3.85rem]">
              Condiciones de uso, privacidad y consulta comercial.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-secondary)] lg:text-lg lg:leading-8">
              Esta sección resume cómo funciona la tienda online de Credifer,
              cómo se gestionan las consultas y qué información debe tener en
              cuenta el usuario antes de confirmar una operación.
            </p>

            <p className="mt-4 text-sm font-bold text-[var(--text-muted)]">
              Última actualización: {lastUpdate}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Términos comerciales
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[var(--text-primary)]">
                Funcionamiento del catálogo
              </h2>

              <div className="mt-6 grid gap-4">
                {legalSections.map((section) => (
                  <article
                    key={section.title}
                    className="rounded-[1.5rem] border border-[#D6E3EF] bg-[#F8FBFE] p-5"
                  >
                    <h3 className="text-lg font-black text-[var(--text-primary)]">
                      {section.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {section.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Privacidad
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[var(--text-primary)]">
                Tratamiento de datos personales
              </h2>

              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                Credifer puede recibir datos personales cuando el usuario
                realiza una consulta, envía un mensaje por WhatsApp, comparte
                información de contacto o solicita condiciones comerciales. Esos
                datos se utilizan para responder consultas, coordinar
                operaciones y brindar atención comercial.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[#D6E3EF] bg-[#F8FBFE] p-5">
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    Datos que pueden recibirse
                  </h3>

                  <ul className="mt-4 space-y-3">
                    {privacyItems.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm leading-6 text-[var(--text-secondary)]"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-blue)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.5rem] border border-[#D6E3EF] bg-[#F8FBFE] p-5">
                  <h3 className="text-lg font-black text-[var(--text-primary)]">
                    Derechos del usuario
                  </h3>

                  <ul className="mt-4 space-y-3">
                    {userRights.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm leading-6 text-[var(--text-secondary)]"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-green)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="arrepentimiento"
              className="scroll-mt-28 rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-7"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Revocación / arrepentimiento
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[var(--text-primary)]">
                Consulta sobre una operación confirmada
              </h2>

              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                La tienda online de Credifer no realiza cobros automáticos ni
                confirma compras por sí sola. Si una operación fue confirmada
                posteriormente con Credifer por canales digitales, el usuario
                puede comunicarse para consultar la revocación, arrepentimiento
                o modificación de la operación, según corresponda.
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Para iniciar la consulta, se recomienda enviar el nombre,
                producto, fecha aproximada de la operación y medio por el cual
                fue coordinada.
              </p>

              <a
                href={arrepentimientoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-feedback mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Consultar revocación por WhatsApp
              </a>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-[#B7CADA] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] lg:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Importante
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
                El carrito no confirma una compra.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Los productos agregados al carrito sirven para enviar una
                consulta ordenada por WhatsApp. La operación se confirma recién
                cuando Credifer valida disponibilidad, condiciones y forma de
                entrega.
              </p>

              <Link
                href="/como-comprar"
                className="tap-feedback mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Ver cómo comprar
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#0E5F93] bg-[linear-gradient(160deg,#0B3558_0%,#0B5F92_58%,#0264A9_100%)] p-6 text-white shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-[#F4C430]/20 blur-3xl" />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/72">
                  Contacto legal
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.035em]">
                  Consultas sobre privacidad o condiciones.
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/78">
                  Para solicitar información, corregir datos o consultar
                  condiciones comerciales, podés comunicarte directamente por
                  WhatsApp.
                </p>

                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-feedback relative z-10 mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/80 bg-white px-5 py-3 text-sm font-black !text-[#0B3558] shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#F8FBFE] focus-ring"
                >
                  <span className="relative z-10 !text-[#0B3558]">
                    Contactar a Credifer
                  </span>
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#B7CADA] bg-[var(--brand-blue-soft)] p-5">
              <p className="text-sm font-black text-[var(--brand-blue-dark)]">
                Esta página tiene fines informativos.
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                Para publicación definitiva, Credifer puede validar estos textos
                con su asesor contable o legal.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
