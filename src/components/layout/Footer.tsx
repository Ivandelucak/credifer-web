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
  "Cuota Simple",
  "Tarjetas",
  "Efectivo",
  "Transferencia",
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hola Credifer, quiero hacer una consulta desde la tienda online.",
  )}`;

  const instagramUrl = "https://www.instagram.com/cell.sur/";

  return (
    <footer className="border-t border-[#0B3558]/20 bg-[linear-gradient(135deg,#0B3558_0%,#0E4B68_58%,#0D5A5E_100%)] text-white">
      <div className="container-page py-10 lg:py-12">
        <div className="grid gap-9 lg:grid-cols-[1.25fr_1.6fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-4 rounded-[1.5rem] border border-white/12 bg-white/[0.08] p-3 pr-5 shadow-[0_18px_42px_rgba(8,47,73,0.16)]">
              <div className="relative h-14 w-32 overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  sizes="128px"
                  className="object-contain p-2"
                />
              </div>

              <div className="hidden border-l border-white/14 pl-4 sm:block">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/58">
                  Catálogo Credifer
                </p>
                <p className="mt-1 text-sm font-black leading-5 text-white">
                  Productos, cuotas y atención personalizada.
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/72">
              Explorá productos, armá tu consulta y coordiná financiación,
              disponibilidad y entrega con un asesor.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {paymentBenefits.map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white/78"
                >
                  {benefit}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-feedback inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--whatsapp)] px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_12px_26px_rgba(37,211,102,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white focus-ring"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 32 32"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M16.04 3.2A12.74 12.74 0 0 0 5.18 22.6L3.6 28.8l6.35-1.52A12.8 12.8 0 1 0 16.04 3.2Zm0 2.33a10.46 10.46 0 1 1-5.32 19.47l-.38-.22-3.77.9.94-3.66-.25-.39A10.46 10.46 0 0 1 16.04 5.53Zm-4.12 4.78c-.23 0-.6.08-.92.43-.31.34-1.2 1.17-1.2 2.84s1.23 3.3 1.4 3.52c.17.23 2.38 3.82 5.87 5.2 2.9 1.14 3.5.92 4.13.86.64-.06 2.05-.84 2.34-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4-.34-.17-2.05-1-2.37-1.12-.31-.12-.54-.17-.77.17-.23.35-.88 1.12-1.08 1.35-.2.23-.4.26-.75.09-.35-.17-1.45-.53-2.76-1.7-1.02-.9-1.71-2.02-1.91-2.36-.2-.35-.02-.54.15-.7.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.9-1.08-2.6-.28-.68-.57-.58-.78-.6h-.65Z" />
                </svg>
                WhatsApp
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-feedback inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.08] px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.12] focus-ring"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
                Instagram
              </a>
            </div>
          </div>

          <div className="grid gap-7 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-white/48">
                  {group.title}
                </h3>

                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="rounded-md text-sm font-black text-white/88 transition hover:text-[var(--brand-yellow)] focus-ring"
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

        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-3 text-xs text-white/58 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p>© {currentYear} Credifer. Todos los derechos reservados.</p>

              <Link
                href="/admin"
                className="rounded-md font-black text-white/54 transition hover:text-[var(--brand-yellow)] focus-ring"
              >
                Acceso interno
              </Link>
            </div>

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
