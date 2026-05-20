"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";

const quickLinks = [
  { label: "Celulares", href: "/celulares" },
  { label: "Audio", href: "/audio" },
  { label: "Herramientas", href: "/herramientas" },
  { label: "Climatización", href: "/climatizacion" },
];

export function MobileSideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage,
  )}`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  function isActiveLink(href: string) {
    if (href === "/") return pathname === "/";

    if (href === "/productos") {
      return (
        pathname.startsWith("/productos") || pathname.startsWith("/producto")
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const drawer = isOpen ? (
    <div className="fixed inset-0 z-[9999] lg:hidden">
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={closeMenu}
        className="absolute inset-0 animate-[crediferOverlayFade_180ms_ease-out] bg-slate-950/45 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="absolute inset-y-0 right-0 z-[10000] flex h-[100dvh] w-[min(88vw,390px)] animate-[crediferSideNavIn_240ms_cubic-bezier(0.22,1,0.36,1)] flex-col overflow-hidden rounded-l-[2rem] border-l border-[#B7CADA] bg-[var(--catalog-bg)] shadow-[-18px_0_55px_rgba(15,23,42,0.24)]"
      >
        <div className="shrink-0 border-b border-[#C9D6E4] bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-2xl focus-ring"
              aria-label="Ir al inicio de Credifer"
            >
              <div className="relative h-12 w-28">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  sizes="112px"
                  className="object-contain object-left"
                />
              </div>

              <div className="border-l border-[#C9D6E4] pl-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--brand-blue)]">
                  Catálogo
                </p>
                <p className="mt-0.5 text-xs font-extrabold leading-4 text-[var(--brand-blue-dark)]">
                  Productos y cuotas
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-xl font-black text-[var(--brand-blue-dark)] shadow-sm transition active:scale-[0.97] focus-ring"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="rounded-[1.75rem] border border-[#C9D6E4] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Menú
            </p>

            <nav className="mt-4 grid gap-2" aria-label="Navegación mobile">
              {siteConfig.navItems.map((item) => {
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 py-3 text-sm font-black transition focus-ring ${
                      isActive
                        ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_12px_24px_rgba(2,100,169,0.18)]"
                        : "border-[#D6E3EF] bg-white text-[var(--brand-blue-dark)] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                    }`}
                  >
                    {item.label}
                    <span aria-hidden="true">›</span>
                  </Link>
                );
              })}

              <Link
                href="/carrito"
                onClick={closeMenu}
                className="flex min-h-12 items-center justify-between rounded-2xl border border-[#D6E3EF] bg-white px-4 py-3 text-sm font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Carrito
                <span aria-hidden="true">›</span>
              </Link>
            </nav>
          </div>

          <div className="mt-4 rounded-[1.75rem] border border-[#C9D6E4] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Accesos rápidos
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-full border border-[#C9D6E4] bg-[var(--brand-blue-soft)] px-3 py-2 text-xs font-black text-[var(--brand-blue-dark)] transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.75rem] border border-[#C9D6E4] bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Canales directos
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Consultá por WhatsApp o seguinos en Instagram.
            </p>

            <div className="mt-4 grid gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-feedback group inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[var(--whatsapp)] px-5 py-3 text-sm font-black text-slate-950 shadow-[0_14px_28px_rgba(37,211,102,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(37,211,102,0.28)] active:scale-[0.97] active:shadow-[0_8px_18px_rgba(37,211,102,0.18)] focus-ring"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 32 32"
                  className="h-5 w-5 transition-transform duration-200 group-active:scale-90"
                  fill="currentColor"
                >
                  <path d="M16.04 3.2A12.74 12.74 0 0 0 5.18 22.6L3.6 28.8l6.35-1.52A12.8 12.8 0 1 0 16.04 3.2Zm0 2.33a10.46 10.46 0 1 1-5.32 19.47l-.38-.22-3.77.9.94-3.66-.25-.39A10.46 10.46 0 0 1 16.04 5.53Zm-4.12 4.78c-.23 0-.6.08-.92.43-.31.34-1.2 1.17-1.2 2.84s1.23 3.3 1.4 3.52c.17.23 2.38 3.82 5.87 5.2 2.9 1.14 3.5.92 4.13.86.64-.06 2.05-.84 2.34-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4-.34-.17-2.05-1-2.37-1.12-.31-.12-.54-.17-.77.17-.23.35-.88 1.12-1.08 1.35-.2.23-.4.26-.75.09-.35-.17-1.45-.53-2.76-1.7-1.02-.9-1.71-2.02-1.91-2.36-.2-.35-.02-.54.15-.7.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.9-1.08-2.6-.28-.68-.57-.58-.78-.6h-.65Z" />
                </svg>

                <span>WhatsApp</span>
              </a>

              <a
                href="https://www.instagram.com/cell.sur/"
                target="_blank"
                rel="noopener noreferrer"
                className="tap-feedback group inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-[#C9D6E4] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FAFC_100%)] px-5 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B7CADA] hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)] active:scale-[0.97] active:shadow-[0_6px_16px_rgba(15,23,42,0.06)] focus-ring"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 transition-transform duration-200 group-active:scale-90"
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

                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white text-[var(--brand-blue-dark)] shadow-sm transition active:scale-[0.97] focus-ring lg:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      </button>

      {isMounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
