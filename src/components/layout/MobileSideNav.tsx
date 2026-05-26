//src/components/layout/MobileSideNav.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Categorías", href: "/categorias" },
  { label: "Cómo comprar", href: "/como-comprar" },
  { label: "Contacto", href: "/contacto" },
  { label: "Carrito", href: "/carrito" },
];

const whatsappUrl =
  "https://wa.me/5492216920251?text=Hola%20Credifer,%20quiero%20hacer%20una%20consulta.";
const instagramUrl = "https://www.instagram.com/cell.sur/";

export function MobileSideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
        <span className="block h-0.5 w-5 rounded-full bg-current" />
        <span className="block h-0.5 w-5 rounded-full bg-current" />
        <span className="block h-0.5 w-5 rounded-full bg-current" />
      </button>

      {mounted && isOpen
        ? createPortal(
            <div className="fixed inset-0 z-[99999] lg:hidden">
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              />

              <aside className="absolute inset-y-0 right-0 z-[100000] flex h-[100dvh] w-[min(88vw,360px)] max-w-[calc(100vw-1rem)] animate-[crediferSideNavIn_240ms_cubic-bezier(0.22,1,0.36,1)] flex-col overflow-hidden rounded-l-[2rem] border-l border-[#B7CADA] bg-[var(--catalog-bg)] shadow-[-18px_0_55px_rgba(15,23,42,0.24)]">
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#C9D6E4] bg-white/95 px-5 py-4 pr-[max(1.25rem,env(safe-area-inset-right))] backdrop-blur">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                      Catálogo Credifer
                    </p>
                    <p className="mt-1 text-sm font-black text-[var(--brand-blue-dark)]">
                      Productos y cuotas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar menú"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B7CADA] bg-white text-xl font-black text-[var(--brand-blue-dark)] shadow-sm transition active:scale-[0.96] focus-ring"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 pr-[max(1.25rem,env(safe-area-inset-right))]">
                  <nav className="space-y-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="tap-feedback flex min-h-12 items-center justify-between rounded-2xl border border-[#B7CADA] bg-white px-4 py-3 text-base font-black text-[var(--brand-blue-dark)] shadow-sm transition active:scale-[0.98] focus-ring"
                      >
                        <span>{item.label}</span>
                        <span>›</span>
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-6 rounded-[1.5rem] border border-[#B7CADA] bg-white p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                      Canales directos
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link
                        href={whatsappUrl}
                        target="_blank"
                        onClick={() => setIsOpen(false)}
                        className="tap-feedback flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--whatsapp)] px-4 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(37,211,102,0.24)] transition active:scale-[0.97] focus-ring"
                      >
                        <span>☏</span>
                        <span>WhatsApp</span>
                      </Link>

                      <Link
                        href={instagramUrl}
                        target="_blank"
                        onClick={() => setIsOpen(false)}
                        className="tap-feedback flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#B7CADA] bg-white px-4 py-3 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition active:scale-[0.97] focus-ring"
                      >
                        <span>◎</span>
                        <span>Instagram</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
