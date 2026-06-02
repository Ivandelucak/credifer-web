//src/components/layout/MobileSideNav.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { siteConfig } from "@/lib/site";

const mainLinks = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Categorías", href: "/categorias" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Carrito", href: "/carrito" },
];

const helpLinks = [
  { label: "Cómo comprar", href: "/como-comprar" },
  { label: "Medios de pago", href: "/medios-de-pago" },
  { label: "Contacto", href: "/contacto" },
];

const instagramUrl = "https://www.instagram.com/cell.sur/";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12.13 0C5.62 0 .32 5.3.32 11.82c0 2.08.54 4.12 1.58 5.91L.22 24l6.42-1.68a11.8 11.8 0 0 0 5.49 1.4h.01c6.51 0 11.82-5.3 11.82-11.82a11.76 11.76 0 0 0-3.44-8.42ZM12.14 21.7h-.01a9.82 9.82 0 0 1-5.01-1.37l-.36-.22-3.81 1 1.02-3.71-.24-.38a9.78 9.78 0 0 1-1.5-5.2c0-5.42 4.41-9.83 9.84-9.83a9.77 9.77 0 0 1 6.95 2.88 9.76 9.76 0 0 1 2.88 6.95c0 5.43-4.41 9.84-9.76 9.84Zm5.39-7.36c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47a8.96 8.96 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.26.49 1.69.63.71.23 1.36.2 1.88.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <>
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
      <span className="block h-0.5 w-5 rounded-full bg-current" />
    </>
  );
}

type LinkGroupProps = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
  closeMenu: () => void;
  pathname: string;
};

function LinkGroup({ title, links, closeMenu, pathname }: LinkGroupProps) {
  return (
    <section className="rounded-[1.5rem] border border-[#B7CADA] bg-white p-3 shadow-sm">
      <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
        {title}
      </p>

      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = isActivePath(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={`tap-feedback flex min-h-11 items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-black transition focus-ring ${
                isActive
                  ? "bg-[var(--brand-blue)] text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)]"
                  : "text-[var(--brand-blue-dark)] hover:bg-[var(--brand-blue-soft)]"
              }`}
            >
              <span>{link.label}</span>
              <span aria-hidden="true" className="text-base">
                ›
              </span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}

export function MobileSideNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hola Credifer, quiero hacer una consulta desde la tienda online.",
  )}`;

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
        className="relative z-[80] inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#B7CADA] bg-white text-[var(--brand-blue-dark)] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition active:scale-[0.96] focus-ring lg:hidden"
      >
        <MenuIcon />
      </button>

      {mounted && isOpen
        ? createPortal(
            <div
              className="fixed inset-0 lg:hidden"
              style={{ zIndex: 2147483647 }}
            >
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={closeMenu}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              />

              <aside className="absolute inset-y-0 right-0 flex h-[100dvh] w-[min(92vw,390px)] max-w-[calc(100vw-0.75rem)] animate-[crediferSideNavIn_240ms_cubic-bezier(0.22,1,0.36,1)] flex-col overflow-hidden rounded-l-[2rem] border-l border-[#B7CADA] bg-[var(--catalog-bg)] shadow-[-18px_0_55px_rgba(15,23,42,0.24)]">
                <div className="shrink-0 border-b border-[#C9D6E4] bg-white/95 px-5 py-4 pr-[max(1.25rem,env(safe-area-inset-right))] backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-28">
                        <Image
                          src="/brand/logo-credifer.png"
                          alt="Credifer"
                          fill
                          sizes="112px"
                          className="object-contain object-left"
                        />
                      </div>

                      <div className="h-9 w-px bg-[#D6E3EF]" />

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                          Menú
                        </p>
                        <p className="text-xs font-black text-[var(--brand-blue-dark)]">
                          Catálogo online
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeMenu}
                      aria-label="Cerrar menú"
                      className="tap-feedback inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-xl font-black text-[var(--brand-blue-dark)] shadow-sm transition active:scale-[0.96] focus-ring"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 rounded-[1.4rem] border border-[#D6E3EF] bg-[linear-gradient(135deg,#EAF4FB_0%,#FFFFFF_62%,#FFF7D8_100%)] p-4">
                    <p className="text-sm font-black leading-5 text-[var(--text-primary)]">
                      Buscá productos, armá tu consulta y coordiná financiación.
                    </p>

                    <p className="mt-1.5 text-xs font-bold leading-5 text-[var(--text-secondary)]">
                      Precios de contado publicados. Cuotas y entrega se
                      confirman con vendedor.
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 pr-[max(1.25rem,env(safe-area-inset-right))]">
                  <LinkGroup
                    title="Navegación"
                    links={mainLinks}
                    closeMenu={closeMenu}
                    pathname={pathname}
                  />

                  <LinkGroup
                    title="Ayuda"
                    links={helpLinks}
                    closeMenu={closeMenu}
                    pathname={pathname}
                  />

                  <section className="rounded-[1.5rem] border border-[#B7CADA] bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                      Canales directos
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMenu}
                        className="tap-feedback flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--whatsapp)] px-3 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(37,211,102,0.24)] transition active:scale-[0.97] focus-ring"
                      >
                        <WhatsAppIcon />
                        <span>WhatsApp</span>
                      </Link>

                      <Link
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMenu}
                        className="tap-feedback flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#B7CADA] bg-white px-3 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition active:scale-[0.97] focus-ring"
                      >
                        <InstagramIcon />
                        <span>Instagram</span>
                      </Link>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-[#C9D6E4] bg-white/80 p-3 shadow-sm">
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="tap-feedback flex min-h-11 items-center justify-between rounded-2xl px-3 py-2 text-sm font-black text-[var(--text-secondary)] transition hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue-dark)] focus-ring"
                    >
                      <span>Acceso interno</span>
                      <span aria-hidden="true">›</span>
                    </Link>
                  </section>
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
