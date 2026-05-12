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
    title: "Ayuda",
    links: [
      { label: "Cómo comprar", href: "/como-comprar" },
      { label: "Medios de pago", href: "/medios-de-pago" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hola Credifer, quiero hacer una consulta desde la tienda online.",
  )}`;

  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.25fr_1fr_1fr]">
        <div>
          <div className="relative mb-5 h-16 w-44">
            <Image
              src="/brand/logo-credifer.png"
              alt="Credifer"
              fill
              sizes="176px"
              className="object-contain object-left"
            />
          </div>

          <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            Catálogo online de Credifer. Elegí productos, armá tu consulta y
            coordiná la compra, financiación y entrega directamente por
            WhatsApp.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-[var(--whatsapp)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--whatsapp-dark)] focus-ring"
          >
            Consultar por WhatsApp
          </a>
        </div>

        {footerLinks.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]">
              {group.title}
            </h3>

            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--brand-blue)] focus-ring rounded-md"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Credifer. Todos los derechos reservados.</p>
          <p>Los precios publicados corresponden a precio contado.</p>
        </div>
      </div>
    </footer>
  );
}
