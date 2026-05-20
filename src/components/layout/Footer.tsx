import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  {
    title: "Tienda",
    links: [
      { label: "Productos", href: "/productos" },
      { label: "Categorías", href: "/categorias" },
      { label: "Ofertas", href: "/ofertas" },
      { label: "Carrito", href: "/carrito" },
    ],
  },
  {
    title: "Categorías",
    links: [
      { label: "Celulares", href: "/celulares" },
      { label: "Audio", href: "/audio" },
      { label: "Herramientas", href: "/herramientas" },
      {
        label: "Grandes electrodomésticos",
        href: "/grandes-electrodomesticos",
      },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Cómo comprar", href: "/como-comprar" },
      { label: "Financiación y pagos", href: "/como-comprar" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
];

const paymentBenefits = [
  "Cuota semanal",
  "Cuota Simple 3 y 6",
  "Tarjetas",
  "Efectivo",
  "Transferencia",
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hola Credifer, quiero hacer una consulta desde la tienda online.",
  )}`;

  return (
    <footer className="relative overflow-hidden border-t border-[#B7CADA] bg-[var(--brand-blue-dark)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(2,100,169,0.38),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(37,211,102,0.16),transparent_24%),radial-gradient(circle_at_60%_90%,rgba(244,196,48,0.12),transparent_30%)]" />

      <div className="container-page relative py-9 lg:py-11">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr] lg:items-start">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_16px_38px_rgba(0,0,0,0.14)] backdrop-blur">
            <div className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
              <div className="relative h-12 w-32">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  sizes="144px"
                  className="object-contain object-left"
                />
              </div>
            </div>

            <h2 className="mt-5 text-xl font-black leading-tight tracking-[-0.025em]">
              Productos, cuotas y atención personalizada.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
              Explorá el catálogo Credifer, armá tu consulta y coordiná
              financiación, disponibilidad y entrega con un asesor.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {paymentBenefits.map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-full border border-white/10 bg-white/[0.10] px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-white/88"
                >
                  {benefit}
                </span>
              ))}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-2xl bg-[var(--whatsapp)] px-5 py-3 text-sm font-black text-slate-950 shadow-[0_14px_30px_rgba(37,211,102,0.26)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white focus-ring"
            >
              Consultar por WhatsApp
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div
                key={group.title}
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-4"
              >
                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white/58">
                  {group.title}
                </h3>

                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="rounded-md text-sm font-bold text-white/82 transition hover:text-white focus-ring"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-3 text-xs text-white/58 sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} Credifer. Todos los derechos reservados.</p>

            <p>
              Los precios publicados corresponden a precio contado. Las opciones
              de financiación se confirman según producto y condiciones
              vigentes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
