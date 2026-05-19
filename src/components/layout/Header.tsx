import Image from "next/image";
import Link from "next/link";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import { siteConfig } from "@/lib/site";

export function Header() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage,
  )}`;

  return (
    <header className="sticky top-0 z-50 overflow-hidden border-b border-[#C2D1E0] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FBFE_45%,#FFF8DD_78%,#F0FAF3_100%)] shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(2,100,169,0.06),transparent_26%),radial-gradient(circle_at_78%_40%,rgba(244,196,48,0.10),transparent_22%),radial-gradient(circle_at_92%_50%,rgba(37,211,102,0.08),transparent_22%)]" />

      <div className="container-page relative flex min-h-[86px] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-4 rounded-2xl focus-ring"
          aria-label="Ir al inicio de Credifer"
        >
          <div className="relative flex h-[68px] w-[150px] items-center sm:w-[190px]">
            <Image
              src="/brand/logo-credifer.png"
              alt="Credifer"
              fill
              priority
              sizes="210px"
              className="object-contain object-left transition group-hover:scale-[1.02]"
            />
          </div>

          <div className="hidden h-12 border-l border-[#C2D1E0] pl-4 xl:block">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--brand-blue)]">
              Catálogo Credifer
            </p>
            <p className="mt-1 text-xs font-extrabold leading-3 text-[var(--brand-blue-dark)]">
              Productos, cuotas y entrega
            </p>
          </div>
        </Link>

        <nav className="hidden items-center rounded-[1.35rem] border border-[#C2D1E0] bg-[#F8FBFE] p-1.5 shadow-[0_8px_22px_rgba(15,23,42,0.07)] lg:flex">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-2.5 text-sm font-black text-[var(--text-primary)] transition hover:bg-white hover:text-[var(--brand-blue)] hover:shadow-sm focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <CartHeaderLink />

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-2xl bg-[var(--whatsapp)] px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_12px_26px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white focus-ring sm:inline-flex"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
