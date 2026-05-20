import Image from "next/image";
import Link from "next/link";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import { MobileSideNav } from "@/components/layout/MobileSideNav";
import { siteConfig } from "@/lib/site";

export function Header() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage,
  )}`;

  const instagramUrl = "https://www.instagram.com/cell.sur/";

  return (
    <header className="sticky top-0 z-50 border-b border-[#C9D6E4] bg-[#F4F8FC]/95 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#0264A9_0%,#F4C430_34%,#D82128_66%,#25D366_100%)]" />

      <div className="container-page flex min-h-[82px] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl focus-ring"
          aria-label="Ir al inicio de Credifer"
        >
          <div className="relative h-14 w-36 sm:w-44">
            <Image
              src="/brand/logo-credifer.png"
              alt="Credifer"
              fill
              priority
              sizes="176px"
              className="object-contain object-left"
            />
          </div>

          <div className="hidden border-l border-[#C9D6E4] pl-4 xl:block">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--brand-blue)]">
              Catálogo Credifer
            </p>
            <p className="mt-0.5 text-xs font-extrabold text-[var(--text-secondary)]">
              Productos, cuotas y entrega
            </p>
          </div>
        </Link>

        <nav className="hidden items-center rounded-2xl border border-[#C9D6E4] bg-white/85 p-1.5 shadow-[0_8px_22px_rgba(15,23,42,0.07)] lg:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-4 py-2.5 text-sm font-black text-[var(--text-primary)] transition hover:bg-[#EAF4FB] hover:text-[var(--brand-blue-dark)] focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <CartHeaderLink />

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir al Instagram de Credifer"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#C9D6E4] bg-white text-[var(--brand-blue-dark)] shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-[#B7CADA] hover:text-[var(--brand-blue)] hover:shadow-[0_12px_26px_rgba(15,23,42,0.12)] active:scale-[0.96] focus-ring lg:inline-flex"
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
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            className="hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--whatsapp)] text-slate-950 shadow-[0_12px_26px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white hover:shadow-[0_16px_32px_rgba(37,211,102,0.34)] active:scale-[0.96] focus-ring lg:inline-flex"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 32 32"
              className="h-6 w-6"
              fill="currentColor"
            >
              <path d="M16.04 3.2A12.74 12.74 0 0 0 5.18 22.6L3.6 28.8l6.35-1.52A12.8 12.8 0 1 0 16.04 3.2Zm0 2.33a10.46 10.46 0 1 1-5.32 19.47l-.38-.22-3.77.9.94-3.66-.25-.39A10.46 10.46 0 0 1 16.04 5.53Zm-4.12 4.78c-.23 0-.6.08-.92.43-.31.34-1.2 1.17-1.2 2.84s1.23 3.3 1.4 3.52c.17.23 2.38 3.82 5.87 5.2 2.9 1.14 3.5.92 4.13.86.64-.06 2.05-.84 2.34-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4-.34-.17-2.05-1-2.37-1.12-.31-.12-.54-.17-.77.17-.23.35-.88 1.12-1.08 1.35-.2.23-.4.26-.75.09-.35-.17-1.45-.53-2.76-1.7-1.02-.9-1.71-2.02-1.91-2.36-.2-.35-.02-.54.15-.7.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.9-1.08-2.6-.28-.68-.57-.58-.78-.6h-.65Z" />
            </svg>
          </a>

          <MobileSideNav />
        </div>
      </div>
    </header>
  );
}
